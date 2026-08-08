<template>
  <div class="data-settings">
    <h2 class="section-title">数据管理</h2>

    <!-- 清理缓存 -->
    <div class="data-card">
      <div class="data-card-header">
        <h3>缓存</h3>
        <span class="cache-size">计算中...</span>
      </div>
      <p class="data-card-desc">清理应用缓存以释放存储空间，不影响对话历史和数据。</p>
      <el-button :loading="clearing" @click="onClearCache">清理缓存</el-button>
    </div>

    <!-- 导出数据 -->
    <div class="data-card">
      <div class="data-card-header">
        <h3>导出全部数据</h3>
      </div>
      <p class="data-card-desc">下载所有对话记录、设置和附件为 ZIP 文件。</p>
      <el-button :loading="exporting" @click="onExport">导出数据</el-button>
    </div>

    <!-- 删除账户 -->
    <div class="data-card danger">
      <div class="data-card-header">
        <h3>删除账户</h3>
      </div>
      <p class="data-card-desc">永久删除您的账户和所有关联数据。此操作不可撤销。</p>
      <el-button type="danger" :loading="deleting" @click="onDeleteAccount">
        删除账户
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/modules/settings'

const settingsStore = useSettingsStore()

const clearing = ref(false)
const exporting = ref(false)
const deleting = ref(false)

async function onClearCache() {
  clearing.value = true
  try {
    await settingsStore.clearCache()
  } finally {
    clearing.value = false
  }
}

async function onExport() {
  exporting.value = true
  try {
    await settingsStore.exportAllData()
  } finally {
    exporting.value = false
  }
}

async function onDeleteAccount() {
  deleting.value = true
  try {
    await settingsStore.deleteAccount()
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped lang="scss">
.data-settings {
  max-width: 600px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px;
  color: var(--text-primary, #111827);
}

.data-card {
  padding: 20px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  margin-bottom: 16px;

  &.danger {
    border-color: #fca5a5;
    background: #fef2f2;
  }
}

.data-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
}

.cache-size {
  font-size: 13px;
  color: var(--text-muted, #9ca3af);
}

.data-card-desc {
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
  margin: 0 0 12px;
}
</style>
