import { ref, type Ref } from 'vue'
import { XRequest, useXStream } from 'vue-element-plus-x'
import { chatApi } from '@/api/chat'
import type { ChatRequestParams, SSEEvent, StreamCallbacks } from '@/api/types'
import type { Provider } from '@/types'

// ===== SSE Parsing =====

/**
 * Parse SSE `data:` line content into SSEEvent.
 * Handles `data: {...}\n\n` format and `data: [DONE]` terminator.
 */
function parseSSEData(data: string): SSEEvent | null {
  const trimmed = data.trim()
  if (!trimmed || trimmed === '[DONE]') {
    return { done: true }
  }
  try {
    return JSON.parse(trimmed) as SSEEvent
  } catch {
    console.warn('[SSE] Failed to parse:', trimmed)
    return null
  }
}

// ===== useChatSend =====

export interface UseChatSendOptions {
  provider: Provider
  model: string
  onMessage?: (event: SSEEvent) => void
  onError?: (error: Error) => void
  onAbort?: () => void
  onFinish?: () => void
}

export interface UseChatSendReturn {
  isLoading: Ref<boolean>
  data: Ref<SSEEvent[]>
  start: (params: Omit<ChatRequestParams, 'provider' | 'model'>) => Promise<void>
  cancel: () => void
}

export function useChatSend(options: UseChatSendOptions): UseChatSendReturn {
  const { provider, model, onMessage, onError, onAbort, onFinish } = options

  const isLoading = ref(false)
  const data = ref<SSEEvent[]>([])

  // XRequest instance for abort management
  const xRequest = new XRequest<string>({
    baseURL: provider.apiHost,
    type: 'fetch',
    transformer: (msg: string) => msg,
    onMessage: (msg: string) => {
      const event = parseSSEData(msg)
      if (!event) return
      if (event.done) return
      data.value.push(event)
      onMessage?.(event)
    },
    onError: (e: unknown) => {
      isLoading.value = false
      const error = e instanceof Error ? e : new Error(String(e))
      console.error('[Chat Stream Error]', error)
      onError?.(error)
    },
    onAbort: () => {
      isLoading.value = false
      onAbort?.()
    },
    onFinish: () => {
      isLoading.value = false
      onFinish?.()
    },
  })

  // useXStream for SSE stream handling
  const { startStream, cancel: cancelStream, isLoading: streamLoading } = useXStream()

  const start = async (params: Omit<ChatRequestParams, 'provider' | 'model'>) => {
    isLoading.value = true
    data.value = []

    const fullParams: ChatRequestParams = {
      ...params,
      provider,
      model,
      stream: true,
    }

    try {
      const readableStream = await chatApi.chatStream(fullParams)

      await startStream({
        readableStream,
      })

      // useXStream doesn't call onFinish, so we handle it here
      if (streamLoading.value) {
        // still loading — stream will complete async
      }
      isLoading.value = false
      onFinish?.()
    } catch (e) {
      isLoading.value = false
      const error = e instanceof Error ? e : new Error(String(e))
      console.error('[Chat Start Error]', error)
      onError?.(error)
    }
  }

  const cancel = () => {
    xRequest.abort()
    cancelStream()
    isLoading.value = false
  }

  return {
    isLoading,
    data,
    start,
    cancel,
  }
}

// ===== SSE Stream Parser (standalone, for manual use) =====

/**
 * Parse a ReadableStream<Uint8Array> of SSE data and invoke callbacks.
 * This is a lower-level utility that doesn't depend on vue-element-plus-x.
 */
export async function parseSSEStream(
  stream: ReadableStream<Uint8Array>,
  callbacks: StreamCallbacks,
): Promise<void> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Process complete SSE events (separated by \n\n)
      const events = buffer.split('\n\n')
      buffer = events.pop() ?? ''

      for (const rawEvent of events) {
        const lines = rawEvent.split('\n')
        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          const dataStr = line.slice(5).trim()
          if (!dataStr) continue

          if (dataStr === '[DONE]') {
            callbacks.onFinish?.()
            return
          }

          try {
            const event = JSON.parse(dataStr) as SSEEvent
            callbacks.onMessage?.(event)
          } catch {
            console.warn('[SSE] Failed to parse:', dataStr)
          }
        }
      }
    }
    callbacks.onFinish?.()
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      callbacks.onAbort?.()
    } else {
      callbacks.onError?.(e instanceof Error ? e : new Error(String(e)))
    }
  } finally {
    reader.releaseLock()
  }
}
