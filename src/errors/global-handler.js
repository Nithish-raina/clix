import chalk from "chalk";
import { ClixError } from "./clix-error.js";
import { logger } from "../utils/logger.js";

export function handleGlobalError(error) {
  logger.br();

  if (error instanceof ClixError) {
    console.error(chalk.red.bold(`✖ Error: ${error.message}`));
    if (error.code) {
      console.error(chalk.dim(`[Code: ${error.code}]`));
    }

    if (error.suggestion) {
      logger.br();
      console.log(chalk.yellow.bold("💡 Suggestion:"));
      console.log(chalk.yellow(error.suggestion));
    }
  } else {
    // Generic/Unexpected Error
    console.error(chalk.red.bold("✖ Unexpected Error Occurred"));
    console.error(chalk.red(error.message));

    if (process.env.DEBUG === "true") {
      logger.br();
      console.error(chalk.dim(error.stack));
    } else {
      logger.br();
      console.log(
        chalk.dim("Run with DEBUG=true to see the full stack trace."),
      );
    }
  }

  logger.br();
  process.exit(1);
}
