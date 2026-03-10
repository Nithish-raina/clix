import { GoogleGenerativeAI } from "@google/generative-ai";
import AIProvider from "../ai.provider.js";

/**
 * AIProvider implementation for Google Gemini models.
 */
class GeminiProvider extends AIProvider {
  /**
   * @param {Object} config - The configuration for the provider.
   * @param {string} config.apiKey - The API key for Gemini.
   * @param {string} [config.model] - The model identifier to use.
   */
  constructor(config) {
    super(config);
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || "gemini-2.5-flash";
  }

  get name() {
    return `Gemini (${this.model})`;
  }

  /**
   * Sends a completion request to the Gemini API.
   * @param {Object} options
   * @param {string} options.systemPrompt - The system context/instructions.
   * @param {string} options.userMessage - The user's input/prompt.
   * @param {number} [options.maxTokens] - The maximum tokens for the response.
   * @returns {Promise<{ content: string, usage: { inputTokens: number, outputTokens: number } }>}
   */
  async complete({ systemPrompt, userMessage }) {
    // Gemini 1.5+ supports system instructions directly in config.
    const model = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: systemPrompt,
    });

    const generationConfig = {
      maxOutputTokens: this.config.maxTokens || 2048,
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig,
    });

    const response = result.response;
    const content = response.text();
    const usageMetadata = response.usageMetadata || {};

    return {
      content,
      usage: {
        inputTokens: usageMetadata.promptTokenCount || 0,
        outputTokens: usageMetadata.candidatesTokenCount || 0,
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

export default GeminiProvider;
