// ─── Token Estimation Utilities ───────────────────────────────────────────────
// Lightweight token estimation without external dependencies.
// Uses a heuristic: Chinese characters ≈ 1.5 chars/token, English ≈ 4 chars/token.

import type { ChatMessage } from '@/types'

// ─── estimateTokens ───────────────────────────────────────────────────────────

/**
 * Estimate the number of tokens in a given text string.
 *
 * Uses a simple heuristic:
 * - Chinese characters: ~1.5 characters per token
 * - ASCII/English characters: ~4 characters per token
 * - Mixed content is split proportionally.
 *
 * @param text The input text.
 * @returns Estimated token count.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0

  let chineseChars = 0
  let otherChars = 0

  for (const char of text) {
    // CJK Unified Ideographs + common Chinese punctuation ranges
    const code = char.codePointAt(0) ?? 0
    if (
      (code >= 0x4e00 && code <= 0x9fff) ||   // CJK Unified Ideographs
      (code >= 0x3400 && code <= 0x4dbf) ||   // CJK Extension A
      (code >= 0x3000 && code <= 0x303f) ||   // CJK Symbols and Punctuation
      (code >= 0xff00 && code <= 0xffef)      // Fullwidth Forms
    ) {
      chineseChars++
    } else {
      otherChars++
    }
  }

  const chineseTokens = chineseChars / 1.5
  const englishTokens = otherChars / 4

  return Math.ceil(chineseTokens + englishTokens)
}

// ─── estimateContextPercent ───────────────────────────────────────────────────

/**
 * Estimate what percentage of the context window is occupied by the given messages.
 *
 * @param messages The conversation messages to evaluate.
 * @param contextLength The model's maximum context length in tokens.
 * @returns A percentage value between 0 and 100.
 */
export function estimateContextPercent(messages: ChatMessage[], contextLength: number): number {
  if (!contextLength || contextLength <= 0) return 0

  let totalTokens = 0
  for (const msg of messages) {
    totalTokens += estimateTokens(msg.content)
    if (msg.reasoningContent) {
      totalTokens += estimateTokens(msg.reasoningContent)
    }
  }

  const percent = (totalTokens / contextLength) * 100
  return Math.min(Math.round(percent * 10) / 10, 100)
}
