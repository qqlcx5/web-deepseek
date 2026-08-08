// ─── Orbit Chat Business Types ────────────────────────────────────────────────
// These types represent the core domain model for the Orbit Chat application.
// They are intentionally separate from the legacy `src/types/chat.ts` types
// which are still used by existing Vue components.

// ─── Provider & Model ─────────────────────────────────────────────────────────

/**
 * An LLM provider configuration (e.g. OpenAI, DeepSeek, Ollama).
 */
export interface Provider {
  /** Unique identifier (uuid or slug). */
  id: string
  /** Human-readable name shown in the UI. */
  name: string
  /** Base API host, e.g. `https://api.openai.com`. */
  apiHost: string
  /** API key — may be omitted when not yet configured. */
  apiKey?: string
  /** Path appended to `apiHost` for chat completions, default `/v1/chat/completions`. */
  apiPath?: string
  /** Models available under this provider. */
  models: ModelInfo[]
  /** Whether the provider is enabled. */
  enabled: boolean
}

/**
 * Metadata for a single model offered by a provider.
 */
export interface ModelInfo {
  /** Model id as expected by the API, e.g. `deepseek-chat`. */
  id: string
  /** Display name. */
  name: string
  /** Owning provider id. */
  providerId: string
  /** Optional short description. */
  description?: string
  /** Maximum output tokens. */
  maxTokens?: number
  /** Context window length in tokens. */
  contextLength?: number
  /** Whether this model is enabled for selection. */
  enabled: boolean
}

// ─── Assistant ────────────────────────────────────────────────────────────────

/**
 * An assistant definition — a configured persona with prompt and parameters.
 */
