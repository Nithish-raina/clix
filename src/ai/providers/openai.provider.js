import OpenAI from "openai";
import AIProvider from "../ai.provider.js";

class OpenAIProvider extends AIProvider {
  constructor(config) {
    super(config);
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.model = config.model || "gpt-5.4";
  }

  get name() {
    return `OpenAI (${this.model})`;
  }

  async complete({ systemPrompt, userMessage }) {
    const tokensLimit = this.config.maxTokens || 2048;

    const response = await this.client.chat.completions.create({
      model: this.model,
      max_completion_tokens: tokensLimit,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    return {
      content: response.choices[0].message.content,
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
      },
    };
  }
}

export default OpenAIProvider;
