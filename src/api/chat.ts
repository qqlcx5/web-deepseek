import type {
  ChatCompletionRequest,
  ChatCompletionChunk,
  ChatCompletionResponse,
  ModelListResponse,
} from '@/types/chat'

const API_BASE = import.meta.env.VITE_AI_API_BASE || '/ai-api'
const API_KEY = import.meta.env.VITE_AI_API_KEY || ''

function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  }
}

/**
 * 获取可用模型列表
 */
export async function fetchModels(): Promise<ModelListResponse> {
  const res = await fetch(`${API_BASE}/models`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch models: ${res.status}`)
  return res.json()
}

/**
 * 非流式对话补全
 */
export async function chatCompletion(
  body: ChatCompletionRequest,
): Promise<ChatCompletionResponse> {
  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ...body, stream: false }),
  })
  if (!res.ok) throw new Error(`Chat completion failed: ${res.status}`)
  return res.json()
}

/**
 * 流式对话补全 (SSE)
 * 返回一个 AsyncGenerator，逐块 yield 内容
 */
export async function* chatCompletionStream(
  body: ChatCompletionRequest,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ...body, stream: true }),
    signal,
  })

  if (!res.ok) {
    const error = await res.text().catch(() => res.statusText)
    throw new Error(`Stream failed: ${res.status} ${error}`)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Process complete SSE lines
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const data = trimmed.slice(6)
        if (data === '[DONE]') return

        try {
          const chunk: ChatCompletionChunk = JSON.parse(data)
          const delta = chunk.choices?.[0]?.delta?.content
          if (delta) yield delta
        } catch {
          // Skip malformed JSON
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
