import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ChatMessage, Model } from '@/types'
import type { AIProvider, ChatInput, StreamCallbacks } from '@/services/ai/types'

// Replace the factory so chat-service never touches real network/http.
const mockProvider: AIProvider = {
  chat: vi.fn(),
  streamChat: vi.fn(),
  testConnection: vi.fn(),
}

vi.mock('@/services/ai/factory', () => ({
  createProvider: vi.fn(() => mockProvider),
}))

import { streamAssistantMessage, type StreamDeps } from '@/services/chat-service'

/**
 * Helper to simulate a streamChat that delivers tokens via callbacks.
 */
function simulateStream(events: { token: string; type?: 'text' | 'thinking' }[]) {
  return async (_input: ChatInput, callbacks: StreamCallbacks) => {
    for (const evt of events) {
      callbacks.onToken(evt.token, evt.type)
      // Let throttling tick
      await new Promise(r => setTimeout(r, 0))
    }
    callbacks.onDone()
  }
}

/**
 * Simulate streamChat that throws an error.
 */
function simulateError(error: Error) {
  return async (_input: ChatInput, callbacks: StreamCallbacks) => {
    callbacks.onError(error)
  }
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
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(mockProvider.streamChat).mockReset()
    vi.mocked(mockProvider.chat).mockReset()
  })

  it('accumulates content + reasoning and finishes as complete', async () => {
    const message = makeMessage()
    mockProvider.streamChat.mockImplementation(simulateStream([
      { token: 'think', type: 'thinking' },
      { token: 'Hello', type: 'text' },
      { token: ' world', type: 'text' },
    ]))

    await streamAssistantMessage(makeDeps(message))

    expect(message.content).toBe('Hello world')
    expect(message.reasoningContent).toBe('think')
    expect(message.status).toBe('complete')
    expect(message.loading).toBe(false)
    expect(message.blocks.find(b => b.type === 'main_text')?.content).toBe('Hello world')
    expect(message.blocks.find(b => b.type === 'thinking')?.content).toBe('think')
  })

  it('finishes complete even with empty stream', async () => {
    const message = makeMessage()
    mockProvider.streamChat.mockImplementation(async (_input, callbacks) => {
      callbacks.onDone()
    })

    await streamAssistantMessage(makeDeps(message))

    expect(message.status).toBe('complete')
    expect(message.loading).toBe(false)
  })

  it('marks the message as stopped on abort', async () => {
    const message = makeMessage()
    mockProvider.streamChat.mockRejectedValue(
      Object.assign(new Error('aborted'), { name: 'AbortError' }),
    )

    await streamAssistantMessage(makeDeps(message))

    expect(message.status).toBe('stopped')
    expect(message.loading).toBe(false)
  })

  it('marks the message as error and toasts on a non-abort failure', async () => {
    const message = makeMessage()
    mockProvider.streamChat.mockImplementation(simulateError(new Error('boom')))

    const deps = makeDeps(message)
    await streamAssistantMessage(deps)

    expect(message.status).toBe('error')
    expect(message.error).toBe('boom')
    expect(message.blocks.some(b => b.type === 'error')).toBe(true)
    expect(deps.onErrorToast).toHaveBeenCalledWith(expect.stringContaining('boom'))
    expect(deps.onErrorToast).toHaveBeenCalledWith(expect.stringContaining('请求出错'))
  })

  it('captures error message and preserves it in error block', async () => {
    const message = makeMessage()
    mockProvider.streamChat.mockImplementation(simulateError(new Error('Unauthorized')))

    const deps = makeDeps(message)
    await streamAssistantMessage(deps)

    expect(message.status).toBe('error')
    expect(message.error).toBe('Unauthorized')
    expect(message.blocks.some(b => b.type === 'error')).toBe(true)
    expect(deps.onErrorToast).toHaveBeenCalledWith(expect.stringContaining('Unauthorized'))
  })

  it('throttles onPersist during the stream but always persists once at the end', async () => {
    const message = makeMessage()
    mockProvider.streamChat.mockImplementation(
      simulateStream(Array.from({ length: 50 }, () => ({ token: 'x', type: 'text' as const }))),
    )
    const deps = makeDeps(message)

    await streamAssistantMessage(deps)

    expect(deps.onPersist).toHaveBeenCalledWith('t1', message)
    expect(deps.onPersist.mock.calls.length).toBeLessThan(50)
  })
})
