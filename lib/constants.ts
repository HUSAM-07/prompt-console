import type { UserSettings } from '@/types';

// OpenRouter API configuration
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Default models available through OpenRouter
export const DEFAULT_MODELS = [
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    description: 'Latest Claude Sonnet model',
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'High performance model',
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    description: 'Fast and efficient model',
  },
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Most capable Claude model',
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'OpenAI GPT-4o model',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Fast and affordable GPT-4',
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash',
    description: 'Google Gemini 2.0 Flash (Free)',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    description: 'Meta Llama 3.3 70B Instruct',
  },
] as const;

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  defaultModelId: 'anthropic/claude-sonnet-4',
  userName: 'User',
  autoSaveEnabled: true,
  autoSaveIntervalMs: 2000,
};

// Auto-save configuration
export const AUTOSAVE_DEBOUNCE_MS = 2000;

// Variable regex pattern
export const VARIABLE_REGEX = /\{\{([A-Za-z][A-Za-z0-9_]*)\}\}/g;

// Application metadata
export const APP_NAME = 'Prompt Console';
export const APP_VERSION = '0.1.0';

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  RUN_PROMPT: {
    key: 'Enter',
    meta: true,
    label: '⌘ + ↵',
  },
  SAVE_PROMPT: {
    key: 's',
    meta: true,
    label: '⌘ + S',
  },
  NEW_PROMPT: {
    key: 'n',
    meta: true,
    label: '⌘ + N',
  },
} as const;

// File upload limits
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_FILE_TYPES = [
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
];

// Prompt limits
export const MAX_SYSTEM_PROMPT_LENGTH = 50000;
export const MAX_MESSAGE_LENGTH = 100000;
export const MAX_MESSAGES_PER_PROMPT = 50;
