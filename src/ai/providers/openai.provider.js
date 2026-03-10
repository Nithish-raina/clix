import OpenAI from "openai";
import AIProvider from "../ai.provider.js";
import {
  LLMError,
  RateLimitError,
  AIProviderError,
} from "../../errors/clix-error.js";

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

    try {
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
    } catch (err) {
      if (err instanceof OpenAI.APIError) {
        if (err.status === 401) {
          throw new AIProviderError(
            `OpenAI Authentication Failed: ${err.message}`,
            "Check your API Key in ~/.clix/config.json or CLIX_OPENAI_KEY env var.",
          );
        }
        if (err.status === 429) {
          throw new RateLimitError("OpenAI");
        }
        throw new LLMError(`OpenAI API Error (${err.status}): ${err.message}`);
      }
      throw new LLMError(`OpenAI Unexpected Error: ${err.message}`);
    }
  }
}

export default OpenAIProvider;
