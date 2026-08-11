import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  Topic, ChatMessage, Assistant, Provider, Settings, AppData,
  ModelRef, AssistantSettings, MessageBlock,
} from '@/types'
import { loadAppData, saveAppData } from '@/utils/db'
import { createSaveQueue } from '@/utils/saveQueue'
import { migrateData, getCurrentVersion } from '@/utils/migrations'

// ===== 默认数据 =====

const DEFAULT_SETTINGS: Settings = {
  language: 'zh-CN',
  theme: 'light',
  fontSize: 14,
  userName: '',
  showAssistants: true,
  showTopics: true,
  topicPosition: 'left',
  showTopicTime: false,
  pinTopicsToTop: true,
  assistantIconType: 'emoji',
  clickAssistantToShowTopic: false,
  enableTopicNaming: true,
  topicNamingPrompt: '根据对话内容生成一个简短的标题（不超过30个字符）',
  useTopicNamingForMessageTitle: false,
  sendMessageShortcut: 'Enter',
  showInputEstimatedTokens: false,
  pasteLongTextAsFile: false,
  pasteLongTextThreshold: 1500,
  foldDisplayMode: 'expanded',
  gridColumns: 2,
  messageNavigation: 'anchor',
  confirmDeleteMessage: false,
  confirmRegenerateMessage: false,
  thoughtAutoCollapse: true,
  messageStyle: 'plain',
  messageFont: 'system',
  showMessageDivider: false,
  showTokens: false,
  showModelProviderInMarkdown: false,
  showModelNameInMarkdown: false,
  showMessageOutline: false,
  renderInputMessageAsMarkdown: false,
  codeShowLineNumbers: true,
  codeWrappable: false,
  codeCollapsible: false,
  codeEditor: {
    enabled: false,
    themeLight: 'github-light',
    themeDark: 'github-dark',
    highlightActiveLine: true,
    foldGutter: false,
    autocompletion: true,
    keymap: true,
  },
  codePreview: { themeLight: 'github-light', themeDark: 'github-dark' },
  mathEngine: 'katex',
  mathEnableSingleDollar: true,
  autoTranslateWithSpace: false,
  showTranslateConfirm: true,
  translateModelPrompt: '',
  targetLanguage: 'zh-CN',
  exportMenuOptions: {
    image: true, markdown: true, markdown_reason: false,
    notion: false, yuque: false, joplin: false,
    obsidian: false, siyuan: false, docx: false, plain_text: true,
  },
  multiModelMessageStyle: 'grid',
  enableBackspaceDeleteModel: true,
  enableQuickPanelTriggers: true,
  narrowMode: false,
  navbarPosition: 'left',
  userTheme: { colorPrimary: '#5b56d6' },
  customCss: '',
}

const DEFAULT_ASSISTANT_SETTINGS: AssistantSettings = {
  temperature: 0.7,
  contextCount: 20,
  enableMaxTokens: false,
  maxTokens: 4096,
  streamOutput: true,
  topP: 1,
  enableTopP: false,
  toolUseMode: 'prompt',
  customParameters: [],
}

const DEFAULT_MODEL_REF: ModelRef = {
  id: 'gpt-4o',
  provider: 'openai',
  name: 'GPT-4o',
  group: 'OpenAI',
}

const DEFAULT_PROVIDER: Provider = {
  id: 'openai',
  name: 'OpenAI',
  type: 'openai',
  apiHost: 'https://api.openai.com/v1',
  apiKey: '',
  enabled: true,
  isSystem: true,
  models: [
    { id: 'gpt-4o', provider: 'openai', name: 'GPT-4o', group: 'OpenAI', enabled: true },
    { id: 'gpt-4o-mini', provider: 'openai', name: 'GPT-4o-mini', group: 'OpenAI', enabled: true },
  ],
}

