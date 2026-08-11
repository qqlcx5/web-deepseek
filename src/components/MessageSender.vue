<script setup lang="ts">
import { ref, computed } from 'vue'
import { XSender } from 'vue-element-plus-x'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'

const app = useAppStore()
const emit = defineEmits<{ send: [text: string] }>()

// XSender 不支持 v-model（Props 无 modelValue），值通过 ref.getModelValue() 获取（见 wiki submit-type 示例）
const senderRef = ref<any>(null)
const loading = ref(false)

const selectedModelName = computed(() => app.activeAssistant?.model?.name ?? 'GPT-4o')

// XSender MentionConfig：options 是 { id, name }
const mentionConfig = computed(() => ({
  dialogTitle: '提及助手',
  options: app.assistants.map(a => ({ id: a.id, name: `${a.emoji} ${a.name}` })),
}))

// XSender TriggerConfig：dialogTitle + key + options[{id,name}]
const triggerConfig = computed(() => [
  {
    dialogTitle: '快捷指令',
    key: '/',
    options: [
      { id: '/clear', name: '清空对话' },
      { id: '/export', name: '导出对话' },
      { id: '/model', name: '切换模型' },
      { id: '/rename', name: '重命名话题' },
    ],
  },
])

// XSender submit 事件无参，用 getModelValue() 取值、setModelValue() 清空
function onSubmit() {
  const value: string = senderRef.value?.getModelValue?.() ?? ''
  if (!value?.trim() || loading.value) return
  emit('send', value.trim())
  senderRef.value?.setModelValue?.('')
}

function onCancel() {
  loading.value = false
  ElMessage.info('已取消')
}
</script>

<template>
  <div class="sender-wrap">
    <!-- 不用 #action-list 插槽：它会隐藏 XSender 内置操作按钮（发送/附件/清空） -->
    <XSender
      ref="senderRef"
      :loading="loading"
      :auto-focus="true"
      :submit-type="app.settings.sendMessageShortcut === 'Enter' ? 'enter' : 'shiftEnter'"
      placeholder="输入消息，按 Enter 发送 · @ 提及 · / 指令"
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