export interface Assistant {
  id: string
  name: string
  description?: string
  /** System prompt for this assistant. */
  prompt: string
  /** Sampling temperature (0–2). */
  temperature?: number
  /** Nucleus sampling probability (0–1). */
  topP?: number
  /** Maximum output tokens. */
  maxTokens?: number
  /** Default model id (e.g. `deepseek-chat`). */
  model?: string
  /** Avatar URL or data-URI. */
  avatar?: string
  enabled: boolean
  /** Whether this is the default assistant. */
  isDefault?: boolean
  /** Free-form tags for filtering. */
  tags?: string[]
  /** Emoji used as a lightweight avatar. */
  emoji?: string
  /** Logical group for sidebar nesting. */
  group?: string
  /** Whether streaming is enabled. */
  stream?: boolean
  /** Context management strategy. */
  contextManagement?: ContextManagement
  /** Extra provider-specific parameters. */
  customParams?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

/**
 * Context management strategy for trimming conversation history.
 */
export interface ContextManagement {
  /** Strategy identifier, e.g. `last-n`, `token-budget`. */
  strategy: string
  /** Maximum number of messages to retain (for `last-n`). */
  maxMessages?: number
  /** Maximum total tokens to retain (for `token-budget`). */
  maxTokens?: number
}

// ─── Topic ────────────────────────────────────────────────────────────────────

/**
 * A conversation topic — a thread of messages tied to an assistant.
 */
export interface Topic {
  id: string
  assistantId: string
  name: string
  /** Full message list (chronological). */
  messages: Message[]
  /** Optional per-topic prompt override. */
  prompt?: string
  temperature?: number
  topP?: number
  maxTokens?: number
  model?: string
  /** Whether the user manually renamed the topic. */
  isNameManuallyEdited?: boolean
  /** Pinned to the top of the sidebar. */
  pinned?: boolean
  /** Marked as favorite. */
  favorite?: boolean
  /** Archived (hidden from the main list). */
  archived?: boolean
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

// ─── Message ──────────────────────────────────────────────────────────────────

/**
 * Message status in the conversation lifecycle.
 */
export type MessageStatus = 'sending' | 'sent' | 'streaming' | 'complete' | 'error' | 'stopped'

/**
 * A single message within a topic.
 *
 * This is the **new** Message type used by the data-import / export pipeline.
 * The legacy `src/types/chat.ts` `Message` interface is still used by
 * existing Vue components and is structurally different.
 */
export interface Message {
  id: string
  topicId: string
  role: MessageRole
  content: string
  /** Chain-of-thought / reasoning text (for models that support it). */
  reasoningContent?: string
  /** Model id that produced this message (for assistant messages). */
  model?: string
  /** Token usage for this message. */
  tokens?: {
    input?: number
    output?: number
  }
  /** Structured content blocks (e.g. tool calls, images). */
  blocks?: MessageBlock[]
  /** Correlation id for request/response pairing. */
  askId?: string
  /** Branch index for branching conversations. */
  branchIndex?: number
  /** Parent branch index (for merge tracking). */
  parentBranchIndex?: number
  createdAt: string
  status: MessageStatus
}

/**
 * Message role.
 */
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool'

/**
 * A structured block within a message.
 */
export interface MessageBlock {
  type: 'text' | 'image' | 'tool_call' | 'tool_result' | 'file'
  content: string
  /** For image/file blocks, the MIME type. */
  mimeType?: string
  /** For tool calls, the tool name. */
  toolName?: string
  /** For tool calls, the arguments JSON. */
  toolArgs?: string
  /** For tool results, the result JSON. */
  toolResult?: string
}

// ─── AppData (root persistence shape) ─────────────────────────────────────────

/**
 * The root persisted application data structure.
 */
export interface AppData {
  /** Schema version for migration purposes. */
  version: number
  providers: Provider[]
  assistants: Assistant[]
  topics: Topic[]
  settings?: Settings
  /** Raw Cherry Studio data kept for round-trip fidelity. */
  cherryData?: CherryData
  /** Compatibility zone for legacy field mappings. */
  compatZone?: Record<string, unknown>
}

/**
 * User-level application settings.
 */
export interface Settings {
  language?: string
  theme?: 'light' | 'dark' | 'auto'
  fontSize?: number
  sendShortcut?: 'Enter' | 'Ctrl+Enter' | 'Shift+Enter'
  maxContextLength?: number
  autoScroll?: boolean
}

// ─── Stream delta (OpenAI-compatible) ─────────────────────────────────────────

/**
 * Delta payload for a streaming chat completion chunk.
 */
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

// ─── UI Types ─────────────────────────────────────────────────────────────────

/**
 * A message prepared for rendering in the UI.
 * Extends the base `Message` with transient display state.
 */
export interface MessageUI extends Message {
  /** Whether the message is currently streaming/loading. */
  loading?: boolean
  /** User rating for the response. */
  rating?: '' | 'up' | 'down'
  /** Citation sources. */
  sources?: Source[]
  /** Associated artifact (e.g. generated code, document). */
  artifact?: Artifact
  /** Branch chain (for branching UI). */
  branches?: number
  /** Currently active branch index. */
  activeBranch?: number
}

/**
 * A citation source.
 */
export interface Source {
  name: string
  domain: string
  url: string
}

/**
 * An artifact associated with a message.
 */
export interface Artifact {
  name: string
  meta: string
}

/**
 * A file attachment on a message.
 */
export interface Attachment {
  id: string
  name: string
  size: string
  type?: string
  url?: string
}

/**
 * A workspace (logical grouping of conversations).
 */
export interface Workspace {
  id: string
  name: string
  color: string
  count: number
}

/**
 * A model as shown in the UI (with provider info).
 */
export interface ModelUI {
  id: string
  name: string
  providerId: string
  providerName?: string
  color?: string
  description?: string
  contextLength?: number
  tags?: string[]
}

/**
 * A command shown in the command palette.
 */
export interface Command {
  title: string
  description: string
  icon: string
  shortcut?: string
  action: string
}

/**
 * A preset prompt template.
 */
export interface PromptPreset {
  name: string
  value: string
}

// ─── Import reference for cherry-data types ───────────────────────────────────
// This re-export ensures `@/types` consumers can access Cherry types without
// a second import path.  The actual definitions live in `./cherry-data`.
export type {
  CherryData,
  CherryPersist,
  CherryAssistantsData,
  CherryLLMData,
  CherryProvider,
  CherryAssistant,
  CherryTopicRecord,
  CherryMessage,
  CherryMessageBlock,
  ParsedCherryData,
} from './cherry-data'
