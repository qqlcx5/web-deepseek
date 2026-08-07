/**
 * useChatState — 基于 useAppStore 的数据驱动聊天状态管理
 *
 * 职责：
 * - 消息列表管理（从 store 加载、实时更新）
 * - 流式对话（调用 stream-chat.ts + useXStream 管理状态）
 * - 会话管理（新建、删除、重命名、切换）
 * - 助手管理（切换、编辑）
 * - 模型管理（选择、配置）
 * - 导出数据
 */

import { useAppStore } from '@/stores/modules/app'
import { streamChat } from '@/utils/stream-chat'
import { useXStream } from 'vue-element-plus-x'
import type { Topic, Message, Provider, ModelInfo, Assistant } from '@/types'
import { useRoute, useRouter } from 'vue-router'

/** 侧栏会话项 */
export interface ChatListItem {
  id: string
  label: string
  group: string
  preview?: string
}

/** 模型选择项 */
export interface ModelOption {
  id: string
  name: string
  color: string
  description?: string
  providerId: string
}

const MODEL_COLORS = [
  '#10a37f', '#d97757', '#4285f4', '#4d6bfe',
  '#5b56d6', '#16875d', '#d97706', '#dc2626',
  '#7c3aed', '#059669', '#0891b2', '#db2777',
]

function pickColor(index: number): string {
  return MODEL_COLORS[index % MODEL_COLORS.length]
}

