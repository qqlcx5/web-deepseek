<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue'
import { BubbleList, Bubble, Thinking } from 'vue-element-plus-x'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import type { ChatMessage } from '@/types'

const app = useAppStore()
const generating = ref(false)
const bubbleListRef = ref()

interface BubbleItem {
  key: string
  placement: 'start' | 'end'
  content: string
  loading: boolean
  variant: 'filled' | 'borderless' | 'outlined' | 'shadow'
  maxWidth: string
}

const list = computed<BubbleItem[]>(() => {
  const topic = app.activeTopic
  if (!topic) return []
  return topic.messages.map((msg) => {
    const isUser = msg.role === 'user'
    return {
      key: msg.id,
      placement: isUser ? 'end' as const : 'start' as const,
      content: getMainText(msg),
      loading: (msg.status === 'streaming' || msg.status === 'sending') && !getMainText(msg),
      variant: 'filled',
      maxWidth: isUser ? '78%' : '86%',
    }
  })
})

// Parallel data map for slot rendering
const msgMap = computed(() => {
  const topic = app.activeTopic
  if (!topic) return new Map<string, ChatMessage>()
  return new Map(topic.messages.map(m => [m.id, m]))
})

function getMainText(msg: ChatMessage): string {
  return msg.blocks.find(b => b.type === 'main_text')?.content ?? ''
}
function getThinking(msg: ChatMessage): string {
  return msg.blocks.find(b => b.type === 'thinking')?.content ?? ''
}
function getError(msg: ChatMessage): string {
  return msg.blocks.find(b => b.type === 'error')?.error?.message ?? ''
}

function copyMessage(msg: ChatMessage) {
  navigator.clipboard.writeText(getMainText(msg))
  ElMessage.success('已复制到剪贴板')
}

function retryMessage(msg: ChatMessage) {
  if (msg.role !== 'assistant') return
  const topic = app.activeTopic
  if (!topic) return
  const idx = topic.messages.findIndex(m => m.id === msg.id)
  if (idx >= 0) topic.messages.splice(idx, 1)
  const prevUserMsg = topic.messages[idx - 1]
  if (prevUserMsg) {
    app.updateMessage(topic.id, prevUserMsg.id, { status: 'complete' })
    simulateSend(topic.id, getMainText(prevUserMsg))
  }
}

function simulateSend(topicId: string, text: string) {
  const userMsg = app.addMessage(topicId, {
    role: 'user', status: 'complete',
    blocks: [{ id: crypto.randomUUID(), messageId: '', type: 'main_text', createdAt: new Date().toISOString(), status: 'success', content: text }],
  })
  if (userMsg.blocks[0]) userMsg.blocks[0].messageId = userMsg.id

  generating.value = true
  const assistantMsg = app.addMessage(topicId, {
    role: 'assistant', status: 'streaming', askId: userMsg.id,
    blocks: [{ id: crypto.randomUUID(), messageId: '', type: 'main_text', createdAt: new Date().toISOString(), status: 'streaming', content: '' }],
  })
  if (assistantMsg.blocks[0]) assistantMsg.blocks[0].messageId = assistantMsg.id

  setTimeout(() => {
    app.updateMessage(topicId, assistantMsg.id, {
      status: 'complete',
      metrics: { completion_tokens: 100, time_completion_millsec: 1200, time_first_token_millsec: 200, time_thinking_millsec: 0 },
      blocks: [{ id: assistantMsg.blocks[0]?.id ?? crypto.randomUUID(), messageId: assistantMsg.id, type: 'main_text', createdAt: assistantMsg.blocks[0]?.createdAt ?? new Date().toISOString(), status: 'success', content: '已重新生成回复。这是 Orbit Chat 的模拟响应，后续将接入真实 API。' }],
    })
    generating.value = false
  }, 1000)
}

function stopGeneration() {
  generating.value = false
  const topic = app.activeTopic
  if (!topic) return
  const last = topic.messages[topic.messages.length - 1]
  if (last?.status === 'streaming') {
    app.updateMessage(topic.id, last.id, { status: 'stopped' })
    last.blocks.forEach(b => { if (b.status === 'streaming') b.status = 'success' })
  }
  ElMessage.info('生成已停止')
}

defineExpose({ stopGeneration, generating })

watch(() => app.activeTopicId, () => {
  nextTick(() => { bubbleListRef.value?.scrollToBottom?.() })
})
</script>

<template>
  <BubbleList ref="bubbleListRef" :list="list" auto-scroll>
    <template #item="{ item }">
      <div class="message-item">
        <template v-if="msgMap.get(String(item.key))">
          <!-- Thinking block -->
          <Thinking
            v-if="getThinking(msgMap.get(String(item.key))!)"
            :content="getThinking(msgMap.get(String(item.key))!)"
            status="end"
            :auto-collapse="app.settings.thoughtAutoCollapse"
            :max-width="item.maxWidth"
          />

          <!-- Bubble -->
          <Bubble
            :placement="item.placement"
            :content="item.content"
            :loading="item.loading"
            :variant="item.variant"
            :max-width="item.maxWidth"
          />

          <!-- Error -->
          <div v-if="getError(msgMap.get(String(item.key))!)" class="error-block">
            {{ getError(msgMap.get(String(item.key))!) }}
            <button class="retry-link" @click="retryMessage(msgMap.get(String(item.key))!)">重试</button>
          </div>

          <!-- Actions for assistant messages -->
          <div v-if="msgMap.get(String(item.key))!.role === 'assistant' && msgMap.get(String(item.key))!.status === 'complete'" class="message-actions">
            <button class="action-btn" title="复制" @click="copyMessage(msgMap.get(String(item.key))!)"><i class="i-tabler-copy text-xs" /></button>
            <button class="action-btn" title="重新生成" @click="retryMessage(msgMap.get(String(item.key))!)"><i class="i-tabler-refresh text-xs" /></button>
            <span v-if="msgMap.get(String(item.key))!.metrics" class="token-count">{{ msgMap.get(String(item.key))!.metrics!.completion_tokens }} tokens</span>
            <span v-if="msgMap.get(String(item.key))!.model?.name" class="model-label">{{ msgMap.get(String(item.key))!.model!.name }}</span>
          </div>

          <!-- Stopped -->
          <div v-if="msgMap.get(String(item.key))!.status === 'stopped'" class="stopped-text">已停止生成</div>
        </template>
      </div>
    </template>
  </BubbleList>
</template>

<style scoped lang="scss">
.message-item { display: flex; flex-direction: column; gap: 8px; padding: 4px 0; }
.error-block { margin-top: 8px; border-radius: 8px; border: 1px solid #fecaca; background: #fef2f2; padding: 8px 12px; font-size: 12px; color: #b91c1c; }
.retry-link { margin-left: 8px; font-weight: 500; text-decoration: underline; color: #5b56d6; }
.message-actions { display: flex; align-items: center; gap: 4px; margin-top: 4px; color: #667085; }
.action-btn { display: flex; align-items: center; justify-content: center; padding: 4px 6px; border-radius: 6px; transition: background 0.1s; &:hover { background: #f3f4f6; } }
.token-count { margin-left: 8px; font-size: 11px; color: #9ca3af; }
.model-label { margin-left: 8px; font-size: 11px; color: #5b56d6; background: #efefff; padding: 2px 6px; border-radius: 4px; }
.stopped-text { font-size: 12px; color: #667085; margin-top: 4px; }
</style>
