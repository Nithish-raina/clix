import ora from "ora";
import { logger } from "../utils/logger.js";
import { formatContextForPrompt, getStaticContext } from "../context/static.js";
import { buildGeneratePrompt } from "../features/generate/generate.prompts.js";

export function registerGenerateCommand(program, { aiProvider, config }) {
  program
    .command("generate <description>")
    .description("Generate a CLI command based on the provided description.")
    .action(async (description, options) => {
      try {
        // delegate to the business layer and return a response to the user
        const spinner = ora({
          text: "Collecting system info...",
          indent: 2,
        }).start();
        const systemContext = getStaticContext();
        const formattedContextPrompt = formatContextForPrompt(systemContext);
        const { systemPrompt, userMessage } = buildGeneratePrompt(
          description,
          formattedContextPrompt,
        );

        const aiResponse = await aiProvider.complete({
          systemPrompt,
          userMessage,
        });

        // Verify if openAI, other AI providers returns a response in this format { content: '...', usage: '...'}. If not then this needs to be refatored.
        const llmResponse = parseAIResponse(aiResponse.content);
      } catch (error) {
        logger.error(`Error during command generation: ${error.message}`);
        spinner.fail("Command generation failed.");
      }
    });
}

/**
 * Parse the AI response JSON string into an object.
 * Handles common issues like markdown code fences.
 */
function parseAIResponse(content) {
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
