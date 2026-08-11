<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Icon } from '@iconify/vue'
import { useAppStore } from '@/stores/app'
import { useSearchStore } from '@/stores/search'
import { useSyncStore } from '@/stores/sync'

const appStore = useAppStore()
const searchStore = useSearchStore()
const syncStore = useSyncStore()

const exporting = ref(false)
const importing = ref(false)
const rebuilding = ref(false)
const clearing = ref(false)
const includeKeysExport = ref(false)

// Storage statistics
const stats = computed(() => {
  const data = appStore.buildData()
  const jsonStr = JSON.stringify(data)
  const estimatedBytes = new TextEncoder().encode(jsonStr).length
  const topicsRelated = appStore.topics.reduce((sum, t) => sum + t.messages.length, 0)
  return {
    providers: appStore.providers.length,
    assistants: appStore.assistants.length,
    topics: appStore.topics.length,
    messagesOnTopics: topicsRelated,
    estimatedSize: estimatedBytes < 1_048_576
      ? `${(estimatedBytes / 1024).toFixed(1)} KB`
      : `${(estimatedBytes / 1_048_576).toFixed(1)} MB`,
    indexDocs: searchStore.docCount,
    indexReady: searchStore.indexReady,
  }
})

function formatTime(ts: number): string {
  if (!ts) return '从未'
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function handleExport() {
  exporting.value = true
  try {
    const result = appStore.exportData({ includeApiKeys: includeKeysExport.value })
    if (result.ok) {
      ElMessage.success('数据已导出')
    } else {
      ElMessage.warning(`导出校验失败：${result.errors.join('；')}`)
    }
  } finally {
    exporting.value = false
  }
}

function handleImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    importing.value = true
    try {
      const result = await appStore.importData(file)
      if (result.ok) {
        const r = result.report
        ElMessage.success(
          `导入成功：${r.providerCount} 个 Provider，${r.assistantCount} 个 Assistant，${r.topicCount} 个话题`,
        )
      } else {
        ElMessage.error(`导入失败：${result.error}`)
      }
    } catch {
      ElMessage.error('导入失败：文件格式错误')
    } finally {
      importing.value = false
    }
  }
  input.click()
}

async function handleRebuildIndex() {
  try {
    await ElMessageBox.confirm('将清空并重建全文搜索索引。确认？', '重建索引', {
      confirmButtonText: '确认重建',
      cancelButtonText: '取消',
      type: 'info',
    })
  } catch {
    return
  }
  rebuilding.value = true
  try {
    searchStore.rebuild()
    ElMessage.success('索引重建完成')
  } catch (e) {
    ElMessage.error(`重建失败: ${e instanceof Error ? e.message : String(e)}`)
  } finally {
    rebuilding.value = false
  }
}

async function handleClearAll() {
  try {
    await ElMessageBox.confirm(
      '将清空所有本地数据（Provider、Assistant、话题、消息）。此操作不可撤销！',
      '清空本地数据',
      { confirmButtonText: '确认清空', cancelButtonText: '取消', type: 'error', confirmButtonClass: 'el-button--danger' },
    )
  } catch {
    return
  }
  clearing.value = true
  try {
    appStore.providers = []
    appStore.assistants = []
    appStore.topics = []
    await appStore.save()
    searchStore.onClear()
    ElMessage.success('本地数据已清空')
  } catch (e) {
    ElMessage.error(`清空失败: ${e instanceof Error ? e.message : String(e)}`)
  } finally {
    clearing.value = false
  }
}
</script>

<template>
  <div class="data-manager">
    <!-- Statistics cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">{{ stats.providers }}</span>
        <span class="stat-label">Provider</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.assistants }}</span>
        <span class="stat-label">Assistant</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.topics }}</span>
        <span class="stat-label">话题</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.messagesOnTopics }}</span>
        <span class="stat-label">消息</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.indexDocs }}</span>
        <span class="stat-label">索引文档</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.estimatedSize }}</span>
        <span class="stat-label">预估占用</span>
      </div>
    </div>
    <div class="last-update">
      最近同步：{{ formatTime(syncStore.lastSyncAt) }}
    </div>

    <!-- Import / Export -->
    <div class="section-title">
      <Icon icon="tabler:file-import" width="14" />
      数据导入导出
    </div>
    <p class="note">
      导出 / 备份使用相同格式（Cherry Studio v5 兼容 JSON）。默认不含 API Key。
    </p>
    <div class="action-row">
      <div class="export-group">
        <el-checkbox v-model="includeKeysExport" size="small">
          导出含 API Key
        </el-checkbox>
        <el-button size="small" :loading="exporting" @click="handleExport">
          <Icon icon="tabler:download" width="14" style="margin-right: 4px;" />
          导出数据
        </el-button>
      </div>
      <el-button size="small" :loading="importing" @click="handleImport">
        <Icon icon="tabler:upload" width="14" style="margin-right: 4px;" />
        导入数据
      </el-button>
    </div>

    <!-- Maintenance -->
    <div class="section-title">
      <Icon icon="tabler:tool" width="14" />
      维护
    </div>
    <div class="action-row">
      <el-button size="small" :loading="rebuilding" @click="handleRebuildIndex">
        <Icon icon="tabler:refresh" width="14" style="margin-right: 4px;" />
        重建搜索索引
      </el-button>
      <el-button size="small" type="danger" :loading="clearing" @click="handleClearAll">
        <Icon icon="tabler:trash" width="14" style="margin-right: 4px;" />
        清空本地数据
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.data-manager { display: flex; flex-direction: column; gap: 10px; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}
.stat-value { font-size: 18px; font-weight: 700; color: var(--el-color-primary); }
.stat-label { font-size: 10px; color: var(--el-text-color-placeholder); }
.last-update { font-size: 11px; color: var(--el-text-color-placeholder); }
.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}
.note { font-size: 11px; color: var(--el-text-color-placeholder); margin: 0; }
.action-row { display: flex; gap: 8px; }
.export-group { display: flex; align-items: center; gap: 6px; }
</style>
