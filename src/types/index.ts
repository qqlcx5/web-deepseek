// ===== Orbit Chat 核心类型 =====

export type MessageRole = 'user' | 'assistant' | 'system'
export type MessageStatus = 'sending' | 'streaming' | 'complete' | 'error' | 'stopped'
export type BlockType = 'main_text' | 'thinking' | 'error' | 'citation' | 'tool' | 'unknown'
export type BlockStatus = 'success' | 'error' | 'pending' | 'streaming'

export interface MessageBlock {
  id: string
  type: BlockType
  content: string
  status: BlockStatus
}

export interface ChatMessage {
  id: string
  topicId: string
  role: MessageRole
  content: string
  createdAt: string
  status: MessageStatus
  model?: string
  usage?: number
  error?: string
  reasoningContent?: string
  blocks?: MessageBlock[]
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
  createdAt: string
  updatedAt: string
}

export interface ModelInfo {
  id: string
  name: string
  group?: string
  enabled: boolean
  contextLength?: number
  maxTokens?: number
}

export interface Provider {
  id: string
  name: string
  apiHost: string
  apiKey?: string
  models: ModelInfo[]
  enabled: boolean
}

export interface AppSettings {
  autoTheme: boolean
  showMessageDivider: boolean
  codeShowLineNumbers: boolean
  enterToSend: boolean
  autoScrollToBottom: boolean
  pasteToAttachment: boolean
  autoNameTopic: boolean
  showModelParams: boolean
  injectTopicTitle: boolean
  injectAttachment: boolean
  sendHistoryMessages: boolean
  exportStripApiKey: boolean
  rebuildSearchIndex: boolean
  thoughtAutoCollapse: boolean
}

export interface AppData {
  version: number
  providers: Provider[]
  assistants: Assistant[]
  topics: Topic[]
  settings: AppSettings
}
