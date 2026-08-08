// ─── Cherry Studio Raw Data Types ─────────────────────────────────────────────
// These types describe the shape of data exported by Cherry Studio.
// They are used by the import / export pipeline to parse and map
// Cherry Studio data into Orbit Chat's own `AppData` structure.

/**
 * The top-level shape of a Cherry Studio data export file.
 *
 * Cherry Studio exports a single JSON object containing multiple
 * "persist" sections, each keyed by a domain name.
 */
export interface CherryData {
  /** Schema version from Cherry Studio. */
  version?: string
  /** Persisted state sections. */
  persist?: CherryPersist
  /** Top-level keys that are not part of `persist`. */
  [key: string]: unknown
}

/**
 * The persist block inside a Cherry Studio export.
 */
export interface CherryPersist {
  assistants?: CherryAssistantsData
  llm?: CherryLLMData
  [key: string]: unknown
}

/**
 * The assistants section of Cherry Studio data.
 */
export interface CherryAssistantsData {
  /** Topic records keyed by topic id. */
  topics?: Record<string, CherryTopicRecord>
  /** Assistant definitions keyed by assistant id. */
  assistants?: Record<string, CherryAssistant>
  /** Other fields Cherry Studio may include. */
  [key: string]: unknown
}

/**
 * The LLM section of Cherry Studio data (providers & models).
 */
export interface CherryLLMData {
  /** Provider configurations keyed by provider id. */
  providers?: Record<string, CherryProvider>
  /** Other fields. */
  [key: string]: unknown
}

/**
 * A provider configuration in Cherry Studio.
 */
export interface CherryProvider {
  id: string
  name: string
  apiKey?: string
  apiHost?: string
  apiURL?: string
  apiVersion?: string
  models?: Array<{
    id: string
    name: string
    [key: string]: unknown
  }>
  isSystem?: boolean
  enabled?: boolean
  [key: string]: unknown
}

/**
 * An assistant definition in Cherry Studio.
 */
export interface CherryAssistant {
  id: string
  name: string
  prompt?: string
  description?: string
  temperature?: number
  topP?: number
  maxTokens?: number
  model?: string
  avatar?: string
  emoji?: string
  tags?: string[]
  groupId?: string
  isDefault?: boolean
  enabled?: boolean
  [key: string]: unknown
}

/**
 * A topic (conversation thread) record in Cherry Studio.
 */
export interface CherryTopicRecord {
  id: string
  assistantId?: string
  name?: string
  messages?: CherryMessage[]
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
  [key: string]: unknown
}

/**
 * A message in Cherry Studio's format.
 */
export interface CherryMessage {
  id: string
  role: string
  content: string
  reasoningContent?: string
  model?: string
  tokens?: {
    input?: number
    output?: number
  }
  blocks?: CherryMessageBlock[]
  askId?: string
  branchIndex?: number
  parentBranchIndex?: number
  createdAt?: string
  status?: string
  [key: string]: unknown
}

/**
 * A structured content block in Cherry Studio's message format.
 */
export interface CherryMessageBlock {
  type: string
  content: string
  mimeType?: string
  toolName?: string
  toolArgs?: string
  toolResult?: string
  [key: string]: unknown
}

/**
 * The result of parsing a Cherry Studio export file.
 * Contains the raw data plus metadata about the parse.
 */
export interface ParsedCherryData {
  /** Whether the parse was successful. */
  ok: boolean
  /** The parsed Cherry data, if successful. */
  data?: CherryData
  /** Error message if parsing failed. */
  error?: string
  /** Number of providers found. */
  providerCount?: number
  /** Number of assistants found. */
  assistantCount?: number
  /** Number of topics found. */
  topicCount?: number
  /** Number of messages found (across all topics). */
  messageCount?: number
}
