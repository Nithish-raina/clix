/**
 * Clean and validate the raw command input.
 *
 * @param {string} rawInput - The command string from the user
 * @returns {{ command: string, isPiped: boolean, hasRedirects: boolean, isMultiCommand: boolean }}
 */
export function parseCommandInput(rawInput) {
  // Trim whitespace and remove surrounding quotes if user wrapped the whole thing
  let command = rawInput.trim();

  // Remove wrapping quotes: clix explain "'ls -la'" → ls -la
  if (
    (command.startsWith('"') && command.endsWith('"')) ||
    (command.startsWith("'") && command.endsWith("'"))
  ) {
    command = command.slice(1, -1).trim();
  }

  // Detect structural features of the command
  const isPiped = /\|(?!\|)/.test(command); // has pipe but not ||
  const hasRedirects = /[<>]|>>/.test(command); // has redirects
  const isMultiCommand = /[;&]|&&|\|\|/.test(command); // chained commands

  return {
    command,
    isPiped,
    hasRedirects,
    isMultiCommand,
  };
}

/**
 * Validate that the input looks like a command worth explaining.
 *
 * @param {string} command
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateCommand(command) {
  if (!command || command.length === 0) {
    return {
      valid: false,
      reason: 'No command provided. Usage: clix explain "your command here"',
    };
  }

  if (command.length > 2000) {
    return {
      valid: false,
      reason:
        "Command is too long (max 2000 characters). Try breaking it into smaller parts.",
    };
  }

  return { valid: true };
}
