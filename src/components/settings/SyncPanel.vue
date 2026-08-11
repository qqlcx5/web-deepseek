<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Icon } from '@iconify/vue'
import { useSyncStore } from '@/stores/sync'
import { useAppStore } from '@/stores/app'

const syncStore = useSyncStore()
const appStore = useAppStore()

const backupList = ref<string[]>([])
const backupLoading = ref(false)

const statusIcon = {
  idle: 'tabler:cloud-off',
  uploading: 'tabler:cloud-upload',
  downloading: 'tabler:cloud-download',
  restoring: 'tabler:cloud-download',
  synced: 'tabler:cloud-check',
  error: 'tabler:cloud-exclamation',
} as const

const statusText = {
  idle: '未同步',
  uploading: '上传中...',
  downloading: '下载中...',
  restoring: '恢复中...',
  synced: '已同步',
  error: '同步失败',
} as const

async function handleUpload() {
  if (appStore.settings.remoteType === 'none' || appStore.settings.remoteType === undefined) {
    ElMessage.warning('请先配置远端存储')
    return
  }
  try {
    await ElMessageBox.confirm('将上传当前全部数据到远端。确认？', '全量上传', {
      confirmButtonText: '确认上传',
      cancelButtonText: '取消',
      type: 'info',
    })
  } catch {
    return
  }
  await syncStore.upload()
  if (syncStore.status === 'synced') {
    ElMessage.success('上传成功')
    fetchBackups()
  }
}

async function handleDownload() {
  if (appStore.settings.remoteType === 'none' || appStore.settings.remoteType === undefined) {
    ElMessage.warning('请先配置远端存储')
    return
  }
  try {
    await ElMessageBox.confirm(
      '将从远端下载数据覆盖本地。此操作不可撤销。确认？',
      '全量下载',
      { confirmButtonText: '确认下载', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    return
  }
  const result = await syncStore.download()
  if (result.ok) {
    ElMessage.success('下载并应用成功')
  } else {
    ElMessage.error(result.message)
  }
}

async function fetchBackups() {
  backupLoading.value = true
  backupList.value = await syncStore.fetchBackups()
  backupLoading.value = false
}

async function handleRestore(snapshot: string) {
  try {
    await ElMessageBox.confirm(
      `将从快照 "${snapshot}" 恢复数据。当前本地数据将被覆盖。确认？`,
      '恢复快照',
      { confirmButtonText: '确认恢复', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    return
  }
  const result = await syncStore.restoreBackup(snapshot)
  if (result.ok) {
    ElMessage.success(`已从快照 ${snapshot} 恢复`)
  } else {
    ElMessage.error(result.message)
  }
}

function formatTime(ts: number): string {
  if (!ts) return '从未'
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  if (appStore.settings.remoteType && appStore.settings.remoteType !== 'none') {
    fetchBackups()
  }
})
</script>

<template>
  <div class="sync-panel">
    <!-- Status bar -->
    <div class="status-bar" :class="syncStore.status">
      <Icon :icon="statusIcon[syncStore.status]" width="16" />
      <span>{{ statusText[syncStore.status] }}</span>
      <span v-if="syncStore.lastSyncAt" class="last-sync">
        | 上次：{{ formatTime(syncStore.lastSyncAt) }}
      </span>
    </div>

    <!-- Error message -->
    <div v-if="syncStore.status === 'error' && syncStore.message" class="error-msg">
      {{ syncStore.message }}
    </div>

    <!-- Action buttons -->
    <div class="sync-actions">
      <el-button
        size="small"
        type="primary"
        :loading="syncStore.status === 'uploading'"
        :disabled="syncStore.isBusy"
        @click="handleUpload"
      >
        <Icon icon="tabler:cloud-upload" width="14" style="margin-right: 4px;" />
        全量上传
      </el-button>
      <el-button
        size="small"
        :loading="syncStore.status === 'downloading'"
        :disabled="syncStore.isBusy"
        @click="handleDownload"
      >
        <Icon icon="tabler:cloud-download" width="14" style="margin-right: 4px;" />
        全量下载
      </el-button>
    </div>

    <!-- Backup list -->
    <div class="backup-section">
      <div class="backup-header">
        <span class="backup-title">
          <Icon icon="tabler:history" width="14" />
          远端备份 ({{ backupList.length }})
        </span>
        <el-button size="small" text :loading="backupLoading" @click="fetchBackups">
          <Icon icon="tabler:refresh" width="14" />
        </el-button>
      </div>
      <div v-if="backupList.length === 0 && !backupLoading" class="empty">
        暂无备份
      </div>
      <div
        v-for="name in backupList"
        :key="name"
        class="backup-item"
      >
        <span class="backup-name">{{ name }}</span>
        <el-button
          size="small"
          text
          type="warning"
          :disabled="syncStore.isBusy"
          @click="handleRestore(name)"
        >
          恢复
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sync-panel { display: flex; flex-direction: column; gap: 8px; }
.status-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  background: var(--el-fill-color-lighter);
}
.status-bar.synced { color: var(--el-color-success); }
.status-bar.error { color: var(--el-color-danger); }
.status-bar.uploading,
.status-bar.downloading,
.status-bar.restoring { color: var(--el-color-primary); }
.last-sync { color: var(--el-text-color-placeholder); }
.error-msg {
  font-size: 12px;
  color: var(--el-color-danger);
  padding: 4px 8px;
  background: var(--el-color-danger-light-9);
  border-radius: 4px;
}
.sync-actions { display: flex; gap: 8px; }
.backup-section { margin-top: 4px; }
.backup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.backup-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}
.empty { font-size: 11px; color: var(--el-text-color-placeholder); padding: 4px 0; }
.backup-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--el-fill-color-lighter);
  margin-top: 4px;
}
.backup-name { font-size: 12px; color: var(--el-text-color-regular); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
