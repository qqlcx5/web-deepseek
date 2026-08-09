// ─── App Store: Normalized Data and Persistence ───────────────────────────────

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AppData, Assistant, ChatMessage, Provider, Settings, Topic } from '@/types'
import { loadAppData, saveAppData } from '@/utils/db'
import { APP_DATA_VERSION, DEFAULT_SETTINGS, importFromFile, mergeAppData, type ImportReport } from '@/utils/data-import'
import { buildExportJSON, downloadJson, validateReferences, type ExportOptions, type ValidationResult } from '@/utils/cherry-export'

function now(): string {
  return new Date().toISOString()
}

function createDefaultAssistant(): Assistant {
  const timestamp = now()
  return {
    id: 'default',
    name: '默认助手',
    prompt: '',
    enabled: true,
    isDefault: true,
    emoji: 'AI',
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

interface MutationResult {
  ok: boolean
  error?: string
}

function normalizeAppData(value: unknown): AppData {
  const raw = value && typeof value === 'object' ? value as Partial<AppData> : {}
  const assistants = Array.isArray(raw.assistants) ? raw.assistants.filter(Boolean) : []
  const normalizedAssistants = assistants.length > 0 ? assistants : [createDefaultAssistant()]
  const defaultAssistant = normalizedAssistants.find(assistant => assistant.isDefault) ?? normalizedAssistants[0]!
  for (const assistant of normalizedAssistants) assistant.isDefault = assistant.id === defaultAssistant.id

  const assistantIds = new Set(normalizedAssistants.map(assistant => assistant.id))
  const topics = (Array.isArray(raw.topics) ? raw.topics : [])
    .filter(Boolean)
    .map(topic => ({
      ...topic,
      assistantId: assistantIds.has(topic.assistantId) ? topic.assistantId : defaultAssistant.id,
      messages: Array.isArray(topic.messages) ? topic.messages : [],
      isNameManuallyEdited: Boolean(topic.isNameManuallyEdited),
      pinned: Boolean(topic.pinned),
      createdAt: topic.createdAt || now(),
      updatedAt: topic.updatedAt || topic.createdAt || now(),
    }))

  return {
    version: APP_DATA_VERSION,
    providers: Array.isArray(raw.providers) ? raw.providers : [],
    assistants: normalizedAssistants,
    topics,
    settings: { ...DEFAULT_SETTINGS, ...(raw.settings ?? {}) },
  }
}

export const useAppStore = defineStore('app', () => {
  const providers = ref<Provider[]>([])
  const assistants = ref<Assistant[]>([createDefaultAssistant()])
  const topics = ref<Topic[]>([])
  const settings = ref<Settings>({ ...DEFAULT_SETTINGS })
  const loaded = ref(false)
  const saving = ref(false)
  const saveError = ref('')
  const dataVersion = ref(0)

  let saveTimer: ReturnType<typeof setTimeout> | null = null
  let saveWaiters: Array<{ resolve: () => void; reject: (error: Error) => void }> = []
  let writeChain: Promise<void> = Promise.resolve()

  const defaultAssistant = computed(() =>
    assistants.value.find(assistant => assistant.isDefault) ?? assistants.value[0] ?? null,
  )

  const sortedTopics = computed(() => [...topics.value].sort((left, right) => {
    if (left.pinned !== right.pinned) return left.pinned ? -1 : 1
    return right.updatedAt.localeCompare(left.updatedAt)
  }))

  function topicById(id: string): Topic | undefined {
    return topics.value.find(topic => topic.id === id)
  }

  function buildData(): AppData {
    return {
      version: APP_DATA_VERSION,
      providers: providers.value,
      assistants: assistants.value,
      topics: topics.value,
      settings: settings.value,
    }
  }

  async function flushSave() {
    saveTimer = null
    const waiters = saveWaiters
    saveWaiters = []
    const snapshot = buildData()

    writeChain = writeChain.catch(() => undefined).then(() => saveAppData(snapshot))
    try {
      await writeChain
      dataVersion.value++
      saveError.value = ''
      for (const waiter of waiters) waiter.resolve()
    } catch (error) {
      const failure = error instanceof Error ? error : new Error(String(error))
      saveError.value = failure.message
      for (const waiter of waiters) waiter.reject(failure)
    } finally {
      if (!saveTimer && saveWaiters.length === 0) saving.value = false
    }
  }

  function save(): Promise<void> {
    saving.value = true
    return new Promise((resolve, reject) => {
      saveWaiters.push({ resolve, reject })
      if (!saveTimer) saveTimer = setTimeout(() => { void flushSave() }, 200)
    })
  }

  async function init() {
    try {
      const stored = await loadAppData()
      if (stored) {
        const data = normalizeAppData(stored)
        providers.value = data.providers
        assistants.value = data.assistants
        topics.value = data.topics
        settings.value = data.settings
      }
    } catch (error) {
      saveError.value = error instanceof Error ? error.message : String(error)
    } finally {
      loaded.value = true
    }
  }

  function addTopic(assistantId = defaultAssistant.value?.id): Topic {
    const assistant = assistants.value.find(candidate => candidate.id === assistantId) ?? defaultAssistant.value
    if (!assistant) throw new Error('未找到可用 Assistant')
    const timestamp = now()
    const topic: Topic = {
      id: `topic-${crypto.randomUUID()}`,
      assistantId: assistant.id,
      name: '新对话',
      messages: [],
      isNameManuallyEdited: false,
      pinned: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    topics.value.unshift(topic)
    void save()
    return topic
  }

  function deleteTopic(id: string) {
    topics.value = topics.value.filter(topic => topic.id !== id)
    void save()
  }

  function renameTopic(id: string, name: string) {
    const topic = topicById(id)
    if (!topic) return
    topic.name = name
    topic.isNameManuallyEdited = true
    topic.updatedAt = now()
    void save()
  }

  function togglePin(id: string) {
    const topic = topicById(id)
    if (!topic) return
    topic.pinned = !topic.pinned
    topic.updatedAt = now()
    void save()
  }

  function addMessage(topicId: string, message: ChatMessage) {
    const topic = topicById(topicId)
    if (!topic) return
    topic.messages.push(message)
    topic.updatedAt = now()
    void save()
  }

  function updateMessage(topicId: string, message: ChatMessage) {
    const topic = topicById(topicId)
    if (!topic) return
    const index = topic.messages.findIndex(candidate => candidate.id === message.id)
    if (index < 0) return
    topic.messages[index] = message
    topic.updatedAt = now()
    void save()
  }

  function clearMessages(topicId: string) {
    const topic = topicById(topicId)
    if (!topic) return
    topic.messages = []
    topic.updatedAt = now()
    void save()
  }

  function assistantUsingModel(modelId: string): Assistant | undefined {
    return assistants.value.find(assistant => assistant.model === modelId)
  }

  function validateProvider(provider: Provider, exceptId?: string): MutationResult {
    if (!provider.id.trim()) return { ok: false, error: 'Provider ID 不能为空。' }
    if (!provider.name.trim()) return { ok: false, error: 'Provider 名称不能为空。' }
    if (!provider.apiHost.trim()) return { ok: false, error: 'API Host 不能为空。' }

    const seenModelIds = new Set<string>()
    for (const model of provider.models) {
      if (!model.id.trim()) return { ok: false, error: '模型 ID 不能为空。' }
      if (seenModelIds.has(model.id)) return { ok: false, error: `模型 ID 重复：${model.id}` }
      seenModelIds.add(model.id)
      const conflict = providers.value.find(candidate =>
        candidate.id !== exceptId && candidate.models.some(other => other.id === model.id),
      )
      if (conflict) return { ok: false, error: `模型 ID “${model.id}”已被 ${conflict.name} 使用。` }
    }
    return { ok: true }
  }

  function addProvider(provider: Provider): MutationResult {
    if (providers.value.some(candidate => candidate.id === provider.id)) {
      return { ok: false, error: `Provider ID 已存在：${provider.id}` }
    }
    const validation = validateProvider(provider)
    if (!validation.ok) return validation
    providers.value.push(provider)
    void save()
    return { ok: true }
  }

  function updateProvider(id: string, patch: Partial<Provider>): MutationResult {
    const provider = providers.value.find(candidate => candidate.id === id)
    if (!provider) return { ok: false, error: 'Provider 不存在。' }
    const next = { ...provider, ...patch }
    const validation = validateProvider(next, id)
    if (!validation.ok) return validation

    const nextModelIds = new Set(next.models.map(model => model.id))
    for (const removedModel of provider.models.filter(model => !nextModelIds.has(model.id))) {
      const dependent = assistantUsingModel(removedModel.id)
      if (dependent) return { ok: false, error: `Assistant “${dependent.name}”仍在使用模型 “${removedModel.name}”。` }
    }

    Object.assign(provider, patch)
    void save()
    return { ok: true }
  }

  function removeProvider(id: string): MutationResult {
    const provider = providers.value.find(candidate => candidate.id === id)
    if (!provider) return { ok: true }
    const dependent = provider.models.map(model => assistantUsingModel(model.id)).find(Boolean)
    if (dependent) return { ok: false, error: `Assistant “${dependent.name}”仍在使用该 Provider 的模型。` }
    providers.value = providers.value.filter(candidate => candidate.id !== id)
    void save()
    return { ok: true }
  }

  function addAssistant(assistant: Assistant) {
    if (assistants.value.some(candidate => candidate.id === assistant.id)) {
      throw new Error(`Assistant ID 已存在：${assistant.id}`)
    }
    if (assistant.isDefault || assistants.value.length === 0) {
      for (const candidate of assistants.value) candidate.isDefault = false
      assistant.isDefault = true
    }
    assistants.value.push(assistant)
    void save()
  }

  function updateAssistant(id: string, patch: Partial<Assistant>) {
    const assistant = assistants.value.find(candidate => candidate.id === id)
    if (!assistant) return
    if (patch.isDefault) {
      for (const candidate of assistants.value) candidate.isDefault = candidate.id === id
    }
    Object.assign(assistant, patch, { updatedAt: now() })
    void save()
  }

  function topicCountByAssistant(id: string): number {
    return topics.value.filter(topic => topic.assistantId === id).length
  }

  function removeAssistant(
    id: string,
    options: { targetAssistantId?: string; cascade?: boolean } = {},
  ): MutationResult {
    const assistant = assistants.value.find(candidate => candidate.id === id)
    if (!assistant) return { ok: true }
    if (assistant.isDefault) return { ok: false, error: '默认 Assistant 不能删除。' }

    const topicCount = topicCountByAssistant(id)
    if (topicCount > 0 && options.targetAssistantId) {
      const target = assistants.value.find(candidate => candidate.id === options.targetAssistantId)
      if (!target || target.id === id) return { ok: false, error: '请选择其他 Assistant 作为迁移目标。' }
      for (const topic of topics.value) {
        if (topic.assistantId === id) {
          topic.assistantId = target.id
          topic.updatedAt = now()
        }
      }
    } else if (topicCount > 0 && options.cascade) {
      topics.value = topics.value.filter(topic => topic.assistantId !== id)
    } else if (topicCount > 0) {
      return { ok: false, error: `该 Assistant 还有 ${topicCount} 个 Topic，请选择迁移或级联删除。` }
    }

    assistants.value = assistants.value.filter(candidate => candidate.id !== id)
    void save()
    return { ok: true }
  }

  function updateSettings(patch: Partial<Settings>) {
    Object.assign(settings.value, patch)
    void save()
  }

  async function importData(file: File): Promise<{ ok: true; report: ImportReport } | { ok: false; error: string }> {
    const result = await importFromFile(file)
    if (!result.ok) return result
    const merged = normalizeAppData(mergeAppData(buildData(), result.data))
    const validation = validateReferences(merged)
    if (!validation.ok) return { ok: false, error: validation.errors.join('\n') }
    providers.value = merged.providers
    assistants.value = merged.assistants
    topics.value = merged.topics
    settings.value = merged.settings
    await save()
    return { ok: true, report: result.report }
  }

  function exportData(options?: ExportOptions): ValidationResult {
    const data = buildData()
    const validation = validateReferences(data)
    if (validation.ok) downloadJson(buildExportJSON(data, options))
    return validation
  }

  return {
    providers, assistants, topics, settings,
    loaded, saving, saveError, dataVersion,
    defaultAssistant, sortedTopics,
    topicById, addTopic, deleteTopic, renameTopic, togglePin,
    addMessage, updateMessage, clearMessages,
    addProvider, updateProvider, removeProvider, assistantUsingModel,
    addAssistant, updateAssistant, removeAssistant, topicCountByAssistant,
    updateSettings,
    init, save,
    importData, exportData,
  }
})
