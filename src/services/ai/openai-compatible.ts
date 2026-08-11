// ─── OpenAI-compatible Provider Adapter ────────────────────────────────────────
// Wraps the existing chatApi into the unified AIProvider interface.

import type { AIProvider, ChatInput, StreamCallbacks, TestConnectionResult } from './types'
import { normalizeBaseUrl, fetchWithTimeout } from './shared'
import { chatApi, type ChatRequestParams } from '@/api/chat-api'

/**
 * Configuration for the OpenAI-compatible adapter.
 */
export interface OpenAIConfig {
  apiHost: string
  apiKey: string
}

/**
 * Create an OpenAI-compatible AIProvider.
 *
 * This adapter delegates to the existing chatApi module, which already
 * handles hook-fetch HTTP with dynamic baseURL + apiKey switching.
 */
export function createOpenAIProvider(config: OpenAIConfig): AIProvider {
  const { apiHost, apiKey } = config

  function buildParams(input: ChatInput): ChatRequestParams {
    return {
      messages: input.messages,
      model: input.model,
      signal: input.signal,
      provider: { apiHost, apiKey },
    }
  }

  return {
    async chat(input: ChatInput): Promise<string> {
      const result = await chatApi.chat(buildParams(input))
      return result.choices?.[0]?.message?.content ?? ''
    },

    async streamChat(input: ChatInput, callbacks: StreamCallbacks): Promise<void> {
      const stream = await chatApi.chatStream(buildParams(input))

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data:')) continue

            const data = trimmed.slice('data:'.length).trim()
            if (data === '[DONE]') {
              callbacks.onDone()
              return
            }

            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta
              if (delta?.reasoning_content) {
                callbacks.onToken(delta.reasoning_content, 'thinking')
              }
              if (delta?.content) {
                callbacks.onToken(delta.content, 'text')
              }
              if (parsed.usage) {
                // usage is typically in the last chunk
              }
            } catch {
              // Ignore malformed SSE frames
            }
          }
        }
        callbacks.onDone()
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          callbacks.onDone()
        } else {
          callbacks.onError(error as Error)
        }
      }
    },

    async testConnection(): Promise<TestConnectionResult> {
      const baseUrl = normalizeBaseUrl(apiHost)
      const url = `${baseUrl}/models`
      const start = performance.now()

      try {
        const response = await fetchWithTimeout(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeoutMs: 10_000,
        })
        const latency = Math.round(performance.now() - start)

        if (response.ok) {
          return { ok: true, latency }
        }
        const body = await response.text().catch(() => '')
        return { ok: false, latency, error: `HTTP ${response.status}: ${body}` }
      } catch (error) {
        const latency = Math.round(performance.now() - start)
        return {
          ok: false,
          latency,
          error: (error as Error).message || '连接超时',
        }
      }
    },
  }
}
