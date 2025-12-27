'use client';

import { useMemo } from 'react';
import type { Variable } from '@/types';
import { VARIABLE_REGEX } from '@/lib/constants';

/**
 * Hook to parse variables from prompt content
 */
export function useVariableParser(content: string): Variable[] {
  return useMemo(() => {
    const regex = new RegExp(VARIABLE_REGEX.source, 'g');
    const matches = content.matchAll(regex);
    const variableNames = new Set<string>();

    for (const match of matches) {
      variableNames.add(match[1]);
    }

    return Array.from(variableNames).map((name) => ({
      name,
      defaultValue: '',
    }));
  }, [content]);
}

/**
 * Hook to parse variables from multiple content sources
 */
export function useVariablesFromPrompt(
  systemPrompt: string,
  messages: Array<{ content: string }>
): Variable[] {
  return useMemo(() => {
    const allContent = [systemPrompt, ...messages.map((m) => m.content)].join(' ');
    const regex = new RegExp(VARIABLE_REGEX.source, 'g');
    const matches = allContent.matchAll(regex);
    const variableNames = new Set<string>();

    for (const match of matches) {
      variableNames.add(match[1]);
    }

    return Array.from(variableNames).map((name) => ({
      name,
      defaultValue: '',
    }));
  }, [systemPrompt, messages]);
}

/**
 * Highlight variables in content for display
 */
export function highlightVariables(content: string): string {
  return content.replace(
    VARIABLE_REGEX,
    '<span class="variable-highlight">{{$1}}</span>'
  );
}

/**
 * Extract variable positions for inline rendering
 */
export interface VariablePosition {
  name: string;
  start: number;
  end: number;
}

export function getVariablePositions(content: string): VariablePosition[] {
  const regex = new RegExp(VARIABLE_REGEX.source, 'g');
  const positions: VariablePosition[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    positions.push({
      name: match[1],
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return positions;
}
