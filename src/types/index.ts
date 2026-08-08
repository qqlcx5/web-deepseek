// ─── Orbit Chat Unified Type System ───────────────────────────────────────────
// Single type source for app store / chat store / ui store / all components.

// ─── Provider & Model ─────────────────────────────────────────────────────────

export interface Provider {
  id: string
  name: string
  apiHost: string
  apiKey?: string
  apiPath?: string
  apiVersion?: string
  models: ModelInfo[]
  enabled: boolean
  isSystem?: boolean
}

export interface ModelInfo {
  id: string
  name: string
  providerId?: string
  provider?: string
  group?: string
  supportedTextDelta?: boolean
  description?: string
  maxTokens?: number
  contextLength?: number
  enabled: boolean
}

// ─── Assistant ────────────────────────────────────────────────────────────────

export interface Assistant {
  id: string
  name: string
  description?: string
  prompt: string
  temperature?: number
  topP?: number
  maxTokens?: number
  model?: string
  avatar?: string
  enabled: boolean
  isDefault?: boolean
  tags?: string[]
  emoji?: string
  group?: string
  stream?: boolean
  contextManagement?: ContextManagement
  customParams?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
  // Cherry Studio extended fields
  regularPhrases?: unknown[]
  settings?: Record<string, unknown>
  defaultModel?: { id: string; provider: string; name: string; group?: string }
  enableWebSearch?: boolean
  mcpServers?: unknown[]
  knowledgeRecognition?: unknown
}

export interface ContextManagement {
  strategy: string
  maxMessages?: number
  maxTokens?: number
}

// ─── Topic (conversation) ─────────────────────────────────────────────────────

export interface Topic {
  id: string
  assistantId: string
  name: string
  messages: ChatMessage[]
  prompt?: string
  temperature?: number
  topP?: number
  maxTokens?: number
  model?: string
  isNameManuallyEdited?: boolean
  pinned?: boolean
  favorite?: boolean
  archived?: boolean
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

// ─── Message ──────────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system'

export type MessageStatus = 'sending' | 'streaming' | 'complete' | 'error' | 'stopped'

export interface Source {
  name: string
  domain: string
  url: string
}

export interface Artifact {
  name: string
  meta: string
}

export interface Attachment {
  id: string
  name: string
  size: string
  type?: string
  url?: string
}

/**
 * Message block — corresponds to Cherry Studio's message_blocks in indexedDB.
 * type ∈ 'main_text' | 'thinking' | 'error' | 'citation' | 'tool' | 'unknown'
 */
export interface MessageBlock {
  id?: string
  type: 'main_text' | 'thinking' | 'error' | 'citation' | 'tool' | 'unknown'
  content: string
  status?: string
  createdAt?: number
  citationReferences?: unknown[]
}

/**
 * Unified Message type — both runtime and persistence structure.
 */
export interface ChatMessage {
  id: string | number
  topicId?: string
  role: MessageRole
  content: string
  time: string
  model?: string
  rating?: '' | 'up' | 'down'
  branches?: number
  activeBranch?: number
  loading?: boolean
  error?: string
  status?: MessageStatus
  reasoningContent?: string
  sources?: Source[]
  artifact?: Artifact
  attachments?: Attachment[]
  tokens?: {
    input?: number
    output?: number
  }
  askId?: string
  branchIndex?: number
  parentBranchIndex?: number
  createdAt?: string
  // Cherry Studio extended fields
  blocks?: MessageBlock[]
  modelId?: string
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
  mentions?: unknown[]
}

// ─── Chat list item (sidebar) ─────────────────────────────────────────────────

export interface Chat {
  id: string
  title: string
  preview: string
  pinned?: boolean
  createdAt?: number
  updatedAt?: number
  messageCount?: number
}

// ─── Model (UI) ───────────────────────────────────────────────────────────────

export interface Model {
  id: string
  name: string
  color: string
  description: string
  tags: string[]
  contextLength?: number
  pricing?: {
    input: number
    output: number
  }
}

export interface ModelListResponse {
  data: Array<{
    id: string
    object?: string
    owned_by?: string
  }>
}

// ─── Workspace ────────────────────────────────────────────────────────────────

export interface Workspace {
  id: string
  name: string
  color: string
  count: number
}

// ─── Chat API Types (OpenAI-compatible) ───────────────────────────────────────

export interface ChatCompletionMessage {
  role: MessageRole
  content: string
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatCompletionMessage[]
  stream?: boolean
  temperature?: number
  max_tokens?: number
  top_p?: number
}

export interface ChatCompletionChunk {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    delta: {
      role?: MessageRole
      content?: string
      reasoning_content?: string
    }
    finish_reason: string | null
  }>
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: ChatCompletionMessage
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// ─── AppData (persistence root) ───────────────────────────────────────────────

export interface AppData {
  version: number
  providers: Provider[]
  assistants: Assistant[]
  topics: Topic[]
  settings?: Settings
  cherryData?: CherryData
  compatZone?: Record<string, unknown>
  messageBlocks?: Record<string, MessageBlock>
}

/**
 * Settings — compatible with Cherry Studio's 119 settings keys.
 * Common keys are explicitly declared; everything else goes through the index.
 */
export interface Settings {
  language?: string
  theme?: 'light' | 'dark' | 'auto'
  fontSize?: number
  sendShortcut?: 'Enter' | 'Ctrl+Enter' | 'Shift+Enter'
  maxContextLength?: number
  autoScroll?: boolean
  sendMessageShortcut?: string
  messageStyle?: string
  codeShowLineNumbers?: boolean
  showTokens?: boolean
  pinTopicsToTop?: boolean
  confirmDeleteMessage?: boolean
  [key: string]: unknown
}

// ─── UI Types ─────────────────────────────────────────────────────────────────

export type ModalType = '' | 'command' | 'model' | 'prompt'

export interface Command {
  title: string
  description: string
  icon: string
  shortcut?: string
  action: string
}

export interface PromptPreset {
  name: string
  value: string
}

export type ThemeMode = 'light' | 'dark' | 'auto'

// ─── Stream delta ─────────────────────────────────────────────────────────────

export interface ChatStreamDelta {
  id?: string
  content?: string
  reasoning_content?: string
  model?: string
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

// ─── Re-export Cherry types ───────────────────────────────────────────────────

export type {
  CherryData,
  CherryLocalStorage,
  CherryPersist,
  CherryLLMData,
  CherryModelRef,
  CherryProvider,
  CherryModel,
  CherryAssistantsData,
  CherryAssistant,
  CherryTopic,
  CherryMessage,
  CherryMessageBlock,
  CherryIndexedDB,
  CherrySettingEntry,
  ParsedCherryData,
} from './cherry-data'

// Re-export types used by data-import for backward compat
export type { MessageBlock as CherryMessageBlockCompat } from './cherry-data'
