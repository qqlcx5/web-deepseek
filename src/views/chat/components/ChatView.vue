<script setup lang="ts">
/**
 * ChatView — 消息会话主容器
 * 组合 BubbleList + XSender，自适应高度
 */
import { ref, watch, nextTick, computed } from 'vue'
import { BubbleList, Welcome, Prompts, XSender } from 'vue-element-plus-x'
import { useRoute } from 'vue-router'
import { useMessageStore } from '@/stores/modules/message'
import { useConversationStore } from '@/stores/modules/conversation'
import { useModelStore } from '@/stores/modules/model'
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'

const route = useRoute()
const messageStore = useMessageStore()
const conversationStore = useConversationStore()
const modelStore = useModelStore()

const conversationId = computed(() => route.params.conversationId as string | undefined)

// 加载历史消息
watch(conversationId, async (id) => {
  if (id) {
    await messageStore.loadMessages(id)
  }
}, { immediate: true })

function handleSend(content: string) {
  if (!conversationId.value || !modelStore.currentModelId) return
  messageStore.sendMessage({
    conversationId: conversationId.value,
    content,
    modelId: modelStore.currentModelId,
  })
}

function handleStop() {
  messageStore.stopStreaming()
}
</script>

<template>
  <div class="chat-view">
    <!-- 无对话时：欢迎页 -->
    <template v-if="!conversationId">
      <div class="chat-view__welcome">
        <Welcome
          title="Cherry Studio"
          description="选择一个对话或开始新的对话"
        />
        <Prompts
          title="快速开始"
          :items="[
            { key: 'plan', label: '写一份项目计划书', description: '生成结构化的项目计划文档' },
            { key: 'translate', label: '翻译一段英文文档', description: '中英互译，保留格式' },
            { key: 'analyze', label: '分析一组数据', description: '对数据进行统计分析和可视化建议' },
            { key: 'code', label: '编写代码片段', description: '根据需求生成可运行的代码' },
            { key: 'explain', label: '解释一个概念', description: '深入浅出地解释技术或学术概念' },
            { key: 'summary', label: '总结一篇文章', description: '提取文章核心观点和关键信息' },
          ]"
          @select="(item: any) => handleSend(item.label)"
        />
      </div>
    </template>

    <!-- 有对话时：消息列表 + 输入框 -->
    <template v-else>
      <div class="chat-view__messages">
        <MessageList
          :conversation-id="conversationId"
          :messages="messageStore.getMessages(conversationId)"
          :is-loading="messageStore.isLoading"
          :streaming-id="messageStore.streamingMessageId"
          @regenerate="(mid: string) => messageStore.regenerate({ messageId: mid })"
          @continue="(mid: string) => messageStore.continueGen({ messageId: mid })"
          @edit="(mid: string, content: string) => messageStore.editMsg({ messageId: mid, content })"
          @delete="(mid: string) => messageStore.deleteMsg(mid)"
          @feedback="(mid: string, fb: any) => messageStore.submitMsgFeedback(mid, fb)"
          @fork="(mid: string) => messageStore.forkConv(mid)"
        />
      </div>
      <div class="chat-view__input">
        <ChatInput
          :disabled="!conversationId"
          :is-streaming="messageStore.isStreaming"
          @send="handleSend"
          @stop="handleStop"
        />
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  &__welcome {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    overflow-y: auto;
  }

  &__messages {
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  &__input {
    flex-shrink: 0;
    padding: 12px 24px 16px;
    border-top: 1px solid var(--el-border-color-light);
    background: var(--el-bg-color);
  }
}
</style>
