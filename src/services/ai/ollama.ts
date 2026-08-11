// ─── Ollama Provider Adapter ──────────────────────────────────────────────────
// Implements Ollama /api/chat NDJSON streaming and /api/tags connection test.

import type { AIProvider, ChatInput, StreamCallbacks, TestConnectionResult } from './types'
import { normalizeBaseUrl, fetchWithTimeout } from './shared'

export interface OllamaConfig {
  apiHost: string
  /** Ollama typically does not require an API key for local instances. */
  apiKey?: string
}

export function createOllamaProvider(config: OllamaConfig): AIProvider {
  const { apiHost, apiKey } = config
  const baseUrl = normalizeBaseUrl(apiHost)

  function headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (apiKey) {
      h['Authorization'] = `Bearer ${apiKey}`
    }
    return h
  }

  async function chat(input: ChatInput): Promise<string> {
    const response = await fetchWithTimeout(`${baseUrl}/chat`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        model: input.model,
        messages: input.messages.map(m => ({ role: m.role, content: m.content })),
        stream: false,
      }),
      signal: input.signal,
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`Ollama API error ${response.status}: ${body}`)
    }

    const data = await response.json()
    return data.message?.content ?? ''
  }

  async function streamChat(input: ChatInput, callbacks: StreamCallbacks): Promise<void> {
    const response = await fetchWithTimeout(`${baseUrl}/chat`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        model: input.model,
        messages: input.messages.map(m => ({ role: m.role, content: m.content })),
        stream: true,
      }),
      signal: input.signal,
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      callbacks.onError(new Error(`Ollama API error ${response.status}: ${body}`))
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      callbacks.onError(new Error('No response body'))
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // NDJSON: each line is a complete JSON object
        let newlineIdx: number
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIdx).trim()
          buffer = buffer.slice(newlineIdx + 1)

          if (!line) continue

          try {
            const parsed = JSON.parse(line)

            if (parsed.done) {
              callbacks.onDone({
                prompt_tokens: parsed.prompt_eval_count,
                completion_tokens: parsed.eval_count,
                total_tokens: (parsed.prompt_eval_count ?? 0) + (parsed.eval_count ?? 0),
              })
              return
            }

            const content = parsed.message?.content ?? ''
            if (content) {
              callbacks.onToken(content, 'text')
            }
          } catch {
            // Ignore malformed NDJSON lines
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
  }

  async function testConnection(): Promise<TestConnectionResult> {
    const start = performance.now()
    try {
      const response = await fetchWithTimeout(`${baseUrl}/tags`, {
        method: 'GET',
        headers: headers(),
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
