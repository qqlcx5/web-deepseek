// ─── App Store: Data Persistence Layer ────────────────────────────────────────
// Uses IndexedDB for persistence.  This store is the single source of truth
// for providers, assistants, topics, and settings.

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppData, Provider, Assistant, Topic, Settings } from '@/types'
import { loadAppData, saveAppData } from '@/utils/db'
import { importFromFile, mergeAppData } from '@/utils/data-import'
import { buildExportJSON, downloadJson, validateReferences, type ExportOptions } from '@/utils/cherry-export'

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: Settings = {
  language: 'zh-CN',
  theme: 'light',
  fontSize: 14,
  sendShortcut: 'Enter',
  autoScroll: true,
}

const SCHEMA_VERSION = 1

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = defineStore('app', () => {
  // ─── State ───
  const providers = ref<Provider[]>([])
  const assistants = ref<Assistant[]>([])
  const topics = ref<Topic[]>([])
  const settings = ref<Settings>({ ...DEFAULT_SETTINGS })
  const compatZone = ref<Record<string, unknown>>({})
  const loaded = ref(false)
  const dataVersion = ref(0)
  const saving = ref(false)

  // ─── Internal: build AppData from current refs ───
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
      } else {
        // No saved data — keep defaults
        providers.value = []
        assistants.value = []
        topics.value = []
        settings.value = { ...DEFAULT_SETTINGS }
        compatZone.value = {}
      }
    } catch (err) {
      console.error('[appStore.init] Failed to load app data:', err)
      providers.value = []
      assistants.value = []
      topics.value = []
      settings.value = { ...DEFAULT_SETTINGS }
      compatZone.value = {}
    } finally {
      loaded.value = true
    }
  }

  // ─── Save to IDB ───
  async function save() {
    saving.value = true
    try {
      const data = buildData()
      await saveAppData(data)
      dataVersion.value++
    } catch (err) {
      console.error('[appStore.save] Failed to save app data:', err)
    } finally {
      saving.value = false
    }
  }

  // ─── Import data from file ───
  async function importData(file: File): Promise<{ ok: true } | { ok: false; error: string }> {
    const result = await importFromFile(file)
    if (!result.ok) {
      return { ok: false, error: result.error }
    }

    const incoming = result.data
    const existing = buildData()
    const merged = mergeAppData(existing, incoming)

    providers.value = merged.providers
    assistants.value = merged.assistants
    topics.value = merged.topics
    if (merged.settings) settings.value = merged.settings
    if (merged.compatZone) compatZone.value = merged.compatZone

    await save()
    return { ok: true }
  }

  // ─── Export data to file ───
  function exportData(options?: ExportOptions) {
    const data = buildData()
    const validation = validateReferences(data)
    if (!validation.ok) {
      console.warn('[appStore.exportData] Reference validation errors:', validation.errors)
    }
    if (validation.warnings.length > 0) {
      console.warn('[appStore.exportData] Reference validation warnings:', validation.warnings)
    }
    const exportJSON = buildExportJSON(data, options)
    downloadJson(exportJSON)
  }

  // ─── Provider actions ───
  function addProvider(provider: Provider) {
    providers.value.push(provider)
    void save()
  }

  function updateProvider(id: string, patch: Partial<Provider>) {
    const target = providers.value.find(p => p.id === id)
    if (target) {
      Object.assign(target, patch)
      void save()
    }
  }

  function removeProvider(id: string) {
    providers.value = providers.value.filter(p => p.id !== id)
    void save()
  }

  // ─── Assistant actions ───
  function addAssistant(assistant: Assistant) {
    assistants.value.push(assistant)
    void save()
  }

  function updateAssistant(id: string, patch: Partial<Assistant>) {
    const target = assistants.value.find(a => a.id === id)
    if (target) {
      Object.assign(target, patch)
      void save()
    }
  }

  function removeAssistant(id: string) {
    assistants.value = assistants.value.filter(a => a.id !== id)
    // Also remove related topics
    topics.value = topics.value.filter(t => t.assistantId !== id)
    void save()
  }

  // ─── Topic actions ───
  function addTopic(topic: Topic) {
    topics.value.push(topic)
    void save()
  }

  function updateTopic(id: string, patch: Partial<Topic>) {
    const target = topics.value.find(t => t.id === id)
    if (target) {
      Object.assign(target, patch)
      void save()
    }
  }

  function removeTopic(id: string) {
    topics.value = topics.value.filter(t => t.id !== id)
    void save()
  }

  // ─── Settings actions ───
  function updateSettings(patch: Partial<Settings>) {
    Object.assign(settings.value, patch)
    void save()
  }

  return {
    // State
    providers,
    assistants,
    topics,
    settings,
    compatZone,
    loaded,
    dataVersion,
    saving,
    // Actions
    init,
    save,
    importData,
    exportData,
    addProvider,
    updateProvider,
    removeProvider,
    addAssistant,
    updateAssistant,
    removeAssistant,
    addTopic,
    updateTopic,
    removeTopic,
    updateSettings,
  }
})
