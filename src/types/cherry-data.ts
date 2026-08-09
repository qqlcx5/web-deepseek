// ─── Cherry Studio v5 Exchange Types ─────────────────────────────────────────
// These types exist only at the import/export boundary.

export interface CherryData {
  time?: number
  version?: number
  localStorage: CherryLocalStorage
  indexedDB: CherryIndexedDB
}

export interface CherryLocalStorage {
  'persist:cherry-studio': CherryPersist
  [key: string]: unknown
}

export interface CherryPersist {
  llm: CherryLLMData
  assistants: CherryAssistantsData
  settings: Record<string, unknown>
  [key: string]: unknown
}

export interface CherryLLMData {
  providers: CherryProvider[]
  defaultModel?: CherryModelRef
  topicNamingModel?: CherryModelRef
  translateModel?: CherryModelRef
  quickAssistantModel?: CherryModelRef
  quickModel?: CherryModelRef
}

export interface CherryModelRef {
  id: string
  provider: string
  name: string
  group?: string
  supported_text_delta?: boolean
}

export interface CherryProvider {
  id: string
  name: string
  apiKey?: string
  apiHost?: string
  apiURL?: string
  models?: CherryModel[]
  enabled?: boolean
}

export interface CherryModel {
  id: string
  name: string
  provider: string
  group?: string
  supported_text_delta?: boolean
}

export interface CherryAssistantsData {
  defaultAssistant: CherryAssistant
  assistants: CherryAssistant[]
}

export interface CherryAssistant {
  id: string
  name: string
  emoji?: string
  prompt?: string
  description?: string
  topics?: CherryTopicRef[]
  model?: CherryModelRef | string
  defaultModel?: CherryModelRef
  settings?: Record<string, unknown>
  enableWebSearch?: boolean
}

export interface CherryTopicRef {
  id: string
  assistantId: string
  name: string
  createdAt?: string | number
  updatedAt?: string | number
  isNameManuallyEdited?: boolean
}

export interface CherryTopic {
  id: string
  messages: CherryMessage[]
}

export interface CherryMessage {
  id: string
  role: string
  topicId?: string
  assistantId?: string
  createdAt?: string | number
  status?: string
  blocks: string[]
  modelId?: string
  model?: CherryModelRef | string
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
  content?: string
}

export interface CherryMessageBlock {
  id: string
  messageId: string
  type: string
  createdAt?: string | number
  status?: string
  content: string
  citationReferences?: unknown[]
}

export interface CherryIndexedDB {
  topics: CherryTopic[]
  message_blocks: CherryMessageBlock[]
}

export interface ParsedCherryData {
  ok: boolean
  data?: CherryData
  error?: string
  providerCount: number
  assistantCount: number
  topicCount: number
  messageCount: number
  blockCount: number
}
