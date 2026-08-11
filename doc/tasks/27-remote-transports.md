# M27 S3 + WebDAV 远端传输

## 模块目标

参考 ai-reader `services/s3/s3.client.ts` 与 `services/webdav/webdav.client.ts`，建立统一 `RemoteTransport` 接口与两种实现：**S3 用 `aws4fetch`，WebDAV 用 `webdav`**。提供 test/hasData/putText/getText/remove/listFiles，供 M28 同步引擎编排。配置存 `AppData.settings`（Cherry 的 webdav 字段位 + 新增 s3 字段），**不进 Cherry 导出**。

> 这是"选什么库"的落地模块。依赖：无（基础设施）。

## 库选型（已确认）

| 目标 | 库 | 导入 | 备注 |
|---|---|---|---|
| S3 / S3 兼容 | `aws4fetch` | `import { AwsClient } from 'aws4fetch'` | fetch + SigV4，支持 path-style / virtual-hosted、ListObjectsV2 分页 |
| WebDAV | `webdav` | `import { createClient } from 'webdav/web'` | 用 `/web` 浏览器构建；`createClient(url,{username,password})` |

> ⚠️ SPA 直连受 CORS 限制：服务端需配 CORS 头，或经同源反代（生产）/ Vite 代理（开发）。任务含此项。

## 涉及文件

- 新增：`src/services/remote/types.ts`（`RemoteTransport`、`S3Config`、`WebDAVConfig`、`ConnectionTestResult`）
- 新增：`src/services/remote/s3.client.ts`、`webdav.client.ts`
- 改：`package.json`（加 `aws4fetch`、`webdav`）、`src/types/index.ts`（settings 增 s3/webdav 配置字段）
- 改：`vite.config.ts`（可选：开发代理 S3/WebDAV 以绕过 CORS）
- 参考：`ai-reader/services/s3/s3.client.ts`、`ai-reader/services/webdav/webdav.client.ts`、`ai-reader/types/{s3,sync}.ts`

## 子任务

- [x] 定义统一接口。
  - 输入：ai-reader `RemoteTransport`。
  - 输出：`interface RemoteTransport { test(); hasData(); putText(path,text); getText(path); remove(path); listFiles() }` + `createS3Remote(cfg)` / `createWebDAVRemote(cfg)` 工厂。
  - 完成判定：两种远端同一接口；basePath 规范化（默认 `/orbit-chat`）。

- [x] S3 实现（aws4fetch）。
  - 输入：`S3Config { endpoint, region, bucket, accessKeyId, secretAccessKey, basePath, forcePathStyle }`。
  - 输出：`new AwsClient({accessKeyId,secretAccessKey,region,service:'s3'})`；test 用 HEAD bucket + ListObjectsV2 prefix；putText/getText/remove/listFiles（解析 ListObjectsV2 XML，含 continuationToken 分页）。
  - 完成判定：MinIO/AWS 可读写列删；路径风格可切换。

- [x] WebDAV 实现（webdav）。
  - 输入：`WebDAVConfig { url, username, password, basePath }`。
  - 输出：`createClient(url,{username,password})`；test 用 exists + 建目录（recursive）；putText/getText/remove/listFiles（getDirectoryContents 过滤目录）。
  - 完成判定：常见 WebDAV（坚果云/Nextcloud）可读写列删。

- [x] CORS 代理与配置存储。
  - 输入：开发/生产环境。
  - 输出：vite.config 增可选代理规则（按 endpoint 透传）；配置写 `settings.remote.s3` / `settings.remote.webdav`，默认导出剔除密钥。
  - 完成判定：开发环境能连通；配置持久；导出 JSON 不含 accessKeyId/secretAccessKey/password。

## 验收

- [x] S3 与 WebDAV 均可 test/put/get/list/remove（手动连一个真实端点）。
- [x] 配置持久且默认导出无密钥。
- [x] `npm run type-check` 通过。
