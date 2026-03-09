#!/usr/bin/env node

import { Command } from "commander";
import {
  registerExplainCommand,
  registerUpdateCommand,
  registerGenerateCommand,
  registerSaveCommand,
  registerSavedCommand,
  registerInitCommand,
} from "../src/commands/index.js";
import { createAIProvider } from "../src/ai/ai.factory.js";
import { loadConfig } from "../src/config/config.manager.js";
import { logger } from "../src/utils/logger.js";
import chalk from "chalk";

// should run to load config and initialize AI provider before any command is executed
async function main() {
  const program = new Command();

  program
    .name("clix")
    .version("1.0.0")
    .description("AI-powered CLI command explainer and generator");

  let config = {};
  let aiProvider = null;

  try {
    config = loadConfig();
    aiProvider = createAIProvider(config);
  } catch (err) {
    // Config missing or invalid. We'll proceed so users can run 'init'.
    // We only log if it's NOT the "help" command (which the user might be running)
    // Actually, just let it be silent. The specific commands will check for aiProvider.
  }

  // Register all commands
  registerInitCommand(program);

  // We need to inject this check into the register functions, OR modify the register functions.
  // Modifying register functions is cleaner. But for now, let's pass `aiProvider` as null.
  // And update the commands to check `aiProvider`.

  registerExplainCommand(program, { aiProvider, config });
  registerUpdateCommand(program, { aiProvider, config });
  registerGenerateCommand(program, { aiProvider, config });
  registerSaveCommand(program, { config });
  registerSavedCommand(program, { config });

  await program.parseAsync(process.argv);
}

main();
