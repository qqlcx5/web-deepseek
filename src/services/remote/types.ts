// ─── Remote Transport interface ─────────────────────────────────────────────
// Unified S3 + WebDAV remote abstraction. Feeds into M28 sync engine.

export interface RemoteFile {
  path: string
  size: number
  lastModified: string
}

export interface ConnectionTestResult {
  ok: boolean
  endpoint: string
  message: string
}

export interface RemoteTransport {
  /** Test connectivity + permissions. */
  test(): Promise<ConnectionTestResult>

  /** Check if any data exists under basePath (or at the given explicit path). */
  hasData(path?: string): Promise<boolean>

  /** Write UTF-8 text to a remote path. */
  putText(path: string, content: string): Promise<void>

  /** Read UTF-8 text from a remote path. */
  getText(path: string): Promise<string>

  /** Delete a remote object. */
  remove(path: string): Promise<void>

  /** List all objects under basePath. */
  listFiles(): Promise<RemoteFile[]>
}

// ─── S3 ──────────────────────────────────────────────────────────────────────

export interface S3Config {
  /** S3-compatible endpoint URL, e.g. https://s3.amazonaws.com or http://localhost:9000 */
  endpoint: string
  /** AWS region, e.g. us-east-1 */
  region: string
  /** Bucket name */
  bucket: string
  /** Access key ID */
  accessKeyId: string
  /** Secret access key */
  secretAccessKey: string
  /** Prefix / folder within the bucket, e.g. orbit-chat (default) */
  basePath: string
  /** Use path-style addressing (true) or virtual-hosted (false) */
  forcePathStyle: boolean
}

// ─── WebDAV ──────────────────────────────────────────────────────────────────

export interface WebDAVConfig {
  /** WebDAV server URL, e.g. https://dav.jianguoyun.com/dav */
  url: string
  username: string
  password: string
  /** Sub-folder within the WebDAV root, e.g. orbit-chat (default) */
  basePath: string
}

// ─── Settings embedded under settings.remote ─────────────────────────────────

export interface RemoteSettings {
  s3: S3Config
  webdav: WebDAVConfig
}

export const DEFAULT_S3_CONFIG: S3Config = {
  endpoint: '',
  region: 'us-east-1',
  bucket: '',
  accessKeyId: '',
  secretAccessKey: '',
  basePath: '/orbit-chat',
  forcePathStyle: true,
}

export const DEFAULT_WEBDAV_CONFIG: WebDAVConfig = {
  url: '',
  username: '',
  password: '',
  basePath: '/orbit-chat',
}
