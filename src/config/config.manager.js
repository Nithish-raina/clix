import fs from "node:fs";
import { DEFAULT_CONFIG, ENV_KEY_MAP } from "./defaults.js";
import { logger } from "../utils/logger.js";
import { CONFIG_FILE, CONFIG_DIR } from "./constants.js";
import {
  ConfigFileMissingError,
  ReadConfigFileError,
  WriteConfigFileError,
  APIKeyMissingError,
} from "../errors/clix-error.js";

/**
 * Load config with Priority: env vars > config file > defaults
 */
export function loadConfig() {
  let fileConfig = {};
  let configExists = false;

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      configExists = true;
      const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
      try {
        fileConfig = JSON.parse(raw);
      } catch (e) {
        throw new ReadConfigFileError(CONFIG_FILE, e);
      }
    }
  } catch (err) {
    if (err instanceof ReadConfigFileError) {
      throw err;
    }
    // If accessing the file system fails for other reasons (permissions?)
    logger.warn(`Failed to access config file: ${err.message}.`);
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
    throw new APIKeyMissingError(config.provider);
  }

  // Saving the config file if it doesn't exist, so future calls would load config from the file instead of again going through env var.
  if (!configExists) {
    try {
      saveConfig(config);
    } catch (e) {
      // If we can't save during auto-save, just warn, don't crash.
      logger.warn(`Could not auto-save config: ${e.message}`);
    }
  }

  return config;
}

/**
 * Save config to the config file
 */
export function saveConfig(config) {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    const toSave = { ...config };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(toSave, null, 2), "utf-8");
  } catch (err) {
    throw new WriteConfigFileError(CONFIG_FILE, err);
  }
}

export { CONFIG_FILE, CONFIG_DIR };
