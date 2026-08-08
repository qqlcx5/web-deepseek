import http from '@/utils/http'
import type { ChatCompletionResponse } from '@/types/chat'

/**
 * Parameters for chat API requests
 */
export interface ChatRequestParams {
  messages: { role: string; content: string }[]
  model: string
  temperature?: number
  maxTokens?: number
  signal?: AbortSignal
  providerId?: string
  apiHost?: string
  apiKey?: string
}

/**
 * Chat API module — wraps hook-fetch calls for chat completions
 */
export const chatApi = {
  /**
   * Send a streaming chat completion request.
   * Returns the raw response body as a ReadableStream<Uint8Array>.
   */
  async chatStream(params: ChatRequestParams): Promise<ReadableStream<Uint8Array>> {
    const {
      messages,
      model,
      temperature,
      maxTokens,
      signal,
      providerId,
      apiHost,
      apiKey,
    } = params

    const body = {
      model,
      messages,
      stream: true,
      ...(temperature !== undefined && { temperature }),
      ...(maxTokens !== undefined && { max_tokens: maxTokens }),
      ...(providerId && { provider_id: providerId }),
      ...(apiHost && { api_host: apiHost }),
    }

    // If apiHost + apiKey are provided, use direct fetch instead of the default http instance
    if (apiHost && apiKey) {
      const url = apiHost.endsWith('/')
        ? `${apiHost}chat/completions`
        : `${apiHost}/chat/completions`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        ...(signal && { signal }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText)
        throw new Error(`Stream failed: ${response.status} ${errorText}`)
      }

      if (!response.body) {
        throw new Error('No response body for stream')
      }

      return response.body as ReadableStream<Uint8Array>
    }

    const request = http.post('/chat/completions', body, {
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
   */
  async chat(params: ChatRequestParams): Promise<ChatCompletionResponse> {
    const {
      messages,
      model,
      temperature,
      maxTokens,
      signal,
      providerId,
      apiHost,
      apiKey,
    } = params

    const body = {
      model,
      messages,
      stream: false,
      ...(temperature !== undefined && { temperature }),
      ...(maxTokens !== undefined && { max_tokens: maxTokens }),
      ...(providerId && { provider_id: providerId }),
      ...(apiHost && { api_host: apiHost }),
    }

    // If apiHost + apiKey are provided, use direct fetch
    if (apiHost && apiKey) {
      const url = apiHost.endsWith('/')
        ? `${apiHost}chat/completions`
        : `${apiHost}/chat/completions`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        ...(signal && { signal }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText)
        throw new Error(`Request failed: ${response.status} ${errorText}`)
      }

      return response.json() as Promise<ChatCompletionResponse>
    }

    const request = http.post('/chat/completions', body, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...(signal && { signal }),
    })

    return request.json() as Promise<ChatCompletionResponse>
  },
}
