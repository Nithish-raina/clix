import chalk from "chalk";
import { UpdateService } from "../features/update/update.service.js";
import { logger } from "../utils/logger.js";

export const registerUpdateCommand = (program, { config }) => {
  program
    .command("update")
    .description("Update the AI model and maxTokens configuration.")
    .action(async () => {
      if (!config || Object.keys(config).length === 0) {
        logger.error("Configuration missing or invalid.");
        logger.error("Please run `clix init` to set up your environment.");
        process.exit(1);
      }

      console.log(
        chalk.blue("Current config:"),
        chalk.dim(JSON.stringify(config, null, 2)),
      );
      console.log();
      await new UpdateService({ config }).runUpdate().catch((err) => {
        logger.error(chalk.red("Error during update:"), err);
      });
    });
};
