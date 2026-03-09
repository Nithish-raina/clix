import AnthropicProvider from "./providers/anthropic.provider.js";
import OpenAIProvider from "./providers/openai.provider.js";

/**
 * Registry of available AI providers.
 * To add a new provider:
 *   1. Create src/ai/providers/yourprovider.provider.js extending AIProvider
 *   2. Add it to this map
 *   3. That's it — all features automatically support it
 */
const PROVIDERS = {
  anthropic: AnthropicProvider,
  openai: OpenAIProvider,
  // ollama: OllamaProvider,     ← uncomment when ready
};

export const AVAILABLE_PROVIDERS = Object.keys(PROVIDERS);

/**
 * Factory function that creates the correct AI provider based on config.
 *
 * @param {object} config - The full app config (must include .provider and .apiKey)
 * @returns {AIProvider} A concrete provider instance
 */
export function createAIProvider(config) {
  const providerName = config.provider;
  const ProviderClass = PROVIDERS[providerName];

  if (!ProviderClass) {
    const available = Object.keys(PROVIDERS).join(", ");
    throw new Error(
      `Unknown AI provider: "${providerName}". Available providers: ${available}`,
    );
  }

  return new ProviderClass(config);
}
