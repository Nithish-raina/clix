/**
 * Explain command — parses CLI args and offloads
 * all business logic to ExplainService.
 */

import ora from "ora";
import chalk from "chalk";
import { ExplainService } from "../features/explain/explain.service.js";
import { formatExplainOutput } from "../features/explain/explain.formatter.js";
import { logger } from "../utils/logger.js";

/**
 * Register the explain command on the commander program.
 *
 * @param {import('commander').Command} program
 * @param {object} deps - Injected dependencies
 * @param {import('../ai/ai.provider.js').default} deps.aiProvider
 * @param {object} deps.config
 */
export function registerExplainCommand(program, { aiProvider, config }) {
  program
    .command("explain")
    .description("Explain what a CLI command does, flag by flag")
    .argument("<command_string>", "The command to explain (wrap in quotes)")
    .option(
      "-b, --beginner",
      "Explain in beginner-friendly terms with examples",
    )
    .addHelpText(
      "after",
      `
Examples:
  $ clix explain "find . -name '*.log' -mtime +30"
  $ clix explain "docker ps -a --filter status=exited" --beginner
  $ clix explain "git log --oneline --graph --all" -b
    `,
    )
    .action(async (commandString, options) => {
      const mode = options.beginner
        ? "beginner"
        : config.defaultMode || "default";
      const spinner = ora({
        text:
          mode === "beginner"
            ? "Building beginner-friendly explanation..."
            : "Analyzing command...",
        spinner: "dots",
      }).start();

      try {
        const service = new ExplainService({ aiProvider });
        const result = await service.explain(commandString, { mode });

        spinner.stop();

        formatExplainOutput(result, { mode });

        // Interactive beginner prompt (only in interactive terminals)
        if (mode === "default" && process.stdout.isTTY) {
          await offerBeginnerMode(commandString, service);
        }
      } catch (err) {
        spinner.stop();

        if (
          err.message.includes("API key") ||
          err.message.includes("authentication")
        ) {
          logger.error("Authentication failed. Check your API key.");
          logger.info(
            "Update your key in ~/.clix/config.json or set the environment variable.",
          );
        } else if (
          err.message.includes("rate limit") ||
          err.message.includes("429")
        ) {
          logger.error(
            "Rate limited by AI provider. Please wait a moment and try again.",
          );
        } else {
          logger.error(err.message);
        }

        process.exit(1);
      }
    });
}

/**
 * After showing the default explanation, offer to show beginner mode.
 * Only shown in interactive terminals. (process.stdout.isTTY)
 */

// This was taken using AI
async function offerBeginnerMode(commandString, service) {
  const prompt =
    chalk.dim("  💡 Press ") +
    chalk.bold.cyan("b") +
    chalk.dim(" for beginner explanation, or any other key to exit");

  console.log(prompt);

  return new Promise((resolve) => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.once("data", async (data) => {
      process.stdin.setRawMode(false);
      process.stdin.pause();

      const key = data.toString().trim().toLowerCase();

      if (key === "b") {
        const spinner = ora(
          "Building beginner-friendly explanation...",
        ).start();

        try {
          const result = await service.explain(commandString, {
            mode: "beginner",
          });
          spinner.stop();
          formatExplainOutput(result, { mode: "beginner" });
        } catch (err) {
          spinner.stop();
          logger.error(`Beginner explanation failed: ${err.message}`);
        }
      }

      resolve();
    });
  });
}
