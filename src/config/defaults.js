export const DEFAULT_CONFIG = {
  // AI provider: 'anthropic' | 'openai' (extensible)
  provider: "anthropic",

  // API key — loaded from config file or environment variable
  apiKey: null,

  // Model override — null means use the provider's default
  model: null,

  // Max tokens for AI responses
  maxTokens: 1024,

  // Default explanation mode: 'default' | 'beginner'
  defaultMode: "default",
};

// Environment variable names per provider for API key fallback
export const ENV_KEY_MAP = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
};
