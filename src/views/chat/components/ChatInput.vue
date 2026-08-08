<script setup lang="ts">
/**
 * ChatInput — 智能输入框组件
 * 使用 Element-Plus-X XSender，集成模型选择器与附件上传
 */
import { ref, computed } from 'vue'
import { XSender } from 'vue-element-plus-x'
import { useModelStore } from '@/stores/modules/model'
import { useConversationStore } from '@/stores/modules/conversation'
import AttachmentUploader from './AttachmentUploader.vue'
import type { Attachment, AttachmentRef } from '@/types/attachment'

const props = defineProps<{
  disabled: boolean
  isStreaming: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
  stop: []
}>()

const modelStore = useModelStore()
const conversationStore = useConversationStore()
const inputValue = ref('')
const showUploader = ref(false)

const currentConversationId = computed(() => conversationStore.currentConversationId)

const modelOptions = computed(() =>
  modelStore.modelList.map(m => ({
    label: m.modelName || '',
    value: m.modelName || '',
  })),
)

const currentModel = computed(() => modelStore.currentModelId)

function handleModelChange(value: string) {
  const model = modelStore.modelList.find(m => m.modelName === value)
  if (model) {
    modelStore.setCurrentModelInfo(model)
  }
}

function handleSubmit(content: string) {
  if (!content.trim() || props.disabled) return
  emit('send', content.trim())
  inputValue.value = ''
}

function handleStop() {
  emit('stop')
}

function handleUploadComplete(attachments: Attachment[]) {
  // 附件上传完成后，可以在此处更新 UI 状态
  // 附件引用将在发送消息时通过 useAttachmentStore.getAttachmentRefs 获取
}
</script>

<template>
  <div class="chat-input">
    <XSender
      v-model="inputValue"
      :disabled="disabled"
      :placeholder="disabled ? '请先选择对话' : '输入消息，Enter 发送，Shift+Enter 换行'"
      @submit="handleSubmit"
    >
      <!-- 模型切换入口 -->
      <template #prefix>
        <div class="chat-input__model" v-if="!disabled">
          <span class="chat-input__model-label">
            {{ currentModel || '选择模型' }}
          </span>
        </div>
      </template>

      <!-- 发送 / 停止按钮 -->
      <template #suffix>
        <button
          v-if="isStreaming"
          class="chat-input__stop-btn"
          @click="handleStop"
        >
          停止
        </button>
      </template>

      <!-- 字符统计 + 附件上传入口 -->
      <template #footer>
        <div class="chat-input__footer">
          <button
            v-if="!disabled"
            class="chat-input__attach-btn"
            :class="{ 'is-active': showUploader }"
            @click="showUploader = !showUploader"
          >
            <span class="attach-icon">+</span>
            附件
          </button>
          <span class="chat-input__count">
            {{ inputValue.length }} 字符
            <template v-if="inputValue.length > 0">
              / ~{{ Math.ceil(inputValue.length * 0.5) }} Token
            </template>
          </span>
        </div>
      </template>
    </XSender>

    <!-- 附件上传区域 -->
    <Transition name="uploader-slide">
      <div v-if="showUploader && currentConversationId" class="chat-input__uploader">
        <AttachmentUploader
          :conversation-id="currentConversationId"
          @upload-complete="handleUploadComplete"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.chat-input {
  width: 100%;
  max-width: 820px;
  margin: 0 auto;

  &__model {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 6px;
    background: var(--el-fill-color-light);
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: var(--el-fill-color);
    }
  }

  &__model-label {
    font-size: 13px;
    color: var(--el-text-color-regular);
    white-space: nowrap;
  }

  &__stop-btn {
    padding: 6px 16px;
    border: none;
    border-radius: 6px;
    background: var(--el-color-danger);
    color: #fff;
    font-size: 13px;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.85;
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 4px;
  }

  &__attach-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    background: transparent;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;

    .attach-icon {
      font-weight: 700;
      font-size: 14px;
    }

    &:hover {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }

    &.is-active {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }
  }

  &__count {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
  }

  &__uploader {
    margin-top: 8px;
  }
}

// 上传区域过渡动画
.uploader-slide-enter-active,
.uploader-slide-leave-active {
  transition: all 0.25s ease;
}
.uploader-slide-enter-from,
.uploader-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
