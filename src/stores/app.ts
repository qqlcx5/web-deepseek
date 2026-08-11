import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Topic, ChatMessage, Assistant, Provider, AppSettings, AppData } from '@/types'

const DEFAULT_SETTINGS: AppSettings = {
  autoTheme: false,
  showMessageDivider: false,
  codeShowLineNumbers: true,
  enterToSend: true,
  autoScrollToBottom: true,
  pasteToAttachment: true,
  autoNameTopic: true,
  showModelParams: true,
  injectTopicTitle: true,
  injectAttachment: true,
  sendHistoryMessages: true,
  exportStripApiKey: true,
  rebuildSearchIndex: true,
  thoughtAutoCollapse: true,
}

const DEFAULT_ASSISTANT: Assistant = {
  id: 'default',
  name: 'Orbit Assistant',
  prompt: '你是一个有帮助的 AI 助手。',
  enabled: true,
  isDefault: true,
  emoji: '✨',
  description: '通用对话助手',
  model: 'gpt-4o',
  temperature: 0.7,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const DEFAULT_PROVIDER: Provider = {
  id: 'openai',
  name: 'OpenAI',
  apiHost: 'https://api.openai.com/v1',
  apiKey: '',
  enabled: true,
  models: [
    { id: 'gpt-4o', name: 'GPT-4o', group: 'OpenAI', enabled: true, contextLength: 128000 },
    { id: 'gpt-4o-mini', name: 'GPT-4o-mini', group: 'OpenAI', enabled: false, contextLength: 128000 },
  ],
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
        content: '帮我梳理 Orbit Chat 的核心产品方向',
        createdAt: '2026-08-10T10:00:00Z',
        status: 'complete',
      },
      {
        id: '2',
        topicId: '1',
        role: 'assistant',
        status: 'complete',
        usage: 438,
        reasoningContent: '我会先提炼产品定位，再按照用户任务拆分核心模块。',
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
        createdAt: '2026-08-10T10:01:00Z',
        model: 'gpt-4o',
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
        content: '设计一套浅色 UI 颜色令牌',
        createdAt: '2026-08-09T14:00:00Z',
        status: 'complete',
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
        content: '帮我整理一个周末旅行计划',
        createdAt: '2026-08-08T09:00:00Z',
        status: 'complete',
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
        content: '比较 BubbleList 和普通列表的实现方式',
        createdAt: '2026-08-07T16:00:00Z',
        status: 'complete',
      },
    ],
  },
]

export const useAppStore = defineStore('app', () => {
  const providers = ref<Provider[]>([DEFAULT_PROVIDER])
  const assistants = ref<Assistant[]>([DEFAULT_ASSISTANT])
  const topics = ref<Topic[]>(SEED_TOPICS)
  const settings = ref<AppSettings>({ ...DEFAULT_SETTINGS })
  const activeTopicId = ref<string>('1')
  const isDark = ref(false)

  const activeTopic = computed(() =>
    topics.value.find(t => t.id === activeTopicId.value) ?? topics.value[0]
  )

  const activeAssistant = computed(() =>
    assistants.value.find(a => a.id === activeTopic.value?.assistantId) ?? assistants.value[0]
  )

  const sortedTopics = computed(() => {
    return [...topics.value].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  })

  function createTopic(): Topic {
    const topic: Topic = {
      id: Date.now().toString(),
      assistantId: 'default',
      name: '新对话',
      isNameManuallyEdited: false,
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
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
        activeTopicId.value = topics.value[0].id
      }
    }
  }

  function togglePin(id: string) {
    const topic = topics.value.find(t => t.id === id)
    if (topic) topic.pinned = !topic.pinned
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

  function addMessage(topicId: string, msg: Partial<ChatMessage>): ChatMessage {
    const topic = topics.value.find(t => t.id === topicId)
    const message: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      topicId,
      role: msg.role ?? 'user',
      content: msg.content ?? '',
      createdAt: new Date().toISOString(),
      status: msg.status ?? 'complete',
      model: msg.model,
      usage: msg.usage,
      error: msg.error,
      reasoningContent: msg.reasoningContent,
    }
    if (topic) {
      topic.messages.push(message)
      topic.updatedAt = new Date().toISOString()
    }
    return message
  }

  function updateMessage(topicId: string, messageId: string, patch: Partial<ChatMessage>) {
    const topic = topics.value.find(t => t.id === topicId)
    const msg = topic?.messages.find(m => m.id === messageId)
    if (msg) Object.assign(msg, patch)
  }

  function toggleTheme() {
    isDark.value = !isDark.value
  }

  function updateSettings(patch: Partial<AppSettings>) {
    Object.assign(settings.value, patch)
  }

  return {
    providers,
    assistants,
    topics,
    settings,
    activeTopicId,
    isDark,
    activeTopic,
    activeAssistant,
    sortedTopics,
    createTopic,
    selectTopic,
    deleteTopic,
    togglePin,
    renameTopic,
    clearTopicMessages,
    addMessage,
    updateMessage,
    toggleTheme,
    updateSettings,
  }
})
