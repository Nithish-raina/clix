import { formatGenerateOutput } from "../features/generate/generate.formatter.js";
import { GenerateService } from "../features/generate/generate.service.js";
import { logger } from "../utils/logger.js";

export function registerGenerateCommand(program, { aiProvider, config }) {
  program
    .command("generate <description>")
    .description("Generate a CLI command based on the provided description.")
    .action(async (description, options) => {
      if (!aiProvider) {
        throw new Error("AI Provider is not initialized. Run `clix init`.");
      }

      try {
        const generateService = new GenerateService({ aiProvider });
        const result = await generateService.generate(description);

        if (!result) return;

        formatGenerateOutput(result);
      } catch (error) {
        throw error;
      }
    });
}
