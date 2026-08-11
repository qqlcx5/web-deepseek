// ─── WebDAV Remote Transport (webdav) ────────────────────────────────────────
// WebDAV client behind the RemoteTransport interface. Uses the /web browser build.

import { createClient } from 'webdav/web'
import type { ConnectionTestResult, RemoteFile, RemoteTransport, WebDAVConfig } from './types'

function normBasePath(basePath: string): string {
  let p = basePath.replace(/\/+$/, '')
  if (!p.startsWith('/')) p = '/' + p
  return p
}

function fullPath(base: string, rel: string): string {
  const b = base === '/' ? '' : base
  const r = rel.startsWith('/') ? rel : '/' + rel
  return b + r
}

/**
 * Create a WebDAV remote transport.
 * basePath defaults to /orbit-chat if empty.
 */
export function createWebDAVRemote(cfg: WebDAVConfig): RemoteTransport {
  const base = normBasePath(cfg.basePath || '/orbit-chat')
  const client = createClient(cfg.url, {
    username: cfg.username || undefined,
    password: cfg.password || undefined,
  })

  async function ensureDir(): Promise<void> {
    // Ensure the base directory exists (create intermediate dirs)
    const exists = await client.exists(base)
    if (!exists) {
      await client.createDirectory(base, { recursive: true })
    }
  }

  return {
    async test(): Promise<ConnectionTestResult> {
      try {
        // Check if the root URL is reachable
        const rootExists = await client.exists('/')
        if (!rootExists) {
          return { ok: false, endpoint: cfg.url, message: 'WebDAV 服务器不可达: / 不存在' }
        }

        // Attempt to create and remove a test directory under basePath
        const testDir = fullPath(base, '/__orbit_test__')
        try {
          await client.createDirectory(testDir, { recursive: true })
        } catch {
          return { ok: false, endpoint: cfg.url, message: `无法在 ${base} 下创建目录，请检查权限` }
        }

        // Clean up test marker
        try {
          await client.deleteFile(testDir)
        } catch {
          // Non-fatal: cleanup failure shouldn't block
        }

        return { ok: true, endpoint: cfg.url, message: 'WebDAV 连接成功' }
      } catch (error) {
        return { ok: false, endpoint: cfg.url, message: error instanceof Error ? error.message : String(error) }
      }
    },

    async hasData(path?: string): Promise<boolean> {
      try {
        const targetPath = path ? fullPath(base, path) : base
        const exists = await client.exists(targetPath)
        if (exists) {
          // If it's a directory, check if it has contents
          if (targetPath === base || targetPath.endsWith('/')) {
            const contents = await client.getDirectoryContents(targetPath)
            return Array.isArray(contents) && contents.some(
              (item: { type: string }) => item.type === 'file',
            )
          }
          return true
        }
        return false
      } catch {
        return false
      }
    },

    async putText(path: string, content: string): Promise<void> {
      await ensureDir()
      const targetPath = fullPath(base, path)
      // Ensure parent directory exists
      const parent = targetPath.slice(0, targetPath.lastIndexOf('/'))
      if (parent && parent !== base) {
        const parentExists = await client.exists(parent)
        if (!parentExists) {
          await client.createDirectory(parent, { recursive: true })
        }
      }
      const result = await client.putFileContents(targetPath, content, {
        contentLength: new TextEncoder().encode(content).length,
        overwrite: true,
      })
      if (result === false) throw new Error(`WebDAV PUT 写入失败: ${targetPath}`)
    },

    async getText(path: string): Promise<string> {
      const targetPath = fullPath(base, path)
      const result = await client.getFileContents(targetPath, { format: 'text' })
      if (typeof result === 'string') return result
      if (Array.isArray(result) && result.length > 0) {
        return (result as { text: string }[]).map(t => t.text).join('\n') || ''
      }
      throw new Error(`WebDAV GET 失败: ${targetPath}`)
    },

    async remove(path: string): Promise<void> {
      const targetPath = fullPath(base, path)
      await client.deleteFile(targetPath)
    },

    async listFiles(): Promise<RemoteFile[]> {
      await ensureDir()
      const raw = await client.getDirectoryContents(base)
      if (!Array.isArray(raw)) return []

      const files: RemoteFile[] = []
      for (const item of raw as { type: string; filename: string; size: number; lastmod: string }[]) {
        if (item.type === 'directory') continue
        files.push({
          path: item.filename.replace(base, '').replace(/^\//, ''),
          size: item.size ?? 0,
          lastModified: item.lastmod ?? '',
        })
      }
      return files
    },
  }
}
