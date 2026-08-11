// ─── Chat Streaming Service ───────────────────────────────────────────────────
// Owns the streaming lifecycle: request, SSE parse, message mutation, status.
// Uses the unified AIProvider factory so chat-service remains provider-agnostic.

import type { ChatMessage, MessageBlock, Model, Provider, TokenUsage } from '@/types'
import { createProvider } from '@/services/ai/factory'
import type { StreamCallbacks } from '@/services/ai/types'
import { buildPrompt } from '@/services/prompt/builder'

export interface StreamDeps {
  /** Conversation context used to build the request body. */
  context: ChatMessage[]
  /** Resolved model for this request. */
  model: Model
  /** Resolved provider (optional override of apiHost/apiKey + providerType). */
  provider: Provider | undefined
  /** Abort signal from the owning store. */
  signal: AbortSignal
  /** Topic id, passed back through onPersist. Omitted in headless/unit runs. */
  topicId?: string
  /** System prompt from the current Assistant (no hardcoded identity). */
  systemPrompt?: string
  /** Max context tokens budget (default: model.contextLength). */
  maxContextTokens?: number
  /** Max history message pairs to keep. */
  maxHistoryMessages?: number
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

/**
 * Stream a chat completion, delegating all message mutations to the store via
 * `onDelta` so they land on the Vue reactive proxy.
 *
 * Uses the unified AIProvider factory to route to the correct adapter
 * (OpenAI-compatible, Anthropic, or Ollama) based on provider.providerType.
 */
export async function streamAssistantMessage(deps: StreamDeps): Promise<void> {
  const { context, model, provider, signal, topicId, systemPrompt, maxContextTokens, maxHistoryMessages, onDelta, onPersist, onErrorToast } = deps

  // State machine: sending → streaming
  onDelta(msg => { msg.status = 'streaming'; msg.loading = true; msg.model = model.name })

  // Resolve provider config: use provider if given, otherwise create a default
  // openai-compatible adapter from env config.
  const providerAdapter = provider
    ? createProvider({
        providerType: provider.providerType ?? 'openai-compatible',
        apiHost: provider.apiHost,
        apiKey: provider.apiKey ?? '',
      })
    : createProvider({
        providerType: 'openai-compatible',
        apiHost: import.meta.env.VITE_AI_API_BASE || '/ai-api',
        apiKey: import.meta.env.VITE_AI_API_KEY || '',
      })

  // Build the request messages via PromptBuilder — no hardcoded AI identity.
  // systemPrompt comes from the Assistant; contextText (documents) is empty
  // until M23 lands. History is derived from the completed conversation context.
  const history = context
    .filter(message => message.content && (message.status === 'complete' || message.status === 'stopped'))
    .map(message => ({ role: message.role as 'user' | 'assistant', content: message.content }))

  // The last message (current user input) is extracted from the filtered
  // context and excluded from history; the builder will inject it separately.
  const userInput = history.pop()?.content ?? ''
  const { messages } = buildPrompt({
    systemPrompt,
    contextText: '',
    history,
    userInput,
    tokenBudget: maxContextTokens ?? model.contextLength,
    maxHistoryMessages,
  })

  let lastPersistAt = 0
  const maybePersist = () => {
    if (topicId && Date.now() - lastPersistAt > 400) {
      let snapshot: ChatMessage | undefined
      onDelta(msg => { snapshot = msg })
      if (snapshot) onPersist(topicId, snapshot)
      lastPersistAt = Date.now()
    }
  }

  const callbacks: StreamCallbacks = {
    onToken(token: string, type?: 'text' | 'thinking') {
      if (type === 'thinking') {
        onDelta(msg => {
          msg.reasoningContent = (msg.reasoningContent ?? '') + token
        })
        mutateBlock(onDelta, 'thinking', block => { block.content += token })
      } else {
        onDelta(msg => { msg.content += token })
        mutateBlock(onDelta, 'main_text', block => { block.content += token })
      }
      maybePersist()
    },
    onDone(usage?: TokenUsage) {
      onDelta(msg => {
        for (const block of msg.blocks) {
          if (block.status === 'streaming') block.status = 'success'
        }
        msg.status = 'complete'
        if (usage) msg.usage = usage
      })
    },
    onError(error: Error) {
      const detail = error.message
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
      onErrorToast(`请求出错: ${detail}`)
    },
  }

  try {
    await providerAdapter.streamChat(
      { model: model.id, messages, signal },
      callbacks,
    )
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      onDelta(msg => {
        msg.status = 'stopped'
        for (const block of msg.blocks) {
          if (block.status === 'streaming') block.status = 'success'
        }
      })
    } else {
      const detail = error instanceof Error ? error.message : String(error)
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
      onErrorToast(`请求出错: ${detail}`)
    }
  } finally {
    onDelta(msg => { msg.loading = false })
    // Final persist
    if (topicId) {
      let snapshot: ChatMessage | undefined
      onDelta(msg => { snapshot = msg })
      if (snapshot) onPersist(topicId, snapshot)
    }
  }
}
