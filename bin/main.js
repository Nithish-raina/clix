#!/usr/bin/env node

import { Command } from "commander";
import { registerExplainCommand } from "../src/commands/explain.command.js";
import { createAIProvider } from "../src/ai/ai.factory.js";
import { loadConfig } from "../src/config/config.manager.js";
import { logger } from "../src/utils/logger.js";

// should run to load config and initialize AI provider before any command is executed
async function main() {
  try {
    const config = loadConfig();
    const aiProvider = createAIProvider(config);

    const program = new Command();

    // returns this so we could chain with other configurations if needed
    program
      .name("clix")
      .version("1.0.0")
      .description("AI-powered CLI command explainer and generator");

    // Register all commands

    // TODO: maintian a command config registry and loop through it to register commands. For now let's add them manually
    // Pass in any param in options object for the command handler.
    registerExplainCommand(program, { aiProvider, config });

    await program.parseAsync(process.argv);
  } catch (error) {
    logger.error(error.message);
    // TODO: add retry logic since this is more critical operation.
    // Add more user-friendly error messages and provide feedback on how to fix common issues (e.g., missing API key, invalid config).
    process.exit(1);
  }
}

main();
