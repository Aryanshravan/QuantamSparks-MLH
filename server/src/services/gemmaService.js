import { HfInference } from '@huggingface/inference';

/**
 * Service for genuine Google Gemma model inference via Hugging Face Inference Providers.
 */
export class GemmaService {
  constructor() {
    this.model = process.env.GEMMA_MODEL || 'google/gemma-3-4b-it';
  }

  getHfClient() {
    const token = process.env.HF_TOKEN;
    if (!token) {
      throw new Error('HF_TOKEN is not configured. Please set your Hugging Face API token in .env');
    }
    return new HfInference(token);
  }

  /**
   * Run a chat completion query against Google Gemma.
   * @param {Array<{role: string, content: string}>} messages
   * @param {Object} options
   */
  async chatCompletion(messages, options = {}) {
    const token = process.env.HF_TOKEN;
    if (!token) {
      throw new Error('HF_TOKEN is missing in the environment. Please add it to your .env file.');
    }

    const model = options.model || this.model;
    const temperature = options.temperature ?? 0.2;
    const max_tokens = options.max_tokens ?? 2048;

    try {
      const hf = this.getHfClient();
      const response = await hf.chatCompletion({
        model: model,
        messages: messages,
        max_tokens: max_tokens,
        temperature: temperature,
      });

      if (response && response.choices && response.choices.length > 0) {
        return {
          content: response.choices[0].message.content,
          model: model,
          usage: response.usage || null,
        };
      }
      throw new Error('No completion choice returned from Hugging Face.');
    } catch (err) {
      console.warn(`[GemmaService] HfInference chatCompletion failed (${err.message}). Trying fallback endpoint...`);
      // Fallback direct REST call to Hugging Face Inference API / Router
      return await this.fallbackChatCompletion(messages, { model, temperature, max_tokens });
    }
  }

  /**
   * Fallback direct HTTP call to Hugging Face Inference API.
   */
  async fallbackChatCompletion(messages, { model, temperature, max_tokens }) {
    const token = process.env.HF_TOKEN;
    const endpoints = [
      `https://router.huggingface.co/hf-inference/models/${model}/v1/chat/completions`,
      `https://api-inference.huggingface.co/models/${model}/v1/chat/completions`
    ];

    let lastError = null;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            max_tokens: max_tokens,
            temperature: temperature
          })
        });

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`HF HTTP ${res.status}: ${errBody}`);
        }

        const data = await res.json();
        if (data && data.choices && data.choices[0]?.message?.content) {
          return {
            content: data.choices[0].message.content,
            model: model,
            usage: data.usage || null
          };
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw new Error(`Gemma inference failed: ${lastError?.message || 'Could not complete inference'}`);
  }

  /**
   * Test inference connectivity with a minimal ping prompt.
   */
  async verifyConnection() {
    return await this.chatCompletion([
      { role: 'user', content: 'Respond with exactly: "Gemma inference operational."' }
    ], { max_tokens: 30 });
  }
}

export const gemmaService = new GemmaService();
