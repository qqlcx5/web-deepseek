// ─── S3 Remote Transport (aws4fetch) ────────────────────────────────────────
// SigV4-authenticated S3 / S3-compatible client behind the RemoteTransport interface.

import { AwsClient } from 'aws4fetch'
import type { ConnectionTestResult, RemoteFile, RemoteTransport, S3Config } from './types'

function normBasePath(basePath: string): string {
  let p = basePath.replace(/\/+$/, '')
  if (!p.startsWith('/')) p = '/' + p
  return p
}

function s3Url(cfg: S3Config, key: string): string {
  const ep = cfg.endpoint.replace(/\/+$/, '')
  const encodedKey = key.replace(/[^/]/g, (char) => {
    // Minimal URL encoding for S3 key characters outside unreserved set
    if (/[A-Za-z0-9\-_.~!*'()/]/.test(char)) return char
    return '%' + char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')
  })
  if (cfg.forcePathStyle) {
    return `${ep}/${cfg.bucket}/${encodedKey}`
  }
  // Virtual-hosted: bucket as subdomain
  const url = new URL(ep)
  url.hostname = `${cfg.bucket}.${url.hostname}`
  return `${url.toString().replace(/\/+$/, '')}/${encodedKey}`
}

function s3BaseUrl(cfg: S3Config): string {
  const ep = cfg.endpoint.replace(/\/+$/, '')
  if (cfg.forcePathStyle) {
    return `${ep}/${cfg.bucket}`
  }
  const url = new URL(ep)
  url.hostname = `${cfg.bucket}.${url.hostname}`
  return url.toString().replace(/\/+$/, '')
}

/**
 * Create an S3 remote transport.
 * basePath defaults to /orbit-chat if empty.
 */
export function createS3Remote(cfg: S3Config): RemoteTransport {
  const base = normBasePath(cfg.basePath || '/orbit-chat')

  const client = new AwsClient({
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
    region: cfg.region || 'us-east-1',
    service: 's3',
  })

  function prefixedKey(path: string): string {
    const rel = path.replace(/^\/+/, '')
    return base === '/' ? rel : `${base.replace(/^\//, '')}/${rel}`
  }

  function stripPrefix(key: string): string {
    if (base === '/') return key
    const prefix = base.replace(/^\//, '') + '/'
    if (key.startsWith(prefix)) return key.slice(prefix.length)
    return key
  }

  // ─── XML helpers ───
  function parseListObjectsXml(xml: string): { files: RemoteFile[]; isTruncated: boolean; nextContinuationToken?: string } {
    const files: RemoteFile[] = []
    const keyRe = /<Key>([^<]+)<\/Key>/g
    const sizeRe = /<Size>(\d+)<\/Size>/g
    const lmRe = /<LastModified>([^<]+)<\/LastModified>/g
    const ctRe = /<NextContinuationToken>([^<]+)<\/NextContinuationToken>/
    const truncatedRe = /<IsTruncated>(true|false)<\/IsTruncated>/

    const keys: string[] = []
    for (let m = keyRe.exec(xml); m; m = keyRe.exec(xml)) {
      keys.push(m[1]!)
    }

    const sizes: number[] = []
    for (let m = sizeRe.exec(xml); m; m = sizeRe.exec(xml)) {
      sizes.push(Number(m[1]))
    }

    const lastModifieds: string[] = []
    for (let m = lmRe.exec(xml); m; m = lmRe.exec(xml)) {
      lastModifieds.push(m[1]!)
    }

    for (let i = 0; i < keys.length; i++) {
      files.push({
        path: keys[i]!,
        size: sizes[i] ?? 0,
        lastModified: lastModifieds[i] ?? '',
      })
    }

    const ctMatch = ctRe.exec(xml)
    const truncatedMatch = truncatedRe.exec(xml)
    return {
      files,
      isTruncated: truncatedMatch?.[1] === 'true',
      nextContinuationToken: ctMatch?.[1],
    }
  }

  return {
    async test(): Promise<ConnectionTestResult> {
      try {
        // HEAD bucket to verify credentials + bucket existence
        const headResp = await client.fetch(`${s3BaseUrl(cfg)}`, { method: 'HEAD' })
        if (!headResp.ok && headResp.status !== 404) {
          // 200 or 403 (permission denied but bucket exists) are acceptable
          // 404 = bucket not found
          const body = await headResp.text().catch(() => '')
          return { ok: false, endpoint: cfg.endpoint, message: `HEAD bucket failed (${headResp.status}): ${body}` }
        }

        // ListObjectsV2 with max-keys=1 to confirm permissions
        const listParams = new URLSearchParams({
          'list-type': '2',
          'max-keys': '1',
          prefix: base.replace(/^\//, ''),
        })
        const listResp = await client.fetch(`${s3BaseUrl(cfg)}?${listParams.toString()}`)
        if (!listResp.ok) {
          const body = await listResp.text().catch(() => '')
          return { ok: false, endpoint: cfg.endpoint, message: `ListObjectsV2 failed (${listResp.status}): ${body.slice(0, 200)}` }
        }

        return { ok: true, endpoint: cfg.endpoint, message: 'S3 连接成功' }
      } catch (error) {
        return { ok: false, endpoint: cfg.endpoint, message: error instanceof Error ? error.message : String(error) }
      }
    },

    async hasData(path?: string): Promise<boolean> {
      try {
        const key = path ? prefixedKey(path) : `${base.replace(/^\//, '')}/`
        const params = new URLSearchParams({
          'list-type': '2',
          'max-keys': '1',
          prefix: key,
        })
        const resp = await client.fetch(`${s3BaseUrl(cfg)}?${params.toString()}`)
        if (!resp.ok) return false
        const xml = await resp.text()
        const { files } = parseListObjectsXml(xml)
        return files.length > 0
      } catch {
        return false
      }
    },

    async putText(path: string, content: string): Promise<void> {
      const key = prefixedKey(path)
      const resp = await client.fetch(s3Url(cfg, key), {
        method: 'PUT',
        body: content,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
      if (!resp.ok) {
        const body = await resp.text().catch(() => '')
        throw new Error(`S3 PUT failed (${resp.status}): ${body}`)
      }
    },

    async getText(path: string): Promise<string> {
      const key = prefixedKey(path)
      const resp = await client.fetch(s3Url(cfg, key))
      if (!resp.ok) {
        if (resp.status === 404) throw new Error(`S3 对象不存在: ${key}`)
        const body = await resp.text().catch(() => '')
        throw new Error(`S3 GET failed (${resp.status}): ${body}`)
      }
      return resp.text()
    },

    async remove(path: string): Promise<void> {
      const key = prefixedKey(path)
      const resp = await client.fetch(s3Url(cfg, key), { method: 'DELETE' })
      if (!resp.ok && resp.status !== 404) {
        const body = await resp.text().catch(() => '')
        throw new Error(`S3 DELETE failed (${resp.status}): ${body}`)
      }
    },

    async listFiles(): Promise<RemoteFile[]> {
      const allFiles: RemoteFile[] = []
      let continuationToken: string | undefined

      do {
        const params = new URLSearchParams({
          'list-type': '2',
          'max-keys': '1000',
          prefix: base === '/' ? '' : base.replace(/^\//, '') + '/',
        })
        if (continuationToken) params.set('continuation-token', continuationToken)

        const resp = await client.fetch(`${s3BaseUrl(cfg)}?${params.toString()}`)
        if (!resp.ok) {
          const body = await resp.text().catch(() => '')
          throw new Error(`S3 ListObjectsV2 failed (${resp.status}): ${body}`)
        }
        const xml = await resp.text()
        const { files, isTruncated, nextContinuationToken } = parseListObjectsXml(xml)

        // Filter out directory markers (keys ending with /) and strip prefix
        for (const file of files) {
          if (file.path.endsWith('/')) continue
          allFiles.push({
            path: stripPrefix(file.path),
            size: file.size,
            lastModified: file.lastModified,
          })
        }

        continuationToken = isTruncated ? nextContinuationToken : undefined
      } while (continuationToken)

      return allFiles
    },
  }
}
