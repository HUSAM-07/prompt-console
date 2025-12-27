import { create } from 'zustand';
import type { LLMResponse, WorkbenchState } from '@/types';

interface WorkbenchStore extends WorkbenchState {
  // Tab actions
  setActiveTab: (tab: 'prompt' | 'evaluate') => void;

  // Test case panel
  toggleTestCasePanel: () => void;
  setTestCasePanelOpen: (open: boolean) => void;

  // Running state
  setIsRunning: (isRunning: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;

  // Response handling
  setLastResponse: (response: LLMResponse | null) => void;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (chunk: string) => void;
  clearStreamingContent: () => void;

  // Active prompt
  setActivePromptId: (id: string | null) => void;

  // Reset
  reset: () => void;
}

const initialState: WorkbenchState = {
  activePromptId: null,
  isTestCasePanelOpen: false,
  activeTab: 'prompt',
  isSaving: false,
  lastResponse: null,
  isRunning: false,
  streamingContent: '',
};

export const useWorkbenchStore = create<WorkbenchStore>()((set) => ({
  // Initial state
  ...initialState,

  // Tab actions
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Test case panel
  toggleTestCasePanel: () =>
    set((state) => ({ isTestCasePanelOpen: !state.isTestCasePanelOpen })),

  setTestCasePanelOpen: (open) => set({ isTestCasePanelOpen: open }),

  // Running state
  setIsRunning: (isRunning) => set({ isRunning }),
  setIsSaving: (isSaving) => set({ isSaving }),

  // Response handling
  setLastResponse: (response) => set({ lastResponse: response }),

  setStreamingContent: (content) => set({ streamingContent: content }),

  appendStreamingContent: (chunk) =>
    set((state) => ({ streamingContent: state.streamingContent + chunk })),

  clearStreamingContent: () => set({ streamingContent: '' }),

  // Active prompt
  setActivePromptId: (id) => set({ activePromptId: id }),

  // Reset
  reset: () => set(initialState),
}));
