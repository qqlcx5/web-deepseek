import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { ChatMessage } from '@/types'

const api = vi.hoisted(() => ({ chatStream: vi.fn() }))

vi.mock('@/api/chat-api', () => ({
  chatApi: { chatStream: api.chatStream },
}))

function streamOf(...events: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      for (const event of events) controller.enqueue(encoder.encode(event))
      controller.close()
    },
  })
}

function assistantMessage(): ChatMessage {
  return {
    id: 'message-1',
    topicId: 'topic-1',
    role: 'assistant',
    content: '',
    createdAt: '2025-01-01T00:00:00.000Z',
    status: 'sending',
    blocks: [],
  }
}

beforeAll(() => {
  Object.assign(globalThis, {
    localStorage: {
      getItem: () => null,
      setItem: () => undefined,
    },
  })
})

describe('chat streaming state machine', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    api.chatStream.mockReset()
  })

  async function configureStore() {
    const { useAppStore } = await import('@/stores/app')
    const { useUiStore } = await import('@/stores/ui')
    const { useChatStore } = await import('@/stores/chat')
    const appStore = useAppStore()
    const uiStore = useUiStore()
    appStore.providers.push({
      id: 'provider-1',
      name: 'Provider',
      apiHost: 'https://api.example.com',
      models: [{ id: 'model-1', name: 'Model', enabled: true }],
      enabled: true,
    })
    uiStore.selectedModel = uiStore.models[0]!
    return useChatStore()
  }

  it('writes content, thinking, usage and successful block statuses from SSE', async () => {
    api.chatStream.mockResolvedValue(streamOf(
      'data: {"reasoning_content":"plan"}\n',
      'data: {"content":"answer"}\n',
      'data: {"usage":{"prompt_tokens":3,"completion_tokens":5,"total_tokens":8}}\n',
      'data: [DONE]\n',
    ))
    const store = await configureStore()
    const message = assistantMessage()

    await store.streamChat(message, [])

    expect(message.status).toBe('complete')
    expect(message.content).toBe('answer')
    expect(message.reasoningContent).toBe('plan')
    expect(message.usage).toEqual({ prompt_tokens: 3, completion_tokens: 5, total_tokens: 8 })
    expect(message.blocks.map(block => [block.type, block.content, block.status])).toEqual([
      ['thinking', 'plan', 'success'],
      ['main_text', 'answer', 'success'],
    ])
  })

  it('preserves generated content when the request is cancelled', async () => {
    const abortError = Object.assign(new Error('cancelled'), { name: 'AbortError' })
    api.chatStream.mockRejectedValue(abortError)
    const store = await configureStore()
    const message = assistantMessage()
    message.content = 'partial answer'
    message.blocks.push({
      id: 'block-1',
      type: 'main_text',
      content: 'partial answer',
      status: 'streaming',
      createdAt: message.createdAt,
    })

    await store.streamChat(message, [])

    expect(message.status).toBe('stopped')
    expect(message.content).toBe('partial answer')
    expect(message.blocks[0]!.status).toBe('success')
  })

  it('adds an error block for failed requests', async () => {
    api.chatStream.mockRejectedValue(new Error('401 unauthorized'))
    const store = await configureStore()
    const message = assistantMessage()

    await store.streamChat(message, [])

    expect(message.status).toBe('error')
    expect(message.error).toBe('401 unauthorized')
    expect(message.blocks).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'error', content: '401 unauthorized', status: 'error' }),
    ]))
  })
})
