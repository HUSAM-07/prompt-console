'use client';

import { useEffect, useCallback } from 'react';

interface KeyCombo {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

/**
 * Hook to handle keyboard shortcuts
 */
export function useKeyboardShortcut(
  keyCombo: KeyCombo,
  callback: () => void,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const matchesKey = event.key.toLowerCase() === keyCombo.key.toLowerCase();
      const matchesMeta = keyCombo.meta ? event.metaKey : !event.metaKey;
      const matchesCtrl = keyCombo.ctrl ? event.ctrlKey : !event.ctrlKey;
      const matchesShift = keyCombo.shift ? event.shiftKey : !event.shiftKey;
      const matchesAlt = keyCombo.alt ? event.altKey : !event.altKey;

      if (matchesKey && matchesMeta && matchesCtrl && matchesShift && matchesAlt) {
        event.preventDefault();
        callback();
      }
    },
    [keyCombo, callback, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}

/**
 * Format key combo for display
 */
export function formatKeyCombo(keyCombo: KeyCombo): string {
  const parts: string[] = [];

  if (keyCombo.meta) {
    // Use ⌘ for Mac, Ctrl for Windows
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac');
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (keyCombo.ctrl && !keyCombo.meta) {
    parts.push('Ctrl');
  }
  if (keyCombo.shift) {
    parts.push('⇧');
  }
  if (keyCombo.alt) {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac');
    parts.push(isMac ? '⌥' : 'Alt');
  }

  // Format the key
  let keyDisplay = keyCombo.key;
  if (keyCombo.key === 'Enter') {
    keyDisplay = '↵';
  } else if (keyCombo.key === ' ') {
    keyDisplay = 'Space';
  } else {
    keyDisplay = keyCombo.key.toUpperCase();
  }
  parts.push(keyDisplay);

  return parts.join(' + ');
}

/**
 * Common keyboard shortcuts
 */
export const shortcuts = {
  runPrompt: { key: 'Enter', meta: true },
  savePrompt: { key: 's', meta: true },
  newPrompt: { key: 'n', meta: true },
  toggleSidebar: { key: 'b', meta: true },
  search: { key: 'k', meta: true },
} as const;