const DEFAULT_ASSISTANT: Assistant = {
  id: 'default',
  name: 'Orbit Assistant',
  emoji: '✨',
  prompt: '你是一个有帮助的 AI 助手。',
  description: '通用对话助手',
  enabled: true,
  isDefault: true,
  model: DEFAULT_MODEL_REF,
  defaultModel: DEFAULT_MODEL_REF,
  settings: { ...DEFAULT_ASSISTANT_SETTINGS },
  enableWebSearch: false,
  knowledgeRecognition: 'off',
  mcpServers: [],
  regularPhrases: [],
  createdAt: '2026-08-10T00:00:00Z',
  updatedAt: '2026-08-10T00:00:00Z',
}

const SEED_TOPICS: Topic[] = [
  {
    id: '1',
    assistantId: 'default',
    name: 'Orbit Chat 产品规划',
    isNameManuallyEdited: false,
    pinned: true,
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-10T10:30:00Z',
    messages: [
      {
        id: '1',
        topicId: '1',
        role: 'user',
        assistantId: 'default',
        createdAt: '2026-08-10T10:00:00Z',
        status: 'complete',
        blocks: [{
          id: 'b1',
          messageId: '1',
          type: 'main_text',
          createdAt: '2026-08-10T10:00:00Z',
          status: 'success',
          content: '帮我梳理 Orbit Chat 的核心产品方向',
        }],
      },
      {
        id: '2',
        topicId: '1',
        role: 'assistant',
        assistantId: 'default',
        createdAt: '2026-08-10T10:01:00Z',
        status: 'complete',
        modelId: 'gpt-4o',
        model: DEFAULT_MODEL_REF,
        askId: '1',
        metrics: {
          completion_tokens: 200,
          time_completion_millsec: 3500,
          time_first_token_millsec: 500,
          time_thinking_millsec: 0,
        },
        blocks: [
          {
            id: 'b2',
            messageId: '2',
            type: 'thinking',
            createdAt: '2026-08-10T10:01:00Z',
            status: 'success',
            content: '我会先提炼产品定位，再按照用户任务拆分核心模块。',
            thinking_millsec: 800,
          },
          {
            id: 'b3',
            messageId: '2',
            type: 'main_text',
            createdAt: '2026-08-10T10:01:00Z',
            status: 'success',
            content: `Orbit Chat 的核心方向可以归纳为三个部分：

**1. 本地优先的多模型对话**
让用户自由配置 OpenAI 兼容、Anthropic 和 Ollama，不依赖服务端账户。

**2. 可迁移的对话资产**
通过 Assistant、Topic 和全文搜索，降低历史信息的查找成本。

**3. 用户完全掌控数据**
使用 IndexedDB 保存数据，并通过 S3、WebDAV 或 Cherry JSON 完成备份与迁移。

\`\`\`
本地 IndexedDB → Cherry JSON → S3 / WebDAV
\`\`\``,
          },
        ],
      },
    ],
  },
  {
    id: '2',
    assistantId: 'default',
    name: '设计系统与颜色令牌',
    isNameManuallyEdited: false,
    pinned: true,
    createdAt: '2026-08-09T14:00:00Z',
    updatedAt: '2026-08-09T14:10:00Z',
    messages: [
      {
        id: '3',
        topicId: '2',
        role: 'user',
        assistantId: 'default',
        createdAt: '2026-08-09T14:00:00Z',
        status: 'complete',
        blocks: [{
          id: 'b4',
          messageId: '3',
          type: 'main_text',
          createdAt: '2026-08-09T14:00:00Z',
          status: 'success',
          content: '设计一套浅色 UI 颜色令牌',
        }],
      },
    ],
  },
  {
    id: '3',
    assistantId: 'default',
    name: '旅行计划整理',
    isNameManuallyEdited: false,
    pinned: false,
    createdAt: '2026-08-08T09:00:00Z',
    updatedAt: '2026-08-08T09:05:00Z',
    messages: [
      {
        id: '4',
        topicId: '3',
        role: 'user',
        assistantId: 'default',
        createdAt: '2026-08-08T09:00:00Z',
        status: 'complete',
        blocks: [{
          id: 'b5',
          messageId: '4',
          type: 'main_text',
          createdAt: '2026-08-08T09:00:00Z',
          status: 'success',
          content: '帮我整理一个周末旅行计划',
        }],
      },
    ],
  },
  {
    id: '4',
    assistantId: 'default',
    name: 'Vue 组件选型',
    isNameManuallyEdited: false,
    pinned: false,
    createdAt: '2026-08-07T16:00:00Z',
    updatedAt: '2026-08-07T16:15:00Z',
    messages: [
      {
        id: '5',
        topicId: '4',
        role: 'user',
        assistantId: 'default',
        createdAt: '2026-08-07T16:00:00Z',
        status: 'complete',
        blocks: [{
          id: 'b6',
          messageId: '5',
          type: 'main_text',
          createdAt: '2026-08-07T16:00:00Z',
          status: 'success',
          content: '比较 BubbleList 和普通列表的实现方式',
        }],
      },
    ],
  },
]

