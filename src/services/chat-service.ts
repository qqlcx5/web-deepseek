// ─── Chat Streaming Service ───────────────────────────────────────────────────
// Owns the streaming lifecycle: request, SSE parse, message mutation, status.
// Pure-ish: takes explicit deps, delegates message mutation to the store via
// onDelta so writes land on the Vue reactive proxy. No Vue, no Pinia.

import type { ChatMessage, MessageBlock, Model, Provider, TokenUsage } from '@/types'
import { chatApi, type ChatRequestParams } from '@/api/chat-api'
import { consumeSSEStream } from '@/utils/sse'

export interface StreamDeps {
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
  /**
   * Called for every delta so the store can mutate the **reactive proxy**
   * version of the assistant message. The mutator receives the message
   * and applies changes in place — this is the single write path that
   * keeps Vue reactivity intact.
   */
  onDelta: (mutator: (message: ChatMessage) => void) => void
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

/**
 * Apply (or create-then-apply) a block of the given type via the onDelta
 * callback. Returns nothing — the mutation happens on the proxy.
 */
function mutateBlock(
  onDelta: (mutator: (message: ChatMessage) => void) => void,
  type: MessageBlock['type'],
  fn: (block: MessageBlock) => void,
): void {
  onDelta((message) => {
    let block = message.blocks.find(b => b.type === type)
    if (!block) {
      block = {
        id: createId('block'),
        type,
        content: '',
        status: 'streaming',
        createdAt: now(),
      }
      message.blocks.push(block)
    }
    fn(block)
  })
}

interface StreamDelta {
  content?: string
  reasoning_content?: string
  usage?: TokenUsage
}

/**
 * Stream a chat completion, delegating all message mutations to the store via
 * `onDelta` so they land on the Vue reactive proxy.
 *
 * Sets the message's status/blocks/content/reasoningContent/usage/error as the
 * stream progresses, calls `onPersist` (throttled to every 400ms) so the store
 * can save progress, and resolves once the stream is done, aborted, or failed.
 */
export async function streamAssistantMessage(deps: StreamDeps): Promise<void> {
  const { context, model, provider, signal, topicId, onDelta, onPersist, onErrorToast } = deps

  // State machine: sending → streaming
  onDelta(msg => { msg.status = 'streaming'; msg.loading = true; msg.model = model.name })

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
      // Read the current message state through onDelta (sync) for persistence.
      // We use a synchronous read via a closure variable.
      let snapshot: ChatMessage | undefined
      onDelta(msg => { snapshot = msg })
      if (snapshot) onPersist(topicId, snapshot)
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
          onDelta(msg => {
            msg.reasoningContent = (msg.reasoningContent ?? '') + delta.reasoning_content
          })
          mutateBlock(onDelta, 'thinking', block => { block.content += delta.reasoning_content })
        }
        if (delta.content) {
          onDelta(msg => { msg.content += delta.content })
          mutateBlock(onDelta, 'main_text', block => { block.content += delta.content })
        }
        if (delta.usage) {
          onDelta(msg => { msg.usage = delta.usage })
        }
      }
      catch {
        // Ignore malformed event frames and keep consuming the stream.
      }
      maybePersist()
    })

    // State machine: streaming → complete
    onDelta(msg => {
      for (const block of msg.blocks) {
        if (block.status === 'streaming') block.status = 'success'
      }
      msg.status = 'complete'
    })
  }
  catch (error) {
    if ((error as Error).name === 'AbortError') {
      // State machine: streaming → stopped (preserve accumulated content)
      onDelta(msg => {
        msg.status = 'stopped'
        for (const block of msg.blocks) {
          if (block.status === 'streaming') block.status = 'success'
        }
      })
    }
    else {
      const detail = error instanceof Error ? error.message : String(error)
      const isApiError = typeof (error as { status?: unknown }).status === 'number'
      const prefix = isApiError ? '请求失败' : '请求出错'
      // State machine: streaming → error
      onDelta(msg => {
        msg.status = 'error'
        msg.error = detail
        msg.blocks.push({
          id: createId('block-error'),
          type: 'error',
          content: detail,
          status: 'error',
          createdAt: now(),
        })
      })
      onErrorToast(`${prefix}: ${detail}`)
    }
  }
  finally {
    onDelta(msg => { msg.loading = false })
    // Final persist: read snapshot through onDelta
    if (topicId) {
      let snapshot: ChatMessage | undefined
      onDelta(msg => { snapshot = msg })
      if (snapshot) onPersist(topicId, snapshot)
    }
  }
}
