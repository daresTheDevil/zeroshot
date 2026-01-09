// @ts-nocheck
/**
 * DirectApiCaller - Fast path for conductor classification
 *
 * Bypasses Claude CLI overhead (58K tokens system context) by making
 * direct Anthropic API calls. Used for simple classification tasks
 * where full tooling is not needed.
 *
 * Performance:
 * - Claude CLI: ~27 seconds (loads all CLAUDE.md, skills, hooks)
 * - Direct API: ~1-2 seconds (minimal context)
 *
 * Use when:
 * - Agent config has `useDirectApi: true`
 * - Task is simple classification (no tools needed)
 * - Agent has JSON schema output format
 */

const Anthropic = require('@anthropic-ai/sdk').default;

// Model ID mapping
const MODEL_MAP = {
  haiku: 'claude-3-5-haiku-latest',
  sonnet: 'claude-sonnet-4-20250514',
  opus: 'claude-opus-4-20250514',
};

// Singleton client instance
let anthropicClient = null;

/**
 * Get or create Anthropic client
 * @returns {Anthropic} Anthropic client instance
 */
function getClient() {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY environment variable required for direct API calls. ' +
          'Set it or use Claude CLI authentication instead.'
      );
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

/**
 * Execute a simple classification task via direct API
 *
 * @param {Object} params - Call parameters
 * @param {string} params.prompt - The prompt/context to send
 * @param {string} params.model - Model name (haiku/sonnet/opus)
 * @param {Object} [params.jsonSchema] - JSON schema for structured output
 * @param {string} [params.systemPrompt] - System prompt (extracted from agent config)
 * @param {number} [params.maxTokens=1024] - Maximum output tokens
 * @returns {Promise<Object>} Result with { success, result, usage, durationMs }
 */
async function callDirectApi({ prompt, model, jsonSchema, systemPrompt, maxTokens = 1024 }) {
  const client = getClient();
  const modelId = MODEL_MAP[model] || model;

  const startTime = Date.now();

  try {
    // Build messages
    const messages = [{ role: 'user', content: prompt }];

    // Build request options
    const requestOptions = {
      model: modelId,
      max_tokens: maxTokens,
      messages,
    };

    // Add system prompt if provided
    if (systemPrompt) {
      requestOptions.system = systemPrompt;
    }

    // Make API call
    const response = await client.messages.create(requestOptions);

    const durationMs = Date.now() - startTime;

    // Extract text content
    const textContent = response.content.find((c) => c.type === 'text');
    const rawResult = textContent?.text || '';

    // Parse JSON if schema is provided
    let parsedResult = rawResult;
    if (jsonSchema) {
      try {
        // Try to extract JSON from the response
        // First try direct parse
        parsedResult = JSON.parse(rawResult);
      } catch {
        // Try to find JSON in markdown block
        const jsonMatch = rawResult.match(/```json\s*([\s\S]*?)```/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[1].trim());
        } else {
          // Try to find any JSON object in the response
          const objectMatch = rawResult.match(/\{[\s\S]*\}/);
          if (objectMatch) {
            parsedResult = JSON.parse(objectMatch[0]);
          } else {
            throw new Error(`Could not parse JSON from response: ${rawResult.slice(0, 200)}`);
          }
        }
      }

      // Validate against schema
      const Ajv = require('ajv');
      const ajv = new Ajv({ allErrors: true, strict: false });
      const validate = ajv.compile(jsonSchema);
      if (!validate(parsedResult)) {
        const errors = validate.errors?.map((e) => `${e.instancePath} ${e.message}`).join('; ');
        throw new Error(`JSON schema validation failed: ${errors}`);
      }
    }

    return {
      success: true,
      result: parsedResult,
      rawResult,
      usage: {
        inputTokens: response.usage?.input_tokens || 0,
        outputTokens: response.usage?.output_tokens || 0,
      },
      durationMs,
      durationApiMs: durationMs, // Same for direct API
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;

    // Handle rate limiting
    if (error.status === 429) {
      return {
        success: false,
        error: 'Rate limited - try again later',
        durationMs,
      };
    }

    // Handle other API errors
    return {
      success: false,
      error: error.message || String(error),
      durationMs,
    };
  }
}

/**
 * Check if an agent should use direct API
 *
 * @param {Object} agentConfig - Agent configuration
 * @returns {boolean} True if agent should use direct API
 */
function shouldUseDirectApi(agentConfig) {
  // Direct API requires ANTHROPIC_API_KEY
  // If not set, fall back to Claude CLI (slower but works with OAuth)
  if (!process.env.ANTHROPIC_API_KEY) {
    return false;
  }

  // Explicit opt-in via config
  if (agentConfig.useDirectApi === true) {
    return true;
  }

  // Explicit opt-out
  if (agentConfig.useDirectApi === false) {
    return false;
  }

  // Auto-detect: Use direct API for conductor agents with JSON output
  // These are simple classification tasks that don't need tools
  if (
    agentConfig.role === 'conductor' &&
    agentConfig.outputFormat === 'json' &&
    agentConfig.jsonSchema
  ) {
    return true;
  }

  return false;
}

module.exports = {
  callDirectApi,
  shouldUseDirectApi,
  getClient,
  MODEL_MAP,
};
