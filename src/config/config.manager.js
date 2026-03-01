import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { DEFAULT_CONFIG, ENV_KEY_MAP } from "./defaults.js";
import { logger } from "../utils/logger.js";

const CONFIG_DIR = path.join(os.homedir(), ".clix");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

/**
 * Load config with Priority: env vars > config file > defaults
 */
export function loadConfig() {
  let fileConfig = {};

  let configExists = false;
  try {
    configExists = fs.existsSync(CONFIG_FILE);
  } catch (err) {
    logger.warn(`Failed to access config file: ${err.message}.`);
  }

  // Try reading the config file
  if (configExists) {
    try {
      const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
      fileConfig = JSON.parse(raw);
    } catch (err) {
      // Silently fall back to defaults if config is malformed
      logger.warn(
        `Failed to read config file: ${err.message}. Using defaults and env vars.`,
      );
    }
  }

  // Merge defaults with file config
  const config = { ...DEFAULT_CONFIG, ...fileConfig };

  // Environment variable override for API key
  const envKey = ENV_KEY_MAP[config.provider];
  if (envKey && process.env[envKey]) {
    config.apiKey = process.env[envKey];
  }

  // Validate that we have an API key
  if (!config.apiKey) {
    throw new Error(
      `No API key found. Either:\n` +
        `  1. Set ${ENV_KEY_MAP[config.provider] || "your provider API key"} environment variable\n` +
        `  2. Create ${CONFIG_FILE} with { "apiKey": "your-key" }\n\n` +
        `  Run: mkdir -p ~/.clix && echo '{"provider":"anthropic","apiKey":"your-key"}' > ~/.clix/config.json`,
    );
  }

  // Saving the config file if it doesn't exist, so future calls would load config from the file instead of again going through env var.
  if (!configExists) {
    saveConfig(config);
  }

  return config;
}

/**
 * Save config to the config file
 */
export function saveConfig(config) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  const toSave = { ...config };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(toSave, null, 2), "utf-8");
}

export { CONFIG_FILE, CONFIG_DIR };
