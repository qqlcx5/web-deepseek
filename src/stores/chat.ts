// ─── Chat Store: Conversation Runtime ─────────────────────────────────────────

import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Attachment, ChatMessage, Model } from '@/types'
import { streamAssistantMessage } from '@/services/chat-service'
import { searchTopics } from '@/services/search'
import { buildTopicMarkdown, downloadText, safeFilename } from '@/services/export'
import { loadDraft, saveDraft } from '@/utils/storage'
import { useAppStore } from './app'
import { useUiStore } from './ui'

export interface SearchResult {
  topicId: string
  topicName: string
  messageId: string
  content: string
  time: string
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

function timestamp(): string {
  return new Date().toISOString()
}

export const useChatStore = defineStore('chat', () => {
  const appStore = useAppStore()
  const uiStore = useUiStore()

  const activeChatId = ref<string | null>(null)
  const activeAssistantId = ref<string | null>(null)
  const messages = ref<ChatMessage[]>([])
  const draft = ref(loadDraft())
  const replyingTo = ref('')
  const replyingToMsgId = ref<string | null>(null)
  const generating = ref(false)
  const abortController = ref<AbortController | null>(null)
  const attachments = ref<Attachment[]>([])

  const currentChat = computed(() => activeChatId.value ? appStore.topicById(activeChatId.value) : undefined)
  const assistantTabs = computed(() => appStore.assistants.filter(assistant => assistant.enabled))
  const chats = computed(() => appStore.sortedTopics
    .filter(topic => !activeAssistantId.value || topic.assistantId === activeAssistantId.value)
    .map(topic => ({
      id: topic.id,
      title: topic.name,
      preview: topic.messages.at(-1)?.content.slice(0, 50) || '暂无消息',
      pinned: topic.pinned,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
      messageCount: topic.messages.length,
    })))
  const canSend = computed(() => Boolean(draft.value.trim() || attachments.value.length) && !generating.value)

  const saving = computed(() => appStore.saving || generating.value)

  const filteredCommandChats = computed(() => {
    const query = uiStore.commandQuery.trim().toLowerCase()
    if (!query) return chats.value.slice(0, 5)
    return chats.value.filter(chat => `${chat.title} ${chat.preview}`.toLowerCase().includes(query)).slice(0, 5)
  })

  const searchResults = computed<SearchResult[]>(() => searchMessages(uiStore.commandQuery).slice(0, 20))

  function assistantTopicCount(assistantId: string): number {
    return appStore.topics.filter(topic => topic.assistantId === assistantId).length
  }

  function openConversation(id: string) {
    if (generating.value) stopGeneration()
    const topic = appStore.topicById(id)
    if (!topic) return
    activeAssistantId.value = topic.assistantId
    activeChatId.value = id
    messages.value = [...topic.messages]
    uiStore.closeDrawers()
  }

  function selectAssistant(id: string) {
    if (!assistantTabs.value.some(assistant => assistant.id === id)) return
    activeAssistantId.value = id
    const firstTopic = appStore.sortedTopics.find(topic => topic.assistantId === id)
    if (firstTopic) {
      openConversation(firstTopic.id)
    } else {
      activeChatId.value = null
      messages.value = []
      uiStore.closeDrawers()
    }
  }

  function newConversation() {
    if (generating.value) stopGeneration()
    const topic = appStore.addTopic(activeAssistantId.value ?? appStore.defaultAssistant?.id)
    activeChatId.value = topic.id
    messages.value = []
    uiStore.closeDrawers()
    uiStore.showToast('新对话已创建')
  }

  function deleteConversation(id: string) {
    appStore.deleteTopic(id)
    if (activeChatId.value === id) {
      activeChatId.value = null
      messages.value = []
    }
    uiStore.showToast('对话已删除')
  }

  function clearConversation(id: string) {
    appStore.clearMessages(id)
    if (activeChatId.value === id) messages.value = []
    uiStore.showToast('对话已清空')
  }

  function renameTopic(id: string, name: string) {
    appStore.renameTopic(id, name)
  }

  function togglePin(id: string) {
    appStore.togglePin(id)
  }

  async function initApp() {
    await appStore.init()
    uiStore.initSelectedModel()
    const initialAssistantId = appStore.defaultAssistant?.id ?? assistantTabs.value[0]?.id ?? null
    if (!activeAssistantId.value) activeAssistantId.value = initialAssistantId
    if (!activeChatId.value && activeAssistantId.value) selectAssistant(activeAssistantId.value)
  }

  function getActiveModel(): Model {
    // User-selected model takes priority
    if (uiStore.selectedModel) return uiStore.selectedModel

    // Fall back to assistant's configured model
    const assistantId = currentChat.value?.assistantId ?? activeAssistantId.value ?? appStore.defaultAssistant?.id
    const topicAssistant = appStore.assistants.find(assistant => assistant.id === assistantId) ?? appStore.defaultAssistant
    const assistantModel = topicAssistant?.model
    const selected = assistantModel ? uiStore.models.find(model => model.id === assistantModel) : null
    const fallback = selected ?? uiStore.models[0]
    if (!fallback) throw new Error('请先配置并启用一个模型')
    return fallback
  }

  async function streamChat(assistantMessage: ChatMessage, context = messages.value) {
    generating.value = true
    abortController.value = new AbortController()

    try {
      const model = getActiveModel()
      const provider = appStore.providers.find(candidate => candidate.id === model.providerId)
      await streamAssistantMessage({
        assistantMessage,
        context,
        model,
        provider,
        signal: abortController.value.signal,
        topicId: activeChatId.value ?? undefined,
        onPersist: (topicId, message) => appStore.updateMessage(topicId, message),
        onErrorToast: message => uiStore.showToast(message),
      })
    }
    finally {
      generating.value = false
      abortController.value = null
      if (activeChatId.value) appStore.updateMessage(activeChatId.value, assistantMessage)
    }
  }

  async function sendMessage() {
    if (!canSend.value) return
    if (!activeChatId.value) newConversation()
    const topicId = activeChatId.value
    if (!topicId) return

    const content = draft.value.trim() || `请分析附件：${attachments.value.map(file => file.name).join('、')}`
    const createdAt = timestamp()
    const userMessage: ChatMessage = {
      id: createId('message'),
      topicId,
      role: 'user',
      content,
      createdAt,
      status: 'complete',
      parentBranchId: replyingToMsgId.value ?? undefined,
      blocks: [{
        id: createId('block'),
        type: 'main_text',
        content,
        status: 'success',
        createdAt,
      }],
    }
    const assistantMessage: ChatMessage = {
      id: createId('message'),
      topicId,
      role: 'assistant',
      content: '',
      createdAt,
      status: 'sending',
      loading: true,
      blocks: [],
    }

    appStore.addMessage(topicId, userMessage)
    appStore.addMessage(topicId, assistantMessage)
    messages.value = [...messages.value, userMessage, assistantMessage]
    draft.value = ''
    attachments.value = []
    replyingTo.value = ''
    replyingToMsgId.value = null

    await streamChat(assistantMessage)

    const topic = appStore.topicById(topicId)
    if (topic && appStore.settings.enableTopicNaming && !topic.isNameManuallyEdited && topic.messages.length <= 2) {
      appStore.renameTopic(topicId, content.length > 30 ? `${content.slice(0, 30)}...` : content)
    }
  }

  function stopGeneration() {
    abortController.value?.abort()
  }

  function copyMessage(message: ChatMessage) {
    void navigator.clipboard.writeText(message.content).then(
      () => uiStore.showToast('消息已复制'),
      () => uiStore.showToast('浏览器未授予剪贴板权限'),
    )
  }

  function rateMessage(message: ChatMessage, rating: 'up' | 'down') {
    message.rating = message.rating === rating ? '' : rating
    if (activeChatId.value) appStore.updateMessage(activeChatId.value, message)
    uiStore.showToast(message.rating ? '反馈已记录' : '反馈已取消')
  }

  async function regenerate(message: ChatMessage) {
    if (message.role !== 'assistant' || !activeChatId.value || generating.value) return
    const index = messages.value.findIndex(candidate => candidate.id === message.id)
    if (index < 1) return
    message.branches = (message.branches ?? 1) + 1
    message.activeBranch = message.branches
    message.content = ''
    message.reasoningContent = undefined
    message.error = undefined
    message.blocks = []
    message.status = 'sending'
    message.loading = true
    await streamChat(message, messages.value.slice(0, index))
  }

  function branchFrom(message: ChatMessage) {
    replyingTo.value = message.content.slice(0, 42)
    replyingToMsgId.value = message.id
    uiStore.showToast('下一条消息将在新分支中发送')
  }

  function editMessage(message: ChatMessage) {
    draft.value = message.content
    replyingTo.value = '编辑历史消息后重新发送'
    replyingToMsgId.value = message.id
  }

  function searchMessages(query: string): SearchResult[] {
    return searchTopics(appStore.topics, query)
  }

  function exportTopicMarkdown(id: string): string {
    const topic = appStore.topicById(id)
    if (!topic) {
      uiStore.showToast('未找到对话')
      return ''
    }
    const markdown = buildTopicMarkdown(topic)
    downloadText(`${safeFilename(topic.name)}.md`, markdown)
    uiStore.showToast('对话已导出为 Markdown')
    return markdown
  }

  function addFiles(files: File[]) {
    const max = 6
    const remaining = max - attachments.value.length
    for (const file of files.slice(0, remaining)) {
      attachments.value.push({
        id: createId('file'),
        name: file.name,
        size: file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: file.type,
      })
    }
    uiStore.showToast(files.length > remaining ? `最多 ${max} 个附件，已忽略 ${files.length - remaining} 个` : `${files.length} 个文件已加入上下文`)
  }

  function removeAttachment(file: Attachment | undefined) {
    if (!file) return
    const index = attachments.value.findIndex(candidate => candidate.id === file.id)
    if (index < 0) return
    const [removed] = attachments.value.splice(index, 1)
    if (!removed) return
    uiStore.showToast('附件已移除', () => attachments.value.splice(index, 0, removed))
  }

  function runCommand(command: typeof uiStore.commands[number]) {
    if (command.action === 'new') {
      newConversation()
      uiStore.modal = ''
      return
    }
    uiStore.runCommand(command)
  }
  async function importData(file: File) {
    const result = await appStore.importData(file)
    if (!result.ok) {
      uiStore.showToast(`导入失败：${result.error}`)
      return
    }
    uiStore.initSelectedModel()
    if (appStore.sortedTopics.length > 0) openConversation(appStore.sortedTopics[0]!.id)
    const report = result.report
    const summary = `已导入 ${report.providerCount} 个 Provider、${report.assistantCount} 个 Assistant、${report.topicCount} 个 Topic`
    uiStore.showToast(report.warnings.length > 0 ? `${summary}\n${report.warnings.join('\n')}` : summary)
  }

  function exportData() {
    const result = appStore.exportData({ includeApiKeys: false })
    uiStore.showToast(result.ok ? '数据已导出' : `导出已阻止：\n${result.errors.join('\n')}`)
  }

  watch(draft, saveDraft)

  return {
    activeChatId, activeAssistantId, messages, draft, replyingTo, replyingToMsgId, generating, attachments,
    saving,
    filteredCommandChats, searchResults,
    currentChat, assistantTabs, chats, canSend,
    assistantTopicCount, selectAssistant, openConversation, newConversation, deleteConversation, clearConversation, renameTopic, togglePin, initApp,
    sendMessage, stopGeneration, streamChat, copyMessage, rateMessage, regenerate, branchFrom, editMessage,
    searchMessages, exportTopicMarkdown, addFiles, removeAttachment,
    runCommand,
    importData, exportData,
  }
})
