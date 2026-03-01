// Reg exp Patterns generated using AI

// TODO Both danger patterns and levelPriority numerics should ideally come from a config file or database to make it easier to update without code changes. For now, hardcoding is fine.
import { DANGER_PATTERNS } from "../config/constants";

/**
 * Scan a command string for known dangerous patterns.
 *
 * @param {string} command - The raw command string to scan
 * @returns {{ hasDanger: boolean, level: string, warnings: string[] }}
 */
export function scanForDanger(command) {
  const warnings = [];
  let highestLevel = "safe";

  const levelPriority = { safe: 0, medium: 1, high: 2, critical: 3 };

  for (const { pattern, level, message } of DANGER_PATTERNS) {
    if (pattern.test(command)) {
      warnings.push({ level, message });

      if (levelPriority[level] > levelPriority[highestLevel]) {
        highestLevel = level;
      }
    }
  }

  return {
    hasDanger: warnings.length > 0,
    level: highestLevel,
    warnings,
  };
}