export const useAppStore = defineStore('app', () => {
  const providers = ref<Provider[]>([DEFAULT_PROVIDER])
  const assistants = ref<Assistant[]>([DEFAULT_ASSISTANT])
  const topics = ref<Topic[]>(SEED_TOPICS)
  const settings = ref<Settings>({ ...DEFAULT_SETTINGS })
  const activeTopicId = ref<string>('1')
  const isDark = ref(false)

  // ===== Persistence =====
  const saveQueue = createSaveQueue<AppData>(saveAppData)
  const saveStatus = saveQueue.status

  const activeTopic = computed(() =>
    topics.value.find(t => t.id === activeTopicId.value) ?? topics.value[0]
  )

  const activeAssistant = computed(() =>
    assistants.value.find(a => a.id === activeTopic.value?.assistantId) ?? assistants.value.find(a => a.isDefault) ?? assistants.value[0]
  )

  const sortedTopics = computed(() => {
    return [...topics.value].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  })

  // ===== Topic actions =====
  function createTopic(assistantId?: string): Topic {
    const aid = assistantId ?? activeAssistant.value?.id ?? 'default'
    const topic: Topic = {
      id: Date.now().toString(),
      assistantId: aid,
      name: '新对话',
      messages: [],
      isNameManuallyEdited: false,
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    topics.value.unshift(topic)
    activeTopicId.value = topic.id
    return topic
  }

  function selectTopic(id: string) {
    activeTopicId.value = id
  }

  function deleteTopic(id: string) {
    const idx = topics.value.findIndex(t => t.id === id)
    if (idx >= 0) {
      topics.value.splice(idx, 1)
      if (activeTopicId.value === id && topics.value.length > 0) {
        activeTopicId.value = topics.value[0]?.id ?? ''
      }
    }
  }

  function togglePin(id: string) {
    const topic = topics.value.find(t => t.id === id)
    if (topic) {
      topic.pinned = !topic.pinned
      topic.updatedAt = new Date().toISOString()
    }
  }

  function renameTopic(id: string, name: string) {
    const topic = topics.value.find(t => t.id === id)
    if (topic) {
      topic.name = name
      topic.isNameManuallyEdited = true
      topic.updatedAt = new Date().toISOString()
    }
  }

  function clearTopicMessages(id: string) {
    const topic = topics.value.find(t => t.id === id)
    if (topic) {
      topic.messages = []
      topic.updatedAt = new Date().toISOString()
    }
  }

  function autoNameTopic(topicId: string, firstMessage: string) {
    const topic = topics.value.find(t => t.id === topicId)
    if (!topic || topic.isNameManuallyEdited) return
    if (!settings.value.enableTopicNaming) return
    topic.name = firstMessage.slice(0, 30)
    topic.updatedAt = new Date().toISOString()
  }

  // ===== Message actions =====
  function addMessage(topicId: string, msg: Partial<ChatMessage>): ChatMessage {
    const topic = topics.value.find(t => t.id === topicId)
    const now = new Date().toISOString()
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6)
    const message: ChatMessage = {
      id,
      topicId,
      role: msg.role ?? 'user',
      assistantId: msg.assistantId ?? activeAssistant.value?.id ?? 'default',
      createdAt: msg.createdAt ?? now,
      status: msg.status ?? 'complete',
      blocks: msg.blocks ?? [],
      modelId: msg.modelId,
      model: msg.model,
      usage: msg.usage,
      mentions: msg.mentions,
      askId: msg.askId,
      metrics: msg.metrics,
      foldSelected: msg.foldSelected,
      multiModelMessageStyle: msg.multiModelMessageStyle,
    }
    if (topic) {
      topic.messages.push(message)
      topic.updatedAt = now
    }
    return message
  }

  function updateMessage(topicId: string, messageId: string, patch: Partial<ChatMessage>) {
    const topic = topics.value.find(t => t.id === topicId)
    const msg = topic?.messages.find(m => m.id === messageId)
    if (msg) Object.assign(msg, patch)
  }

  function updateBlock(topicId: string, messageId: string, blockId: string, patch: Partial<MessageBlock>) {
    const topic = topics.value.find(t => t.id === topicId)
    const msg = topic?.messages.find(m => m.id === messageId)
    const block = msg?.blocks.find(b => b.id === blockId)
    if (block) Object.assign(block, patch)
  }

  // ===== Provider actions =====
  function createProvider(data: Partial<Provider>) {
    const provider: Provider = {
      id: data.id ?? crypto.randomUUID(),
      name: data.name ?? '',
      type: data.type ?? 'openai',
      apiHost: data.apiHost ?? '',
      apiKey: data.apiKey ?? '',
      enabled: data.enabled ?? true,
      isSystem: false,
      models: data.models ?? [],
    }
    providers.value.push(provider)
    return provider
  }

  function updateProvider(id: string, patch: Partial<Provider>) {
    const p = providers.value.find(p => p.id === id)
    if (p) Object.assign(p, patch)
  }

  function deleteProvider(id: string): { ok: boolean; refs: string[] } {
    const refs = assistants.value
      .filter(a => a.model?.provider === id)
      .map(a => a.name)
    if (refs.length) return { ok: false, refs }
    const idx = providers.value.findIndex(p => p.id === id)
    if (idx >= 0) providers.value.splice(idx, 1)
    return { ok: true, refs: [] }
  }

  function createModel(providerId: string, data: Partial<import('@/types').ModelInfo>) {
    const p = providers.value.find(p => p.id === providerId)
    if (!p) return
    p!.models.push({
      id: data.id ?? '',
      provider: providerId,
      name: data.name ?? '',
      group: data.group ?? p.name,
      enabled: data.enabled ?? true,
    })
  }

  function updateModel(providerId: string, modelId: string, patch: Partial<import('@/types').ModelInfo>) {
    const p = providers.value.find(p => p.id === providerId)
    const m = p?.models.find(m => m.id === modelId)
    if (m) Object.assign(m, patch)
  }

  function deleteModel(providerId: string, modelId: string): { ok: boolean; refs: string[] } {
    const refs = assistants.value
      .filter(a => a.model?.id === modelId && a.model?.provider === providerId)
      .map(a => a.name)
    if (refs.length) return { ok: false, refs }
    const p = providers.value.find(p => p.id === providerId)
    if (!p) return { ok: false, refs: [] }
    const idx = p.models.findIndex(m => m.id === modelId)
    if (idx >= 0) p.models.splice(idx, 1)
    return { ok: true, refs: [] }
  }

  // ===== Assistant actions =====
  function createAssistant(data: Partial<Assistant>): Assistant {
    const now = new Date().toISOString()
    const assistant: Assistant = {
      id: data.id ?? crypto.randomUUID(),
      name: data.name ?? 'New Assistant',
      emoji: data.emoji ?? '🤖',
      prompt: data.prompt ?? '',
      description: data.description,
      enabled: data.enabled ?? true,
      isDefault: false,
      model: data.model,
      defaultModel: data.defaultModel,
      settings: data.settings ?? { ...DEFAULT_ASSISTANT_SETTINGS },
      enableWebSearch: data.enableWebSearch,
      knowledgeRecognition: data.knowledgeRecognition,
      mcpServers: data.mcpServers ?? [],
      regularPhrases: data.regularPhrases ?? [],
      createdAt: now,
      updatedAt: now,
    }
    assistants.value.push(assistant)
    return assistant
  }

  function updateAssistant(id: string, patch: Partial<Assistant>) {
    const a = assistants.value.find(a => a.id === id)
    if (a) {
      Object.assign(a, patch)
      a.updatedAt = new Date().toISOString()
    }
  }

  function deleteAssistant(id: string, options?: { migrateTo?: string; cascade?: boolean }) {
    if (id === 'default') return false
    const idx = assistants.value.findIndex(a => a.id === id)
    if (idx < 0) return false

    const relatedTopics = topics.value.filter(t => t.assistantId === id)
    if (relatedTopics.length) {
      if (options?.cascade) {
        relatedTopics.forEach(t => {
          const ti = topics.value.findIndex(tt => tt.id === t.id)
          if (ti >= 0) topics.value.splice(ti, 1)
        })
      } else if (options?.migrateTo) {
        relatedTopics.forEach(t => {
          t.assistantId = options.migrateTo!
          t.updatedAt = new Date().toISOString()
        })
      } else {
        return false
      }
    }

    assistants.value.splice(idx, 1)
    return true
  }

  function setDefaultAssistant(id: string) {
    assistants.value.forEach(a => {
      a.isDefault = a.id === id
      a.updatedAt = new Date().toISOString()
    })
  }

  function importAssistants(data: Assistant[]) {
    let imported = 0, skipped = 0
    for (const a of data) {
      if (assistants.value.some(x => x.id === a.id)) {
        skipped++
        continue
      }
      assistants.value.push(a)
      imported++
    }
    return { imported, skipped }
  }

  // ===== Settings actions =====
  function updateSettings(patch: Partial<Settings>) {
    Object.assign(settings.value, patch)
  }

  function toggleTheme() {
    if (settings.value.theme === 'auto') {
      settings.value.theme = isDark.value ? 'light' : 'dark'
    } else {
      settings.value.theme = isDark.value ? 'light' : 'dark'
    }
    isDark.value = !isDark.value
  }

  // ===== Persistence methods =====
  async function init() {
    try {
      const raw = await loadAppData<AppData>()
      if (raw) {
        const data = migrateData(raw)
        setAppData(data)
        // 恢复后设置最近更新的 Topic
        if (topics.value.length > 0) {
          const sorted = [...topics.value].sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          activeTopicId.value = sorted[0]?.id ?? ''
        }
      }
      // Apply theme on init
      applyTheme()
      saveStatus.value = 'idle'
    } catch (e) {
      console.error('[appStore] init failed', e)
      saveStatus.value = 'error'
    }

    // watch 自动保存
    watch(
      [providers, assistants, topics, settings],
      () => { saveQueue.enqueue(getAppData()) },
      { deep: true }
    )
  }

  function applyTheme() {
    if (settings.value.theme === 'auto') {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      isDark.value = settings.value.theme === 'dark'
    }
  }

  async function flushSave() {
    await saveQueue.flushNow()
  }

  // ===== AppData =====
  function getAppData(): AppData {
    return {
      version: getCurrentVersion(),
      providers: providers.value,
      assistants: assistants.value,
      topics: topics.value,
      settings: settings.value,
    }
  }

  function setAppData(data: AppData) {
    providers.value = data.providers ?? []
    assistants.value = data.assistants ?? []
    topics.value = data.topics ?? []
    settings.value = { ...DEFAULT_SETTINGS, ...data.settings }
    activeTopicId.value = data.topics?.[0]?.id ?? ''
  }

  return {
    providers,
    assistants,
    topics,
    settings,
    activeTopicId,
    isDark,
    saveStatus,
    activeTopic,
    activeAssistant,
    sortedTopics,
    // Topic
    createTopic,
    selectTopic,
    deleteTopic,
    togglePin,
    renameTopic,
    clearTopicMessages,
    autoNameTopic,
    // Message
    addMessage,
    updateMessage,
    updateBlock,
    // Provider
    createProvider,
    updateProvider,
    deleteProvider,
    createModel,
    updateModel,
    deleteModel,
    // Assistant
    createAssistant,
    updateAssistant,
    deleteAssistant,
    setDefaultAssistant,
    importAssistants,
    // Settings
    updateSettings,
    toggleTheme,
    applyTheme,
    // AppData
    getAppData,
    setAppData,
    // Persistence
    init,
    flushSave,
  }
})
