import { select, password } from "@inquirer/prompts";
import { saveConfig } from "../config/config.manager.js";
import { AVAILABLE_PROVIDERS } from "../ai/ai.factory.js";
import { logger } from "../utils/logger.js";
import { ClixError, WriteConfigFileError } from "../errors/clix-error.js";
import chalk from "chalk";

const MODELS = {
  anthropic: [
    {
      name: "Claude 4.6 Sonnet (Recommended)",
      value: "claude-sonnet-4-6",
    },
    { name: "Claude 4.6 Opus", value: "claude-opus-4-6" },
    { name: "Claude 4.5 Haiku (Fastest)", value: "claude-haiku-4-5" },
  ],
  openai: [
    { name: "GPT-5.4 (Recommended)", value: "gpt-5.4" },
    { name: "GPT-5.4 Pro", value: "gpt-5.4-pro" },
    { name: "GPT-5 Mini (Fastest)", value: "gpt-5-mini" },
    { name: "GPT-4o (Legacy)", value: "gpt-4o" },
  ],
  gemini: [
    {
      name: "Gemini 3.1 Pro (New Preview)",
      value: "gemini-3.1-pro-preview",
    },
    {
      name: "Gemini 3.1 Flash-Lite (Fastest)",
      value: "gemini-3.1-flash-lite-preview",
    },
    { name: "Gemini 2.5 Flash", value: "gemini-2.5-flash" },
    { name: "Gemini 2.5 Pro", value: "gemini-2.5-pro" },
  ],
};

export function registerInitCommand(program) {
  program
    .command("init")
    .description("Initialize Clix configuration (Provider, Model, API Key)")
    .action(async () => {
      console.log(
        chalk.blue("Welcome to Clix! Let's set up your environment.\n"),
      );

      try {
        const provider = await select({
          message: "Select your AI Provider:",
          choices: AVAILABLE_PROVIDERS.map((p) => ({
            name: p.charAt(0).toUpperCase() + p.slice(1),
            value: p,
          })),
        });

        const modelChoices = MODELS[provider] || [
          { name: "Default Model", value: "default" },
        ];

        const model = await select({
          message: `Select a model for ${provider}:`,
          choices: modelChoices,
        });

        const apiKey = await password({
          message: `Enter your API Key for ${provider}:`,
          mask: "*",
          validate: (input) =>
            input.trim().length > 0 || "API Key is required.",
        });

        const config = {
          provider,
          model,
          apiKey,
        };

        try {
          saveConfig(config);
          logger.success(
            "Configuration saved successfully! You can now use Clix.",
          );
        } catch (err) {
          throw new WriteConfigFileError("config", err);
        }
      } catch (error) {
        if (error.name === "ExitPromptError") {
          logger.warn("\nInitialization cancelled.");
          return;
        }
        throw error;
      }
    });
}
