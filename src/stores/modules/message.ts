/**
 * 消息模块 Pinia Store
 * 管理消息收发、流式响应、消息操作
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useXStream } from 'vue-element-plus-x'
import {
  fetchMessages,
  stopStream as apiStopStream,
  regenerateMessage,
  continueGeneration as apiContinueGeneration,
  editMessage as apiEditMessage,
  deleteMessage as apiDeleteMessage,
  submitFeedback as apiSubmitFeedback,
  forkConversation as apiForkConversation,
} from '@/api/message'
import type {
  SendMessageParams,
  RegenerateParams,
  EditMessageParams,
  ContinueParams,
} from '@/api/message/types'
import type {
  Message,
  MessageStatus,
  MessageFeedback,
  StreamChunk,
  ToolCallChunk,
  TokenUsage,
} from '@/types/message'
import { useConversationStore } from './conversation'
import { useModelStore } from './model'

export const useMessageStore = defineStore('message', () => {
  // ---- 状态 ----
  const messagesByConversation = ref<Record<string, Message[]>>({})
  const streamingMessageId = ref<string | null>(null)
  const streamingContent = ref('')
  const streamingReasoning = ref('')
  const streamingToolCalls = ref<ToolCallChunk[]>([])
  const isLoading = ref(false)
  const hasMore = ref<Record<string, boolean>>({})
  const cursors = ref<Record<string, string | undefined>>({})
  const error = ref<string | null>(null)

  // useXStream 实例
  const { stream, abort: abortStream, isStreaming } = useXStream()

  // ---- 计算属性 ----
  function getMessages(conversationId: string): Message[] {
    return messagesByConversation.value[conversationId] || []
  }

  const streamingMessage = computed(() => {
    if (!streamingMessageId.value) return null
    return Object.values(messagesByConversation.value)
      .flat()
      .find(m => m.id === streamingMessageId.value) || null
  })

  // ---- 内部方法 ----
  function setMessages(conversationId: string, msgs: Message[]) {
    messagesByConversation.value[conversationId] = msgs
  }

  function prependMessages(conversationId: string, msgs: Message[]) {
    const existing = messagesByConversation.value[conversationId] || []
    const existingIds = new Set(existing.map(m => m.id))
    const newMsgs = msgs.filter(m => !existingIds.has(m.id))
    messagesByConversation.value[conversationId] = [...newMsgs, ...existing]
  }

  function appendMessage(conversationId: string, msg: Message) {
    const existing = messagesByConversation.value[conversationId] || []
    const idx = existing.findIndex(m => m.id === msg.id)
    if (idx >= 0) {
      existing[idx] = msg
    } else {
      existing.push(msg)
    }
    messagesByConversation.value[conversationId] = [...existing]
  }

  function updateMessage(conversationId: string, messageId: string, patch: Partial<Message>) {
    const msgs = messagesByConversation.value[conversationId]
    if (!msgs) return
    const idx = msgs.findIndex(m => m.id === messageId)
    if (idx >= 0) {
      msgs[idx] = { ...msgs[idx], ...patch }
      messagesByConversation.value[conversationId] = [...msgs]
    }
  }

  function removeMessage(conversationId: string, messageId: string) {
    const msgs = messagesByConversation.value[conversationId]
    if (!msgs) return
    messagesByConversation.value[conversationId] = msgs.filter(m => m.id !== messageId)
  }

  // ---- SSE 流处理 ----
  function handleStreamChunk(conversationId: string, chunk: StreamChunk) {
    switch (chunk.type) {
      case 'text':
        appendStreamContent(chunk.content || '')
        break
      case 'tool_call':
        if (chunk.toolCall) {
          appendToolCall(chunk.toolCall)
        }
        break
      case 'error':
        error.value = chunk.error?.message || '流式响应错误'
        updateMessage(conversationId, streamingMessageId.value!, { status: 'error' })
        break
      case 'done':
        finalizeStream(chunk.usage)
        break
    }
  }

  function appendStreamContent(delta: string) {
    streamingContent.value += delta
    if (streamingMessage.value) {
      streamingMessage.value.content = streamingContent.value
    }
  }

  function appendToolCall(toolCall: ToolCallChunk) {
    const idx = streamingToolCalls.value.findIndex(t => t.id === toolCall.id)
    if (idx >= 0) {
      const existing = streamingToolCalls.value[idx]
      streamingToolCalls.value[idx] = {
        ...existing,
        arguments: existing.arguments + (toolCall.arguments || ''),
        status: toolCall.status,
        result: toolCall.result,
      }
    } else {
      streamingToolCalls.value.push(toolCall)
    }
  }

  function finalizeStream(usage?: TokenUsage) {
    const cid = streamingMessage.value?.conversationId
    const mid = streamingMessageId.value
    if (cid && mid) {
      updateMessage(cid, mid, {
        content: streamingContent.value,
        status: 'done',
        tokensUsed: usage?.totalTokens,
      })
    }
    streamingMessageId.value = null
    streamingContent.value = ''
    streamingReasoning.value = ''
    streamingToolCalls.value = []
    isLoading.value = false

    // 通知对话管理模块更新预览
    const convStore = useConversationStore()
    if (cid) {
      convStore.updateConversation(cid, {
        lastMessagePreview: truncatePreview(streamingContent.value),
      })
    }
  }

  function truncatePreview(content: string): string {
    return content.length > 80 ? content.slice(0, 80) + '...' : content
  }

  // ---- 公开方法 ----

  /** 加载历史消息 */
  async function loadMessages(conversationId: string) {
    if (getMessages(conversationId).length > 0 && !hasMore.value[conversationId]) return
    try {
      const res = await fetchMessages({
        conversationId,
        cursor: cursors.value[conversationId],
      })
      prependMessages(conversationId, res.messages)
      hasMore.value[conversationId] = res.hasMore
      cursors.value[conversationId] = res.cursor
    } catch (e: any) {
      console.error('加载历史消息失败', e)
    }
  }

  /** 发送消息 */
  async function sendMessage(params: SendMessageParams) {
    const { conversationId, content, modelId } = params
    isLoading.value = true
    error.value = null

    // 添加用户消息
    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      conversationId,
      role: 'user',
      content,
      parentId: params.parentMessageId || null,
      childrenIds: [],
      modelId,
      status: 'done',
      createdAt: Date.now(),
    }
    appendMessage(conversationId, userMsg)

    // 添加 AI 占位消息
    const aiMsgId = `msg-${Date.now()}-ai`
    const aiMsg: Message = {
      id: aiMsgId,
      conversationId,
      role: 'assistant',
      content: '',
      parentId: userMsg.id,
      childrenIds: [],
      modelId,
      status: 'streaming',
      createdAt: Date.now(),
    }
    appendMessage(conversationId, aiMsg)

    streamingMessageId.value = aiMsgId
    streamingContent.value = ''

    // 构建消息历史
    const msgList = getMessages(conversationId)
    const history = msgList
      .filter(m => m.status === 'done' && m.id !== aiMsgId)
      .map(m => ({ role: m.role, content: m.content }))

    const { signal } = new AbortController()

    try {
      await stream('/api/chat/stream', {
        method: 'POST',
        body: JSON.stringify({
          conversationId,
          content,
          modelId,
          messages: history,
          stream: true,
        }),
        signal,
        onChunk: (text: string) => {
          try {
            // SSE data: 行解析
            const lines = text.split('\n')
            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed || !trimmed.startsWith('data:')) continue
              const data = trimmed.slice(5).trim()
              if (data === '[DONE]') {
                finalizeStream()
                return
              }
              try {
                const chunk: StreamChunk = JSON.parse(data)
                handleStreamChunk(conversationId, chunk)
              } catch {
                // 纯文本增量
                streamingContent.value += data
                updateMessage(conversationId, aiMsgId, { content: streamingContent.value })
              }
            }
          } catch {
            // ignore parse errors
          }
        },
      })
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        error.value = e.message || '流式请求失败'
        updateMessage(conversationId, aiMsgId, {
          status: 'error',
          error: e.message,
        })
      } else {
        updateMessage(conversationId, aiMsgId, { status: 'stopped' })
      }
      streamingMessageId.value = null
      isLoading.value = false
    }
  }

  /** 停止流式生成 */
  async function stopStreaming() {
    try {
      abortStream()
      const cid = streamingMessage.value?.conversationId
      if (cid) {
        await apiStopStream({ conversationId: cid })
      }
      if (streamingMessageId.value && cid) {
        updateMessage(cid, streamingMessageId.value, { status: 'stopped' })
      }
    } catch (e) {
      console.error('停止流式失败', e)
    }
    streamingMessageId.value = null
    isLoading.value = false
  }

  /** 重新生成 */
  async function regenerate(params: RegenerateParams) {
    try {
      await regenerateMessage(params)
      // 触发流式重新生成
      const conversationStore = useConversationStore()
      const modelStore = useModelStore()
      await sendMessage({
        conversationId: conversationStore.currentConversationId || '',
        content: '',
        modelId: modelStore.currentModelId || '',
        parentMessageId: params.messageId,
      })
    } catch (e: any) {
      ElMessage.error(e.message || '重新生成失败')
    }
  }

  /** 继续生成 */
  async function continueGen(params: ContinueParams) {
    try {
      await apiContinueGeneration(params)
      const conversationStore = useConversationStore()
      const modelStore = useModelStore()
      await sendMessage({
        conversationId: conversationStore.currentConversationId || '',
        content: '',
        modelId: modelStore.currentModelId || '',
      })
    } catch (e: any) {
      ElMessage.error(e.message || '继续生成失败')
    }
  }

  /** 编辑消息 */
  async function editMsg(params: EditMessageParams) {
    try {
      await apiEditMessage(params)
    } catch (e: any) {
      ElMessage.error(e.message || '编辑消息失败')
    }
  }

  /** 删除消息 */
  async function deleteMsg(messageId: string) {
    const conversationStore = useConversationStore()
    const cid = conversationStore.currentConversationId || ''
    try {
      await apiDeleteMessage(messageId)
      removeMessage(cid, messageId)
      ElMessage.success('消息已删除')
    } catch (e: any) {
      ElMessage.error(e.message || '删除消息失败')
    }
  }

  /** 提交反馈 */
  async function submitMsgFeedback(messageId: string, feedback: MessageFeedback) {
    try {
      await apiSubmitFeedback(messageId, feedback)
      const cid = streamingMessage.value?.conversationId || ''
      updateMessage(cid, messageId, { feedback })
    } catch (e: any) {
      ElMessage.error(e.message || '反馈提交失败')
    }
  }

  /** 分支对话 */
  async function forkConv(messageId: string): Promise<string | null> {
    try {
      const res = await apiForkConversation(messageId)
      return res.conversationId
    } catch (e: any) {
      ElMessage.error(e.message || '创建分支失败')
      return null
    }
  }

  return {
    // state
    messagesByConversation,
    streamingMessageId,
    streamingContent,
    streamingReasoning,
    streamingToolCalls,
    isLoading,
    hasMore,
    cursors,
    error,
    isStreaming,
    // computed
    streamingMessage,
    getMessages,
    // mutations
    setMessages,
    appendMessage,
    updateMessage,
    removeMessage,
    // actions
    loadMessages,
    sendMessage,
    stopStreaming,
    regenerate,
    continueGen,
    editMsg,
    deleteMsg,
    submitMsgFeedback,
    forkConv,
    // internal (exposed for components)
    handleStreamChunk,
    appendStreamContent,
    finalizeStream,
  }
})
