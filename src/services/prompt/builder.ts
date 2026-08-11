// ─── Prompt Builder ──────────────────────────────────────────────────────────
// Assembles the messages array for chat completions. No hardcoded AI identity
// — systemPrompt is sourced from Assistant.prompt (or empty). Documents are
// injected as a user-prefixed context block before the conversation.

import type { DocumentEntity, ContextSettings } from './context'
import { buildPageContext } from './context'
import { truncateContext } from './truncate'

export interface BuildPromptInput {
  /** System prompt from Assistant or global settings. */
  systemPrompt?: string
  /** Formatted document context text (from buildPageContext or empty). */
  contextText?: string
  /** Conversation history (user + assistant pairs). */
  history: Array<{ role: 'user' | 'assistant'; content: string }>
  /** The current user message. */
  userInput: string
  /** Token budget cap (e.g. from model.contextLength). */
  tokenBudget?: number
  /** Max history message pairs to keep. */
  maxHistoryMessages?: number
  /** Optional document + settings for inline formatting. */
  document?: DocumentEntity | null
  /** Context formatting toggles. */
  contextSettings?: ContextSettings
}

export interface BuildPromptOutput {
  systemPrompt?: string
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export function buildPrompt(input: BuildPromptInput): BuildPromptOutput {
  const {
    systemPrompt,
    contextText: rawContextText,
    history,
    userInput,
    tokenBudget,
    maxHistoryMessages,
    document,
    contextSettings,
  } = input

  // ── 1. Format document context ────────────────────────────────────────────
  const documentContextText = document
    ? buildPageContext(document, contextSettings)
    : ''
  const combinedContext = [rawContextText, documentContextText]
    .filter(Boolean)
    .join('\n\n')

  // ── 2. Truncate if token budget is specified ──────────────────────────────
  let finalContextText = combinedContext
  let finalMessages: Array<{ role: 'user' | 'assistant'; content: string }> = history

  if (tokenBudget !== undefined && tokenBudget > 0) {
    const effectiveBudget = systemPrompt
      ? tokenBudget - estimateTokens(systemPrompt)
      : tokenBudget
    const result = truncateContext({
      contextText: combinedContext,
      historyMessages: history,
      userInput,
      tokenBudget: Math.max(0, effectiveBudget),
      maxHistoryMessages,
    })
    finalContextText = result.contextText
    finalMessages = result.messages
  } else if (maxHistoryMessages !== undefined && maxHistoryMessages > 0) {
    finalMessages = history.slice(-maxHistoryMessages * 2)
  }

  // ── 3. Build messages array ───────────────────────────────────────────────
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = []

  // System prompt — only inject when non-empty (no hardcoded identity)
  if (systemPrompt && systemPrompt.trim()) {
    messages.push({ role: 'system', content: systemPrompt })
  }

  // History
  for (const msg of finalMessages) {
    messages.push({ role: msg.role, content: msg.content })
  }

  // Document context injected as a user message before the current user input
  if (finalContextText) {
    messages.push({ role: 'user', content: finalContextText })
  }

  // Current user input
  messages.push({ role: 'user', content: userInput })

  return { systemPrompt: systemPrompt || undefined, messages }
}
