<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useAppStore } from '@/stores/app'
import S3Settings from './S3Settings.vue'
import WebDAVSettings from './WebDAVSettings.vue'
import type { S3Config, WebDAVConfig } from '@/services/remote/types'

const appStore = useAppStore()

const remoteType = computed({
  get: () => (appStore.settings.remoteType as 'none' | 's3' | 'webdav') ?? 'none',
  set: (v: 'none' | 's3' | 'webdav') => appStore.updateSettings({ remoteType: v }),
})

const s3Config = computed({
  get: () => appStore.settings.remote?.s3 ?? { endpoint: '', region: '', bucket: '', accessKeyId: '', secretAccessKey: '', basePath: '', forcePathStyle: false },
  set: (v: S3Config) => appStore.updateSettings({ remote: { ...appStore.settings.remote, s3: v } }),
})

const webdavConfig = computed({
  get: () => appStore.settings.remote?.webdav ?? { url: '', username: '', password: '', basePath: '' },
  set: (v: WebDAVConfig) => appStore.updateSettings({ remote: { ...appStore.settings.remote, webdav: v } }),
})

const autoSync = computed({
  get: () => appStore.settings.webdavAutoSync ?? false,
  set: (v) => appStore.updateSettings({ webdavAutoSync: v }),
})

const autoSyncInterval = computed({
  get: () => appStore.settings.webdavAutoSyncInterval ?? 30,
  set: (v) => appStore.updateSettings({ webdavAutoSyncInterval: v }),
})
</script>

<template>
  <div class="storage-settings">
    <div class="form-row">
      <label>远端存储类型</label>
      <el-select
        :model-value="remoteType"
        size="small"
        style="width: 160px;"
        @change="(v: string) => remoteType = v as 'none' | 's3' | 'webdav'"
      >
        <el-option value="none" label="不使用" />
        <el-option value="s3" label="Amazon S3" />
        <el-option value="webdav" label="WebDAV" />
      </el-select>
    </div>

    <template v-if="remoteType === 's3'">
      <div class="subsection">
        <div class="subsection-title">
          <Icon icon="tabler:cloud" width="14" />
          S3 配置
        </div>
        <S3Settings v-model="s3Config" />
      </div>
    </template>

    <template v-if="remoteType === 'webdav'">
      <div class="subsection">
        <div class="subsection-title">
          <Icon icon="tabler:folder-cloud" width="14" />
          WebDAV 配置
        </div>
        <WebDAVSettings
          v-model="webdavConfig"
          :auto-sync="autoSync"
          :auto-sync-interval="autoSyncInterval"
          @update:auto-sync="autoSync = $event"
          @update:auto-sync-interval="autoSyncInterval = $event"
        />
      </div>
    </template>

    <p v-if="remoteType !== 'none'" class="note">
      配置后可在同步操作中上传 / 下载数据。导出 / 备份均为 Cherry Studio v5 兼容格式。
    </p>
  </div>
</template>

<style scoped>
.storage-settings { display: flex; flex-direction: column; gap: 8px; }
.form-row { display: flex; align-items: center; gap: 8px; }
.form-row label { width: 100px; font-size: 12px; color: var(--el-text-color-secondary); flex-shrink: 0; text-align: right; }
.subsection { margin-top: 4px; padding: 8px 12px; background: var(--el-fill-color-lighter); border-radius: 8px; }
.subsection-title { font-size: 12px; font-weight: 600; color: var(--el-text-color-regular); margin-bottom: 6px; display: flex; align-items: center; gap: 4px; }
.note { font-size: 11px; color: var(--el-text-color-placeholder); margin: 0; }
</style>
