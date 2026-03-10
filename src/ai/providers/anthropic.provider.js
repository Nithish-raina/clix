import Anthropic from "@anthropic-ai/sdk";
import AIProvider from "../ai.provider.js";
import {
  LLMError,
  RateLimitError,
  AIProviderError,
} from "../../errors/clix-error.js";

class AnthropicProvider extends AIProvider {
  constructor(config) {
    super(config);
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.model = config.model || "claude-sonnet-4-6";
  }

  get name() {
    return `Anthropic (${this.model})`;
  }

  async complete({ systemPrompt, userMessage }) {
    const tokensLimit = this.config.maxTokens || 2048;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: tokensLimit,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      });

      // Extract text from the response content blocks
      const content = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      return {
        content,
        usage: {
          inputTokens: response.usage?.input_tokens || 0,
          outputTokens: response.usage?.output_tokens || 0,
        },
      };
    } catch (err) {
      if (err instanceof Anthropic.APIError) {
        if (err.status === 401) {
          throw new AIProviderError(
            `Anthropic Authentication Failed: ${err.message}`,
            "Check your API Key in ~/.clix/config.json or CLIX_ANTHROPIC_KEY env var.",
          );
        }
        if (err.status === 429) {
          throw new RateLimitError("Anthropic");
        }
        throw new LLMError(
          `Anthropic API Error (${err.status}): ${err.message}`,
        );
      }
      throw new LLMError(`Anthropic Unexpected Error: ${err.message}`);
    }
  }

  async validateConnection() {
    try {
      await this.complete({
        systemPrompt: "Respond with exactly: ok",
        userMessage: "ping",
        maxTokens: 8,
      });
      return true;
    } catch (err) {
      return false;
    }
  }
}

export default AnthropicProvider;
