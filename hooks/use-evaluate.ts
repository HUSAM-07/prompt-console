'use client';

import { useCallback, useRef } from 'react';
import { OpenRouterClient, buildMessages } from '@/lib/openrouter';
import { useSettingsStore } from '@/stores/settings-store';
import { useEvaluateStore } from '@/stores/evaluate-store';
import type { PromptVersion, EvaluationResult, TestCase } from '@/types';
import type { OpenRouterRequest } from '@/types/openrouter';

/**
 * Hook to run evaluations against prompt versions
 */
export function useEvaluateRunner() {
  const getActiveApiKey = useSettingsStore((state) => state.getActiveApiKey);
  const {
    addResult,
    updateResult,
    getResultForCell,
    setIsRunningAll,
    setRunProgress,
    resetRunProgress,
  } = useEvaluateStore();

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Run a single evaluation for a test case against a prompt version
   */
  const runSingleEvaluation = useCallback(
    async (
      promptVersion: PromptVersion,
      testCase: TestCase
    ): Promise<EvaluationResult | null> => {
      const apiKey = getActiveApiKey();
      if (!apiKey) {
        throw new Error('No API key configured');
      }

      // Check if there's an existing result
      const existingResult = getResultForCell(testCase.id, promptVersion.id);

      // Create or update result to running state
      let resultId: string;
      if (existingResult) {
        updateResult(existingResult.id, {
          status: 'running',
          content: '',
          error: undefined,
        });
        resultId = existingResult.id;
      } else {
        const newResult = addResult({
          testCaseId: testCase.id,
          promptVersionId: promptVersion.id,
          content: '',
          model: promptVersion.modelId,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          latencyMs: 0,
          status: 'running',
        });
        resultId = newResult.id;
      }

      const startTime = Date.now();

      try {
        const client = new OpenRouterClient(apiKey);

        // Build messages with variable substitution
        const messages = buildMessages(
          promptVersion.systemPrompt,
          promptVersion.messages,
          testCase.variableValues
        );

        const request: OpenRouterRequest = {
          model: promptVersion.modelId,
          messages,
          temperature: promptVersion.temperature,
          max_tokens: promptVersion.maxTokens,
          stream: false, // Use non-streaming for accurate token counts
        };

        const response = await client.chat(request);
        const latencyMs = Date.now() - startTime;

        const content = response.choices[0]?.message?.content || '';
        const usage = {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        };

        updateResult(resultId, {
          content,
          usage,
          latencyMs,
          status: 'completed',
        });

        return getResultForCell(testCase.id, promptVersion.id) || null;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        updateResult(resultId, {
          status: 'error',
          error,
          latencyMs: Date.now() - startTime,
        });
        return null;
      }
    },
    [getActiveApiKey, addResult, updateResult, getResultForCell]
  );

  /**
   * Run all evaluations for multiple test cases against multiple prompt versions
   */
  const runAllEvaluations = useCallback(
    async (
      promptVersions: PromptVersion[],
      testCases: TestCase[]
    ): Promise<void> => {
      if (promptVersions.length === 0 || testCases.length === 0) return;

      const total = promptVersions.length * testCases.length;
      setIsRunningAll(true);
      setRunProgress({ completed: 0, total });

      abortControllerRef.current = new AbortController();

      let completed = 0;

      // Run evaluations sequentially to avoid rate limiting
      for (const version of promptVersions) {
        for (const testCase of testCases) {
          if (abortControllerRef.current?.signal.aborted) {
            break;
          }

          try {
            await runSingleEvaluation(version, testCase);
          } catch (err) {
            // Continue with other evaluations even if one fails
            console.error('Evaluation failed:', err);
          }

          completed++;
          setRunProgress({ completed, total });
        }

        if (abortControllerRef.current?.signal.aborted) {
          break;
        }
      }

      setIsRunningAll(false);
    },
    [runSingleEvaluation, setIsRunningAll, setRunProgress]
  );

  /**
   * Cancel all running evaluations
   */
  const cancelEvaluations = useCallback(() => {
    abortControllerRef.current?.abort();
    resetRunProgress();
  }, [resetRunProgress]);

  return {
    runSingleEvaluation,
    runAllEvaluations,
    cancelEvaluations,
  };
}

/**
 * Hook to generate test cases using AI
 */
export function useTestCaseGenerator() {
  const getActiveApiKey = useSettingsStore((state) => state.getActiveApiKey);

  const generateTestCases = useCallback(
    async (
      systemPrompt: string,
      userMessageTemplate: string,
      variables: string[],
      count: number = 3
    ): Promise<Record<string, string>[]> => {
      const apiKey = getActiveApiKey();
      if (!apiKey) {
        throw new Error('No API key configured');
      }

      const client = new OpenRouterClient(apiKey);

      const prompt = `You are a QA engineer generating test cases for a prompt template.

The prompt has these variables: ${variables.join(', ')}

System prompt:
${systemPrompt}

User message template:
${userMessageTemplate}

Generate ${count} diverse test cases that would thoroughly test this prompt. For each test case, provide realistic values for each variable.

Return your response as a JSON array of objects, where each object has the variable names as keys. Example format:
[
  {"${variables[0] || 'var1'}": "value1", ...},
  {"${variables[0] || 'var1'}": "value2", ...}
]

Return ONLY the JSON array, no other text.`;

      const response = await client.chat({
        model: 'anthropic/claude-3.5-haiku',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      });

      const content = response.choices[0]?.message?.content || '[]';

      try {
        // Extract JSON from the response (handle markdown code blocks)
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(content);
      } catch {
        console.error('Failed to parse generated test cases:', content);
        return [];
      }
    },
    [getActiveApiKey]
  );

  return { generateTestCases };
}

/**
 * Hook for CSV import/export of test cases
 */
export function useCSVImportExport() {
  /**
   * Parse CSV content into test case variable values
   */
  const parseCSV = useCallback((content: string): Record<string, string>[] => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    // Parse header row
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));

    // Parse data rows
    const results: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        if (header && values[index] !== undefined) {
          row[header] = values[index];
        }
      });

      if (Object.keys(row).length > 0) {
        results.push(row);
      }
    }

    return results;
  }, []);

  /**
   * Import test cases from CSV file
   */
  const importFromCSV = useCallback(
    async (file: File): Promise<Record<string, string>[]> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const testCases = parseCSV(content);
            resolve(testCases);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
    },
    [parseCSV]
  );

  /**
   * Export test cases to CSV string
   */
  const exportToCSV = useCallback(
    (
      testCases: TestCase[],
      results?: Map<string, EvaluationResult>
    ): string => {
      if (testCases.length === 0) return '';

      // Get all unique variable names
      const variableNames = new Set<string>();
      testCases.forEach((tc) => {
        Object.keys(tc.variableValues).forEach((key) => variableNames.add(key));
      });

      const headers = ['name', ...Array.from(variableNames)];
      if (results) {
        headers.push('ideal_output');
      }

      // Build CSV rows
      const rows = testCases.map((tc) => {
        const row = [tc.name];
        variableNames.forEach((varName) => {
          row.push(tc.variableValues[varName] || '');
        });
        if (results && tc.idealOutput) {
          row.push(tc.idealOutput);
        }
        return row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',');
      });

      return [headers.join(','), ...rows].join('\n');
    },
    []
  );

  return { importFromCSV, exportToCSV, parseCSV };
}
