// ─── Unified AI Provider Types ────────────────────────────────────────────────

/** Provider type discriminator used by the factory. */
export type ProviderType = 'openai-compatible' | 'anthropic' | 'ollama'

/** Input for a streaming chat request. */
export interface ChatInput {
  model: string
  messages: { role: string; content: string }[]
  signal?: AbortSignal
  /** Additional provider-specific options. */
  options?: Record<string, unknown>
}

/** Callbacks invoked during a streaming chat. */
export interface StreamCallbacks {
  /**
   * Called for each text token received.
   * For reasoning/thinking content, the token type is 'thinking'.
   */
  onToken: (token: string, type?: 'text' | 'thinking') => void
  /** Called when the stream completes successfully. */
  onDone: (usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }) => void
  /** Called when the stream encounters an error. */
  onError: (error: Error) => void
}

/** Result of a connection test. */
export interface TestConnectionResult {
  ok: boolean
  latency: number
  error?: string
}

/**
 * Unified AI provider adapter interface.
 *
 * Each provider implementation (OpenAI-compatible, Anthropic, Ollama) must
 * satisfy this contract so chat-service can remain provider-agnostic.
 */
export interface AIProvider {
  /** Send a non-streaming chat completion and return the full response text. */
  chat(input: ChatInput): Promise<string>

  /** Send a streaming chat completion, invoking callbacks as tokens arrive. */
  streamChat(input: ChatInput, callbacks: StreamCallbacks): Promise<void>

  /** Test connectivity to the provider endpoint. */
  testConnection(): Promise<TestConnectionResult>
}
