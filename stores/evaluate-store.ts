import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { PromptVersion, EvaluationResult, EvaluateViewConfig, Prompt, Message } from '@/types';
import { STORAGE_KEYS } from '@/lib/storage-keys';

interface EvaluateStore {
  // State
  promptVersions: PromptVersion[];
  results: EvaluationResult[];
  viewConfig: EvaluateViewConfig;
  isRunningAll: boolean;
  runProgress: { completed: number; total: number };
  isHydrated: boolean;

  // Prompt Version actions
  createPromptVersion: (prompt: Prompt, name?: string) => PromptVersion;
  updatePromptVersion: (id: string, updates: Partial<PromptVersion>) => void;
  deletePromptVersion: (id: string) => void;
  getVersionsForPrompt: (promptId: string) => PromptVersion[];
  getVersionById: (id: string) => PromptVersion | undefined;

  // Result actions
  addResult: (result: Omit<EvaluationResult, 'id' | 'createdAt'>) => EvaluationResult;
  updateResult: (id: string, updates: Partial<EvaluationResult>) => void;
  getResultForCell: (testCaseId: string, promptVersionId: string) => EvaluationResult | undefined;
  getResultsForVersion: (promptVersionId: string) => EvaluationResult[];
  clearResultsForVersion: (promptVersionId: string) => void;
  clearAllResults: (promptId: string) => void;

  // View config actions
  setShowPrompt: (show: boolean) => void;
  setShowIdealOutputs: (show: boolean) => void;

  // Running state
  setIsRunningAll: (running: boolean) => void;
  setRunProgress: (progress: { completed: number; total: number }) => void;
  resetRunProgress: () => void;

  // Hydration
  setHydrated: () => void;
}

export const useEvaluateStore = create<EvaluateStore>()(
  persist(
    (set, get) => ({
      // Initial state
      promptVersions: [],
      results: [],
      viewConfig: {
        showPrompt: false,
        showIdealOutputs: false,
      },
      isRunningAll: false,
      runProgress: { completed: 0, total: 0 },
      isHydrated: false,

      // Prompt Version actions
      createPromptVersion: (prompt: Prompt, name?: string) => {
        const existingVersions = get().promptVersions.filter(
          (v) => v.promptId === prompt.id
        );
        const versionNumber = existingVersions.length + 1;

        const newVersion: PromptVersion = {
          id: uuidv4(),
          promptId: prompt.id,
          name: name || `${prompt.name} v${versionNumber}`,
          systemPrompt: prompt.systemPrompt,
          messages: prompt.messages.map((m) => ({ ...m })),
          modelId: prompt.modelId,
          temperature: prompt.temperature,
          maxTokens: prompt.maxTokens,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          promptVersions: [...state.promptVersions, newVersion],
        }));

        return newVersion;
      },

      updatePromptVersion: (id, updates) =>
        set((state) => ({
          promptVersions: state.promptVersions.map((v) =>
            v.id === id ? { ...v, ...updates } : v
          ),
        })),

      deletePromptVersion: (id) =>
        set((state) => ({
          promptVersions: state.promptVersions.filter((v) => v.id !== id),
          results: state.results.filter((r) => r.promptVersionId !== id),
        })),

      getVersionsForPrompt: (promptId) => {
        return get().promptVersions.filter((v) => v.promptId === promptId);
      },

      getVersionById: (id) => {
        return get().promptVersions.find((v) => v.id === id);
      },

      // Result actions
      addResult: (resultData) => {
        const newResult: EvaluationResult = {
          ...resultData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          results: [...state.results, newResult],
        }));

        return newResult;
      },

      updateResult: (id, updates) =>
        set((state) => ({
          results: state.results.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      getResultForCell: (testCaseId, promptVersionId) => {
        return get().results.find(
          (r) =>
            r.testCaseId === testCaseId && r.promptVersionId === promptVersionId
        );
      },

      getResultsForVersion: (promptVersionId) => {
        return get().results.filter((r) => r.promptVersionId === promptVersionId);
      },

      clearResultsForVersion: (promptVersionId) =>
        set((state) => ({
          results: state.results.filter((r) => r.promptVersionId !== promptVersionId),
        })),

      clearAllResults: (promptId) => {
        const versionIds = get()
          .promptVersions.filter((v) => v.promptId === promptId)
          .map((v) => v.id);

        set((state) => ({
          results: state.results.filter(
            (r) => !versionIds.includes(r.promptVersionId)
          ),
        }));
      },

      // View config actions
      setShowPrompt: (show) =>
        set((state) => ({
          viewConfig: { ...state.viewConfig, showPrompt: show },
        })),

      setShowIdealOutputs: (show) =>
        set((state) => ({
          viewConfig: { ...state.viewConfig, showIdealOutputs: show },
        })),

      // Running state
      setIsRunningAll: (running) => set({ isRunningAll: running }),

      setRunProgress: (progress) => set({ runProgress: progress }),

      resetRunProgress: () =>
        set({ runProgress: { completed: 0, total: 0 }, isRunningAll: false }),

      // Hydration
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: STORAGE_KEYS.EVALUATE_DATA,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
      partialize: (state) => ({
        promptVersions: state.promptVersions,
        results: state.results,
        viewConfig: state.viewConfig,
      }),
    }
  )
);
