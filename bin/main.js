#!/usr/bin/env node

import { Command } from "commander";
import { registerExplainCommand } from "../src/commands/explain.command.js";
import { createAIProvider } from "../src/ai/ai.factory.js";
import { loadConfig } from "../src/config/config.manager.js";
import { logger } from "../src/utils/logger.js";

async function main() {
  try {
    const config = loadConfig();
    const aiProvider = createAIProvider(config);

    const program = new Command();

    program
      .name("clix")
      .version("1.0.0")
      .description("AI-powered CLI command explainer and generator");

    // Register all commands
    registerExplainCommand(program, { aiProvider, config });
    // Register other commands here...

    await program.parseAsync(process.argv);
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}

main();
