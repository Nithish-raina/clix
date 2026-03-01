import "dotenv/config";
export const DEFAULT_CONFIG = {
  // AI provider: 'anthropic' | 'openai' (extensible)
  provider: "anthropic",

  // API key — loaded from config file or environment variable
  apiKey: process.env.ANTHROPIC_API_KEY || null,

  // Model override — null means use the provider's default
  model: "claude-haiku-4-5",

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
};
