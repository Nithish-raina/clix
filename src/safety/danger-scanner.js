// Reg exp Patterns generated using AI

// TODO Both danger patterns and levelPriority numerics should ideally come from a config file or database to make it easier to update without code changes. For now, hardcoding is fine.
const DANGER_PATTERNS = [
  {
    pattern: /rm\s+(-[a-zA-Z]*f[a-zA-Z]*\s+|.*-rf|.*-fr)/,
    level: "high",
    message: "Force removes files/directories with no confirmation or recovery",
  },
  {
    pattern: /rm\s+-/,
    level: "medium",
    message: "Removes files — deleted files cannot be recovered from trash",
  },
  {
    pattern: />\s*\/dev\/sd[a-z]/,
    level: "critical",
    message:
      "Writes directly to a disk device — will destroy all data on the drive",
  },
  {
    pattern: /mkfs\./,
    level: "critical",
    message:
      "Formats a filesystem — all existing data will be permanently erased",
  },
  {
    pattern: /dd\s+if=/,
    level: "high",
    message: "Low-level data copy — can overwrite entire disks if misused",
  },
  {
    pattern: /chmod\s+(-R\s+)?777/,
    level: "medium",
    message:
      "Sets full read/write/execute permissions for everyone — security risk",
  },
  {
    pattern: /chmod\s+(-R\s+)?000/,
    level: "medium",
    message: "Removes all permissions — may lock you out of files",
  },
  {
    pattern: /:\(\)\s*\{\s*:\|:\s*&\s*\}\s*;:/,
    level: "critical",
    message:
      "Fork bomb — will crash your system by spawning infinite processes",
  },
  {
    pattern: />\s*\/etc\/passwd/,
    level: "critical",
    message:
      "Overwrites the system user database — will break user authentication",
  },
  {
    pattern: /curl\s.*\|\s*(bash|sh|zsh)/,
    level: "high",
    message:
      "Pipes remote code directly into a shell — executes untrusted code",
  },
  {
    pattern: /wget\s.*\|\s*(bash|sh|zsh)/,
    level: "high",
    message:
      "Pipes remote code directly into a shell — executes untrusted code",
  },
  {
    pattern: /--force\s+push|push\s+.*--force|push\s+-f/,
    level: "medium",
    message: "Force push overwrites remote git history — may lose team commits",
  },
  {
    pattern: /git\s+reset\s+--hard/,
    level: "medium",
    message: "Hard reset discards all uncommitted changes permanently",
  },
  {
    pattern: /git\s+clean\s+-[a-zA-Z]*f/,
    level: "medium",
    message: "Removes untracked files permanently — cannot be recovered",
  },
  {
    pattern: /shutdown|reboot|init\s+[06]/,
    level: "medium",
    message: "Will shut down or restart the system",
  },
  {
    pattern: /kill\s+-9|killall|pkill/,
    level: "medium",
    message: "Force-kills processes — may cause data loss or corruption",
  },
  {
    pattern: /docker\s+(system\s+prune|volume\s+prune)/,
    level: "medium",
    message:
      "Removes Docker resources — stopped containers, unused volumes/images",
  },
  {
    pattern: /DROP\s+(TABLE|DATABASE)/i,
    level: "critical",
    message: "Permanently deletes a database table or entire database",
  },
];

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
