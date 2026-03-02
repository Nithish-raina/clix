import chalk from "chalk";

/**
 * Print confirmation after saving a command.
 *
 * @param {object} entry - The saved command entry
 */
export function printSaveConfirmation(entry) {
  console.log();
  console.log(chalk.green("  ✔ Command saved"));
  console.log();
  console.log(chalk.dim("  ID:      ") + chalk.white(entry.id));
  console.log(chalk.dim("  Command: ") + chalk.cyan(entry.command));

  if (entry.description) {
    console.log(chalk.dim("  Note:    ") + chalk.white(entry.description));
  }

  if (entry.tags.length > 0) {
    const tagStr = entry.tags.map((t) => chalk.magenta(`#${t}`)).join(" ");
    console.log(chalk.dim("  Tags:    ") + tagStr);
  }

  console.log();
  console.log(chalk.dim("  View saved commands: clix saved"));
  console.log();
}

/**
 * Print error when save fails.
 *
 * @param {string} message - Error message
 */
export function printSaveError(message) {
  console.log();
  console.log(chalk.red(`  ✖ ${message}`));
  console.log();
}
