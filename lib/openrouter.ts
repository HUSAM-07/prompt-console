import type {
  OpenRouterRequest,
  OpenRouterResponse,
  OpenRouterStreamChunk,
  OpenRouterModelResponse,
  OpenRouterModelInfo,
} from '@/types/openrouter';
import { OPENROUTER_BASE_URL, VARIABLE_REGEX } from './constants';

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = OPENROUTER_BASE_URL;
  }

  private getHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
      'X-Title': 'Prompt Console',
    };
  }

  /**
   * Validate the API key by making a test request
   */
  async validateKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get available models from OpenRouter
   */
  async getModels(): Promise<OpenRouterModelInfo[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data: OpenRouterModelResponse = await response.json();
    return data.data;
  }

  /**
   * Chat completion (non-streaming)
   */
  async chat(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...request,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Chat completion with streaming
   */
  async *chatStream(
    request: OpenRouterRequest
  ): AsyncGenerator<OpenRouterStreamChunk, void, unknown> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...request,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Request failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed === '' || trimmed === 'data: [DONE]') {
          continue;
        }

        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            yield json as OpenRouterStreamChunk;
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }
  }

  /**
   * Helper to interpolate variables in content
   */
  static interpolateVariables(
    content: string,
    variables: Record<string, string>
  ): string {
    return content.replace(VARIABLE_REGEX, (match, varName) => {
      return variables[varName] ?? match;
    });
  }
}

/**
 * Build messages array for OpenRouter request
 */
export function buildMessages(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  variables: Record<string, string> = {}
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const result: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

  // Add system prompt if present
  if (systemPrompt.trim()) {
    result.push({
      role: 'system',
      content: OpenRouterClient.interpolateVariables(systemPrompt, variables),
    });
  }

  // Add messages
  for (const msg of messages) {
    if (msg.content.trim()) {
      result.push({
        role: msg.role,
        content: OpenRouterClient.interpolateVariables(msg.content, variables),
      });
    }
  }

  return result;
}

/**
 * Format model name for display
 */
export function formatModelName(modelId: string): string {
  // Remove provider prefix and clean up
  const parts = modelId.split('/');
  const modelName = parts[parts.length - 1];

  // Convert kebab-case to Title Case
  return modelName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get model provider from ID
 */
export function getModelProvider(modelId: string): string {
  const parts = modelId.split('/');
  return parts[0] || 'unknown';
}
