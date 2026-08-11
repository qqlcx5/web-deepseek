// ─── Sync Store ────────────────────────────────────────────────────────────
// UI state for sync operations: status, progress, preview, auto-sync control.

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAppStore } from '@/stores/app'
import type { AppData } from '@/types'
import { createTransport, forceUpload, forceDownload, type DownloadResult, type SyncResult } from '@/services/sync/sync.service'
import { listBackups, restoreFromSnapshot, pruneBackups } from '@/services/sync/backup'
import { parseDataJSON } from '@/utils/cherry-parser'
import { buildAppData } from '@/utils/data-import'

export type SyncStatus = 'idle' | 'uploading' | 'downloading' | 'restoring' | 'synced' | 'error'

const SYNC_META_KEY = 'orbit-sync-meta'

interface PersistedSyncMeta {
  lastSyncAt: number
}

function loadSyncMeta(): PersistedSyncMeta {
  try {
    const raw = localStorage.getItem(SYNC_META_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { lastSyncAt: typeof parsed.lastSyncAt === 'number' ? parsed.lastSyncAt : 0 }
    }
  } catch { /* ignore corrupt data */ }
  return { lastSyncAt: 0 }
}

function saveSyncMeta(meta: PersistedSyncMeta): void {
  localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta))
}

export const useSyncStore = defineStore('sync', () => {
  const meta = loadSyncMeta()

  const lastSyncAt = ref<number>(meta.lastSyncAt)
  const status = ref<SyncStatus>('idle')
  const message = ref('')
  const backupCount = ref(0)
  const backupNames = ref<string[]>([])

  // Auto-sync
  let autoSyncTimer: ReturnType<typeof setInterval> | null = null

  const isBusy = computed(() =>
    status.value === 'uploading' || status.value === 'downloading' || status.value === 'restoring',
  )

  // ── Persistence ──

  function persistLastSync(timestamp: number = Date.now()) {
    lastSyncAt.value = timestamp
    saveSyncMeta({ lastSyncAt: timestamp })
  }

  // ── Transport helper ──

  function getTransport() {
    const app = useAppStore()
    if (!app.loaded) return null
    return createTransport(app.settings)
  }

  // ── Upload ──

  async function upload(includeApiKeys = false): Promise<SyncResult> {
    const transport = getTransport()
    if (!transport) {
      const result: SyncResult = { ok: false, message: '未配置远端存储（S3 或 WebDAV）', direction: 'upload' }
      status.value = 'error'
      message.value = result.message
      return result
    }

    status.value = 'uploading'
    message.value = '正在上传...'

    const app = useAppStore()
    const result = await forceUpload(transport, app.buildData(), { includeApiKeys })

    if (result.ok) {
      persistLastSync()
      status.value = 'synced'
    } else {
      status.value = 'error'
    }
    message.value = result.message
    return result
  }

  // ── Download ──

  async function download(): Promise<DownloadResult> {
    const transport = getTransport()
    if (!transport) {
      const result: DownloadResult = { ok: false, message: '未配置远端存储（S3 或 WebDAV）' }
      status.value = 'error'
      message.value = result.message
      return result
    }

    status.value = 'downloading'
    message.value = '正在下载...'

    const app = useAppStore()
    const localData = app.buildData()
    const result = await forceDownload(transport, localData)

    if (result.ok && result.data) {
      // Apply downloaded data to store
      applyAppData(result.data)
      persistLastSync()
      status.value = 'synced'
    } else {
      status.value = 'error'
    }
    message.value = result.message
    return result
  }

  // ── Apply downloaded AppData ──

  function applyAppData(data: AppData): void {
    const app = useAppStore()
    app.providers = data.providers
    app.assistants = data.assistants
    app.topics = data.topics
    app.settings = { ...app.settings, ...data.settings }
    void app.save()
  }

  // ── Backup management ──

  async function fetchBackups(): Promise<string[]> {
    const transport = getTransport()
    if (!transport) {
      backupNames.value = []
      backupCount.value = 0
      return []
    }
    const names = await listBackups(transport)
    backupNames.value = names
    backupCount.value = names.length
    return names
  }

  async function restoreBackup(snapshotName: string): Promise<SyncResult> {
    const transport = getTransport()
    if (!transport) {
      return { ok: false, message: '未配置远端存储', direction: 'download' }
    }

    status.value = 'restoring'
    message.value = `正在从快照 ${snapshotName} 恢复...`

    try {
      const json = await restoreFromSnapshot(transport, snapshotName)
      const parsed = parseDataJSON(json)
      if (!parsed.ok || !parsed.data) {
        status.value = 'error'
        message.value = `快照解析失败: ${parsed.error}`
        return { ok: false, message: message.value, direction: 'download' }
      }
      const data = buildAppData(parsed.data)
      applyAppData(data)

      status.value = 'synced'
      message.value = `已从快照 ${snapshotName} 恢复`
      persistLastSync()
      return { ok: true, message: message.value, direction: 'download' }
    } catch (error) {
      status.value = 'error'
      message.value = error instanceof Error ? error.message : String(error)
      return { ok: false, message: message.value, direction: 'download' }
    }
  }

  async function pruneSnapshots(max = 10): Promise<string[]> {
    const transport = getTransport()
    if (!transport) return []
    const deleted = await pruneBackups(transport, max)
    await fetchBackups()
    return deleted
  }

  // ── Auto-sync ──

  function startAutoSync(intervalMinutes: number): void {
    stopAutoSync()
    if (intervalMinutes <= 0) return

    autoSyncTimer = setInterval(() => {
      const app = useAppStore()
      if (app.settings.remoteType !== 'none') {
        void upload()
      }
    }, intervalMinutes * 60 * 1000)
  }

  function stopAutoSync(): void {
    if (autoSyncTimer !== null) {
      clearInterval(autoSyncTimer)
      autoSyncTimer = null
    }
  }

  return {
    lastSyncAt,
    status,
    message,
    backupCount,
    backupNames,
    isBusy,
    upload,
    download,
    fetchBackups,
    restoreBackup,
    pruneSnapshots,
    startAutoSync,
    stopAutoSync,
  }
})

