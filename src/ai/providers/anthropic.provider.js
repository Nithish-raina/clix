import Anthropic from "@anthropic-ai/sdk";
import AIProvider from "../ai.provider.js";

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
