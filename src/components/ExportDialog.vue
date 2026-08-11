<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { exportToCherryV5, validateForExport } from '@/utils/exporter'

const app = useAppStore()
const visible = ref(false)
const includeApiKey = ref(false)
const exporting = ref(false)

const validation = computed(() => {
  return validateForExport(app.getAppData())
})

const overview = computed(() => {
  const d = app.getAppData()
  return {
    providers: d.providers.length,
    assistants: d.assistants.length,
    topics: d.topics.length,
    messages: d.topics.reduce((sum, t) => sum + t.messages.length, 0),
  }
})

function open() {
  visible.value = true
  includeApiKey.value = false
  exporting.value = false
}

function doExport() {
  if (!validation.value.valid) {
    ElMessage.warning('存在引用校验问题，请先修复后再导出')
    return
  }

  exporting.value = true
  try {
    const appData = app.getAppData()
    const json = exportToCherryV5(appData, { includeApiKey: includeApiKey.value })

    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    const fileName = `orbit-chat-export-${ts}.json`

    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
    visible.value = false
  } catch (e) {
    ElMessage.error(`导出失败: ${(e as Error).message}`)
  } finally {
    exporting.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <el-dialog v-model="visible" title="导出为 Cherry Studio v5 格式" width="640px" :close-on-click-modal="false">
    <div class="export-dialog-body">
      <!-- 数据概览 -->
      <div class="section">
        <div class="section-title">数据概览</div>
        <div class="overview-grid">
          <div class="overview-item">
            <span class="overview-label">Provider</span>
            <span class="overview-value">{{ overview.providers }}</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">Assistant</span>
            <span class="overview-value">{{ overview.assistants }}</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">Topic</span>
            <span class="overview-value">{{ overview.topics }}</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">Message</span>
            <span class="overview-value">{{ overview.messages }}</span>
          </div>
        </div>
      </div>

      <!-- 选项 -->
      <div class="section">
        <div class="section-title">导出选项</div>
        <label class="checkbox-row">
          <input type="checkbox" v-model="includeApiKey" />
          <span class="checkbox-label">包含 API Key</span>
          <span class="checkbox-hint">（默认不包含，建议仅在本地备份时勾选）</span>
        </label>
      </div>

      <!-- 校验问题 -->
      <div v-if="!validation.valid" class="section">
        <div class="section-title error-title">引用校验问题 ({{ validation.issues.length }})</div>
        <div class="issue-list">
          <div v-for="(issue, i) in validation.issues" :key="i" class="issue-item">
            {{ issue }}
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="btn btn-secondary" @click="visible = false">取消</button>
      <button
        class="btn btn-primary"
        :disabled="exporting || !validation.valid"
        @click="doExport"
      >
        {{ exporting ? '导出中...' : '导出 JSON' }}
      </button>
    </template>
  </el-dialog>
</template>

<style scoped>
.export-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.error-title {
  color: var(--el-color-danger);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.overview-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}

.overview-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.overview-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
}

.checkbox-row input[type="checkbox"] {
  cursor: pointer;
}

.checkbox-label {
  color: var(--el-text-color-primary);
}

.checkbox-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.issue-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.issue-item {
  font-size: 12px;
  color: var(--el-color-danger);
  padding: 4px 8px;
  background: var(--el-color-danger-light-9);
  border-radius: 4px;
}

.btn {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid var(--el-border-color);
  transition: all 0.2s;
}

.btn-secondary {
  background: var(--el-fill-color-blank);
  color: var(--el-text-color-primary);
}

.btn-secondary:hover {
  border-color: var(--el-color-primary);
}

.btn-primary {
  background: var(--el-color-primary);
  color: #fff;
  border-color: var(--el-color-primary);
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
