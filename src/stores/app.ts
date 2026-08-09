// ─── App Store: Data Persistence Layer ────────────────────────────────────────
// Single source of truth for providers, assistants, topics, settings.
// Persists to IndexedDB. Chat store calls this for CRUD.

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppData, Provider, Assistant, Topic, Settings, ChatMessage } from '@/types'
import { loadAppData, saveAppData } from '@/utils/db'
import { importFromFile, mergeAppData } from '@/utils/data-import'
import { buildExportJSON, downloadJson, validateReferences, type ExportOptions } from '@/utils/cherry-export'

const SCHEMA_VERSION = 1

const DEFAULT_SETTINGS: Settings = {
  language: 'zh-CN',
  theme: 'light',
  fontSize: 14,
  sendShortcut: 'Enter',
  autoScroll: true,
}

export const useAppStore = defineStore('app', () => {
  const providers = ref<Provider[]>([])
  const assistants = ref<Assistant[]>([])
  const topics = ref<Topic[]>([])
  const settings = ref<Settings>({ ...DEFAULT_SETTINGS })
  const compatZone = ref<Record<string, unknown>>({})
  const loaded = ref(false)
  const saving = ref(false)
  const dataVersion = ref(0)

  // ─── Getters ───
  const defaultAssistant = computed(() =>
    assistants.value.find(a => a.isDefault) ?? assistants.value[0] ?? null,
  )

  const sortedTopics = computed(() => {
    return [...topics.value].sort((a, b) => {
      // Pinned topics always first
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      // Then by updatedAt (most recent first)
      const ta = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
      const tb = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime()
      return tb - ta
    })
  })

  function topicById(id: string): Topic | undefined {
    return topics.value.find(t => t.id === id)
  }

  // ─── Build AppData from current state ───
  function buildData(): AppData {
    return {
      version: SCHEMA_VERSION,
      providers: providers.value,
      assistants: assistants.value,
      topics: topics.value,
      settings: settings.value,
      compatZone: compatZone.value,
    }
  }

  // ─── Init: load from IDB ───
  async function init() {
    try {
      const data = await loadAppData()
      if (data) {
        providers.value = data.providers ?? []
        assistants.value = data.assistants ?? []
        topics.value = data.topics ?? []
        settings.value = data.settings ?? { ...DEFAULT_SETTINGS }
        compatZone.value = data.compatZone ?? {}
      }
    } catch (err) {
      console.error('[appStore.init] Failed:', err)
    } finally {
      loaded.value = true
    }
  }

  // ─── Save to IDB ───
  async function save() {
    saving.value = true
    try {
      await saveAppData(buildData())
      dataVersion.value++
    } catch (err) {
      console.error('[appStore.save] Failed:', err)
    } finally {
      saving.value = false
    }
  }

  // ─── Topic CRUD ───
  function addTopic(assistantId: string): Topic {
    const topic: Topic = {
      id: `topic-${Date.now()}`,
      assistantId,
      name: '新对话',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    topics.value.unshift(topic)
    void save()
    return topic
  }

  function deleteTopic(id: string) {
    topics.value = topics.value.filter(t => t.id !== id)
    void save()
  }

  function renameTopic(id: string, name: string) {
    const topic = topicById(id)
    if (topic) {
      topic.name = name
      topic.isNameManuallyEdited = true
      void save()
    }
  }

  function togglePin(id: string) {
    const topic = topicById(id)
    if (topic) {
      topic.pinned = !topic.pinned
      void save()
    }
  }

  // ─── Message CRUD (within a topic) ───
  function addMessage(topicId: string, message: ChatMessage) {
    const topic = topicById(topicId)
    if (topic) {
      topic.messages.push(message)
      topic.updatedAt = new Date().toISOString()
      void save()
    }
  }

  function updateMessage(topicId: string, message: ChatMessage) {
    const topic = topicById(topicId)
    if (!topic) return
    const idx = topic.messages.findIndex(m => m.id === message.id)
    if (idx !== -1) {
      topic.messages[idx] = message
      void save()
    }
  }

  function clearMessages(topicId: string) {
    const topic = topicById(topicId)
    if (topic) {
      topic.messages = []
      void save()
    }
  }

  // ─── Provider CRUD ───
  function addProvider(provider: Provider) {
    providers.value.push(provider)
    void save()
  }

  function updateProvider(id: string, patch: Partial<Provider>) {
    const target = providers.value.find(p => p.id === id)
    if (target) Object.assign(target, patch)
    void save()
  }

  function removeProvider(id: string) {
    providers.value = providers.value.filter(p => p.id !== id)
    void save()
  }

  // ─── Assistant CRUD ───
  function addAssistant(assistant: Assistant) {
    assistants.value.push(assistant)
    void save()
  }

  function updateAssistant(id: string, patch: Partial<Assistant>) {
    const target = assistants.value.find(a => a.id === id)
    if (target) Object.assign(target, patch)
    void save()
  }

  function removeAssistant(id: string) {
    assistants.value = assistants.value.filter(a => a.id !== id)
    topics.value = topics.value.filter(t => t.assistantId !== id)
    void save()
  }

  // ─── Settings ───
  function updateSettings(patch: Partial<Settings>) {
    Object.assign(settings.value, patch)
    void save()
  }

  // ─── Import / Export ───
  async function importData(file: File): Promise<{ ok: true } | { ok: false; error: string }> {
    const result = await importFromFile(file)
    if (!result.ok) return { ok: false, error: result.error }

    const merged = mergeAppData(buildData(), result.data)
    providers.value = merged.providers
    assistants.value = merged.assistants
    topics.value = merged.topics
    if (merged.settings) settings.value = merged.settings
    if (merged.compatZone) compatZone.value = merged.compatZone
    await save()
    return { ok: true }
  }

  function exportData(options?: ExportOptions) {
    const data = buildData()
    const validation = validateReferences(data)
    if (!validation.ok) {
      console.warn('[appStore.exportData] Reference errors:', validation.errors)
    }
    const exportJSON = buildExportJSON(data, options)
    downloadJson(exportJSON)
  }

  return {
    // State
    providers, assistants, topics, settings, compatZone,
    loaded, saving, dataVersion,
    // Getters
    defaultAssistant, sortedTopics,
    // Topic
    topicById, addTopic, deleteTopic, renameTopic, togglePin,
    // Message
    addMessage, updateMessage, clearMessages,
    // Provider
    addProvider, updateProvider, removeProvider,
    // Assistant
    addAssistant, updateAssistant, removeAssistant,
    // Settings
    updateSettings,
    // Persistence
    init, save,
    // Import/Export
    importData, exportData,
  }
})
