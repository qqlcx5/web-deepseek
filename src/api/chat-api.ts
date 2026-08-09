// ─── Chat API Module ──────────────────────────────────────────────────────────
// Wraps hook-fetch calls for chat completions.
// Supports dynamic provider switching (apiHost + apiKey) at request time.

import http, { createHttp, setHttpConfig } from '@/utils/http'
import type { ChatCompletionResponse } from '@/types/chat'
import type { Provider } from '@/types'

// Re-export setHttpConfig for convenience
export { setHttpConfig }

/**
 * API error with status code and human-readable message.
 */
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

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
 * Normalise a Cherry Studio apiHost into a proper OpenAI-compatible base URL.
 *
 * Cherry Studio stores apiHost in various formats:
 *   - Full path:  https://api.example.com/v1/chat/completions#
 *   - With /v1/:  https://api.example.com/v1/
 *   - Bare domain: https://api.example.com
 *   - Non-standard: https://ark...com/api/v3/chat/completions#
 *
 * Strategy:
 *   1. Strip trailing # and whitespace.
 *   2. If the URL already ends with /chat/completions, extract the base up to that point.
 *   3. If the URL contains /v1 (or /v2, /v3, etc.) keep everything up to and including it.
 *   4. Otherwise append /v1.
 * The final request URL becomes: {normalisedBase}/chat/completions
 */
function normalizeApiHost(raw: string): string {
  let host = raw.trim().replace(/#+$/, '').replace(/\/+$/, '')

  // Already contains /chat/completions — extract the base before it
  const chatIdx = host.indexOf('/chat/completions')
  if (chatIdx !== -1) {
    return host.slice(0, chatIdx)
  }

  // Contains a version path segment like /v1, /v2, /v3 — keep as-is
  if (/\/v\d+/.test(host)) {
    return host
  }

  // Bare domain — append /v1
  return host + '/v1'
}

/**
 * Resolve which HTTP instance to use.
 * If provider override is given, create a temporary instance with normalised baseURL.
 * Otherwise use the default http instance.
 */
function resolveHttp(params: ChatRequestParams) {
  if (params.provider?.apiHost) {
    return createHttp(
      normalizeApiHost(params.provider.apiHost),
      params.provider.apiKey,
    )
  }
  if (params.apiHost) {
    return createHttp(normalizeApiHost(params.apiHost), undefined)
  }
  return http
}

/**
 * The chat completions endpoint path appended after the normalised base URL.
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

    let response: Response
    try {
      response = await request.response
    } catch (fetchError) {
      // hook-fetch may throw a normalised error — extract the real message
      const err = fetchError as Error & { status?: number; response?: Response }
      let detail = err.message
      if (err.response) {
        try {
          const body = await err.response.clone().json()
          detail = body.msg || body.message || body.error || err.message
        } catch {
          try { detail = await err.response.clone().text() } catch {}
        }
      }
      throw new ApiError(detail, err.status ?? 0)
    }

    if (!response.ok) {
      let detail = response.statusText
      try {
        const body = await response.clone().json()
        detail = body.msg || body.message || body.error || detail
      } catch {
        try { detail = await response.clone().text() } catch {}
      }
      throw new ApiError(detail, response.status)
    }

    if (!response.body) {
      throw new ApiError('No response body for stream', response.status)
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

    try {
      return await request.json() as ChatCompletionResponse
    } catch (fetchError) {
      const err = fetchError as Error & { status?: number; response?: Response }
      let detail = err.message
      if (err.response) {
        try {
          const body = await err.response.clone().json()
          detail = body.msg || body.message || body.error || err.message
        } catch {
          try { detail = await err.response.clone().text() } catch {}
        }
      }
      throw new ApiError(detail, err.status ?? 0)
    }
  },
}
