// src/infrastructure/services/ai/OpenRouterService.js
const logger = require("../../utils/logger");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Thin client for the OpenRouter chat-completions API.
 *
 * Config comes from the environment so the model can be swapped without a code
 * change:
 *   OPENROUTER_API_KEY   (required)
 *   OPENROUTER_MODEL     (optional, defaults to a cheap DeepSeek model)
 *   OPENROUTER_BASE_URL  (optional, for proxies/self-hosting)
 *   OPENROUTER_TIMEOUT_MS(optional, defaults to 60000)
 *
 * Uses the global fetch (Node 18+), matching the pattern already used by
 * TypingTextController.summarize. No SDK dependency.
 */
class OpenRouterService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    this.model = process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat";
    this.baseUrl = process.env.OPENROUTER_BASE_URL || OPENROUTER_URL;
    this.timeoutMs = Number(process.env.OPENROUTER_TIMEOUT_MS) || 60000;
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  /**
   * Send a chat completion request and return the assistant message content.
   *
   * @param {Object} params
   * @param {Array<{role: string, content: string}>} params.messages
   * @param {number} [params.temperature]
   * @param {number} [params.maxTokens]
   * @param {boolean} [params.jsonMode] request a JSON object response
   * @returns {Promise<{content: string, model: string, usage: object|null}>}
   */
  async chat({ messages, temperature = 0.7, maxTokens = 4000, jsonMode = false }) {
    if (!this.isConfigured()) {
      const err = new Error("OPENROUTER_API_KEY is not configured.");
      err.code = "AI_NOT_CONFIGURED";
      throw err;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    const body = {
      model: this.model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    if (jsonMode) {
      // Ask OpenRouter to constrain the response to a JSON object where supported.
      body.response_format = { type: "json_object" };
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          // Optional attribution headers OpenRouter uses for dashboard stats.
          "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:5000",
          "X-OpenRouter-Title": process.env.OPENROUTER_APP_NAME || "Learning App",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const detail = await this._readErrorDetail(response);
        logger.error(
          `[OpenRouter] ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ""}`
        );

        const err = new Error(
          response.status === 401
            ? "AI provider rejected the API key."
            : `AI provider request failed (${response.status}).`
        );
        err.code = "AI_PROVIDER_ERROR";
        err.status = response.status;
        throw err;
      }

      const data = await response.json();
      const choice = data?.choices?.[0];
      const content = choice?.message?.content;

      if (typeof content !== "string" || content.trim() === "") {
        // A reasoning model can spend its whole budget on reasoning tokens and
        // return empty content with finish_reason "length". Report that clearly
        // instead of a bare "empty response", since the fix is different.
        const finishReason = choice?.finish_reason;
        const reasoningTokens = data?.usage?.completion_tokens_details?.reasoning_tokens;

        const err = new Error(
          finishReason === "length"
            ? "The AI ran out of output tokens before producing an answer" +
              (reasoningTokens ? ` (${reasoningTokens} went to reasoning).` : ".") +
              " Try fewer questions, or use a non-reasoning model."
            : "AI provider returned an empty response."
        );
        err.code = finishReason === "length" ? "AI_TRUNCATED" : "AI_EMPTY_RESPONSE";
        throw err;
      }

      return {
        content,
        model: data?.model || this.model,
        usage: data?.usage || null,
      };
    } catch (error) {
      if (error?.name === "AbortError") {
        const err = new Error("AI provider timed out.");
        err.code = "AI_TIMEOUT";
        throw err;
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async _readErrorDetail(response) {
    try {
      const text = await response.text();
      return text ? text.slice(0, 500) : "";
    } catch {
      return "";
    }
  }
}

module.exports = new OpenRouterService();
