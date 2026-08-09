// ─── Cherry Studio Data Parser (Real data.json Structure) ─────────────────────
// Utilities for safely parsing Cherry Studio export JSON files.
// Real structure: { time, version, localStorage: { 'persist:cherry-studio': {...} }, indexedDB: {...} }

import type { CherryData, ParsedCherryData } from '@/types/cherry-data'

/**
 * Safely parse a JSON string into a typed value.
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
 * Real structure:
 * - localStorage['persist:cherry-studio'].llm.providers = array
 * - localStorage['persist:cherry-studio'].assistants.assistants = array
 * - indexedDB.topics = array
 * - indexedDB.message_blocks = array
 *
 * @param text The raw JSON string from a Cherry Studio export file.
 * @returns A ParsedCherryData result.
 */
export function parseDataJSON(text: string): ParsedCherryData {
  const result = safeParse<CherryData>(text)
  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
      providerCount: 0,
      assistantCount: 0,
      topicCount: 0,
      messageCount: 0,
      blockCount: 0,
    }
  }

  const data = result.data

  // Navigate the real structure
  const persist = data.localStorage?.['persist:cherry-studio']
  if (!persist) {
    return {
      ok: false,
      error: "Missing localStorage['persist:cherry-studio']",
      providerCount: 0,
      assistantCount: 0,
      topicCount: 0,
      messageCount: 0,
      blockCount: 0,
    }
  }

  // Count providers (array)
  const providers = persist.llm?.providers
  const providerCount = Array.isArray(providers) ? providers.length : 0

  // Count assistants (array)
  const assistants = persist.assistants?.assistants
  const assistantCount = Array.isArray(assistants) ? assistants.length : 0

  // Count topics and messages from indexedDB
  const topics = data.indexedDB?.topics
  const topicCount = Array.isArray(topics) ? topics.length : 0

  let messageCount = 0
  if (Array.isArray(topics)) {
    for (const topic of topics) {
      if (topic && Array.isArray(topic.messages)) {
        messageCount += topic.messages.length
      }
    }
  }

  // Count message blocks from indexedDB
  const messageBlocks = data.indexedDB?.message_blocks
  const blockCount = Array.isArray(messageBlocks) ? messageBlocks.length : 0

  return {
    ok: true,
    data,
    providerCount,
    assistantCount,
    topicCount,
    messageCount,
    blockCount,
  }
}
