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
  if (!command || command.trim().length === 0) {
    return {
      valid: false,
      reason: "Command cannot be empty.",
    };
  }

  if (command.length > 500) {
    return {
      valid: false,
      reason:
        "Command is too long (max 500 characters). Try breaking it into smaller parts.",
    };
  }

  // Reject null bytes and control characters (except common whitespace)
  // Null bytes can truncate strings in C-based tools and bypass security checks.
  // Control characters have no legitimate use in CLI commands and may indicate
  // an injection attempt (e.g., terminal escape sequence injection).
  // eslint-disable-next-line no-control-regex
  const controlCharPattern = /[\x00-\x08\x0E-\x1F\x7F]/;
  if (controlCharPattern.test(command)) {
    return {
      valid: false,
      reason:
        "Command contains invalid control characters. Please use only printable characters.",
    };
  }

  return { valid: true };
}
