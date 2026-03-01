import chalk from "chalk";
import { saveConfig } from "../config/config.manager.js";

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

      const newModel = await promptForModel(config.model);
      const newMaxTokens = await promptForMaxTokens(config.maxTokens);

      let updated = false;
      if (newModel && newModel !== config.model) {
        config.model = newModel;
        updated = true;
        console.log(chalk.green(`✅ Model updated to: ${newModel}`));
      }

      if (newMaxTokens && newMaxTokens !== config.maxTokens) {
        config.maxTokens = newMaxTokens;
        updated = true;
        console.log(chalk.green(`✅ Max tokens updated to: ${newMaxTokens}`));
      }

      if (updated) {
        saveConfig(config);
        console.log(chalk.bold.green("\nConfiguration saved successfully!"));
      } else {
        console.log(chalk.yellow("\nNo changes were made."));
      }

      process.exit(0);
    });
};

function promptForModel(currentModel) {
  return new Promise((resolve) => {
    console.log(chalk.bold("Select a new AI model:"));
    console.log(
      `  - ${chalk.cyan("claude-haiku-4-5")} (Fastest, good for quick tasks)`,
    );
    console.log(
      `  - ${chalk.cyan("claude-sonnet-4-5")} (Balanced, good for complex tasks)`,
    );
    process.stdout.write(
      chalk.green(
        `\nEnter the model name (or press Enter to keep '${currentModel}'): `,
      ),
    );

    process.stdin.once("data", (data) => {
      const input = data.toString().trim();
      resolve(input || null);
    });
  });
}

function promptForMaxTokens(currentMaxTokens) {
  return new Promise((resolve) => {
    process.stdout.write(
      chalk.green(
        `\nEnter the max tokens for AI responses (e.g., 4096, min 2048) (or press Enter to keep '${currentMaxTokens}'): `,
      ),
    );

    process.stdin.once("data", (data) => {
      const input = data.toString().trim();
      if (!input) {
        return resolve(null);
      }

      const maxTokens = parseInt(input, 10);
      if (isNaN(maxTokens)) {
        console.log(chalk.red("Invalid number. No changes made."));
        resolve(null);
      } else {
        const MIN_TOKENS = 2048;
        if (maxTokens < MIN_TOKENS) {
          console.log(
            chalk.yellow(
              `⚠️  Entered max tokens (${maxTokens}) is below the minimum of ${MIN_TOKENS}. Using ${MIN_TOKENS} instead.`,
            ),
          );
          resolve(MIN_TOKENS);
        } else {
          resolve(maxTokens);
        }
      }
    });
  });
}