export function useChatState() {
  const store = useAppStore()
  const route = useRoute()
  const router = useRouter()

  // ---- 布局 ----
  const sidebarOpen = ref(true)
  const inspectorOpen = ref(false)
  const inspectorTab = ref<'info' | 'model' | 'prompt'>('info')
  const focusMode = ref(false)

  // ---- 数据 ----
  const activeTopicId = ref<string>('')
  const draft = ref('')
  const generating = ref(false)
  const selectedModelId = ref<string>('')
  const selectedAssistantId = ref<string>('')

  // ---- useXStream ----
  const { startStream, cancel: cancelStream, loading: streaming, data: streamData, error: streamError } = useXStream()

  // ---- 从 route params 同步 ----
  const routeTopicId = computed(() => (route.params.id as string) || '')

  // ---- 计算属性 ----

  /** 扁平化的会话列表（用于 Conversations 组件） */
  const chatList = computed<ChatListItem[]>(() => {
    const topics = store.flatTopics
    return topics.map((t) => {
      const lastMsg = t.messages[t.messages.length - 1]
      const preview = lastMsg ? lastMsg.content.slice(0, 40) : ''
      const created = t.createdAt ? new Date(t.createdAt) : null
      const now = Date.now()
      let group = '更早'
      if (created) {
        const days = (now - created.getTime()) / (1000 * 60 * 60 * 24)
        if (days <= 1) group = '今天'
        else if (days <= 7) group = '7 天内'
        else if (days <= 30) group = '30 天内'
      }
      return {
        id: t.id,
        label: t.name || '新对话',
        group,
        preview,
      }
    })
  })

  /** 当前活跃会话 */
  const activeTopic = computed<Topic | undefined>(() =>
    store.appData?.topics.find((t) => t.id === activeTopicId.value),
  )

  /** 当前会话的消息列表 */
  const messages = computed<Message[]>(() => {
    const topic = activeTopic.value
    return topic ? [...topic.messages] : []
  })

  /** 可用模型列表 */
  const modelOptions = computed<ModelOption[]>(() => {
    const data = store.appData
    if (!data) return []
    const list: ModelOption[] = []
    let index = 0
    for (const p of data.providers) {
      if (!p.enabled) continue
      for (const m of p.models) {
        if (!m.enabled) continue
        list.push({
          id: m.id,
          name: m.name,
          color: pickColor(index++),
          description: m.description,
          providerId: p.id,
        })
      }
    }
    return list
  })

  /** 当前选中的模型 */
  const selectedModel = computed<ModelOption | undefined>(() =>
    modelOptions.value.find((m) => m.id === selectedModelId.value) ?? modelOptions.value[0],
  )

  /** 助手列表 */
  const assistants = computed<Assistant[]>(() => store.appData?.assistants ?? [])

  /** 当前助手 */
  const activeAssistant = computed<Assistant | undefined>(() =>
    assistants.value.find((a) => a.id === selectedAssistantId.value)
      ?? assistants.value.find((a) => a.isDefault)
      ?? assistants.value[0],
  )

  /** 是否可以发送 */
  const canSend = computed(() => !generating.value && draft.value.trim().length > 0)

  /** 模型配置参数 */
  const modelConfig = computed(() => {
    const a = activeAssistant.value
    const m = selectedModel.value
    const provider = store.appData?.providers.find((p) => p.models.some((pm) => pm.id === m?.id))
    return {
      temperature: a?.temperature ?? 0.7,
      topP: a?.topP ?? 1.0,
      maxTokens: a?.maxTokens ?? 4096,
      provider,
      modelId: m?.id ?? '',
      modelName: m?.name ?? '',
    }
  })

  // ---- 方法 ----

  /** 从 store 初始化 */
  function initFromStore() {
    const data = store.appData
    if (!data) return

    // 默认选中第一个模型
    if (!selectedModelId.value && modelOptions.value.length > 0) {
      selectedModelId.value = modelOptions.value[0].id
    }

    // 默认选中第一个助手
    if (!selectedAssistantId.value && data.assistants.length > 0) {
      selectedAssistantId.value = data.assistants[0].id
    }

    // 从路由参数还原 activeTopicId
    const tid = routeTopicId.value
    if (tid && data.topics.some((t) => t.id === tid)) {
      activeTopicId.value = tid
    } else if (data.topics.length > 0) {
      activeTopicId.value = data.topics[0].id
    }
  }

  /** 选择会话 */
  function selectTopic(id: string) {
    activeTopicId.value = id
    if (route.params.id !== id) {
      router.replace({ name: 'chatWithId', params: { id } })
    }
    sidebarOpen.value = false // 移动端自动关闭
  }

  /** 新建会话 */
  function newTopic(): string {
    const data = store.appData
    const assistantId = activeAssistant.value?.id || data?.assistants[0]?.id || 'default'

    // 如果没有默认助手，创建一个
    if (!data?.assistants.length) {
      store.addAssistant({
        id: 'default',
        name: '默认助手',
        prompt: '你是一位乐于助人的 AI 助手。',
        enabled: true,
        createdAt: new Date().toISOString(),
      })
    }

    const aid = store.appData?.assistants[0]?.id || 'default'
    const topicId = crypto.randomUUID()
    const topic: Topic = {
      id: topicId,
      assistantId: aid,
      name: '新对话',
      messages: [],
      createdAt: new Date().toISOString(),
    }

    store.addTopic(aid, topic)
    selectTopic(topicId)
    return topicId
  }

  /** 重命名会话 */
  function renameTopic(id: string, name: string) {
    store.updateTopic(id, { name, isNameManuallyEdited: true })
  }

  /** 删除会话 */
  function deleteTopic(id: string) {
    store.deleteTopic(id)
    if (activeTopicId.value === id) {
      activeTopicId.value = store.appData?.topics[0]?.id ?? ''
    }
  }

  /** 发送消息 */
  async function sendMessage() {
    if (!canSend.value) return
    const data = store.appData
    if (!data) return

    const text = draft.value.trim()
    let topicId = activeTopicId.value

    // 如果没有活跃会话，自动创建
    if (!topicId) {
      topicId = newTopic()
    }

    const topic = data.topics.find((t) => t.id === topicId)
    if (!topic) return

    const provider = modelConfig.value.provider
    if (!provider) {
      return
    }
    if (!provider.apiKey) {
      return
    }

    // 1. 持久化 user 消息
    const userMsgId = crypto.randomUUID()
    const now = new Date().toISOString()
    store.addMessage(topicId, {
      id: userMsgId,
      topicId,
      role: 'user',
      content: text,
      createdAt: now,
      status: 'done',
    })

    draft.value = ''

    // 2. 创建 assistant 占位消息
    const aiMsgId = crypto.randomUUID()
    store.addMessage(topicId, {
      id: aiMsgId,
      topicId,
      role: 'assistant',
      content: '',
      model: selectedModel.value?.name,
      createdAt: new Date().toISOString(),
      status: 'streaming',
    })

    generating.value = true

    // 3. 构建上下文
    const systemMsg = topic.prompt || activeAssistant.value?.prompt || '你是一位乐于助人的 AI 助手。'
    const contextMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemMsg },
    ]
    const recent = topic.messages.slice(-(store.appData?.settings?.maxContext ?? 20))
    for (const m of recent) {
      if (m.id !== aiMsgId) {
        contextMessages.push({
          role: m.role === 'tool' ? 'user' : m.role,
          content: m.content,
        })
      }
    }

    // 4. 流式请求 - 将 async generator 转为 ReadableStream
    const abortCtrl = new AbortController()
    let accumulated = ''

    const gen = streamChat({
      provider: {
        id: provider.id,
        name: provider.name,
        apiHost: provider.apiHost,
        apiKey: provider.apiKey,
        enabled: true,
        models: [],
      },
      model: selectedModel.value?.id ?? '',
      messages: contextMessages,
      temperature: modelConfig.value.temperature,
      topP: modelConfig.value.topP,
      maxTokens: modelConfig.value.maxTokens,
      signal: abortCtrl.signal,
    })

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const delta of gen) {
            if (delta.content) {
              accumulated += delta.content
              controller.enqueue(new TextEncoder().encode(delta.content))
              // 实时更新 store
              store.updateMessage(topicId, aiMsgId, { content: accumulated })
            }
          }
          controller.close()
        } catch (err: any) {
          controller.error(err)
        }
      },
    })

    startStream({ readableStream })

    // 5. 等待 useXStream 完成（通过 watch streamData）
    const unwatch = watch(streamError, (err) => {
      if (err) {
        store.updateMessage(topicId, aiMsgId, {
          content: accumulated || `请求失败：${err}`,
          status: 'error',
        })
        generating.value = false
        unwatch()
      }
    })

    // 监听 streaming 状态变化以判断结束
    watch(
      streaming,
      (val) => {
        if (!val) {
          // 流结束
          store.updateMessage(topicId, aiMsgId, {
            content: accumulated || '（空响应）',
            status: streamError.value ? 'error' : 'done',
          })
          generating.value = false

          // 自动更新 topic name（首条消息）
          if (topic.messages.length <= 3) {
            store.updateTopic(topicId, { name: text.slice(0, 20) })
          }
          unwatch()
        }
      },
      { once: true },
    )
  }

  /** 停止生成 */
  function stopGeneration() {
    cancelStream()
    generating.value = false
    const topicId = activeTopicId.value
    if (topicId) {
      const msgs = store.appData?.topics.find((t) => t.id === topicId)?.messages ?? []
      const last = msgs[msgs.length - 1]
      if (last && last.role === 'assistant' && last.status === 'streaming') {
        store.updateMessage(topicId, last.id, {
          status: 'done',
          content: last.content || '生成已停止。',
        })
      }
    }
  }

  /** 重新生成最后一条消息 */
  async function regenerate() {
    const topicId = activeTopicId.value
    if (!topicId) return
    const topic = store.appData?.topics.find((t) => t.id === topicId)
    if (!topic) return

    const msgs = topic.messages
    // 找到最后一条 assistant 消息和它对应的 user 消息
    const lastAssistantIdx = msgs.length - 1
    if (lastAssistantIdx < 0) return

    // 删除最后一条 assistant
    const lastAssistant = msgs[lastAssistantIdx]
    if (lastAssistant.role !== 'assistant') return

    store.deleteMessage?.(topicId, lastAssistant.id)
    // 重新发送（复用 sendMessage 逻辑，但需要先设置 draft）
    // 找到最后一条 user 消息
    let lastUserIdx = lastAssistantIdx - 1
    while (lastUserIdx >= 0 && msgs[lastUserIdx].role !== 'user') {
      lastUserIdx--
    }
    if (lastUserIdx >= 0) {
      // 删除旧 assistant 后重新发送
      // 这里简化：直接再次调用 sendMessage 前不设 draft，而是构造新的请求
      const provider = modelConfig.value.provider
      if (!provider || !provider.apiKey) return

      const userContent = msgs[lastUserIdx].content
      const systemMsg = topic.prompt || activeAssistant.value?.prompt || ''

      // 重新添加 assistant placeholder
      const aiMsgId = crypto.randomUUID()
      store.addMessage(topicId, {
        id: aiMsgId,
        topicId,
        role: 'assistant',
        content: '',
        model: selectedModel.value?.name,
        createdAt: new Date().toISOString(),
        status: 'streaming',
      })

      generating.value = true

      const contextMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemMsg },
      ]
      const recent = topic.messages.slice(-20)
      for (const m of recent) {
        if (m.id !== aiMsgId) {
          contextMessages.push({
            role: m.role === 'tool' ? 'user' : m.role,
            content: m.content,
          })
        }
      }

      let accumulated = ''
      const abortCtrl = new AbortController()

      const gen = streamChat({
        provider: {
          id: provider.id,
          name: provider.name,
          apiHost: provider.apiHost,
          apiKey: provider.apiKey,
          enabled: true,
          models: [],
        },
        model: selectedModel.value?.id ?? '',
        messages: contextMessages,
        signal: abortCtrl.signal,
      })

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const delta of gen) {
              if (delta.content) {
                accumulated += delta.content
                controller.enqueue(new TextEncoder().encode(delta.content))
                store.updateMessage(topicId, aiMsgId, { content: accumulated })
              }
            }
            controller.close()
          } catch (err: any) {
            controller.error(err)
          }
        },
      })

      startStream({ readableStream })
    }
  }

  /** 复制消息 */
  function copyMessage(content: string) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(content)
    }
  }

  /** 选择模型 */
  function selectModel(modelId: string) {
    selectedModelId.value = modelId
  }

  /** 切换助手 */
  function selectAssistant(id: string) {
    selectedAssistantId.value = id
  }

  /** 导出数据 */
  function exportData() {
    store.downloadExport()
  }

  /** 导入数据 */
  async function importData(file: File) {
    return store.importData(file)
  }

  /** 切换 focus 模式 */
  function toggleFocusMode() {
    focusMode.value = !focusMode.value
    if (focusMode.value) {
      inspectorOpen.value = false
    }
  }

  /** 窗口尺寸变化处理 */
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)
  function handleResize() {
    windowWidth.value = window.innerWidth
  }

  // 响应式断点
  const isDesktop = computed(() => windowWidth.value >= 1180)
  const isTablet = computed(() => windowWidth.value >= 760 && windowWidth.value < 1180)
  const isMobile = computed(() => windowWidth.value < 760)

  // ---- 生命周期 ----
  onMounted(async () => {
    if (!store.isImported && !store.loading) {
      await store.init()
    }
    initFromStore()
    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    if (generating.value) {
      cancelStream()
    }
    window.removeEventListener('resize', handleResize)
  })

  // 监听路由变化
  watch(routeTopicId, (newId) => {
    if (newId && newId !== activeTopicId.value) {
      activeTopicId.value = newId
    }
  })

  return {
    // 状态
    sidebarOpen,
    inspectorOpen,
    inspectorTab,
    focusMode,
    activeTopicId,
    draft,
    generating,
    selectedModelId,
    selectedAssistantId,
    streamData,
    streamError,
    streaming,
    windowWidth,
    // 计算
    chatList,
    messages,
    modelOptions,
    selectedModel,
    assistants,
    activeAssistant,
    activeTopic,
    canSend,
    modelConfig,
    isDesktop,
    isTablet,
    isMobile,
    // 方法
    initFromStore,
    selectTopic,
    newTopic,
    renameTopic,
    deleteTopic,
    sendMessage,
    stopGeneration,
    regenerate,
    copyMessage,
    selectModel,
    selectAssistant,
    exportData,
    importData,
    toggleFocusMode,
    startStream,
    cancelStream,
  }
}
