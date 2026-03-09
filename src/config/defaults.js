import "dotenv/config";
export const DEFAULT_CONFIG = {
  // AI provider: 'anthropic' | 'openai' (extensible)
  provider: "anthropic",

  // API key — loaded from config file or environment variable
  apiKey: null,

  // Model override — null means use the provider's default
  // Let the provider decide the default model (e.g. claude-sonnet-4-6 or gpt-5.4)
  model: null,

  // Max tokens for AI responses
  // Increased this to 2048, for beginner level explanations which can be more verbose. We can adjust this based on usage and costs.
  maxTokens: 2048,

  // Default explanation mode: 'default' | 'beginner'
  defaultMode: "default",
};

// Environment variable names per provider for API key fallback
export const ENV_KEY_MAP = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  google: "GOOGLE_API_KEY",
};
