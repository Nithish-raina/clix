import { formatGenerateOutput } from "../features/generate/generate.formatter.js";
import { GenerateService } from "../features/generate/generate.service.js";
import { logger } from "../utils/logger.js";

export function registerGenerateCommand(program, { aiProvider, config }) {
  program
    .command("generate <description>")
    .description("Generate a CLI command based on the provided description.")
    .action(async (description, options) => {
      if (!aiProvider) {
        logger.error("Configuration missing or invalid.");
        logger.error(
          "Please run `clix init` to set up your AI provider and API Key.",
        );
        process.exit(1);
      }
      try {
        const generateService = new GenerateService({ aiProvider });
        const result = await generateService.generate(description);
        if (!result) return;
        formatGenerateOutput(result);
      } catch (error) {
        // Error already handled in service logging
        logger.error("Command generation failed. Please try again.");
        process.exit(1);
      }
    });
}
