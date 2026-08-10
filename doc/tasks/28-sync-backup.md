# M28 同步与备份引擎（备份 = Cherry JSON）

## 模块目标

在 web-deepseek **单记录 AppData** 模型上实现备份/恢复/同步。**备份内容 = Cherry 导出 JSON**（与导入导出同格式，二合一），不再维护第二套同步 schema。提供全量上传/下载、版本备份回滚、大删除安全闸、自动同步。entity 级三方合并明确不做。

> 依赖：M27（RemoteTransport）、`src/services/export.ts`（Cherry 导出）。

## 涉及文件

- 新增：`src/services/sync/sync.service.ts`、`backup.ts`、`refresh.ts`
- 改：`src/services/export.ts`（导出 Cherry JSON 的函数被复用为备份序列化）
- 改：`src/stores/app.ts`（同步元数据 `syncState {lastSyncAt}`，存 localStorage 不进 AppData）
- 新增：`src/stores/sync.ts`（同步状态/预览/进度）
- 参考：`ai-reader/services/sync/{sync.service,refresh}.ts`（仅参考安全闸/备份命名思路）

## 数据格式（与 Cherry 导出统一）

```jsonc
// 远端 data.json = Cherry v5 导出格式（见 docs/data-json-schema.md）
// 默认不含密钥；用户显式勾选才包含 apiKey
{
  "time": 1758091674643,
  "version": 5,
  "localStorage": { ... },
  "indexedDB": { "topics": [...], "message_blocks": [...] }
}
```

> 备份与"导出"用同一序列化路径；区别仅在写入远端 vs 下载文件。

## 子任务

- [ ] 快照上传 / 下载。
  - 输入：当前 AppData、RemoteTransport。
  - 输出：`forceUpload`：test→用 Cherry 导出序列化 AppData（复用 export.ts，默认无 Key，可勾选含 Key）→putText('data.json')→更新 syncState；`forceDownload`：test→hasData→getText→Cherry 导入路径→`applyAppData` + refresh。
  - 完成判定：上传后远端 data.json 能被 Cherry 导入；下载后本地数据替换且 UI 刷新。

- [ ] 版本备份与回滚。
  - 输入：上传前的远端旧 data.json。
  - 输出：变更时把旧快照存为 `data.backup-{utcStamp}-{rand4}.json`；`listBackups`/`restoreFromSnapshot(name)`；`pruneBackups(max)`（默认 10）。
  - 完成判定：多次同步产生有限备份；可回滚到指定备份。

- [ ] 安全闸。
  - 输入：本地与远端实体计数。
  - 输出：下载前比较；当远端 topics/messages 远小于本地（疑似空库）时 abort 并提示用全量上传/下载（沿用 ai-reader SAFEGUARD 思路）。
  - 完成判定：误连空远端不会清空本地。

- [ ] 自动同步与状态。
  - 输入：`settings.webdavAutoSync` / `settings.remoteType`、间隔。
  - 输出：可选定时/启动时同步；顶栏显示 saving/synced/error（复用现有保存状态位）。
  - 完成判定：开关可控；失败有 toast。

## 数据契约

- syncState（lastSyncAt 等）存 localStorage，不进 AppData / 不进 Cherry 导出。
- 备份序列化复用 Cherry 导出，保证 Cherry 可读。
- 远端类型由 `settings.remoteType`（none/s3/webdav）决定用哪个 transport。

## 验收

- [ ] 全量上传/下载/回滚可用；上传文件 Cherry 可导入。
- [ ] 安全闸阻止误删。
- [ ] Cherry 导入导出格式不变（data-json-schema.md）。
- [ ] `npm run type-check` 通过。
