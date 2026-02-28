/**
 * Explain Service — the brain of the explain feature.
 *
 * Orchestrates: input parsing → danger scan → AI call → response parsing
 * Depends on the AIProvider abstraction — never on a specific provider.
 */

import { parseCommandInput, validateCommand } from "./explain.parser.js";
import { buildExplainPrompt } from "./explain.prompts.js";
import { scanForDanger } from "../../safety/danger-scanner.js";

export class ExplainService {
  /**
   * @param {object} deps
   * @param {import('../../ai/ai.provider.js').default} deps.aiProvider
   */
  constructor({ aiProvider }) {
    this.aiProvider = aiProvider;
  }

  /**
   * Explain a CLI command.
   *
   * @param {string} rawCommand - The raw command string from the user
   * @param {object} options
   * @param {'default'|'beginner'} options.mode - Explanation detail level
   * @returns {Promise<object>} Structured explanation result
   */
  async explain(rawCommand, { mode = "default" } = {}) {
    // 1. Validate input
    const validation = validateCommand(rawCommand);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    // 2. Parse and clean the input
    const parsed = parseCommandInput(rawCommand);

    // 3. Run local danger scan (fast, offline)
    const localDangerScan = scanForDanger(parsed.command);

    // 4. Build the AI prompt
    const systemPrompt = buildExplainPrompt(mode);
    const userMessage = `Explain this command:\n\n${parsed.command}`;

    // 5. Call the AI provider
    const aiResponse = await this.aiProvider.complete({
      systemPrompt,
      userMessage,
    });

    // 6. Parse the AI response
    const explanation = this._parseAIResponse(aiResponse.content);

    // 7. Merge local danger scan with AI analysis
    //    Local scanner is authoritative — if it flags danger, we trust it
    //    even if the AI says it's safe
    const result = this._mergeResults(explanation, localDangerScan, parsed);

    // 8. Attach metadata
    result.meta = {
      mode,
      provider: this.aiProvider.name,
      tokensUsed: aiResponse.usage,
    };

    return result;
  }

  /**
   * Parse the AI response JSON string into an object.
   * Handles common issues like markdown code fences.
   */
  _parseAIResponse(content) {
    let cleaned = content.trim();

    // Strip markdown code fences if the AI wrapped the response
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    try {
      return JSON.parse(cleaned);
    } catch (err) {
      throw new Error(
        `Failed to parse AI response as JSON. This usually means the AI returned an unexpected format.\n` +
          `Raw response:\n${content.substring(0, 500)}`,
      );
    }
  }

  /**
   * Merge the AI explanation with the local danger scan.
   * Local scanner overrides AI danger assessment when it finds something.
   */
  _mergeResults(explanation, localScan, parsed) {
    const result = { ...explanation };

    // If local scanner found danger that AI missed, upgrade the danger level
    if (localScan.hasDanger) {
      const levelPriority = { safe: 0, medium: 1, high: 2, critical: 3 };

      if (
        levelPriority[localScan.level] >
        levelPriority[result.danger_level || "safe"]
      ) {
        result.danger_level = localScan.level;
      }

      // Add any local warnings the AI didn't catch
      const existingWarnings = new Set(result.warnings || []);
      for (const w of localScan.warnings) {
        if (
          ![...existingWarnings].some((ew) =>
            ew.toLowerCase().includes(w.message.toLowerCase().slice(0, 30)),
          )
        ) {
          result.warnings = result.warnings || [];
          result.warnings.push(w.message);
        }
      }
    }

    // Attach parsed metadata
    result.isPiped = parsed.isPiped;
    result.isMultiCommand = parsed.isMultiCommand;
    result.hasRedirects = parsed.hasRedirects;

    return result;
  }
}
