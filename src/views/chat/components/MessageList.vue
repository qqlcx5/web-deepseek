<script setup lang="ts">
/**
 * MessageList — 消息列表组件
 * 使用 Element-Plus-X BubbleList + Bubble + Thinking + ThoughtChain
 */
import { ref, watch, nextTick, computed } from 'vue'
import { BubbleList, Bubble, Thinking, ThoughtChain, MarkdownRenderer } from 'vue-element-plus-x'
import type { Message, MessageFeedback } from '@/types/message'

const props = defineProps<{
  conversationId: string
  messages: Message[]
  isLoading: boolean
  streamingId: string | null
}>()

const emit = defineEmits<{
  regenerate: [messageId: string]
  continue: [messageId: string]
  edit: [messageId: string, content: string]
  delete: [messageId: string]
  feedback: [messageId: string, feedback: MessageFeedback]
  fork: [messageId: string]
}>()

// BubbleList items with role-based config
const bubbleItems = computed(() =>
  props.messages.map(msg => ({
    key: msg.id,
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content,
    status: msg.status,
    loading: msg.status === 'streaming' || msg.status === 'sending',
    error: msg.error,
    isStreaming: msg.id === props.streamingId,
    tokensUsed: msg.tokensUsed,
    feedback: msg.feedback,
    modelId: msg.modelId,
  })),
)

function handleRegenerate(item: any) {
  emit('regenerate', item.key)
}

function handleContinue(item: any) {
  emit('continue', item.key)
}

function handleEdit(item: any) {
  emit('edit', item.key, item.content)
}

function handleDelete(item: any) {
  emit('delete', item.key)
}

function handleLike(item: any) {
  emit('feedback', item.key, { rating: 'like', createdAt: Date.now() })
}

function handleDislike(item: any) {
  emit('feedback', item.key, { rating: 'dislike', createdAt: Date.now() })
}

function handleFork(item: any) {
  emit('fork', item.key)
}
</script>

<template>
  <BubbleList
    class="message-list"
    :items="bubbleItems"
    :style="{ height: '100%' }"
  >
    <template #bubble="{ item }">
      <Bubble
        :key="item.key"
        :role="item.role"
        :loading="item.loading"
      >
        <!-- Thinking Block for AI messages -->
        <template v-if="item.role === 'assistant' && item.isStreaming" #header>
          <Thinking
            :collapsed="false"
            title="思考中..."
          >
            <ThoughtChain
              :thoughts="[
                { status: 'pending', content: '正在分析您的问题...' },
              ]"
            />
          </Thinking>
        </template>

        <template #content>
          <MarkdownRenderer
            v-if="item.role === 'assistant'"
            :content="item.content"
            :streaming="item.isStreaming"
          />
          <span v-else>{{ item.content }}</span>
        </template>

        <!-- Token Usage -->
        <template v-if="item.role === 'assistant' && item.tokensUsed" #footer>
          <span class="message-list__tokens">Token: {{ item.tokensUsed }}</span>
        </template>

        <!-- Actions -->
        <template #actions>
          <div
            v-if="item.role === 'assistant'"
            class="message-list__actions"
          >
            <button
              class="message-list__action-btn"
              title="复制"
              @click="navigator.clipboard.writeText(item.content)"
            >
              复制
            </button>
            <button
              v-if="item.status === 'done'"
              class="message-list__action-btn"
              title="重新生成"
              @click="handleRegenerate(item)"
            >
              重新生成
            </button>
            <button
              v-if="item.status === 'truncated'"
              class="message-list__action-btn"
              title="继续生成"
              @click="handleContinue(item)"
            >
              继续
            </button>
            <button class="message-list__action-btn" title="点赞" @click="handleLike(item)">
              点赞
            </button>
            <button class="message-list__action-btn" title="点踩" @click="handleDislike(item)">
              点踩
            </button>
            <button class="message-list__action-btn" title="分支" @click="handleFork(item)">
              分支
            </button>
          </div>
          <div
            v-if="item.role === 'user'"
            class="message-list__actions"
          >
            <button
              class="message-list__action-btn"
              title="复制"
              @click="navigator.clipboard.writeText(item.content)"
            >
              复制
            </button>
            <button class="message-list__action-btn" title="编辑" @click="handleEdit(item)">
              编辑
            </button>
            <button class="message-list__action-btn" title="删除" @click="handleDelete(item)">
              删除
            </button>
          </div>
        </template>
      </Bubble>
    </template>
  </BubbleList>
</template>

<style scoped lang="scss">
.message-list {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 16px 0;

  &__actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;

    .el-plus-x-bubble:hover & {
      opacity: 1;
    }
  }

  &__action-btn {
    padding: 2px 8px;
    border: none;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    line-height: 20px;
    transition: background 0.2s, color 0.2s;

    &:hover {
      background: var(--el-fill-color);
      color: var(--el-text-color-primary);
    }
  }

  &__tokens {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
  }
}
</style>
