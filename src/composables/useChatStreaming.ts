import { ref, type Ref } from 'vue'
import { chatCompletionStream } from '@/api/chat'
import type { ChatCompletionMessage, Message, Model } from '@/types/chat'

interface UseChatStreamingOptions {
  model: Ref<Model>
  systemPrompt: Ref<string>
  messages: Ref<Message[]>
  onMessageUpdated?: () => void
  onComplete?: (message: Message) => void
  onError?: (error: Error, message: Message) => void
}

export function useChatStreaming(options: UseChatStreamingOptions) {
  const generating = ref(false)
  let abortController: AbortController | null = null

  function buildApiMessages(): ChatCompletionMessage[] {
    const result: ChatCompletionMessage[] = []

    if (options.systemPrompt.value.trim()) {
      result.push({
        role: 'system',
        content: options.systemPrompt.value,
      })
    }

    for (const msg of options.messages.value) {
      if (msg.loading || msg.error) continue
      if (msg.role === 'user' || msg.role === 'assistant') {
        result.push({
          role: msg.role,
          content: msg.content,
        })
      }
    }

    return result
  }

  async function streamAssistantMessage(userContent: string) {
    // Push user message
    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: userContent,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
    options.messages.value.push(userMsg)

    // Push placeholder assistant message
    const assistantMsg: Message = {
      id: Date.now() + 1,
      role: 'assistant',
      model: options.model.value.name,
      time: '刚刚',
      content: '',
      loading: true,
      branches: 1,
      activeBranch: 1,
    }
    options.messages.value.push(assistantMsg)

    generating.value = true
    abortController = new AbortController()

    try {
      const apiMessages = buildApiMessages()

      for await (const chunk of chatCompletionStream(
        {
          model: options.model.value.id,
          messages: apiMessages,
          stream: true,
        },
        abortController.signal,
      )) {
        assistantMsg.loading = false
        assistantMsg.content += chunk
        options.onMessageUpdated?.()
      }

      if (!assistantMsg.content) {
        assistantMsg.content = '_（空回复）_'
      }

      options.onComplete?.(assistantMsg)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        assistantMsg.loading = false
        assistantMsg.content ||= '_生成已停止。_'
      } else {
        assistantMsg.loading = false
        assistantMsg.error = (err as Error).message
        assistantMsg.content = `⚠️ 请求失败：${(err as Error).message}`
        options.onError?.(err as Error, assistantMsg)
      }
    } finally {
      generating.value = false
      abortController = null
    }
  }

  function stopGeneration() {
    abortController?.abort()
  }

  return {
    generating,
    streamAssistantMessage,
    stopGeneration,
  }
}
