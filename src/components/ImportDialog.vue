<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { parseCherryV5 } from '@/utils/importer'
import type { AppData } from '@/types'

const app = useAppStore()
const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ 'update:visible': [val: boolean] }>()

const visible = computed({
  get: () => props.visible,
  set: (v: boolean) => emit('update:visible', v),
})

const fileName = ref('')
const fileContent = ref('')
const parseResult = ref<{ data?: AppData; warnings: string[]; errors: string[] } | null>(null)
const importing = ref(false)

const preview = computed(() => {
  if (!parseResult.value?.data) return null
  const d = parseResult.value.data
  return {
    providers: d.providers.length,
    assistants: d.assistants.length,
    topics: d.topics.length,
    messages: d.topics.reduce((sum, t) => sum + t.messages.length, 0),
    warnings: parseResult.value.warnings.length,
  }
})

function reset() {
  fileName.value = ''
  fileContent.value = ''
  parseResult.value = null
  importing.value = false
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  fileName.value = file.name
  const reader = new FileReader()
  reader.onload = () => {
    fileContent.value = reader.result as string
    doParse()
  }
  reader.onerror = () => {
    ElMessage.error('文件读取失败')
  }
  reader.readAsText(file)
}

function doParse() {
  parseResult.value = parseCherryV5(fileContent.value)
  if (parseResult.value.errors.length > 0) {
    ElMessage.error(`解析失败: ${parseResult.value.errors[0]}`)
  }
}

function confirmImport() {
  if (!parseResult.value?.data) {
    ElMessage.warning('没有可导入的数据')
    return
  }
  importing.value = true
  try {
    app.setAppData(parseResult.value.data)
    ElMessage.success('导入成功')
    visible.value = false
    reset()
  } catch (e) {
    ElMessage.error(`导入失败: ${(e as Error).message}`)
  } finally {
    importing.value = false
  }
}

defineExpose({ reset })
</script>

<template>
  <el-dialog v-model="visible" title="导入 Cherry Studio v5 数据" width="640px" :close-on-click-modal="false">
    <div class="import-dialog-body">
      <!-- 文件选择 -->
      <div class="file-section">
        <input type="file" accept=".json" @change="handleFileSelect" class="file-input" />
        <span v-if="fileName" class="file-name">{{ fileName }}</span>
      </div>

      <!-- 错误列表 -->
      <div v-if="parseResult?.errors.length" class="error-section">
        <div class="section-title error-title">错误 ({{ parseResult.errors.length }})</div>
        <ul class="error-list">
          <li v-for="(err, i) in parseResult.errors" :key="i">{{ err }}</li>
        </ul>
      </div>

      <!-- 预览信息 -->
      <div v-if="preview" class="preview-section">
        <div class="section-title">数据预览</div>
        <div class="preview-grid">
          <div class="preview-item">
            <span class="preview-label">Provider</span>
            <span class="preview-value">{{ preview.providers }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Assistant</span>
            <span class="preview-value">{{ preview.assistants }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Topic</span>
            <span class="preview-value">{{ preview.topics }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Message</span>
            <span class="preview-value">{{ preview.messages }}</span>
          </div>
          <div class="preview-item" v-if="preview.warnings > 0">
            <span class="preview-label">Warning</span>
            <span class="preview-value warning-value">{{ preview.warnings }}</span>
          </div>
        </div>
      </div>

      <!-- 警告列表 -->
      <div v-if="parseResult?.warnings.length" class="warning-section">
        <div class="section-title warning-title">警告 ({{ parseResult.warnings.length }})</div>
        <div class="warning-list">
          <div v-for="(w, i) in parseResult.warnings" :key="i" class="warning-item">{{ w }}</div>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="btn btn-secondary" @click="visible = false">取消</button>
      <button
        class="btn btn-primary"
        :disabled="!parseResult?.data || importing || parseResult.errors.length > 0"
        @click="confirmImport"
      >
        {{ importing ? '导入中...' : '确认导入' }}
      </button>
    </template>
  </el-dialog>
</template>

<style scoped>
.import-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.file-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-input {
  font-size: 13px;
}

.file-name {
  color: var(--el-color-primary);
  font-size: 13px;
}

.section-title {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
}

.error-title { color: var(--el-color-danger); }
.warning-title { color: var(--el-color-warning); }

.error-list {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: var(--el-color-danger);
}

.error-list li {
  margin-bottom: 4px;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}

.preview-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.preview-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.warning-value {
  color: var(--el-color-warning);
}

.warning-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.warning-item {
  font-size: 12px;
  color: var(--el-color-warning);
  padding: 4px 8px;
  background: var(--el-color-warning-light-9);
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
