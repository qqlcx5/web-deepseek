// ─── Message Search ───────────────────────────────────────────────────────────
// Pure function over normalised data. No Vue, no store dependency — testable.

import type { Topic } from '@/types'

export interface MessageSearchResult {
  topicId: string
  topicName: string
  messageId: string
  content: string
  time: string
}

/**
 * Full-text search across every message in every topic.
 * Case-insensitive substring match. Returns at most `limit` hits.
 */
export function searchTopics(topics: Topic[], query: string, limit = 50): MessageSearchResult[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  const results: MessageSearchResult[] = []
  for (const topic of topics) {
    for (const message of topic.messages) {
      if (message.content.toLowerCase().includes(normalized)) {
        results.push({
          topicId: topic.id,
          topicName: topic.name,
          messageId: message.id,
          content: message.content,
          time: message.createdAt,
        })
        if (results.length >= limit) return results
      }
    }
  }
  return results
}
