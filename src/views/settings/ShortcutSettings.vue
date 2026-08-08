<template>
  <div class="shortcut-settings">
    <h2 class="section-title">快捷键</h2>
    <el-form label-width="160px" label-position="left">
      <el-form-item
        v-for="item in settingsStore.shortcuts"
        :key="item.action"
        :label="item.label"
      >
        <div class="shortcut-row">
          <el-input
            :model-value="item.currentKeys"
            readonly
            class="shortcut-input"
            @click="startCapture(item.action)"
          />
          <el-button size="small" @click="startCapture(item.action)">
            编辑
          </el-button>
        </div>
      </el-form-item>
    </el-form>

    <div class="shortcut-actions">
      <el-button @click="settingsStore.resetShortcuts()">重置为默认</el-button>
    </div>

    <!-- 按键捕获弹窗 -->
    <el-dialog
      v-model="captureVisible"
      title="按下快捷键组合"
      width="360px"
      :close-on-click-modal="false"
    >
      <div class="capture-display" ref="captureRef" tabindex="0" @keydown.prevent="onKeyDown">
        <span v-if="captureKeys" class="capture-keys">{{ captureKeys }}</span>
        <span v-else class="capture-placeholder">按下组合键...</span>
      </div>
      <template #footer>
        <el-button @click="captureVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!captureKeys" @click="confirmCapture">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useSettingsStore } from '@/stores/modules/settings'

const settingsStore = useSettingsStore()

const captureVisible = ref(false)
const captureKeys = ref('')
const captureAction = ref('')
const captureRef = ref<HTMLElement | null>(null)

function startCapture(action: string) {
  captureAction.value = action
  captureKeys.value = ''
  captureVisible.value = true
  nextTick(() => {
    captureRef.value?.focus()
  })
}

function onKeyDown(e: KeyboardEvent) {
  const parts: string[] = []
  if (e.ctrlKey) parts.push('Ctrl')
  if (e.metaKey) parts.push('Meta')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')

  // 排除单独按修饰键
  const key = e.key
  if (['Control', 'Meta', 'Alt', 'Shift'].includes(key)) {
    if (parts.length === 0) return
  } else if (key === 'Escape') {
    captureKeys.value = 'Escape'
    return
  } else if (key === 'Enter') {
    // Enter 不触发确认，只是记录
    parts.push('Enter')
    captureKeys.value = parts.join('+')
    return
  } else {
    parts.push(key)
  }

  captureKeys.value = parts.join('+')
}

function confirmCapture() {
  if (captureKeys.value && captureAction.value) {
    settingsStore.updateShortcut(captureAction.value, captureKeys.value)
  }
  captureVisible.value = false
}
</script>

<style scoped lang="scss">
.shortcut-settings {
  max-width: 600px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px;
  color: var(--text-primary, #111827);
}

.shortcut-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.shortcut-input {
  width: 180px;
  cursor: pointer;

  :deep(input) {
    cursor: pointer;
  }
}

.shortcut-actions {
  margin-top: 24px;
}

.capture-display {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  border: 2px dashed var(--border-color, #d1d5db);
  border-radius: 8px;
  outline: none;
  background: var(--bg-secondary, #f9fafb);
}

.capture-keys {
  font-size: 22px;
  font-weight: 600;
  color: var(--color-primary, #3b82f6);
}

.capture-placeholder {
  font-size: 14px;
  color: var(--text-muted, #9ca3af);
}
</style>
