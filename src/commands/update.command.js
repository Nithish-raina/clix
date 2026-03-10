import chalk from "chalk";
import { UpdateService } from "../features/update/update.service.js";
import { logger } from "../utils/logger.js";
import { ConfigFileMissingError, ClixError } from "../errors/clix-error.js";

export const registerUpdateCommand = (program, { config }) => {
  program
    .command("update")
    .description("Update the AI model and maxTokens configuration.")
    .action(async () => {
      try {
        if (!config || Object.keys(config).length === 0) {
          // If config is missing, we should probably tell them to init.
          // But if loadConfig threw, we wouldn't be here comfortably.
          // Let's assume emptiness implies missing config.
          throw new ConfigFileMissingError("~/.clix/config.json");
        }

        console.log(
          chalk.blue("Current config:"),
          chalk.dim(JSON.stringify(config, null, 2)),
        );
        console.log();

        await new UpdateService({ config }).runUpdate();
      } catch (err) {
        throw err;
      }
    });
};
