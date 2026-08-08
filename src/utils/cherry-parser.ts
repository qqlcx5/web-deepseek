// ─── Cherry Studio Data Parser ────────────────────────────────────────────────
// Utilities for safely parsing Cherry Studio export JSON files.

import type { CherryData, ParsedCherryData } from '@/types/cherry-data'

/**
 * Safely parse a JSON string into a typed value.
 *
 * @param text The JSON string to parse.
 * @returns An object with `ok` and either `data` or `error`.
 */
export function safeParse<T>(text: string): { ok: true; data: T } | { ok: false; error: string } {
  try {
    const data = JSON.parse(text) as T
    return { ok: true, data }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, error: message }
  }
}

/**
 * Parse a Cherry Studio data export JSON string.
 *
 * Performs structural validation and returns a `ParsedCherryData`
 * containing counts and the parsed data (or an error message).
 *
 * @param text The raw JSON string from a Cherry Studio export file.
 * @returns A `ParsedCherryData` result.
 */
export function parseDataJSON(text: string): ParsedCherryData {
  const result = safeParse<CherryData>(text)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }

  const data = result.data
  const persist = data.persist

  // Count providers
  const providers = persist?.llm?.providers
  const providerCount = providers ? Object.keys(providers).length : 0

  // Count assistants
  const assistants = persist?.assistants?.assistants
  const assistantCount = assistants ? Object.keys(assistants).length : 0

  // Count topics and messages
  const topics = persist?.assistants?.topics
  const topicCount = topics ? Object.keys(topics).length : 0

  let messageCount = 0
  if (topics) {
    for (const topicKey of Object.keys(topics)) {
      const topic = topics[topicKey]
      if (topic && Array.isArray(topic.messages)) {
        messageCount += topic.messages.length
      }
    }
  }

  return {
    ok: true,
    data,
    providerCount,
    assistantCount,
    topicCount,
    messageCount,
  }
}
