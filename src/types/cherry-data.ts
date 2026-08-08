// ─── Cherry Studio Raw Data Types (Real data.json Structure) ──────────────────
// These types describe the shape of data exported by Cherry Studio.
// Verified against real data.json with: localStorage + indexedDB structure.

/**
 * The top-level shape of a Cherry Studio data export file.
 *
 * Real structure:
 * { time: int, version: 5, localStorage: { 'persist:cherry-studio': {...} }, indexedDB: {...} }
 */
export interface CherryData {
  time?: number
  version?: number
  localStorage: CherryLocalStorage
  indexedDB: CherryIndexedDB
}

/**
 * The localStorage wrapper inside a Cherry Studio export.
 */
export interface CherryLocalStorage {
  'persist:cherry-studio': CherryPersist
  [key: string]: unknown
}

/**
 * The persist block inside localStorage['persist:cherry-studio'].
 */
export interface CherryPersist {
  llm: CherryLLMData
  assistants: CherryAssistantsData
  settings: Record<string, unknown>
  [key: string]: unknown
}

/**
 * The LLM section — providers array + model references.
 */
export interface CherryLLMData {
  /** Array of Provider objects (61 in real data). */
  providers: CherryProvider[]
  defaultModel?: CherryModelRef
  topicNamingModel?: CherryModelRef
  translateModel?: CherryModelRef
  quickAssistantModel?: CherryModelRef
  quickModel?: CherryModelRef
  settings?: Record<string, unknown>
}

/**
 * A model reference ({id, provider, name, group}).
 */
export interface CherryModelRef {
  id: string
  provider: string
  name: string
  group?: string
  supported_text_delta?: boolean
}

/**
 * A provider configuration in Cherry Studio.
 * In real data, providers is an ARRAY (not a Record).
 */
export interface CherryProvider {
  id: string
  name: string
  apiKey?: string
  apiHost?: string
  apiURL?: string
  apiVersion?: string
  models?: CherryModel[]
  isSystem?: boolean
  enabled?: boolean
  [key: string]: unknown
}

/**
 * A model in Cherry Studio's provider.
 */
export interface CherryModel {
  id: string
  name: string
  provider: string
  group?: string
  supported_text_delta?: boolean
  [key: string]: unknown
}

/**
 * The assistants section of Cherry Studio data.
 */
export interface CherryAssistantsData {
  defaultAssistant: CherryAssistant
  assistants: CherryAssistant[]
}

/**
 * An assistant definition in Cherry Studio.
 */
export interface CherryAssistant {
  id: string
  name: string
  emoji?: string
  prompt?: string
  description?: string
  topics?: unknown[]
  messages?: unknown[]
  type?: string
  regularPhrases?: unknown[]
  settings?: Record<string, unknown>
  model?: CherryModelRef
  defaultModel?: CherryModelRef
  enableWebSearch?: boolean
  mcpServers?: unknown[]
  knowledgeRecognition?: unknown
  [key: string]: unknown
}

/**
 * A topic in Cherry Studio's indexedDB.
 */
export interface CherryTopic {
  id: string
  messages: CherryMessage[]
  [key: string]: unknown
}

/**
 * A message in Cherry Studio's format.
 * Note: content is often empty string — actual content lives in message_blocks.
 */
export interface CherryMessage {
  id: string
  role: string
  topicId?: string
  assistantId?: string
  createdAt?: number
  status?: string
  blocks: string[]
  modelId?: string
  model?: CherryModelRef
  mentions?: unknown[]
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
  content?: string
  [key: string]: unknown
}

/**
 * A message block in Cherry Studio's indexedDB.
 * type ∈ 'main_text' | 'thinking' | 'error' | 'citation' | 'tool' | 'unknown'
 */
export interface CherryMessageBlock {
  id: string
  messageId: string
  type: string
  createdAt: number
  status: string
  content: string
  citationReferences?: unknown[]
  [key: string]: unknown
}

/**
 * The indexedDB section of a Cherry Studio export.
 */
export interface CherryIndexedDB {
  topics: CherryTopic[]
  message_blocks: CherryMessageBlock[]
  settings?: CherrySettingEntry[]
  files?: unknown[]
  knowledge_notes?: unknown[]
  translate_history?: unknown[]
  quick_phrases?: unknown[]
  translate_languages?: unknown[]
  notes_tree?: unknown[]
  [key: string]: unknown
}

/**
 * A setting entry in indexedDB.
 */
export interface CherrySettingEntry {
  id: string
  value: unknown
}

/**
 * The result of parsing a Cherry Studio export file.
 */
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
