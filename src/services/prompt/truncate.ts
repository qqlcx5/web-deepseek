// ─── Token Estimation & Context Truncation ────────────────────────────────────
// ~4 chars/token heuristic; preserves head metadata; oldest history dropped
// first; user's current input never truncated.

export interface TruncateContextInput {
  contextText: string
  historyMessages: Array<{ role: 'user' | 'assistant'; content: string }>
  userInput: string
  tokenBudget: number
  maxHistoryMessages?: number
}

export interface TruncateResult {
  contextText: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Truncate a single text block from the end (keep the head) to fit within
 * `budget` tokens.
 */
function truncateText(text: string, budget: number): string {
  if (budget <= 0) return ''
  // binary-search the cutoff point
  let lo = 0
  let hi = text.length
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    if (estimateTokens(text.slice(0, mid)) <= budget) {
      lo = mid
    } else {
      hi = mid - 1
    }
  }
  return text.slice(0, lo).trimEnd()
}

export function truncateContext(input: TruncateContextInput): TruncateResult {
  const { contextText, historyMessages, userInput, tokenBudget, maxHistoryMessages } = input

  // ── 1. Reserve tokens for the user's current question ──────────────────────
  const userTokens = estimateTokens(userInput)
  const budgetForSystem = Math.max(0, tokenBudget - userTokens)

  // ── 2. Truncate document context (keep head) ───────────────────────────────
  const truncatedContext = truncateText(contextText, budgetForSystem)

  // ── 3. Fit history messages within remaining budget ────────────────────────
  let historyBudget = budgetForSystem - estimateTokens(truncatedContext)

  // Apply maxHistoryMessages cap if specified
  let eligible = historyMessages
  if (maxHistoryMessages !== undefined && maxHistoryMessages > 0) {
    eligible = eligible.slice(-maxHistoryMessages * 2) // pairs
  }

  // Drop oldest first until within token budget
  const kept: Array<{ role: 'user' | 'assistant'; content: string }> = []
  for (let i = eligible.length - 1; i >= 0; i--) {
    const msg = eligible[i]!
    const cost = estimateTokens(msg.content)
    if (cost <= historyBudget) {
      kept.unshift(msg)
      historyBudget -= cost
    } else if (historyBudget > 0) {
      // Truncate this message content and keep a partial version
      const partialContent = truncateText(msg.content, historyBudget)
      if (partialContent.length > 0) {
        kept.unshift({ role: msg.role, content: partialContent })
      }
      historyBudget = 0
    }
    // else: budget exhausted, stop
  }

  return {
    contextText: truncatedContext,
    messages: kept,
  }
}
