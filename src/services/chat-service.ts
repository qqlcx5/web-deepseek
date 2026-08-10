// ─── Chat Streaming Service ───────────────────────────────────────────────────
// Owns the streaming lifecycle: request, SSE parse, message mutation, status.
// Pure-ish: takes explicit deps, mutates the passed message by reference, and
// reports side effects (persist, error toast) via callbacks. No Vue, no Pinia.

import type { ChatMessage, MessageBlock, Model, Provider, TokenUsage } from '@/types'
import { chatApi, type ChatRequestParams } from '@/api/chat-api'
import { consumeSSEStream } from '@/utils/sse'

export interface StreamDeps {
  /** Assistant message to fill in. Mutated in place. */
  assistantMessage: ChatMessage
  /** Conversation context used to build the request body. */
  context: ChatMessage[]
  /** Resolved model for this request. */
  model: Model
  /** Resolved provider (optional override of apiHost/apiKey). */
  provider: Provider | undefined
  /** Abort signal from the owning store. */
  signal: AbortSignal
  /** Topic id, passed back through onPersist. Omitted in headless/unit runs. */
  topicId?: string
  /** Called (throttled) so the store can persist the mutating message. */
  onPersist: (topicId: string, message: ChatMessage) => void
  /** Called once with a human-readable message when a non-abort error occurs. */
  onErrorToast: (message: string) => void
}

function now(): string {
  return new Date().toISOString()
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

function findOrCreateBlock(message: ChatMessage, type: MessageBlock['type']): MessageBlock {
  const current = message.blocks.find(block => block.type === type)
  if (current) return current
  const block: MessageBlock = {
    id: createId('block'),
    type,
    content: '',
    status: 'streaming',
    createdAt: now(),
  }
  message.blocks.push(block)
  return block
}

interface StreamDelta {
  content?: string
  reasoning_content?: string
  usage?: TokenUsage
}

/**
 * Stream a chat completion into `deps.assistantMessage`.
 *
 * Sets the message's status/blocks/content/reasoningContent/usage/error as the
 * stream progresses, calls `onPersist` (throttled to every 400ms) so the store
 * can save progress, and resolves once the stream is done, aborted, or failed.
 */
export async function streamAssistantMessage(deps: StreamDeps): Promise<void> {
  const { assistantMessage, context, model, provider, signal, topicId, onPersist, onErrorToast } = deps

  assistantMessage.status = 'streaming'
  assistantMessage.loading = true
  assistantMessage.model = model.name

  const params: ChatRequestParams = {
    messages: context
      .filter(message => message.content && (message.status === 'complete' || message.status === 'stopped'))
      .map(message => ({ role: message.role, content: message.content })),
    model: model.id,
    signal,
    ...(provider?.apiHost ? { provider: { apiHost: provider.apiHost, apiKey: provider.apiKey } } : {}),
  }

  let lastPersistAt = 0
  const maybePersist = () => {
    if (topicId && Date.now() - lastPersistAt > 400) {
      onPersist(topicId, assistantMessage)
      lastPersistAt = Date.now()
    }
  }

  try {
    const stream = await chatApi.chatStream(params)

    await consumeSSEStream(stream, (data) => {
      if (data === '[DONE]') return
      try {
        const delta = JSON.parse(data) as StreamDelta
        if (delta.reasoning_content) {
          assistantMessage.reasoningContent = (assistantMessage.reasoningContent ?? '') + delta.reasoning_content
          findOrCreateBlock(assistantMessage, 'thinking').content += delta.reasoning_content
        }
        if (delta.content) {
          assistantMessage.content += delta.content
          findOrCreateBlock(assistantMessage, 'main_text').content += delta.content
        }
        if (delta.usage) assistantMessage.usage = delta.usage
      }
      catch {
        // Ignore malformed event frames and keep consuming the stream.
      }
      maybePersist()
    })

    for (const block of assistantMessage.blocks) {
      if (block.status === 'streaming') block.status = 'success'
    }
    assistantMessage.status = 'complete'
  }
  catch (error) {
    if ((error as Error).name === 'AbortError') {
      assistantMessage.status = 'stopped'
      for (const block of assistantMessage.blocks) {
        if (block.status === 'streaming') block.status = 'success'
      }
    }
    else {
      const detail = error instanceof Error ? error.message : String(error)
      const isApiError = typeof (error as { status?: unknown }).status === 'number'
      const prefix = isApiError ? '请求失败' : '请求出错'
      assistantMessage.status = 'error'
      assistantMessage.error = detail
      assistantMessage.blocks.push({
        id: createId('block-error'),
        type: 'error',
        content: detail,
        status: 'error',
        createdAt: now(),
      })
      onErrorToast(`${prefix}: ${detail}`)
    }
  }
  finally {
    assistantMessage.loading = false
    if (topicId) onPersist(topicId, assistantMessage)
  }
}
