import chalk from "chalk";
import { UpdateService } from "../features/update/update.service.js";

export const registerUpdateCommand = (program, { config }) => {
  program
    .command("update")
    .description("Update the AI model and maxTokens configuration.")
    .action(async () => {
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
