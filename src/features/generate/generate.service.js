import ora from "ora";
import { logger } from "../../utils/logger.js";
import {
  formatContextForPrompt,
  getStaticContext,
} from "../../context/static.js";
import { buildGeneratePrompt } from "./generate.prompts.js";

export class GenerateService {
  constructor({ aiProvider }) {
    this.aiProvider = aiProvider;
  }

  async generate(description) {
    const spinner = ora({
      text: "Collecting system info...",
      indent: 2,
    }).start();

    try {
      const systemContext = getStaticContext();
      const formattedContextPrompt = formatContextForPrompt(systemContext);
      const { systemPrompt, userMessage } = buildGeneratePrompt(
        description,
        formattedContextPrompt,
      );

      const aiResponse = await this.aiProvider.complete({
        systemPrompt,
        userMessage,
      });

      // Verify if openAI, other AI providers returns a response in this format { content: '...', usage: '...'}. If not then this needs to be refatored.
      const llmResponse = this._parseAIResponse(aiResponse.content);
      spinner.stop();
      return llmResponse;
    } catch (error) {
      logger.error(`Error during command generation: ${error.message}`);
      spinner.fail("Command generation failed.");
      throw error;
    }
  }

  /**
   * Parse the AI response JSON string into an object.
   * Handles common issues like markdown code fences.
   * @private
   */
  _parseAIResponse(content) {
    let cleaned = content.trim();
    logger.info("Raw AI response:", cleaned); // For debugging parsing issues

    // Strip markdown code fences if the AI wrapped the response
    // TODO : Should add more strong cleaning logic like removing any markdown syntax. As of now this is fine because we instructed LLM to not provide any markdown syntax in the system prompt.
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
}
