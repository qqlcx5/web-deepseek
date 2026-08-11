// ─── Orbit Chat Core Data Contract ────────────────────────────────────────────
// Runtime state and IndexedDB persistence use these normalized entities only.

import type { S3Config, WebDAVConfig } from '@/services/remote/types'

export type ProviderType = 'openai-compatible' | 'anthropic' | 'ollama'

export interface Provider {
  id: string
  name: string
  apiHost: string
  apiKey?: string
  models: ModelInfo[]
  enabled: boolean
  isSystem?: boolean
  apiVersion?: string
  /** Discriminator for the AI provider adapter. Defaults to 'openai-compatible'. */
  providerType?: ProviderType
}

export interface ModelInfo {
  id: string
  name: string
  group?: string
  supportedTextDelta?: boolean
  description?: string
  maxTokens?: number
  contextLength?: number
  enabled: boolean
}

export interface Assistant {
  id: string
  name: string
  prompt: string
  enabled: boolean
  isDefault: boolean
  emoji?: string
  description?: string
  model?: string
  temperature?: number
  topP?: number
  maxTokens?: number
  contextCount?: number
  streamOutput?: boolean
  enableWebSearch?: boolean
  createdAt: string
  updatedAt: string
}

export interface Topic {
  id: string
  assistantId: string
  name: string
  messages: ChatMessage[]
  isNameManuallyEdited: boolean
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export type MessageRole = 'user' | 'assistant' | 'system'
export type MessageStatus = 'sending' | 'streaming' | 'complete' | 'error' | 'stopped'
export type MessageBlockType = 'main_text' | 'thinking' | 'error' | 'citation' | 'tool' | 'unknown'
export type MessageBlockStatus = 'streaming' | 'success' | 'error'

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
  fileSize?: number
}

export interface TokenUsage {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
}

export interface MessageBlock {
  id: string
  type: MessageBlockType
  content: string
  status: MessageBlockStatus
  createdAt: string
  citationReferences?: unknown[]
}

export interface ChatMessage {
  id: string
  topicId: string
  role: MessageRole
  content: string
  createdAt: string
  status: MessageStatus
  model?: string
  rating?: '' | 'up' | 'down'
  branches?: number
  activeBranch?: number
  loading?: boolean
  error?: string
  reasoningContent?: string
  sources?: Source[]
  artifact?: Artifact
  attachments?: Attachment[]
  parentBranchId?: string
  blocks: MessageBlock[]
  usage?: TokenUsage
}

export interface Settings {
  language: 'zh-CN' | 'en-US'
  theme: 'light' | 'dark' | 'auto'
  fontSize: number
  sendShortcut: 'Enter' | 'Ctrl+Enter' | 'Shift+Enter'
  autoScroll: boolean
  autoCheckUpdate: boolean
  messageStyle: 'plain' | 'bubble'
  messageFont: 'system' | 'serif' | 'mono'
  codeShowLineNumbers: boolean
  codeWrappable: boolean
  codeCollapsible: boolean
  foldDisplayMode: 'full' | 'compact'
  confirmDeleteMessage: boolean
  confirmRegenerateMessage: boolean
  showTokens: boolean
  showMessageDivider: boolean
  showMessageOutline: boolean
  messageNavigation: boolean
  enableTopicNaming: boolean
  pinTopicsToTop: boolean
  showTopics: boolean
  showTopicTime: boolean
  showInputEstimatedTokens: boolean
  pasteLongTextAsFile: boolean
  pasteLongTextThreshold: number
  context: {
    maxContextTokens: number
    maxHistoryMessages: number
    includeUrl: boolean
    includeTitle: boolean
    includeCapturedAt: boolean
  }
  remote: {
    s3: S3Config
    webdav: WebDAVConfig
  }
  remoteType: 'none' | 's3' | 'webdav'
  webdavAutoSync: boolean
  webdavAutoSyncInterval: number
  renderInputMessageAsMarkdown: boolean
  mathEngine: 'katex' | 'mathjax'
  targetLanguage: string
}

/** The only persisted application payload. */
export interface AppData {
  version: number
  providers: Provider[]
  assistants: Assistant[]
  topics: Topic[]
  settings: Settings
}

// ─── UI Types ─────────────────────────────────────────────────────────────────

export interface Chat {
  id: string
  title: string
  preview: string
  pinned: boolean
  createdAt: string
  updatedAt: string
  messageCount: number
}

export interface Model {
  id: string
  name: string
  providerId: string
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

export type ModalType = '' | 'command' | 'model' | 'prompt' | 'settings' | 'provider' | 'assistant'

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

// ─── Chat API Types ───────────────────────────────────────────────────────────

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
  usage?: TokenUsage
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
  usage?: Required<TokenUsage>
}

export interface ChatStreamDelta {
  id?: string
  content?: string
  reasoning_content?: string
  model?: string
  usage?: TokenUsage
}
