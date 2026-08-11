// ─── Anthropic Provider Adapter ───────────────────────────────────────────────
// Implements Anthropic Messages API (SSE streaming with content_block_delta).

import type { AIProvider, ChatInput, StreamCallbacks, TestConnectionResult } from './types'
import { normalizeBaseUrl, fetchWithTimeout } from './shared'

const ANTHROPIC_VERSION = '2023-06-01'

export interface AnthropicConfig {
  apiHost: string
  apiKey: string
}

export function createAnthropicProvider(config: AnthropicConfig): AIProvider {
  const { apiHost, apiKey } = config
  const baseUrl = normalizeBaseUrl(apiHost)

  function headers(): Record<string, string> {
    return {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'Content-Type': 'application/json',
    }
  }

  async function chat(input: ChatInput): Promise<string> {
    const response = await fetchWithTimeout(`${baseUrl}/messages`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        model: input.model,
        max_tokens: 4096,
        messages: input.messages.map(m => ({ role: m.role, content: m.content })),
        stream: false,
      }),
      signal: input.signal,
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`Anthropic API error ${response.status}: ${body}`)
    }

    const data = await response.json()
    // Anthropic returns content as an array of blocks
    const textBlocks = data.content?.filter((b: { type: string }) => b.type === 'text') ?? []
    return textBlocks.map((b: { text: string }) => b.text).join('')
  }

  async function streamChat(input: ChatInput, callbacks: StreamCallbacks): Promise<void> {
    const response = await fetchWithTimeout(`${baseUrl}/messages`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        model: input.model,
        max_tokens: 4096,
        messages: input.messages.map(m => ({ role: m.role, content: m.content })),
        stream: true,
      }),
      signal: input.signal,
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      callbacks.onError(new Error(`Anthropic API error ${response.status}: ${body}`))
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      callbacks.onError(new Error('No response body'))
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''
    let currentEvent = ''
    let rawUsage: { input_tokens?: number; output_tokens?: number } = {}
    const buildUsage = (): { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined => {
      if (rawUsage.input_tokens == null && rawUsage.output_tokens == null) return undefined
      return {
        prompt_tokens: rawUsage.input_tokens,
        completion_tokens: rawUsage.output_tokens,
        total_tokens: (rawUsage.input_tokens ?? 0) + (rawUsage.output_tokens ?? 0),
      }
    }

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()

          if (trimmed.startsWith('event:')) {
            currentEvent = trimmed.slice('event:'.length).trim()
            continue
          }

          if (!trimmed.startsWith('data:')) continue
          const dataStr = trimmed.slice('data:'.length).trim()

          try {
            const parsed = JSON.parse(dataStr)
            const type = parsed.type

            if (currentEvent === 'content_block_delta' || type === 'content_block_delta') {
              const delta = parsed.delta
              if (delta?.type === 'text_delta' && delta.text) {
                callbacks.onToken(delta.text, 'text')
              } else if (delta?.type === 'thinking_delta' && delta.thinking) {
                callbacks.onToken(delta.thinking, 'thinking')
              } else if (delta?.type === 'input_json_delta' && delta.partial_json) {
                // Tool use — could be tracked if needed
              }
            } else if (type === 'message_delta') {
              rawUsage = parsed.usage ?? rawUsage
            } else if (currentEvent === 'message_stop' || type === 'message_stop') {
              callbacks.onDone(buildUsage())
              return
            } else if (type === 'error') {
              callbacks.onError(new Error(parsed.error?.message ?? 'Unknown Anthropic error'))
              return
            }
          } catch {
            // Ignore malformed frames
          }
        }
      }
      callbacks.onDone(buildUsage())
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        callbacks.onDone()
      } else {
        callbacks.onError(error as Error)
      }
    }
  }

  async function testConnection(): Promise<TestConnectionResult> {
    const start = performance.now()
    try {
      const response = await fetchWithTimeout(`${baseUrl}/models`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
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
      return { ok: false, latency, error: (error as Error).message || '连接超时' }
    }
  }

  return { chat, streamChat, testConnection }
}
