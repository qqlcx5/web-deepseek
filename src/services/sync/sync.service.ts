// ─── Sync Service ───────────────────────────────────────────────────────────
// Full-snapshot upload / download on top of RemoteTransport (S3 / WebDAV).
// Backup = Cherry export JSON (same format as import/export).

import type { RemoteTransport } from '@/services/remote/types'
import { createS3Remote } from '@/services/remote/s3.client'
import { createWebDAVRemote } from '@/services/remote/webdav.client'
import type { AppData, Settings } from '@/types'
import { buildExportJSON, type ExportOptions } from '@/utils/cherry-export'
import { parseDataJSON } from '@/utils/cherry-parser'
import { buildAppData } from '@/utils/data-import'
import { backupCurrent, pruneBackups } from './backup'

export interface SyncResult {
  ok: boolean
  message: string
  direction: 'upload' | 'download'
}

export interface DownloadResult {
  ok: boolean
  message: string
  data?: AppData
}

// ─── Transport factory ─────────────────────────────────────────────────────

/**
 * Create a RemoteTransport based on Settings.remote and the active remoteType.
 * Returns null if neither S3 nor WebDAV is configured.
 */
export function createTransport(settings: Settings): RemoteTransport | null {
  const { remoteType } = settings
  if (remoteType === 's3' && settings.remote.s3.endpoint) {
    return createS3Remote(settings.remote.s3)
  }
  if (remoteType === 'webdav' && settings.remote.webdav.url) {
    return createWebDAVRemote(settings.remote.webdav)
  }
  return null
}

// ─── Upload ─────────────────────────────────────────────────────────────────

/**
 * Serialise AppData as Cherry v5 JSON and upload to remote as data.json.
 * Before uploading, backs up any existing remote data.json as a timestamped snapshot.
 * After upload, prunes old backups to keep at most 10.
 */
export async function forceUpload(
  transport: RemoteTransport,
  data: AppData,
  options: ExportOptions = {},
): Promise<SyncResult> {
  // Connectivity check
  const testResult = await transport.test()
  if (!testResult.ok) return { ok: false, message: `远端连接失败: ${testResult.message}`, direction: 'upload' }

  // Backup old data.json if it exists
  const hasExisting = await transport.hasData('data.json')
  if (hasExisting) {
    await backupCurrent(transport)
  }

  // Serialize and upload
  const json = JSON.stringify(buildExportJSON(data, options))
  await transport.putText('data.json', json)

  // Prune old backups
  await pruneBackups(transport, 10)

  return { ok: true, message: '上传成功', direction: 'upload' }
}

// ─── Download ───────────────────────────────────────────────────────────────

/**
 * Download Cherry v5 JSON from remote data.json, parse, validate, and return AppData.
 * Safety gate: aborts if remote entity counts are dramatically lower than local
 * (protects against accidentally connecting to an empty remote and losing local data).
 */
export async function forceDownload(
  transport: RemoteTransport,
  localData: AppData,
): Promise<DownloadResult> {
  // Connectivity check
  const testResult = await transport.test()
  if (!testResult.ok) return { ok: false, message: `远端连接失败: ${testResult.message}` }

  // Check if data exists
  const exists = await transport.hasData('data.json')
  if (!exists) return { ok: false, message: '远端暂无备份数据，请先执行上传。' }

  // Fetch remote data
  const json = await transport.getText('data.json')

  // Parse the Cherry JSON
  const parsed = parseDataJSON(json)
  if (!parsed.ok || !parsed.data) return { ok: false, message: `远端数据解析失败: ${parsed.error}` }

  const remoteData = buildAppData(parsed.data)

  // ── Safety gate ──
  // Compare local vs remote entity counts. If remote is much smaller, abort.
  const localTopics = localData.topics.length
  const localMessages = localData.topics.reduce((sum, t) => sum + t.messages.length, 0)
  const remoteTopics = remoteData.topics.length
  const remoteMessages = remoteData.topics.reduce((sum, t) => sum + t.messages.length, 0)

  const SAFEGUARD_RATIO = 0.1
  if (localTopics > 0 && remoteTopics < localTopics * SAFEGUARD_RATIO) {
    return {
      ok: false,
      message: `安全闸触发：远端对话(${remoteTopics}) 远少于本地(${localTopics})，疑似空库。请确认远端配置或使用「全量上传」覆盖。`,
    }
  }
  if (localMessages > 0 && remoteMessages < localMessages * SAFEGUARD_RATIO) {
    return {
      ok: false,
      message: `安全闸触发：远端消息(${remoteMessages}) 远少于本地(${localMessages})，疑似空库。请确认远端配置或使用「全量上传」覆盖。`,
    }
  }

  return { ok: true, message: '下载成功', data: remoteData }
}
