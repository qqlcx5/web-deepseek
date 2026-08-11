// ─── MiniSearch Index for Topic + Message Full-Text Search ───────────────────
// Indexes topics[] (name) and topic.messages[] (content).
// Pure derivative — not persisted; rebuilt from appStore on demand.

import MiniSearch from 'minisearch'
import type { Topic } from '@/types'

export interface IndexedDoc {
  /** Composite key: `${topicId}::${messageId}` */
  id: string
  topicId: string
  messageId: string
  topicName: string
  content: string
  role: string
  assistantId: string
  assistantName: string
  createdAt: string
}

let instance: MiniSearch<IndexedDoc> | null = null

function createInstance(): MiniSearch<IndexedDoc> {
  return new MiniSearch<IndexedDoc>({
    fields: ['topicName', 'content', 'assistantName'],
    storeFields: ['topicId', 'messageId', 'role', 'createdAt', 'assistantId', 'topicName', 'content', 'assistantName'],
    searchOptions: {
      boost: { topicName: 2 },
      fuzzy: 0.2,
      prefix: true,
    },
  })
}

function flatten(
  topics: Topic[],
  getAssistantName: (assistantId: string) => string,
): IndexedDoc[] {
  const docs: IndexedDoc[] = []
  for (const topic of topics) {
    const assistantName = getAssistantName(topic.assistantId)
    for (const msg of topic.messages) {
      if (!msg.content) continue
      docs.push({
        id: `${topic.id}::${msg.id}`,
        topicId: topic.id,
        messageId: msg.id,
        topicName: topic.name,
        content: msg.content,
        role: msg.role,
        assistantId: topic.assistantId,
        assistantName,
        createdAt: msg.createdAt,
      })
    }
  }
  return docs
}

/**
 * Build the index from scratch.
 * Call on app init or after import.
 */
export function rebuildIndex(
  topics: Topic[],
  getAssistantName: (assistantId: string) => string,
): void {
  instance = createInstance()
  const docs = flatten(topics, getAssistantName)
  if (docs.length > 0) instance.addAll(docs)
}

/**
 * Add or update a single topic's messages in the index.
 */
export function upsertTopic(
  topic: Topic,
  getAssistantName: (assistantId: string) => string,
): void {
  if (!instance) return
  // Remove existing docs for this topic
  removeTopic(topic.id)
  const assistantName = getAssistantName(topic.assistantId)
  const docs: IndexedDoc[] = []
  for (const msg of topic.messages) {
    if (!msg.content) continue
    docs.push({
      id: `${topic.id}::${msg.id}`,
      topicId: topic.id,
      messageId: msg.id,
      topicName: topic.name,
      content: msg.content,
      role: msg.role,
      assistantId: topic.assistantId,
      assistantName,
      createdAt: msg.createdAt,
    })
  }
  if (docs.length > 0) instance.addAll(docs)
}

/**
 * Remove a topic's messages from the index.
 */
export function removeTopic(topicId: string): void {
  if (!instance) return
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const existing = instance.search('', { filter: (r: any) => r.topicId === topicId })
  for (const doc of existing) {
    instance.remove(doc as any)
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

/**
 * Search the index.
 * Returns results grouped by topic, sorted by relevance.
 */
export function searchIndex(
  query: string,
  options?: { assistantId?: string },
): IndexedDoc[] {
  if (!instance) return []
  const q = query.trim()
  if (!q) return []

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const filter = options?.assistantId
    ? (result: any) => result.assistantId === options.assistantId
    : undefined
  // MiniSearch.search returns SearchResult[] with stored fields merged in;
  // IndexedDoc's stored fields (storeFields) are a superset so the cast is safe.
  return instance.search(q, { filter }) as any as IndexedDoc[]
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

/**
 * Check if the index has been built.
 */
export function isIndexReady(): boolean {
  return instance !== null
}

/**
 * Get the total document count in the index.
 */
export function indexDocumentCount(): number {
  return instance?.documentCount ?? 0
}

/**
 * Clear the index entirely.
 */
export function clearIndex(): void {
  if (instance) {
    instance.removeAll()
    instance = null
  }
}
