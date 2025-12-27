'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { AUTOSAVE_DEBOUNCE_MS } from '@/lib/constants';

interface UseAutoSaveOptions {
  enabled?: boolean;
  debounceMs?: number;
  onSave?: () => void;
}

/**
 * Hook for auto-saving data with debounce
 */
export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => void | Promise<void>,
  options: UseAutoSaveOptions = {}
) {
  const { enabled = true, debounceMs = AUTOSAVE_DEBOUNCE_MS, onSave: onSaveCallback } = options;

  const previousDataRef = useRef<T>(data);
  const isFirstRender = useRef(true);

  const debouncedSave = useDebouncedCallback(
    async (dataToSave: T) => {
      await onSave(dataToSave);
      onSaveCallback?.();
    },
    debounceMs
  );

  useEffect(() => {
    // Skip first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousDataRef.current = data;
      return;
    }

    // Check if data has changed
    const hasChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);

    if (enabled && hasChanged) {
      previousDataRef.current = data;
      debouncedSave(data);
    }
  }, [data, enabled, debouncedSave]);

  // Manual save function
  const saveNow = useCallback(async () => {
    debouncedSave.cancel();
    await onSave(data);
    onSaveCallback?.();
  }, [data, onSave, onSaveCallback, debouncedSave]);

  // Cancel pending save
  const cancelSave = useCallback(() => {
    debouncedSave.cancel();
  }, [debouncedSave]);

  return {
    saveNow,
    cancelSave,
    isPending: debouncedSave.isPending(),
  };
}
