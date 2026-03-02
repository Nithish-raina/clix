/**
 * Terminal output formatter for the generate feature.
 * Takes structured generate data and renders it beautifully.
 */

import chalk from "chalk";
import boxen from "boxen";

/**
 * Format and print the generated command to the terminal.
 *
 * @param {object} result - The structured response from the AI
 */
export function formatGenerateOutput(result) {
  console.log();

  printCommand(result.command);
  printExplanation(result.explanation);
  printComponents(result.components);
  printDangerWarning(result.danger_level, result.warnings);
  printAlternatives(result.alternatives);
  printRequiredTools(result.required_tools);

  console.log();
}

function printCommand(command) {
  console.log(chalk.bold("  ⚡ Generated Command"));
  console.log();
  console.log(`  ${chalk.green.bold(command)}`);
  console.log();
}

function printExplanation(explanation) {
  if (!explanation) return;
  console.log(chalk.white(`  ${explanation}`));
  console.log();
}

function printComponents(components) {
  if (!components || components.length === 0) return;

  console.log(chalk.bold("  🔍 Breakdown"));
  console.log();

  const maxTokenLen = Math.max(...components.map((c) => c.token.length));

  for (const comp of components) {
    const token = chalk.cyan(comp.token.padEnd(maxTokenLen + 2));
    const sep = chalk.dim("#");
    console.log(`  ${token} ${sep} ${comp.explanation}`);
  }

  console.log();
}

function printDangerWarning(dangerLevel, warnings) {
  if (!dangerLevel || dangerLevel === "none" || dangerLevel === "low") return;

  const isHigh = dangerLevel === "high";
  const icon = isHigh ? "🚨" : "⚠️";
  const title = isHigh ? "DESTRUCTIVE COMMAND" : "USE WITH CAUTION";
  const color = isHigh ? chalk.red : chalk.yellow;
  const borderColor = isHigh ? "red" : "yellow";

  let content = color.bold(`${icon} ${title}`);

  if (warnings?.length) {
    content += "\n";
    for (const w of warnings) {
      content += "\n" + color(`  • ${w}`);
    }
  }

  console.log(
    boxen(content, {
      padding: 1,
      margin: { top: 0, bottom: 1, left: 2, right: 2 },
      borderStyle: "double",
      borderColor,
    }),
  );
}

function printAlternatives(alternatives) {
  if (!alternatives || alternatives.length === 0) return;

  console.log(chalk.bold("  💡 Alternatives"));
  console.log();

  for (const alt of alternatives) {
    console.log(`  ${chalk.cyan(alt.command)}`);
    console.log(`  ${chalk.dim(alt.explanation)}`);
    if (alt.tradeoff) {
      console.log(`  ${chalk.dim(`Tradeoff: ${alt.tradeoff}`)}`);
    }
    console.log();
  }
}

function printRequiredTools(tools) {
  if (!tools || tools.length === 0) return;
  console.log(chalk.dim(`  🔧 Tools used: ${tools.join(", ")}`));
  console.log();
}
