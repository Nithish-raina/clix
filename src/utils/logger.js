import chalk from "chalk";

export const logger = {
  info(msg) {
    console.log(chalk.blue("ℹ"), msg);
  },

  success(msg) {
    console.log(chalk.green("✔"), msg);
  },

  warn(msg) {
    console.log(chalk.yellow("⚠️"), msg);
  },

  error(msg) {
    console.error(chalk.red("✖"), msg);
  },

  dim(msg) {
    console.log(chalk.dim(msg));
  },

  // Print without any prefix — for formatted output blocks
  raw(msg) {
    console.log(msg);
  },

  // Blank line
  br() {
    console.log();
  },
};
