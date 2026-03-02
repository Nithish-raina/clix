import chalk from "chalk";
import boxen from "boxen";

/**
 * Print the list of saved commands.
 *
 * @param {object} data
 * @param {object[]} data.commands
 * @param {number} data.totalCount
 * @param {number} data.filteredCount
 * @param {object} [filters] - Active filters for display
 */
export function printSavedCommands(
  { commands, totalCount, filteredCount },
  filters = {},
) {
  console.log();

  if (totalCount === 0) {
    printEmpty();
    return;
  }

  // header
  let header = chalk.bold(`  📋 Saved Commands`);
  if (filteredCount !== totalCount) {
    header += chalk.dim(` (${filteredCount} of ${totalCount})`);
  } else {
    header += chalk.dim(` (${totalCount})`);
  }
  console.log(header);

  // active filters
  if (filters.tag) {
    console.log(
      chalk.dim(`  Filtered by tag: ${chalk.magenta("#" + filters.tag)}`),
    );
  }
  if (filters.search) {
    console.log(chalk.dim(`  Search: "${filters.search}"`));
  }

  console.log();

  // command list
  for (const cmd of commands) {
    printCommandEntry(cmd);
  }

  console.log();
}

function printCommandEntry(cmd) {
  // ID and command
  const idStr = chalk.dim(`  [${cmd.id}]`);
  console.log(`${idStr} ${chalk.cyan(cmd.command)}`);

  // description
  if (cmd.description) {
    console.log(chalk.dim(`       ${cmd.description}`));
  }

  // tags and date
  const parts = [];
  if (cmd.tags.length > 0) {
    parts.push(cmd.tags.map((t) => chalk.magenta(`#${t}`)).join(" "));
  }
  parts.push(chalk.dim(formatDate(cmd.savedAt)));
  console.log(`       ${parts.join("  ")}`);

  console.log();
}

function printEmpty() {
  console.log(chalk.dim("  No saved commands yet."));
  console.log();
  console.log(
    chalk.dim('  Save one with: clix save "your command" --tag mytag'),
  );
  console.log();
}

/**
 * Print confirmation after deleting a command.
 *
 * @param {object} deleted - The deleted entry
 */
export function printDeleteConfirmation(deleted) {
  console.log();
  console.log(chalk.green(`  ✔ Deleted command [${deleted.id}]`));
  console.log(chalk.dim(`    ${deleted.command}`));
  console.log();
}

/**
 * Print error for saved command operations.
 *
 * @param {string} message
 */
export function printSavedError(message) {
  console.log();
  console.log(chalk.red(`  ✖ ${message}`));
  console.log();
}

/**
 * Print all available tags.
 *
 * @param {string[]} tags
 */
export function printTags(tags) {
  console.log();

  if (tags.length === 0) {
    console.log(chalk.dim("  No tags yet."));
    console.log();
    return;
  }

  console.log(chalk.bold("  🏷️  Tags"));
  console.log();
  console.log(`  ${tags.map((t) => chalk.magenta(`#${t}`)).join("  ")}`);
  console.log();
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
