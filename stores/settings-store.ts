import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { UserSettings, APIKey } from '@/types';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { DEFAULT_SETTINGS, OPENROUTER_BASE_URL } from '@/lib/constants';

interface SettingsStore {
  // State
  settings: UserSettings;
  apiKeys: APIKey[];
  isHydrated: boolean;

  // Settings actions
  updateSettings: (updates: Partial<UserSettings>) => void;
  resetSettings: () => void;

  // API Key actions
  addApiKey: (name: string, key: string) => void;
  removeApiKey: (id: string) => void;
  setActiveApiKey: (id: string) => void;
  updateApiKeyValidity: (id: string, isValid: boolean) => void;
  getActiveApiKey: () => string | null;

  // Hydration
  setHydrated: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: DEFAULT_SETTINGS,
      apiKeys: [],
      isHydrated: false,

      // Settings actions
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      resetSettings: () =>
        set({
          settings: DEFAULT_SETTINGS,
        }),

      // API Key actions
      addApiKey: (name, key) =>
        set((state) => {
          const newKey: APIKey = {
            id: uuidv4(),
            name,
            key,
            createdAt: new Date().toISOString(),
            isValid: undefined,
            isActive: state.apiKeys.length === 0, // First key is active by default
          };
          return {
            apiKeys: [...state.apiKeys, newKey],
          };
        }),

      removeApiKey: (id) =>
        set((state) => {
          const filtered = state.apiKeys.filter((k) => k.id !== id);
          // If we removed the active key, make the first remaining key active
          if (filtered.length > 0 && !filtered.some((k) => k.isActive)) {
            filtered[0].isActive = true;
          }
          return { apiKeys: filtered };
        }),

      setActiveApiKey: (id) =>
        set((state) => ({
          apiKeys: state.apiKeys.map((k) => ({
            ...k,
            isActive: k.id === id,
          })),
        })),

      updateApiKeyValidity: (id, isValid) =>
        set((state) => ({
          apiKeys: state.apiKeys.map((k) =>
            k.id === id ? { ...k, isValid, lastUsedAt: new Date().toISOString() } : k
          ),
        })),

      getActiveApiKey: () => {
        const { apiKeys } = get();
        const activeKey = apiKeys.find((k) => k.isActive);
        return activeKey?.key || null;
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
      partialize: (state) => ({
        settings: state.settings,
        apiKeys: state.apiKeys,
      }),
    }
  )
);

// Utility function to validate an API key
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
