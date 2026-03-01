import chalk from "chalk";

/**
 * Centralized constants for the application.
 */

// Styles for different danger levels in the output
export const DANGER_STYLES = {
  safe: { icon: "✅", color: chalk.green, label: "SAFE" },
  medium: { icon: "⚠️", color: chalk.yellow, label: "CAUTION" },
  high: { icon: "🚨", color: chalk.red, label: "DANGEROUS" },
  critical: {
    icon: "💀",
    color: chalk.bgRed.white.bold,
    label: "CRITICAL DANGER",
  },
};

// Patterns to detect dangerous commands
export const DANGER_PATTERNS = [
  {
    pattern: /^\s*sudo\s+rm\s+-\w*\s*\//,
    level: "critical",
    message: "Potentially catastrophic command: `sudo rm` on root.",
  },
  {
    pattern: /^\s*rm\s+-\w*\s*\/$/,
    level: "critical",
    message: "Potentially catastrophic command: `rm` on root.",
  },
  {
    pattern: /^\s*mv\s+\S+\s+\/dev\/null/,
    level: "critical",
    message: "Moving a file to /dev/null is equivalent to deleting it.",
  },
  {
    pattern: /dd\s+if=\/dev\/random/,
    level: "high",
    message: "`dd` can overwrite data. Using /dev/random is suspicious.",
  },
  {
    pattern: /:(){:|:&};:/,
    level: "high",
    message: "This is a 'fork bomb' and will crash your system.",
  },
  {
    pattern: /^\s*rm\s/,
    level: "medium",
    message: "The `rm` command permanently deletes files.",
  },
  {
    pattern: /^\s*sudo\s/,
    level: "medium",
    message: "`sudo` executes commands with root privileges.",
  },
  {
    pattern: /wget\s+http:\/\//,
    level: "medium",
    message: "Downloading from unencrypted HTTP URLs is insecure.",
  },
  {
    pattern: /curl\s+http:\/\//,
    level: "medium",
    message: "Downloading from unencrypted HTTP URLs is insecure.",
  },
];

// Minimum number of tokens for the AI response
export const MIN_TOKENS = 2048;
