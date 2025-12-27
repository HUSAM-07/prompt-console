// === Core Prompt Types ===

export interface Prompt {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  messages: Message[];
  variables: Variable[];
  modelId: string;
  temperature?: number;
  maxTokens?: number;
  createdAt: string;
  updatedAt: string;
  lastSavedAt?: string;
  author: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
}

export interface Variable {
  name: string;
  defaultValue?: string;
  description?: string;
}

export interface TestCase {
  id: string;
  promptId: string;
  name: string;
  variableValues: Record<string, string>;
  idealOutput?: string;
  createdAt: string;
}

// === File Types ===

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string; // base64 for small files
  uploadedAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  base64Content?: string; // For images and small files
  url?: string; // For larger files or external URLs
  uploadedAt: string;
}

// === API/Model Types ===

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: number;
    completion: number;
  };
  context_length: number;
  top_provider?: {
    max_completion_tokens: number;
  };
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt?: string;
  isValid?: boolean;
  isActive: boolean;
}

// === Settings Types ===

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  defaultModelId: string;
  userName: string;
  autoSaveEnabled: boolean;
  autoSaveIntervalMs: number;
}

// === Response Types ===

export interface LLMResponse {
  id: string;
  promptId: string;
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  createdAt: string;
  latencyMs: number;
}

// === UI State Types ===

export interface WorkbenchState {
  activePromptId: string | null;
  isTestCasePanelOpen: boolean;
  activeTab: 'prompt' | 'evaluate';
  isSaving: boolean;
  lastResponse: LLMResponse | null;
  isRunning: boolean;
  streamingContent: string;
}

// === Evaluation Types ===

export interface PromptVersion {
  id: string;
  promptId: string;
  name: string;
  systemPrompt: string;
  messages: Message[];
  modelId: string;
  temperature?: number;
  maxTokens?: number;
  createdAt: string;
}

export interface EvaluationResult {
  id: string;
  testCaseId: string;
  promptVersionId: string;
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  status: 'pending' | 'running' | 'completed' | 'error';
  error?: string;
  createdAt: string;
}

export interface EvaluateViewConfig {
  showPrompt: boolean;
  showIdealOutputs: boolean;
}

// === Navigation Types ===

export interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  disabled?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}
