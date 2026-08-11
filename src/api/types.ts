import type { Provider, ProviderType } from '@/types'

// ===== Chat Request Params =====

export interface ChatMessageParam {
  role: 'system' | 'user' | 'assistant' | 'developer'
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
}

export interface ChatToolParam {
  type: string
  function: {
    name: string
    description: string
    parameters: object
  }
}

export interface ChatRequestParams {
  provider: Provider
  model: string
  messages: ChatMessageParam[]
  temperature?: number
  maxTokens?: number
  topP?: number
  stream?: boolean
  tools?: ChatToolParam[]
  signal?: AbortSignal
}

// ===== SSE Event =====

export interface SSEUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export interface SSEMetrics {
  completion_tokens: number
  time_completion_millsec: number
  time_first_token_millsec: number
  time_thinking_millsec: number
}

export interface SSEEvent {
  id?: string
  object?: string
  model?: string
  choices?: Array<{
    index: number
    delta: {
      role?: string
      content?: string | null
      reasoning_content?: string | null
    }
    finish_reason?: string | null
  }>
  usage?: SSEUsage
  metrics?: SSEMetrics
  done?: boolean
}

// ===== Provider Adapter =====

export interface ProviderAdapterFactory {
  type: ProviderType
  buildRequestBody(params: ChatRequestParams): Record<string, unknown>
  buildRequestHeaders(provider: Provider): Record<string, string>
  parseSSEEvent(raw: unknown): SSEEvent
}

// ===== Stream Callbacks =====

export interface StreamCallbacks {
  onMessage?: (event: SSEEvent) => void
  onError?: (error: Error) => void
  onAbort?: () => void
  onFinish?: () => void
}

// ===== Stream Result =====

export interface StreamResult {
  content: string
  reasoningContent: string
  usage?: SSEUsage
  metrics?: SSEMetrics
}
