import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ChatMessage, Model } from '@/types'

// Replace the chat API module so chat-service never touches real network/http.
vi.mock('@/api/chat-api', () => ({
  ApiError: class ApiError extends Error {
    status = 0
    constructor(message: string, status: number) {
      super(message)
      this.name = 'ApiError'
      this.status = status
    }
  },
  chatApi: { chatStream: vi.fn() },
}))

import { chatApi } from '@/api/chat-api'
import { streamAssistantMessage, type StreamDeps } from '@/services/chat-service'

function sseStream(frames: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const frame of frames) controller.enqueue(encoder.encode(`data: ${frame}\n`))
      controller.close()
    },
  })
}

function makeMessage(): ChatMessage {
  return {
    id: 'a1',
    topicId: 't1',
    role: 'assistant',
    content: '',
    createdAt: '',
    status: 'sending',
    loading: true,
    blocks: [],
  }
}

const MODEL: Model = {
  id: 'm',
  name: 'Model',
  providerId: 'p',
  color: '',
  description: '',
  tags: [],
}

/**
 * Build StreamDeps with a real message object and an onDelta that applies
 * mutations directly to it — simulating what the store does on the proxy.
 */
function makeDeps(message: ChatMessage, overrides: Partial<StreamDeps> = {}): StreamDeps {
  return {
    context: [],
    model: MODEL,
    provider: undefined,
    signal: new AbortController().signal,
    topicId: 't1',
    onDelta: (mutator) => { mutator(message) },
    onPersist: vi.fn(),
    onErrorToast: vi.fn(),
    ...overrides,
  }
}

describe('streamAssistantMessage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('accumulates content + reasoning and finishes as complete', async () => {
    const message = makeMessage()
    vi.mocked(chatApi.chatStream).mockResolvedValue(sseStream([
      JSON.stringify({ reasoning_content: 'think' }),
      JSON.stringify({ content: 'Hello' }),
      JSON.stringify({ content: ' world' }),
    ]))

    await streamAssistantMessage(makeDeps(message))

    expect(message.content).toBe('Hello world')
    expect(message.reasoningContent).toBe('think')
    expect(message.status).toBe('complete')
    expect(message.loading).toBe(false)
    expect(message.blocks.find(b => b.type === 'main_text')?.content).toBe('Hello world')
    expect(message.blocks.find(b => b.type === 'thinking')?.content).toBe('think')
  })

  it('ignores the [DONE] sentinel and still completes', async () => {
    const message = makeMessage()
    vi.mocked(chatApi.chatStream).mockResolvedValue(sseStream([
      '[DONE]',
      JSON.stringify({ content: 'x' }),
    ]))

    await streamAssistantMessage(makeDeps(message))

    expect(message.content).toBe('x')
    expect(message.status).toBe('complete')
  })

  it('marks the message as stopped on abort', async () => {
    const message = makeMessage()
    const abortError = new Error('aborted')
    abortError.name = 'AbortError'
    vi.mocked(chatApi.chatStream).mockRejectedValue(abortError)

    await streamAssistantMessage(makeDeps(message))

    expect(message.status).toBe('stopped')
  })

  it('marks the message as error and toasts on a non-abort failure', async () => {
    const message = makeMessage()
    vi.mocked(chatApi.chatStream).mockRejectedValue(new Error('boom'))

    const deps = makeDeps(message)
    await streamAssistantMessage(deps)

    expect(message.status).toBe('error')
    expect(message.error).toBe('boom')
    expect(message.blocks.some(b => b.type === 'error')).toBe(true)
    expect(deps.onErrorToast).toHaveBeenCalledWith(expect.stringContaining('boom'))
    expect(deps.onErrorToast).toHaveBeenCalledWith(expect.stringContaining('请求出错'))
  })

  it('throttles onPersist during the stream but always persists once at the end', async () => {
    const message = makeMessage()
    vi.mocked(chatApi.chatStream).mockResolvedValue(
      sseStream(Array.from({ length: 50 }, () => JSON.stringify({ content: 'x' }))),
    )
    const deps = makeDeps(message)

    await streamAssistantMessage(deps)

    // 50 frames arrive within the same tick → at most one mid-stream persist, plus the final one.
    expect(deps.onPersist).toHaveBeenCalledWith('t1', message)
    expect(deps.onPersist.mock.calls.length).toBeLessThan(50)
  })
})
