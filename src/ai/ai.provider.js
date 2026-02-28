/**
 * Abstract AI Provider contract.
 * Every concrete provider (Anthropic, OpenAI, Ollama, etc.) must extend this
 * and implement all methods.
 *
 * Business logic depends on THIS interface, never on concrete providers.
 */
class AIProvider {
  constructor(config) {
    if (new.target === AIProvider) {
      throw new Error(
        "AIProvider is abstract and cannot be instantiated directly. Use a concrete provider.",
      );
    }
    this.config = config;
  }

  /**
   * Provider display name (e.g., "Anthropic Claude", "OpenAI GPT")
   * @returns {string}
   */
  get name() {
    throw new Error("name getter must be implemented by provider");
  }

  /**
   * Send a prompt to the AI and get a completion.
   *
   * @param {object} options
   * @param {string} options.systemPrompt - The system instructions
   * @param {string} options.userMessage  - The user's input
   * @param {number} [options.maxTokens]  - Max tokens for response
   * @returns {Promise<{ content: string, usage: { inputTokens: number, outputTokens: number } }>}
   */
  async complete({ systemPrompt, userMessage, maxTokens }) {
    throw new Error("complete() must be implemented by provider");
  }
}

export default AIProvider;
