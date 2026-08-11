<script setup lang="ts">
import { ref, computed } from 'vue'
import { XSender } from 'vue-element-plus-x'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'

const app = useAppStore()
const emit = defineEmits<{ send: [text: string] }>()

const inputValue = ref('')
const loading = ref(false)

const selectedModelName = computed(() => app.activeAssistant?.model?.name ?? 'GPT-4o')

// Mention config — @ 触发模型/助手选择
const mentionConfig = {
  trigger: '@',
  options: app.assistants.map(a => ({
    label: `${a.emoji} ${a.name}`,
    value: a.id,
  })),
}

// Trigger config — / 触发指令
const triggerConfig = [
  {
    key: 'slash',
    trigger: '/',
    options: [
      { label: '清空对话', value: '/clear' },
      { label: '导出对话', value: '/export' },
      { label: '切换模型', value: '/model' },
      { label: '重命名话题', value: '/rename' },
    ],
  },
]

function onSubmit(value: string) {
  if (!value?.trim() || loading.value) return
  emit('send', value.trim())
  inputValue.value = ''
}

function onCancel() {
  loading.value = false
  ElMessage.info('已取消')
}

// Token 估算（粗略）
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

const tokenEstimate = computed(() => estimateTokens(inputValue.value))
</script>

<template>
  <div class="sender-wrap">
    <div v-if="app.settings.showInputEstimatedTokens && inputValue" class="token-hint">
      ≈ {{ tokenEstimate }} tokens
    </div>

    <XSender
      v-model="inputValue"
      :loading="loading"
      :disabled="false"
      :auto-focus="true"
      :submit-type="app.settings.sendMessageShortcut === 'Enter' ? 'enter' : 'shift-enter'"
      placeholder="输入消息，按 Enter 发送 · Shift + Enter 换行 · @ 提及 · / 指令"
      :clearable="true"
      :mention-config="mentionConfig"
      :trigger-config="triggerConfig"
      @submit="onSubmit"
      @cancel="onCancel"
    />

    <div class="sender-footer">
      <div class="footer-left">
        <span class="model-badge">{{ selectedModelName }}</span>
        <span v-if="app.activeAssistant" class="assistant-badge">
          {{ app.activeAssistant.emoji }} {{ app.activeAssistant.name }}
        </span>
      </div>
      <div class="footer-right">
        <span class="footer-hint">Orbit Chat 可能生成不准确信息</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sender-wrap {
  position: relative;
  max-width: 820px;
  margin: 0 auto;
}

.token-hint {
  position: absolute;
  top: -24px;
  right: 8px;
  font-size: 11px;
  color: #9ca3af;
}

.sender-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding: 0 4px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.model-badge {
  font-size: 11px;
  color: #5b56d6;
  background: #efefff;
  padding: 2px 8px;
  border-radius: 4px;
}

.assistant-badge {
  font-size: 11px;
  color: #667085;
}

.footer-hint {
  font-size: 11px;
  color: #9ca3af;
}
</style>
