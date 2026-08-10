# M23 Documents 数据层扩展

## 模块目标

为 reader 能力（抓取/预览/搜索/同步）引入 `DocumentEntity`，作为 `AppData.documents[]` 扩展存储。**不进入 Cherry v5 导入导出**（保持 `docs/data-json-schema.md` 不变）；进入 web-deepseek 自有备份/同步快照（M28）。同时把 documents 访问仓库化，便于后续替换存储实现。

> 这是 M24/M25/M26/M28 的前置。

## 涉及文件

- 改：`src/types/index.ts`（`DocumentEntity`、`AppData.documents?`、`CaptureSettings`/`ContextSettings`）
- 新增：`src/services/documents/repository.ts`（`DocumentRepository` CRUD + 按 url/hash 查询）
- 改：`src/stores/app.ts`（documents 读写、迁移默认值）、`src/utils/db.ts`（save/load 已序列化 AppData，无需改）
- 改：`src/services/export.ts`/`import`（确保 documents **不**进 Cherry 导出）
- 参考：`ai-reader/db/schema.ts`（DocumentEntity 字段）、`ai-reader/doc/detail.md` §6.1

## 子任务

- [ ] 定义 DocumentEntity。
  - 输入：ai-reader §6.1 字段表。
  - 输出：`DocumentEntity { id,url,canonicalUrl?,title,siteName?,author?,description?,publishedAt?,markdown,rawText?,rawHtml?,rawHtmlCompressed?,excerpt?,wordCount,tokenCount,contentHash,extractionMethod,source,capturedAt,updatedAt,lastOpenedAt?,tags?,syncStatus? }`。
  - 完成判定：类型完备；与 ai-reader 对齐（去掉扩展专属字段）。

- [ ] AppData 扩展 + 迁移。
  - 输入：现有单记录 AppData。
  - 输出：`AppData.documents: DocumentEntity[] = []`（可选，旧数据加载补 `[]`）；`Settings` 增 `context`/`capture` 子结构（默认值见 ai-reader §4.7.2/4.8.2）。
  - 完成判定：刷新后 documents 恢复；旧无 documents 的数据迁移成功。

- [ ] DocumentRepository。
  - 输入：`appStore.documents`。
  - 输出：`list/getById/findByUrl/findByHash/upsert/remove/clear`；变更触发 `appStore` 持久化（复用现有串行防抖保存）。
  - 完成判定：CRUD 生效；不绕过 appStore 持久化。

- [ ] Cherry 导入导出隔离。
  - 输入：现有 Cherry 导出/导入（M04/M03）。
  - 输出：导出 JSON 不含 documents；导入不覆盖 documents。
  - 完成判定：导入导出闭环后 documents 数量不变（data-json-schema.md 不变）。

## 数据契约

- documents 仅存在于 AppData 与 web-deepseek 备份快照，不出现在 Cherry data.json。
- Conversation = 现有 Topic；document 可选关联 Topic（在 Topic 增 `documentId?`，同样不入 Cherry 导出）。

## 验收

- [ ] `AppData.documents` 持久化与恢复。
- [ ] Cherry 导入导出文件不含 documents。
- [ ] `npm run type-check` 通过；M09 数据契约测试不回归。
