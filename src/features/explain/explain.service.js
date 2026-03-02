/**
 * Explain Service — the brain of the explain feature.
 *
 * Orchestrates: input parsing → danger scan → AI call → response parsing
 * Depends on the AIProvider abstraction — never on a specific provider.
 */

import { parseCommandInput, validateCommand } from "./explain.parser.js";
import { buildExplainPrompt } from "./explain.prompts.js";
import { scanForDanger } from "../../safety/danger-scanner.js";
import { logger } from "../../utils/logger.js";

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
    // TODO: The validate command should be moved to a separate validator module and should return more structured errors (e.g., { valid: false, reason: '...' }) instead of throwing. This way we can provide better feedback to the user on how to fix their input.
    const validation = validateCommand(rawCommand);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    // 2. Parse the input to extract command and operators such as pipes, redirects, and multi-commands. This metadata can be useful for both AI prompting and final output.
    const parsed = parseCommandInput(rawCommand);

    // 3. Run local danger scan before calling AI
    const localDangerScanResults = scanForDanger(parsed.command);

    // 4. Build the AI prompt
    const systemPrompt = buildExplainPrompt(mode);
    const userMessage = `Explain this command:\n\n${parsed.command}`;

    // 5. Call the AI provider
    const aiResponse = await this.aiProvider.complete({
      systemPrompt,
      userMessage,
    });

    // 6. Parse the AI response
    // Verify if openAI, other AI providers returns a response in this format { content: '...', usage: '...'}. If not then this needs to be refatored.
    const explanation = this.parseAIResponse(aiResponse.content);

    // 7. Merge local danger scan with AI analysis
    //    Local scanner is authoritative — if it flags danger, we trust it
    //    even if the AI says it's safe
    const result = this.mergeResults(
      explanation,
      localDangerScanResults,
      parsed,
    );

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
  parseAIResponse(content) {
    let cleaned = content.trim();
    // logger.info("Raw AI response:", cleaned); // For debugging parsing issues

    // Strip markdown code fences if the AI wrapped the response
    // TODO : Should add more strong cleaning logic like removing any markdown syntax. As of now this is fine because we instructed LLM to not provide any markdown syntax in the system prompt.
    if (cleaned.startsWith("```")) {
      const match = cleaned.match(/^```(?:json)?\n?([\s\S]*?)\n?```/);
      if (match) cleaned = match[1];
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
  mergeResults(explanation, localScan, parsed) {
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

      // Add any local warnings the AI didn't catch, avoiding duplicates.
      const allWarnings = new Set(result.warnings || []);
      for (const w of localScan.warnings) {
        allWarnings.add(w.message);
      }
      result.warnings = [...allWarnings];
    }

    // Attach parsed metadata
    result.isPiped = parsed.isPiped;
    result.isMultiCommand = parsed.isMultiCommand;
    result.hasRedirects = parsed.hasRedirects;

    return result;
  }
}
