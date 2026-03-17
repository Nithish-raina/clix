import chalk from "chalk";
import { UpdateService } from "../features/update/update.service.js";
import { ConfigFileMissingError } from "../errors/clix-error.js";

export const registerUpdateCommand = (program, { config }) => {
  program
    .command("update")
    .description("Update the AI model and maxTokens configuration.")
    .action(async () => {
      if (!config || Object.keys(config).length === 0) {
        throw new ConfigFileMissingError("~/.clix/config.json");
      }

      console.log(
        chalk.blue("Current config:"),
        chalk.dim(JSON.stringify(config, null, 2)),
      );
      console.log();

      await new UpdateService({ config }).runUpdate();
    });
};
