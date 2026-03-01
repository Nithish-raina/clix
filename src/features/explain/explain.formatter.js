/**
 * Terminal output formatter for the explain feature.
 * Takes structured explanation data and renders it beautifully.
 */

import chalk from "chalk";
import boxen from "boxen";

// Danger level colors and icons
const DANGER_STYLES = {
  safe: { icon: "✅", color: chalk.green, label: "SAFE" },
  medium: { icon: "⚠️", color: chalk.yellow, label: "CAUTION" },
  high: { icon: "🚨", color: chalk.red, label: "DANGEROUS" },
  critical: {
    icon: "💀",
    color: chalk.bgRed.white.bold,
    label: "CRITICAL DANGER",
  },
};

/**
 * Format and print the explanation to the terminal.
 *
 * @param {object} result - The structured explanation from ExplainService
 * @param {object} options
 * @param {'default'|'beginner'} options.mode
 */
export function formatExplainOutput(result, { mode = "default" } = {}) {
  console.log();

  // Summary
  printSummary(result.summary);

  console.log();

  // Components breakdown
  if (mode === "beginner") {
    printBeginnerComponents(result.components);
  } else {
    printDefaultComponents(result.components);
  }

  // Danger warnings
  if (result.danger_level && result.danger_level !== "safe") {
    printDangerWarning(result, mode);
  }

  // Safer alternative
  if (result.safer_alternative) {
    printSaferAlternative(result.safer_alternative, mode);
  }

  // Related commands (beginner mode)
  if (mode === "beginner" && result.related_commands?.length) {
    printRelatedCommands(result.related_commands);
  }

  // Footer with metadata
  printFooter(result.meta);

  console.log();
}

function printSummary(summary) {
  console.log(chalk.bold("  📋 Summary"));
  console.log(chalk.white(`  ${summary}`));
}

function printDefaultComponents(components) {
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

function printBeginnerComponents(components) {
  console.log(chalk.bold("  📖 Step-by-step explanation"));
  console.log();

  for (const comp of components) {
    const beginner = comp.beginner || {};

    // Component box
    let boxContent = "";

    // Token header
    boxContent += chalk.bold.cyan(comp.token) + "\n\n";

    // Concept explanation
    if (beginner.concept) {
      boxContent += chalk.white(beginner.concept);
    } else {
      boxContent += chalk.white(comp.explanation);
    }

    // Simple example
    if (beginner.simple_example) {
      boxContent += "\n\n" + chalk.dim("Example:");
      boxContent += "\n  " + chalk.green(beginner.simple_example.command);
      boxContent +=
        "\n  " + chalk.dim("→ " + beginner.simple_example.explanation);
    }

    // Matches / doesn't match
    if (beginner.matches?.length) {
      boxContent += "\n\n" + chalk.dim("What matches:");
      for (const m of beginner.matches) {
        boxContent += "\n  " + chalk.green("✅ " + m);
      }
    }
    if (beginner.doesnt_match?.length) {
      boxContent += "\n" + chalk.dim("What doesn't match:");
      for (const m of beginner.doesnt_match) {
        boxContent += "\n  " + chalk.red("❌ " + m);
      }
    }

    console.log(
      boxen(boxContent, {
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        margin: { top: 0, bottom: 1, left: 2, right: 2 },
        borderStyle: "round",
        borderColor: "gray",
      }),
    );
  }
}

function printDangerWarning(result, mode) {
  const style = DANGER_STYLES[result.danger_level] || DANGER_STYLES.medium;

  let warningContent = style.color(`${style.icon} ${style.label}`) + "\n";

  // Beginner-friendly warning
  if (mode === "beginner" && result.beginner_warning) {
    warningContent += "\n" + chalk.white(result.beginner_warning);
  }

  // Warning list
  if (result.warnings?.length) {
    warningContent += "\n";
    for (const w of result.warnings) {
      warningContent += "\n" + chalk.yellow(`  • ${w}`);
    }
  }

  console.log(
    boxen(warningContent, {
      padding: 1,
      margin: { top: 0, bottom: 1, left: 2, right: 2 },
      borderStyle: "double",
      borderColor: result.danger_level === "critical" ? "red" : "yellow",
    }),
  );
}

function printSaferAlternative(alt, mode) {
  console.log(chalk.bold.green("  💡 Safer alternative"));

  if (alt.description) {
    console.log(chalk.white(`  ${alt.description}`));
  }

  if (alt.steps?.length) {
    console.log();
    for (let i = 0; i < alt.steps.length; i++) {
      const step = alt.steps[i];
      console.log(chalk.dim(`  Step ${i + 1}: ${step.label}`));
      console.log(chalk.green(`    $ ${step.command}`));
      if (i < alt.steps.length - 1) console.log();
    }
  }

  console.log();
}

function printRelatedCommands(commands) {
  console.log(
    chalk.dim(
      `  📚 Learn more about: ${commands.map((c) => `man ${c}`).join(", ")}`,
    ),
  );
  console.log();
}

function printFooter(meta) {
  if (!meta) return;

  const parts = [];
  if (meta.provider) parts.push(`Provider: ${meta.provider}`);
  if (meta.tokensUsed) {
    parts.push(
      `Tokens: ${meta.tokensUsed.inputTokens + meta.tokensUsed.outputTokens}`,
    );
  }

  if (parts.length) {
    console.log(chalk.dim(`  ${parts.join(" • ")}`));
  }
}
