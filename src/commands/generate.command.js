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
        const systemContext = getStaticContext();
        const formattedContextPrompt = formatContextForPrompt(systemContext);
        const { systemPrompt, userMessage } = buildGeneratePrompt(
          description,
          formattedContextPrompt,
        );
        logger.info(`system prompt: ${systemPrompt}`);
        logger.info(`user message: ${userMessage}`);
      } catch (error) {
        logger.error(`Error during command generation: ${error.message}`);
      }
    });
}
