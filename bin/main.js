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
import { handleGlobalError } from "../src/errors/global-handler.js";
import { APIKeyMissingError } from "../src/errors/clix-error.js";
import chalk from "chalk";

// should run to load config and initialize AI provider before any command is executed
async function main() {
  try {
    const program = new Command();

    program
      .name("clix")
      .version("1.0.0")
      .description("AI-powered CLI command explainer and generator");

    let config = {};
    let aiProvider = null;

    // Register init command first, as it doesn't need config/provider
    registerInitCommand(program);

    try {
      config = loadConfig();
      aiProvider = createAIProvider(config);
    } catch (err) {
      // If API Key is missing, we STILL want the CLI to run so users can run `clix init`.
      // But other commands should fail if run.
      if (err instanceof APIKeyMissingError) {
        // We can log a warning or just let specific commands handle the missing provider.
        // For now, let's leave aiProvider as null.
      } else {
        // Other config errors (read/write errors) should probably stop execution or warn.
        // We'll throw to global handler if it's critical, or just warn?
        // Let's throw to global handler to show pretty error, unless it's just missing config which 'init' fixes.
        // Actually, if loadConfig throws, it means we can't proceed with AI commands.
        // But we want 'init' to work.
        // So we catch here.
      }
    }

    // Register all commands
    // We pass config & provider. If they are null/empty, the specific command action should check.

    registerExplainCommand(program, { aiProvider, config });
    registerUpdateCommand(program, { aiProvider, config });
    registerGenerateCommand(program, { aiProvider, config });
    registerSaveCommand(program, { config });
    registerSavedCommand(program, { config });

    await program.parseAsync(process.argv);
  } catch (error) {
    handleGlobalError(error);
  }
}

main();
