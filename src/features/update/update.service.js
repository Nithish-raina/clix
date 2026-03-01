import chalk from "chalk";
import { saveConfig } from "../../config/config.manager.js";
import { promptForModel, promptForMaxTokens } from "./update.prompts.js";

export class UpdateService {
  /**
   * @param {object} deps
   * @param {object} deps.config - The current application configuration.
   */
  constructor({ config }) {
    this.config = config;
  }

  /**
   * Runs the interactive update process.
   */
  async runUpdate() {
    console.log(
      chalk.blue("Current config:"),
      chalk.dim(JSON.stringify(this.config, null, 2)),
    );
    console.log();

    const newModel = await promptForModel(this.config.model);
    const newMaxTokens = await promptForMaxTokens(this.config.maxTokens);

    let updated = false;
    const newConfig = { ...this.config };

    if (newModel && newModel !== newConfig.model) {
      newConfig.model = newModel;
      updated = true;
      console.log(chalk.green(`✅ Model updated to: ${newModel}`));
    }

    if (newMaxTokens && newMaxTokens !== newConfig.maxTokens) {
      newConfig.maxTokens = newMaxTokens;
      updated = true;
      console.log(chalk.green(`✅ Max tokens updated to: ${newMaxTokens}`));
    }

    if (updated) {
      saveConfig(newConfig);
      console.log(chalk.bold.green("\nConfiguration saved successfully!"));
      process.exit(0);
    } else {
      console.log(chalk.yellow("\nNo changes were made."));
      process.exit(0);
    }
  }
}
