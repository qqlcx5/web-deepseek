// ─── Chat API Module ──────────────────────────────────────────────────────────
// Wraps hook-fetch calls for chat completions.
// Supports dynamic provider switching (apiHost + apiKey) at request time.

import http, { createHttp, setHttpConfig } from '@/utils/http'
import type { ChatCompletionResponse } from '@/types/chat'
import type { Provider } from '@/types'

// Re-export setHttpConfig for convenience
export { setHttpConfig }

/**
 * Optional provider override for a single request.
 * When provided, a temporary HTTP instance is created with the provider's apiHost + apiKey.
 */
export interface ProviderOverride {
  apiHost?: string
  apiKey?: string
}

/**
 * Parameters for chat API requests.
 */
export interface ChatRequestParams {
  messages: { role: string; content: string }[]
  model: string
  temperature?: number
  maxTokens?: number
  signal?: AbortSignal
  providerId?: string
  apiHost?: string
  /** Optional provider override — if set, uses provider.apiHost + provider.apiKey. */
  provider?: ProviderOverride
}

/**
 * Resolve which HTTP instance to use.
 * If provider override is given, create a temporary instance.
 * Otherwise use the default http instance.
 */
function resolveHttp(params: ChatRequestParams) {
  if (params.provider?.apiHost) {
    return createHttp(
      params.provider.apiHost,
      params.provider.apiKey,
    )
  }
  if (params.apiHost) {
    // Legacy: use apiHost string directly, keep default apiKey
    return createHttp(params.apiHost, undefined)
  }
  return http
}

/**
 * Resolve the base path for the chat completions endpoint.
 * Default http instance already has baseURL set, so path is relative.
 * Dynamic instances get an absolute baseURL, so path is also relative (appended to baseURL).
 */
const CHAT_PATH = '/chat/completions'

/**
 * Chat API module — wraps hook-fetch calls for chat completions.
 */
export const chatApi = {
  /**
   * Send a streaming chat completion request.
   * Returns the raw response body as a ReadableStream<Uint8Array>.
   *
   * If `params.provider` is set, a temporary HTTP instance is created with
   * the provider's apiHost and apiKey.
   */
  async chatStream(params: ChatRequestParams): Promise<ReadableStream<Uint8Array>> {
    const {
      messages,
      model,
      temperature,
      maxTokens,
      signal,
      providerId,
    } = params

    const body = {
      model,
      messages,
      stream: true,
      ...(temperature !== undefined && { temperature }),
      ...(maxTokens !== undefined && { max_tokens: maxTokens }),
      ...(providerId && { provider_id: providerId }),
    }

    const instance = resolveHttp(params)
    const request = instance.post(CHAT_PATH, body, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...(signal && { signal }),
    })

    const response = await request.response
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      throw new Error(`Stream failed: ${response.status} ${errorText}`)
    }

    if (!response.body) {
      throw new Error('No response body for stream')
    }

    return response.body as ReadableStream<Uint8Array>
  },

  /**
   * Send a non-streaming chat completion request.
   * Returns the parsed JSON response.
   *
   * If `params.provider` is set, a temporary HTTP instance is created with
   * the provider's apiHost and apiKey.
   */
  async chat(params: ChatRequestParams): Promise<ChatCompletionResponse> {
    const {
      messages,
      model,
      temperature,
      maxTokens,
      signal,
      providerId,
    } = params

    const body = {
      model,
      messages,
      stream: false,
      ...(temperature !== undefined && { temperature }),
      ...(maxTokens !== undefined && { max_tokens: maxTokens }),
      ...(providerId && { provider_id: providerId }),
    }

    const instance = resolveHttp(params)
    const request = instance.post(CHAT_PATH, body, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...(signal && { signal }),
    })

    return request.json() as Promise<ChatCompletionResponse>
  },
}
