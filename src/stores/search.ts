// ─── Search Store: Query, Results, Scope, Preview ────────────────────────────
// Holds only UI transient state. Index lives in src/services/search/index.ts.

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { searchIndex, rebuildIndex, upsertTopic, removeTopic, clearIndex, isIndexReady, indexDocumentCount } from '@/services/search/index'
import { useAppStore } from './app'
import type { IndexedDoc } from '@/services/search/index'

export interface GroupedResult {
  topicId: string
  topicName: string
  assistantId: string
  assistantName: string
  pinned: boolean
  updatedAt: string
  messages: IndexedDoc[]
}

export type SearchScope = 'all' | 'current'

export const useSearchStore = defineStore('search', () => {
  const appStore = useAppStore()

  const query = ref('')
  const scope = ref<SearchScope>('all')
  const assistantId = ref<string | null>(null) // used when scope === 'current'

  // ─── Index helpers ───
  const assistantName = (id: string) =>
    appStore.assistants.find(a => a.id === id)?.name ?? '未知'

  function ensureIndex() {
    if (!isIndexReady()) {
      rebuildIndex(appStore.topics, assistantName)
    }
  }

  // ─── Results ───
  const rawResults = computed<IndexedDoc[]>(() => {
    if (!query.value.trim()) return []
    ensureIndex()
    const opts = scope.value === 'current' && assistantId.value
      ? { assistantId: assistantId.value }
      : undefined
    return searchIndex(query.value, opts)
  })

  const groupedResults = computed<GroupedResult[]>(() => {
    const map = new Map<string, GroupedResult>()
    for (const doc of rawResults.value) {
      let group = map.get(doc.topicId)
      if (!group) {
        const topic = appStore.topicById(doc.topicId)
        group = {
          topicId: doc.topicId,
          topicName: doc.topicName,
          assistantId: doc.assistantId,
          assistantName: doc.assistantName,
          pinned: topic?.pinned ?? false,
          updatedAt: topic?.updatedAt ?? doc.createdAt,
          messages: [],
        }
        map.set(doc.topicId, group)
      }
      group.messages.push(doc)
    }
    // Sort: pinned first, then recency
    return [...map.values()].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return b.updatedAt.localeCompare(a.updatedAt)
    })
  })

  // ─── Empty-state topics (no query, show recent) ───
  const recentTopics = computed<GroupedResult[]>(() => {
    return appStore.sortedTopics.slice(0, 30).map(topic => ({
      topicId: topic.id,
      topicName: topic.name,
      assistantId: topic.assistantId,
      assistantName: assistantName(topic.assistantId),
      pinned: topic.pinned,
      updatedAt: topic.updatedAt,
      messages: topic.messages.slice(-2).map(msg => ({
        id: `${topic.id}::${msg.id}`,
        topicId: topic.id,
        messageId: msg.id,
        topicName: topic.name,
        content: msg.content,
        role: msg.role,
        assistantId: topic.assistantId,
        assistantName: assistantName(topic.assistantId),
        createdAt: msg.createdAt,
      })),
    }))
  })

  const results = computed<GroupedResult[]>(() => {
    if (query.value.trim()) return groupedResults.value
    return recentTopics.value.filter(g => {
      if (scope.value === 'current' && assistantId.value) {
        return g.assistantId === assistantId.value
      }
      return true
    })
  })

  const resultCount = computed(() => results.value.length)
  const indexReady = computed(() => isIndexReady())
  const docCount = computed(() => indexDocumentCount())

  // ─── Actions ───
  function setQuery(q: string) {
    query.value = q
  }

  function setScope(s: SearchScope, aId?: string | null) {
    scope.value = s
    if (s === 'current' && aId) assistantId.value = aId
  }

  function rebuild() {
    rebuildIndex(appStore.topics, assistantName)
  }

  function onTopicChanged(topic: { id: string } & Record<string, unknown>) {
    const fullTopic = appStore.topicById(topic.id)
    if (fullTopic) upsertTopic(fullTopic, assistantName)
  }

  function onTopicRemoved(id: string) {
    removeTopic(id)
  }

  function onClear() {
    clearIndex()
  }

  return {
    query, scope, assistantId,
    results, resultCount,
    indexReady, docCount,
    setQuery, setScope,
    rebuild, onTopicChanged, onTopicRemoved, onClear,
  }
})
