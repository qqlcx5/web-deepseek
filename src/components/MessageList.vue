<script setup lang="ts">
import { computed, ref, shallowRef, onMounted, nextTick, watch } from 'vue'
import { BubbleList, Bubble, Thinking } from 'vue-element-plus-x'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import type { MessageView } from '@/stores/app'
import type { TextBlock, ThinkingBlock, ErrorBlock } from '@/types'

// Async load MarkdownRenderer (per wiki pattern)
const MarkdownRenderer = shallowRef<any>()
onMounted(async () => {
  await import('x-markdown-vue/style')
  const mod = await import('x-markdown-vue')
  MarkdownRenderer.value = mod.MarkdownRenderer ?? mod
})

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

function getMainText(msg: MessageView): string {
  return msg.blocks.find((b): b is TextBlock => b.type === 'main_text')?.content ?? ''
}
function getThinking(msg: MessageView): string {
  return msg.blocks.find((b): b is ThinkingBlock => b.type === 'thinking')?.content ?? ''
}
function getThinkingStatus(msg: MessageView): 'start' | 'thinking' | 'end' | 'error' {
  const block = msg.blocks.find((b): b is ThinkingBlock => b.type === 'thinking')
  if (!block) return 'end'
  if (block.status === 'pending') return 'thinking'
  if (block.status === 'error') return 'error'
  return 'end'
}
function getError(msg: MessageView): string {
  return msg.blocks.find((b): b is ErrorBlock => b.type === 'error')?.error.message ?? ''
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
      loading: msg.status === 'pending' && !getMainText(msg),
      variant: 'filled' as const,
      maxWidth: isUser ? '78%' : '86%',
    }
  })
})

const msgMap = computed(() => {
  const topic = app.activeTopic
  if (!topic) return new Map<string, MessageView>()
  return new Map(topic.messages.map(m => [m.id, m]))
})

function copyMessage(msg: MessageView) {
  navigator.clipboard.writeText(getMainText(msg))
  ElMessage.success('已复制到剪贴板')
}

const emit = defineEmits<{ retry: [msg: MessageView] }>()

function retryMessage(msg: MessageView) {
  if (msg.role !== 'assistant') return
  emit('retry', msg)
}

defineExpose({
  stopGeneration() {
    generating.value = false
    const topic = app.activeTopic
    if (!topic) return
    const last = topic.messages[topic.messages.length - 1]
    if (last?.status === 'pending') {
      app.updateMessage(topic.id, last.id, { status: 'success' })
      last.blocks.forEach(b => app.updateBlock(topic.id, last.id, b.id, { status: 'success' }))
    }
    ElMessage.info('生成已停止')
  },
  generating,
})

watch(() => app.activeTopicId, () => {
  nextTick(() => { bubbleListRef.value?.scrollToBottom?.() })
})

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <BubbleList ref="bubbleListRef" :list="list" auto-scroll show-back-button>
    <template #item="{ item }">
      <div class="message-item">
        <template v-if="msgMap.get(String(item.key))">
          <!-- Thinking block -->
          <Thinking
            v-if="getThinking(msgMap.get(String(item.key))!)"
            :content="getThinking(msgMap.get(String(item.key))!)"
            :status="getThinkingStatus(msgMap.get(String(item.key))!)"
            :auto-collapse="app.settings.thoughtAutoCollapse"
            :max-width="item.maxWidth"
          />

          <!-- Bubble with XMarkdown content -->
          <Bubble
            :placement="item.placement"
            :loading="item.loading"
            :variant="item.variant"
            :max-width="item.maxWidth"
          >
            <template #content>
              <component
                :is="MarkdownRenderer"
                v-if="item.content && MarkdownRenderer"
                :markdown="item.content"
                :is-dark="app.isDark"
                :enable-animate="msgMap.get(String(item.key))?.status === 'pending'"
                :show-code-block-header="true"
                :enable-code-line-number="app.settings.codeShowLineNumbers"
              />
              <span v-else-if="item.content">{{ item.content }}</span>
            </template>

            <!-- Header: model name + timestamp -->
            <template v-if="msgMap.get(String(item.key))!.role === 'assistant'" #header>
              <div class="msg-header">
                <span v-if="app.settings.showModelNameInMarkdown && msgMap.get(String(item.key))!.model?.name" class="msg-model">
                  {{ msgMap.get(String(item.key))!.model!.name }}
                </span>
                <span class="msg-time">{{ formatTime(msgMap.get(String(item.key))!.createdAt) }}</span>
              </div>
            </template>

            <!-- Footer: action buttons + tokens -->
            <template v-if="msgMap.get(String(item.key))!.status === 'success'" #footer>
              <div class="msg-footer">
                <button class="action-btn" title="复制" @click="copyMessage(msgMap.get(String(item.key))!)">
                  <i class="i-tabler-copy text-xs" />
                </button>
                <button v-if="msgMap.get(String(item.key))!.role === 'assistant'" class="action-btn" title="重新生成" @click="retryMessage(msgMap.get(String(item.key))!)">
                  <i class="i-tabler-refresh text-xs" />
                </button>
                <span v-if="app.settings.showTokens && msgMap.get(String(item.key))!.metrics" class="token-count">
                  {{ msgMap.get(String(item.key))!.metrics!.completion_tokens }} tokens
                </span>
              </div>
            </template>
          </Bubble>

          <!-- Error block -->
          <div v-if="getError(msgMap.get(String(item.key))!)" class="error-block">
            <i class="i-tabler-alert-circle text-sm" />
            {{ getError(msgMap.get(String(item.key))!) }}
            <button class="retry-link" @click="retryMessage(msgMap.get(String(item.key))!)">重试</button>
          </div>
        </template>
      </div>
    </template>
  </BubbleList>
</template>

<style scoped lang="scss">
.message-item { display: flex; flex-direction: column; gap: 8px; padding: 4px 0; }

.msg-header { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #667085; }
.msg-model { color: #5b56d6; background: #efefff; padding: 1px 6px; border-radius: 4px; font-size: 11px; }
.msg-time { color: #9ca3af; }

.msg-footer { display: flex; align-items: center; gap: 4px; margin-top: 4px; }
.action-btn { display: flex; align-items: center; justify-content: center; padding: 4px 6px; border-radius: 6px; color: #667085; transition: background 0.1s; &:hover { background: #f3f4f6; } }
.token-count { margin-left: 8px; font-size: 11px; color: #9ca3af; }

.error-block { display: flex; align-items: center; gap: 6px; margin-top: 8px; border-radius: 8px; border: 1px solid #fecaca; background: #fef2f2; padding: 8px 12px; font-size: 12px; color: #b91c1c; }
.retry-link { margin-left: auto; font-weight: 500; text-decoration: underline; color: #5b56d6; }
</style>
