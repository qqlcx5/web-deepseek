// ─── Chat Store: Conversation Runtime State ───────────────────────────────────
// Manages: active topic, messages, draft, streaming, attachments, branching.
// Delegates persistence to appStore, UI state to uiStore.

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { ChatMessage, Attachment, ChatStreamDelta, ModalType, MessageBlock } from '@/types'
import { useAppStore } from './app'
import { useUiStore } from './ui'
import { chatApi, type ChatRequestParams } from '@/api/chat-api'
import { estimateTokens } from '@/utils/token-counter'

export interface SearchResult {
  topicId: string
  topicName: string
  messageId: string | number
  content: string
  time: string
}

export const useChatStore = defineStore('chat', () => {
  const appStore = useAppStore()
  const uiStore = useUiStore()

  // ─── State ───
  const activeChatId = ref<string | null>(null)
  const messages = ref<ChatMessage[]>([])
  const draft = ref(localStorage.getItem('orbit-draft') || '')
  const replyingTo = ref('')
  const replyingToMsgId = ref<string | number | null>(null)
  const generating = ref(false)
  const abortController = ref<AbortController | null>(null)
  const attachments = ref<Attachment[]>([])

  // ─── Getters ───
  const currentChat = computed(() =>
    activeChatId.value ? appStore.topicById(activeChatId.value) : undefined,
  )

  const chats = computed(() =>
    appStore.sortedTopics.map(t => ({
      ...t,
      title: t.name,
      preview: t.messages?.length
        ? t.messages[t.messages.length - 1]?.content?.slice(0, 50)
        : '暂无消息',
    })),
  )

  const canSend = computed(() =>
    Boolean(draft.value.trim() || attachments.value.length) && !generating.value,
  )

  const sidebarOpen = computed({
    get: () => uiStore.sidebarOpen,
    set: (v: boolean) => { uiStore.sidebarOpen = v },
  })
  const focusMode = computed(() => uiStore.focusMode)
  const inspectorVisible = computed(() => uiStore.inspectorVisible)
  const inspectorOpen = computed(() => uiStore.inspectorOpen)
  const modal = computed({
    get: () => uiStore.modal,
    set: (v: ModalType) => { uiStore.modal = v },
  })
  const toast = computed(() => uiStore.toast)
  const online = computed(() => uiStore.online)
  const saving = computed(() => uiStore.saving)
  const nearBottom = computed({
    get: () => uiStore.nearBottom,
    set: (v: boolean) => { uiStore.nearBottom = v },
  })
  const commandQuery = computed(() => uiStore.commandQuery)
  const promptDraft = computed({
    get: () => uiStore.promptDraft,
    set: (v: string) => { uiStore.promptDraft = v },
  })
  const selectedModel = computed(() => uiStore.selectedModel)
  const workspaces = computed(() => uiStore.workspaces)
  const models = computed(() => uiStore.models)
  const promptPresets = computed(() => uiStore.promptPresets)
  const commands = computed(() => uiStore.commands)
  const filteredCommands = computed(() => uiStore.filteredCommands)

  const filteredCommandChats = computed(() => {
    const q = uiStore.commandQuery.trim().toLowerCase()
    if (!q) return chats.value.slice(0, 5)
    return chats.value.filter(c =>
      `${c.name} ${c.preview ?? ''}`.toLowerCase().includes(q),
    ).slice(0, 5)
  })

  // Search results for command palette
  const searchResults = computed<SearchResult[]>(() => {
    const q = uiStore.commandQuery.trim().toLowerCase()
    if (!q || q.length < 1) return []
    const results: SearchResult[] = []
    for (const topic of appStore.topics) {
      for (const msg of topic.messages) {
        if (msg.content && msg.content.toLowerCase().includes(q)) {
          results.push({
            topicId: topic.id,
            topicName: topic.name,
            messageId: msg.id,
            content: msg.content,
            time: msg.time,
          })
          if (results.length >= 20) return results
        }
      }
    }
    return results
  })

  // ─── Compat: forward UI store setters (so existing components work) ───
  function setSidebarOpen(v: boolean) { uiStore.sidebarOpen = v }
  function setFocusMode(v: boolean) { uiStore.focusMode = v }
  function setInspectorOpen(v: boolean) { uiStore.inspectorOpen = v }
  function setInspectorVisible(v: boolean) { uiStore.inspectorVisible = v }
  function setModal(v: ModalType) { uiStore.modal = v }
  function setCommandQuery(v: string) { uiStore.commandQuery = v }
  function setPromptDraft(v: string) { uiStore.promptDraft = v }
  function setNearBottom(v: boolean) { uiStore.nearBottom = v }

  // ─── Conversation switching ───
  function openConversation(id: string) {
    // Abort any ongoing stream
    if (generating.value) stopGeneration()
    activeChatId.value = id
    const topic = appStore.topicById(id)
    messages.value = topic?.messages ? [...topic.messages] : []
    uiStore.closeDrawers()
  }

  function newConversation() {
    if (generating.value) stopGeneration()
    const assistantId = appStore.defaultAssistant?.id ?? 'default'
    const topic = appStore.addTopic(assistantId)
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
    if (activeChatId.value === id) {
      messages.value = []
    }
    uiStore.showToast('对话已清空')
  }

  function renameTopic(id: string, name: string) {
    appStore.renameTopic(id, name)
  }

  function togglePin(id: string) {
    const topic = appStore.topicById(id)
    if (topic) appStore.togglePin(id)
  }

  // ─── Init app ───
  async function initApp() {
    await appStore.init()
    // Auto-select first topic if any
    if (!activeChatId.value && appStore.sortedTopics.length > 0) {
      openConversation(appStore.sortedTopics[0]!.id)
    }
  }

  // ─── Streaming ───
  async function streamChat(assistantMsg: ChatMessage) {
    generating.value = true
    assistantMsg.status = 'streaming'
    assistantMsg.loading = true

    // Initialize blocks array on the assistant message
    if (!assistantMsg.blocks) {
      assistantMsg.blocks = []
    }

    abortController.value = new AbortController()

    // Gather provider info from selected model and appStore providers
    const selectedModel = uiStore.selectedModel
    const providers = appStore.providers
    // Match provider by model id prefix or by provider id
    const provider = providers.find(p =>
      p.models?.some(m => m.id === selectedModel?.id) ||
      p.id === selectedModel?.id?.split('-')[0],
    )

    const params: ChatRequestParams = {
      messages: messages.value
        .filter(m => m.status === 'complete' || m.status === 'streaming' || m.status === 'stopped')
        .map(m => ({ role: m.role, content: m.content })),
      model: selectedModel?.id ?? 'deepseek-chat',
      signal: abortController.value.signal,
      ...(provider?.apiHost && provider?.apiKey && {
        provider: { apiHost: provider.apiHost, apiKey: provider.apiKey },
      }),
    }

    // Helper: find or create a block of given type
    function findOrCreateBlock(type: MessageBlock['type']): MessageBlock {
      let block = (assistantMsg.blocks ?? []).find(b => b.type === type)
      if (!block) {
        block = {
          id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type,
          content: '',
          status: 'streaming',
          createdAt: Date.now(),
        }
        if (!assistantMsg.blocks) assistantMsg.blocks = []
        assistantMsg.blocks.push(block)
      }
      return block
    }

    try {
      const stream = await chatApi.chatStream(params)
      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data: ')) continue
          const json = trimmed.slice(6)
          if (json === '[DONE]') continue
          try {
            const delta = JSON.parse(json) as ChatStreamDelta
            // Parse reasoning_content into a thinking block
            if (delta.reasoning_content) {
              assistantMsg.reasoningContent = (assistantMsg.reasoningContent ?? '') + delta.reasoning_content
              const block = findOrCreateBlock('thinking')
              block.content += delta.reasoning_content
              block.status = 'streaming'
            }
            // Parse content into a main_text block
            if (delta.content) {
              assistantMsg.content += delta.content
              const block = findOrCreateBlock('main_text')
              block.content += delta.content
              block.status = 'streaming'
            }
            // Parse usage from the final frame
            if (delta.usage) {
              assistantMsg.usage = {
                prompt_tokens: delta.usage.prompt_tokens,
                completion_tokens: delta.usage.completion_tokens,
                total_tokens: delta.usage.total_tokens,
              }
              assistantMsg.tokens = {
                input: delta.usage.prompt_tokens,
                output: delta.usage.completion_tokens,
              }
            }
          } catch { /* skip malformed */ }
        }
      }

      // Finalize all blocks
      for (const block of assistantMsg.blocks ?? []) {
        if (block.status === 'streaming') {
          block.status = 'success'
        }
      }

      assistantMsg.status = 'complete'
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        assistantMsg.status = 'stopped'
        if (!assistantMsg.content) assistantMsg.content = '_生成已停止。_'
        for (const block of assistantMsg.blocks ?? []) {
          if (block.status === 'streaming') block.status = 'success'
        }
      } else {
        assistantMsg.status = 'error'
        assistantMsg.error = (err as Error).message
        assistantMsg.content = `请求失败：${(err as Error).message}`
        const errorBlock: MessageBlock = {
          id: `block-err-${Date.now()}`,
          type: 'error',
          content: (err as Error).message,
          status: 'error',
          createdAt: Date.now(),
        }
        if (!assistantMsg.blocks) assistantMsg.blocks = []
        assistantMsg.blocks.push(errorBlock)
      }
    } finally {
      assistantMsg.loading = false
      generating.value = false
      abortController.value = null
      // Persist to appStore
      if (activeChatId.value) {
        appStore.updateMessage(activeChatId.value, assistantMsg)
      }
    }
  }

  // ─── Send Message ───
  async function sendMessage() {
    if (!canSend.value) return
    if (!activeChatId.value) {
      newConversation()
    }
    const topicId = activeChatId.value!

    const content = draft.value.trim() ||
      `请分析附件：${attachments.value.map(f => f.name).join('、')}`

    const now = new Date().toISOString()

    // Create user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      topicId,
      role: 'user',
      content,
      time: now,
      createdAt: now,
      status: 'complete',
      blocks: [
        {
          id: `block-${Date.now()}`,
          type: 'main_text',
          content,
          status: 'success',
          createdAt: Date.now(),
        },
      ],
    }

    // Record parent branch index if replying to a specific message
    if (replyingToMsgId.value) {
      userMsg.parentBranchIndex = replyingToMsgId.value as number
    }

    appStore.addMessage(topicId, userMsg)
    messages.value = [...messages.value, userMsg]

    // Clear input
    draft.value = ''
    attachments.value = []
    replyingTo.value = ''
    replyingToMsgId.value = null
    uiStore.saving = true

    // Create assistant placeholder
    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      topicId,
      role: 'assistant',
      model: uiStore.selectedModel?.name,
      content: '',
      reasoningContent: '',
      time: now,
      createdAt: now,
      status: 'sending',
      loading: true,
      blocks: [],
    }
    appStore.addMessage(topicId, assistantMsg)
    messages.value = [...messages.value, assistantMsg]

    await streamChat(assistantMsg)

    // Auto-rename topic if it's the first message
    const topic = appStore.topicById(topicId)
    if (topic && !topic.isNameManuallyEdited && topic.messages.length <= 2) {
      const title = content.slice(0, 30) + (content.length > 30 ? '...' : '')
      appStore.renameTopic(topicId, title)
    }

    uiStore.saving = false
  }

  function stopGeneration() {
    abortController.value?.abort()
  }

  // ─── Message Actions ───
  function copyMessage(msg: ChatMessage) {
    navigator.clipboard.writeText(msg.content).then(
      () => uiStore.showToast('消息已复制'),
      () => uiStore.showToast('浏览器未授予剪贴板权限'),
    )
  }

  function rateMessage(msg: ChatMessage, rating: 'up' | 'down') {
    msg.rating = msg.rating === rating ? '' : rating
    if (activeChatId.value) appStore.updateMessage(activeChatId.value, msg)
    uiStore.showToast(msg.rating ? '反馈已记录' : '反馈已取消')
  }

  function regenerate(msg: ChatMessage) {
    msg.branches = (msg.branches ?? 1) + 1
    msg.activeBranch = msg.branches
    if (activeChatId.value) appStore.updateMessage(activeChatId.value, msg)
    uiStore.showToast('已创建新的回复分支')
    // Re-stream from the user message before this one
    const idx = messages.value.findIndex(m => m.id === msg.id)
    if (idx > 0) {
      const userMsg = messages.value[idx - 1]
      // Reset assistant message
      msg.content = ''
      msg.reasoningContent = ''
      msg.status = 'sending'
      msg.loading = true
      msg.error = undefined
      msg.blocks = []
      messages.value = [...messages.value]
      // Re-stream
      abortController.value = new AbortController()

      // Gather provider info
      const selectedModel = uiStore.selectedModel
      const providers = appStore.providers
      const provider = providers.find(p =>
        p.models?.some(m => m.id === selectedModel?.id) ||
        p.id === selectedModel?.id?.split('-')[0],
      )

      const params: ChatRequestParams = {
        messages: messages.value
          .slice(0, idx)
          .filter(m => m.status === 'complete' || m.status === 'stopped')
          .map(m => ({ role: m.role, content: m.content })),
        model: selectedModel?.id ?? 'deepseek-chat',
        signal: abortController.value.signal,
        ...(provider?.apiHost && provider?.apiKey && {
          provider: { apiHost: provider.apiHost, apiKey: provider.apiKey },
        }),
      }
      generating.value = true

      // Helper for block management
      function findOrCreateBlock(type: MessageBlock['type']): MessageBlock {
        let block = (msg.blocks ?? []).find(b => b.type === type)
        if (!block) {
          block = {
            id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type,
            content: '',
            status: 'streaming',
            createdAt: Date.now(),
          }
          if (!msg.blocks) msg.blocks = []
          msg.blocks.push(block)
        }
        return block
      }

      chatApi.chatStream(params).then(async (stream) => {
        const reader = stream.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''
            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed.startsWith('data: ')) continue
              const json = trimmed.slice(6)
              if (json === '[DONE]') continue
              try {
                const delta = JSON.parse(json) as ChatStreamDelta
                if (delta.reasoning_content) {
                  msg.reasoningContent = (msg.reasoningContent ?? '') + delta.reasoning_content
                  const block = findOrCreateBlock('thinking')
                  block.content += delta.reasoning_content
                  block.status = 'streaming'
                }
                if (delta.content) {
                  msg.content += delta.content
                  const block = findOrCreateBlock('main_text')
                  block.content += delta.content
                  block.status = 'streaming'
                }
                if (delta.usage) {
                  msg.usage = {
                    prompt_tokens: delta.usage.prompt_tokens,
                    completion_tokens: delta.usage.completion_tokens,
                    total_tokens: delta.usage.total_tokens,
                  }
                  msg.tokens = {
                    input: delta.usage.prompt_tokens,
                    output: delta.usage.completion_tokens,
                  }
                }
              } catch { /* skip */ }
            }
          }
          for (const block of msg.blocks ?? []) {
            if (block.status === 'streaming') block.status = 'success'
          }
          msg.status = 'complete'
        } catch (err) {
          if ((err as Error).name === 'AbortError') {
            msg.status = 'stopped'
            for (const block of msg.blocks ?? []) {
              if (block.status === 'streaming') block.status = 'success'
            }
          } else {
            msg.status = 'error'
            msg.error = (err as Error).message
            const errorBlock: MessageBlock = {
              id: `block-err-${Date.now()}`,
              type: 'error',
              content: (err as Error).message,
              status: 'error',
              createdAt: Date.now(),
            }
            if (!msg.blocks) msg.blocks = []
            msg.blocks.push(errorBlock)
          }
        } finally {
          msg.loading = false
          generating.value = false
          abortController.value = null
          if (activeChatId.value) appStore.updateMessage(activeChatId.value, msg)
        }
      })
    }
  }

  function branchFrom(msg: ChatMessage) {
    replyingTo.value = msg.content.slice(0, 42)
    replyingToMsgId.value = msg.id
    uiStore.showToast('下一条消息将在新分支中发送')
  }

  function editMessage(msg: ChatMessage) {
    draft.value = msg.content
    replyingTo.value = '编辑历史消息后重新发送'
  }

  // ─── Search Messages ───
  function searchMessages(query: string): SearchResult[] {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const results: SearchResult[] = []
    for (const topic of appStore.topics) {
      for (const msg of topic.messages) {
        if (msg.content && msg.content.toLowerCase().includes(q)) {
          results.push({
            topicId: topic.id,
            topicName: topic.name,
            messageId: msg.id,
            content: msg.content,
            time: msg.time,
          })
          if (results.length >= 50) return results
        }
      }
    }
    return results
  }

  // ─── Export Topic as Markdown ───
  function exportTopicMarkdown(id: string): string {
    const topic = appStore.topicById(id)
    if (!topic) {
      uiStore.showToast('未找到对话')
      return ''
    }

    const lines: string[] = []
    lines.push(`# ${topic.name}`)
    lines.push('')
    lines.push(`> 导出时间：${new Date().toLocaleString('zh-CN')}`)
    if (topic.model) lines.push(`> 模型：${topic.model}`)
    lines.push('')

    for (const msg of topic.messages) {
      const role = msg.role === 'user' ? '🧑 用户' : msg.role === 'assistant' ? '🤖 助手' : '系统'
      const time = msg.time ? new Date(msg.time).toLocaleString('zh-CN') : ''
      lines.push(`## ${role}${time ? ` · ${time}` : ''}`)
      lines.push('')
      lines.push(msg.content || '_(空消息)_')
      if (msg.reasoningContent) {
        lines.push('')
        lines.push('<details><summary>推理过程</summary>')
        lines.push('')
        lines.push(msg.reasoningContent)
        lines.push('')
        lines.push('</details>')
      }
      lines.push('')
      lines.push('---')
      lines.push('')
    }

    const markdown = lines.join('\n')

    // Trigger download
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${topic.name.replace(/[<>:"/\\|?*]/g, '_')}.md`
    a.click()
    URL.revokeObjectURL(url)

    uiStore.showToast('对话已导出为 Markdown')
    return markdown
  }

  // ─── Attachments ───
  function addFiles(files: File[]) {
    const max = 6
    const remaining = max - attachments.value.length
    files.slice(0, remaining).forEach(file => {
      attachments.value.push({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size < 1024 * 1024
          ? `${Math.max(1, Math.round(file.size / 1024))} KB`
          : `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      })
    })
    if (files.length > remaining) {
      uiStore.showToast(`最多 ${max} 个附件，已忽略 ${files.length - remaining} 个`)
    } else {
      uiStore.showToast(`${files.length} 个文件已加入上下文`)
    }
  }

  function removeAttachment(file: Attachment) {
    const index = attachments.value.findIndex(a => a.id === file.id)
    if (index === -1) return
    const removed = attachments.value.splice(index, 1)[0]
    uiStore.showToast('附件已移除', () => {
      attachments.value.splice(index, 0, removed)
    })
  }

  // ─── UI Delegates (for component compat) ───
  function toggleFocusMode() { uiStore.toggleFocusMode() }
  function toggleInspector() { uiStore.toggleInspector() }
  function closeInspector() { uiStore.closeInspector() }
  function closeDrawers() { uiStore.closeDrawers() }
  function showToast(message: string, undo?: () => void) { uiStore.showToast(message, undo) }
  function selectModel(model: typeof uiStore.selectedModel) { uiStore.selectModel(model) }
  function runCommand(cmd: typeof uiStore.commands[number]) {
    if (cmd.action === 'new') {
      newConversation()
      uiStore.modal = ''
      return
    }
    if (cmd.action === 'export') {
      exportTopicMarkdown(activeChatId.value ?? '')
      uiStore.modal = ''
      return
    }
    uiStore.runCommand(cmd)
  }
  function savePrompt() { uiStore.savePrompt() }
  function handleResize() { uiStore.handleResize() }
  function undo() { uiStore.undo() }

  // ─── Import/Export delegates ───
  async function importData(file: File) {
    const result = await appStore.importData(file)
    if (result.ok) {
      uiStore.showToast('数据导入成功')
      if (appStore.sortedTopics.length > 0) {
        openConversation(appStore.sortedTopics[0]!.id)
      }
    } else {
      uiStore.showToast(`导入失败：${result.error}`)
    }
  }

  function exportData() {
    appStore.exportData({ includeApiKeys: false })
    uiStore.showToast('数据已导出')
  }

  // ─── Draft persistence ───
  watch(draft, (val) => {
    localStorage.setItem('orbit-draft', val)
  })

  // ─── Expose ───
  return {
    // State (own)
    activeChatId, messages, draft, replyingTo, replyingToMsgId, generating, attachments,
    // State (forwarded from uiStore as computeds)
    sidebarOpen, focusMode, inspectorVisible, inspectorOpen,
    modal, toast, online, saving, nearBottom, commandQuery,
    promptDraft, selectedModel, workspaces, models,
    promptPresets, commands, filteredCommands, filteredCommandChats,
    searchResults,
    // Getters
    currentChat, chats, canSend,
    // Conversation
    openConversation, newConversation, deleteConversation, clearConversation, renameTopic, togglePin, initApp,
    // Messaging
    sendMessage, stopGeneration, streamChat,
    copyMessage, rateMessage, regenerate, branchFrom, editMessage,
    searchMessages, exportTopicMarkdown,
    // Attachments
    addFiles, removeAttachment,
    // UI delegates
    toggleFocusMode, toggleInspector, closeInspector, closeDrawers,
    showToast, selectModel, runCommand, savePrompt, handleResize, undo,
    // Import/Export
    importData, exportData,
    // Compat setters
    setSidebarOpen, setFocusMode, setInspectorOpen, setInspectorVisible,
    setModal, setCommandQuery, setPromptDraft, setNearBottom,
    // Token estimation helper exposed for components
    estimateTokens,
  }
})
