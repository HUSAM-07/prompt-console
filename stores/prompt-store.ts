import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Prompt, Message, Variable, TestCase, Attachment } from '@/types';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { VARIABLE_REGEX, DEFAULT_SETTINGS } from '@/lib/constants';

interface PromptStore {
  // State
  prompts: Prompt[];
  testCases: TestCase[];
  isHydrated: boolean;

  // Prompt actions
  createPrompt: (name?: string) => Prompt;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  duplicatePrompt: (id: string) => Prompt | null;
  getPromptById: (id: string) => Prompt | undefined;

  // Message actions
  addMessage: (promptId: string, role: 'user' | 'assistant') => void;
  updateMessage: (promptId: string, messageId: string, content: string) => void;
  updateMessageAttachments: (promptId: string, messageId: string, attachments: Attachment[]) => void;
  deleteMessage: (promptId: string, messageId: string) => void;

  // Test case actions
  addTestCase: (promptId: string, variableValues: Record<string, string>) => TestCase;
  updateTestCase: (id: string, updates: Partial<TestCase>) => void;
  deleteTestCase: (id: string) => void;
  getTestCasesForPrompt: (promptId: string) => TestCase[];

  // Hydration
  setHydrated: () => void;
}

// Helper function to parse variables from content
function parseVariables(content: string): Variable[] {
  const matches = content.matchAll(VARIABLE_REGEX);
  const variableNames = new Set<string>();

  for (const match of matches) {
    variableNames.add(match[1]);
  }

  return Array.from(variableNames).map((name) => ({
    name,
    defaultValue: '',
  }));
}

// Helper to get all variables from a prompt
function getAllVariablesFromPrompt(prompt: Prompt): Variable[] {
  const allContent = [
    prompt.systemPrompt,
    ...prompt.messages.map((m) => m.content),
  ].join(' ');

  return parseVariables(allContent);
}

export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      // Initial state
      prompts: [],
      testCases: [],
      isHydrated: false,

      // Prompt actions
      createPrompt: (name = 'Untitled Prompt') => {
        const newPrompt: Prompt = {
          id: uuidv4(),
          name,
          systemPrompt: '',
          messages: [
            {
              id: uuidv4(),
              role: 'user',
              content: '',
            },
          ],
          variables: [],
          modelId: DEFAULT_SETTINGS.defaultModelId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: 'User',
        };

        set((state) => ({
          prompts: [newPrompt, ...state.prompts],
        }));

        return newPrompt;
      },

      updatePrompt: (id, updates) =>
        set((state) => ({
          prompts: state.prompts.map((p) => {
            if (p.id !== id) return p;

            const updated = {
              ...p,
              ...updates,
              updatedAt: new Date().toISOString(),
              lastSavedAt: new Date().toISOString(),
            };

            // Recalculate variables when content changes
            if (updates.systemPrompt !== undefined || updates.messages !== undefined) {
              updated.variables = getAllVariablesFromPrompt(updated);
            }

            return updated;
          }),
        })),

      deletePrompt: (id) =>
        set((state) => ({
          prompts: state.prompts.filter((p) => p.id !== id),
          testCases: state.testCases.filter((tc) => tc.promptId !== id),
        })),

      duplicatePrompt: (id) => {
        const { prompts } = get();
        const original = prompts.find((p) => p.id === id);
        if (!original) return null;

        const duplicate: Prompt = {
          ...original,
          id: uuidv4(),
          name: `${original.name} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: original.messages.map((m) => ({
            ...m,
            id: uuidv4(),
          })),
        };

        set((state) => ({
          prompts: [duplicate, ...state.prompts],
        }));

        return duplicate;
      },

      getPromptById: (id) => {
        const { prompts } = get();
        return prompts.find((p) => p.id === id);
      },

      // Message actions
      addMessage: (promptId, role) =>
        set((state) => ({
          prompts: state.prompts.map((p) => {
            if (p.id !== promptId) return p;

            return {
              ...p,
              messages: [
                ...p.messages,
                {
                  id: uuidv4(),
                  role,
                  content: '',
                },
              ],
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      updateMessage: (promptId, messageId, content) =>
        set((state) => ({
          prompts: state.prompts.map((p) => {
            if (p.id !== promptId) return p;

            const updated = {
              ...p,
              messages: p.messages.map((m) =>
                m.id === messageId ? { ...m, content } : m
              ),
              updatedAt: new Date().toISOString(),
              lastSavedAt: new Date().toISOString(),
            };

            // Recalculate variables
            updated.variables = getAllVariablesFromPrompt(updated);

            return updated;
          }),
        })),

      updateMessageAttachments: (promptId, messageId, attachments) =>
        set((state) => ({
          prompts: state.prompts.map((p) => {
            if (p.id !== promptId) return p;

            return {
              ...p,
              messages: p.messages.map((m) =>
                m.id === messageId ? { ...m, attachments } : m
              ),
              updatedAt: new Date().toISOString(),
              lastSavedAt: new Date().toISOString(),
            };
          }),
        })),

      deleteMessage: (promptId, messageId) =>
        set((state) => ({
          prompts: state.prompts.map((p) => {
            if (p.id !== promptId) return p;

            return {
              ...p,
              messages: p.messages.filter((m) => m.id !== messageId),
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      // Test case actions
      addTestCase: (promptId, variableValues) => {
        const newTestCase: TestCase = {
          id: uuidv4(),
          promptId,
          name: `Test Case ${get().testCases.filter((tc) => tc.promptId === promptId).length + 1}`,
          variableValues,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          testCases: [...state.testCases, newTestCase],
        }));

        return newTestCase;
      },

      updateTestCase: (id, updates) =>
        set((state) => ({
          testCases: state.testCases.map((tc) =>
            tc.id === id ? { ...tc, ...updates } : tc
          ),
        })),

      deleteTestCase: (id) =>
        set((state) => ({
          testCases: state.testCases.filter((tc) => tc.id !== id),
        })),

      getTestCasesForPrompt: (promptId) => {
        const { testCases } = get();
        return testCases.filter((tc) => tc.promptId === promptId);
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: STORAGE_KEYS.PROMPTS,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
      partialize: (state) => ({
        prompts: state.prompts,
        testCases: state.testCases,
      }),
    }
  )
);

// Export helper for variable parsing
export { parseVariables, getAllVariablesFromPrompt };
