'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { OpenRouterClient, buildMessages } from '@/lib/openrouter';
import { useSettingsStore } from '@/stores/settings-store';
import { useWorkbenchStore } from '@/stores/workbench-store';
import { buildMetaPrompt, buildUserMessage, type GeneratePromptOptions } from '@/lib/meta-prompts';
import type { Prompt, LLMResponse } from '@/types';
import type { OpenRouterRequest } from '@/types/openrouter';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hook to get OpenRouter client instance
 */
export function useOpenRouterClient() {
  const getActiveApiKey = useSettingsStore((state) => state.getActiveApiKey);
  const apiKey = getActiveApiKey();

  if (!apiKey) {
    return null;
  }

  return new OpenRouterClient(apiKey);
}

/**
 * Hook to fetch available models
 */
export function useModels() {
  const client = useOpenRouterClient();

  return useQuery({
    queryKey: ['openrouter-models'],
    queryFn: async () => {
      if (!client) throw new Error('No API key configured');
      return client.getModels();
    },
    enabled: !!client,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to run a prompt with streaming
 */
export function useRunPrompt() {
  const client = useOpenRouterClient();
  const {
    setIsRunning,
    setStreamingContent,
    appendStreamingContent,
    clearStreamingContent,
    setLastResponse,
  } = useWorkbenchStore();

  const [error, setError] = useState<Error | null>(null);

  const runPrompt = useCallback(
    async (
      prompt: Prompt,
      variableValues: Record<string, string> = {}
    ): Promise<LLMResponse | null> => {
      if (!client) {
        setError(new Error('No API key configured'));
        return null;
      }

      setError(null);
      setIsRunning(true);
      clearStreamingContent();

      const startTime = Date.now();

      try {
        const messages = buildMessages(
          prompt.systemPrompt,
          prompt.messages,
          variableValues
        );

        const request: OpenRouterRequest = {
          model: prompt.modelId,
          messages,
          temperature: prompt.temperature,
          max_tokens: prompt.maxTokens,
          stream: true,
        };

        let fullContent = '';
        let usage = {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        };

        for await (const chunk of client.chatStream(request)) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            fullContent += content;
            appendStreamingContent(content);
          }
        }

        const latencyMs = Date.now() - startTime;

        // Make a non-streaming request to get token usage
        // (OpenRouter streaming doesn't always include usage)
        try {
          const nonStreamResponse = await client.chat({
            ...request,
            stream: false,
          });
          usage = {
            promptTokens: nonStreamResponse.usage.prompt_tokens,
            completionTokens: nonStreamResponse.usage.completion_tokens,
            totalTokens: nonStreamResponse.usage.total_tokens,
          };
        } catch {
          // Use estimates if we can't get actual usage
          usage = {
            promptTokens: Math.ceil(JSON.stringify(messages).length / 4),
            completionTokens: Math.ceil(fullContent.length / 4),
            totalTokens: 0,
          };
          usage.totalTokens = usage.promptTokens + usage.completionTokens;
        }

        const response: LLMResponse = {
          id: uuidv4(),
          promptId: prompt.id,
          content: fullContent,
          model: prompt.modelId,
          usage,
          createdAt: new Date().toISOString(),
          latencyMs,
        };

        setLastResponse(response);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        return null;
      } finally {
        setIsRunning(false);
      }
    },
    [client, setIsRunning, clearStreamingContent, appendStreamingContent, setLastResponse]
  );

  const reset = useCallback(() => {
    setError(null);
    clearStreamingContent();
    setLastResponse(null);
  }, [clearStreamingContent, setLastResponse]);

  return {
    runPrompt,
    error,
    reset,
  };
}

/**
 * Hook to validate an API key
 */
export function useValidateApiKey() {
  return useMutation({
    mutationFn: async (apiKey: string) => {
      const client = new OpenRouterClient(apiKey);
      const isValid = await client.validateKey();
      return isValid;
    },
  });
}

/**
 * Options for prompt generation
 */
export interface GeneratePromptHookOptions {
  thinkingEnabled?: boolean;
  suggestionType?: string;
}

/**
 * Hook to generate a prompt using AI with enhanced meta-prompts
 */
export function useGeneratePrompt() {
  const client = useOpenRouterClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generatePrompt = useCallback(
    async (
      description: string,
      options: GeneratePromptHookOptions = {}
    ): Promise<string | null> => {
      if (!client) {
        setError(new Error('No API key configured'));
        return null;
      }

      setIsGenerating(true);
      setError(null);

      try {
        // Build the enhanced meta-prompt based on options
        const metaPromptOptions: GeneratePromptOptions = {
          description,
          thinkingEnabled: options.thinkingEnabled,
          suggestionType: options.suggestionType,
        };

        const systemPrompt = buildMetaPrompt(metaPromptOptions);
        const userMessage = buildUserMessage(description);

        const response = await client.chat({
          model: 'anthropic/claude-3.5-haiku',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userMessage,
            },
          ],
          temperature: 0.7,
          max_tokens: 4096,
        });

        return response.choices[0]?.message?.content || null;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to generate prompt');
        setError(error);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [client]
  );

  return {
    generatePrompt,
    isGenerating,
    error,
  };
}
