import { logger } from "../src/utils/logger.js";

export function registerGenerateCommand(program, { aiProvider, config }) {
  program
    .command("generate <description>")
    .description("Generate a CLI command based on the provided description.")
    .action(async (description, options) => {
      try {
        // delegate to the business layer and return a response to the user
      } catch (error) {
        logger.error(`Error during command generation: ${error.message}`);
      }
    });
}
