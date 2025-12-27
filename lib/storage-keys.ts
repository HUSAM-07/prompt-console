export const STORAGE_KEYS = {
  PROMPTS: 'prompt-console:prompts',
  SETTINGS: 'prompt-console:settings',
  API_KEYS: 'prompt-console:api-keys',
  FILES: 'prompt-console:files',
  TEST_CASES: 'prompt-console:test-cases',
  SIDEBAR_COLLAPSED: 'prompt-console:sidebar-collapsed',
  RECENT_MODELS: 'prompt-console:recent-models',
  ACTIVE_API_KEY: 'prompt-console:active-api-key',
  EVALUATE_DATA: 'prompt-console:evaluate',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
