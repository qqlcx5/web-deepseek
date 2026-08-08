// ─── Core Message Types ───

export type MessageRole = 'user' | 'assistant' | 'system'

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

export interface Message {
  id: string | number
  role: MessageRole
  content: string
  time: string
  model?: string
  rating?: '' | 'up' | 'down'
  branches?: number
  activeBranch?: number
  loading?: boolean
  error?: string
  sources?: Source[]
  artifact?: Artifact
  attachments?: Attachment[]
  tokens?: {
    input?: number
    output?: number
  }
}

// ─── Model & Provider ───

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

// ─── Chat & Conversation ───

export interface Chat {
  id: string
  title: string
  preview: string
  pinned?: boolean
  createdAt?: number
  updatedAt?: number
  messageCount?: number
}

export interface Workspace {
  id: string
  name: string
  color: string
  count: number
}

// ─── Chat API Types (OpenAI-compatible) ───

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
    }
    finish_reason: string | null
  }>
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

// ─── UI Types ───

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
