import chalk from "chalk";

export class ClixError extends Error {
  constructor(message, suggestion, code) {
    super(message);
    this.name = this.constructor.name;
    this.suggestion = suggestion;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ConfigFileMissingError extends ClixError {
  constructor(path) {
    super(
      `Configuration file not found at: ${path}`,
      "Run 'clix init' to set up your configuration.",
      "CONFIG_MISSING",
    );
  }
}

export class ReadConfigFileError extends ClixError {
  constructor(path, originalError) {
    super(
      `Failed to read configuration file at: ${path}`,
      `Check if the file exists and is readable. Details: ${originalError.message}`,
      "CONFIG_READ_ERROR",
    );
  }
}

export class WriteConfigFileError extends ClixError {
  constructor(path, originalError) {
    super(
      `Failed to save configuration to: ${path}`,
      `Ensure you have write permissions for the directory. Details: ${originalError.message}`,
      "CONFIG_WRITE_ERROR",
    );
  }
}

export class APIKeyMissingError extends ClixError {
  constructor(provider) {
    super(
      `API Key missing for provider: ${provider}`,
      "Run 'clix init' to update your configuration or check your environment variables.",
      "API_KEY_MISSING",
    );
  }
}

export class AIProviderError extends ClixError {
  constructor(
    message,
    suggestion = "Check your network connection and API status.",
  ) {
    super(message, suggestion, "AI_PROVIDER_ERROR");
  }
}

export class LLMError extends ClixError {
  constructor(message, suggestion = "Try again later or check your quota.") {
    super(message, suggestion, "LLM_ERROR");
  }
}

export class RateLimitError extends ClixError {
  constructor(provider) {
    super(
      `Rate limit exceeded for ${provider}`,
      "Wait for a while before trying again or upgrade your plan.",
      "RATE_LIMIT_EXCEEDED",
    );
  }
}

export class LLMServiceDownError extends ClixError {
  constructor(provider) {
    super(
      `${provider} is currently unavailable.`,
      `Please bear with us — the ${provider} service appears to be down. Try again in a few minutes.`,
      "LLM_SERVICE_DOWN",
    );
  }
}

export class CacheFileMissingError extends ClixError {
  constructor(path) {
    super(
      `Cache file not found at: ${path}`,
      "This is usually temporary. A new cache file will be created.",
      "CACHE_MISSING",
    );
  }
}

export class CacheReadError extends ClixError {
  constructor(path, originalError) {
    super(
      `Failed to read cache file at: ${path}`,
      `The cache file might be corrupted. Try clearing it manually. Details: ${originalError.message}`,
      "CACHE_READ_ERROR",
    );
  }
}

export class CacheWriteError extends ClixError {
  constructor(path, originalError) {
    super(
      `Failed to write to cache file at: ${path}`,
      `Ensure you have write permissions. Details: ${originalError.message}`,
      "CACHE_WRITE_ERROR",
    );
  }
}
