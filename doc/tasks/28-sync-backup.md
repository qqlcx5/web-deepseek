# M28 同步与备份引擎

## 模块目标

参考 ai-reader `services/sync/*`，在 web-deepseek **单记录 AppData** 模型上实现备份/恢复/同步。鉴于 AppData 是单 blob（非 Dexie 多表），v1 采用**快照模式**：全量上传 / 全量下载 / 版本备份回滚 / 连接测试，并保留 ai-reader 的**大批量删除安全闸**与**备份保留数**思路。entity 级三方合并列为后续增强。

> 依赖：M27（RemoteTransport）、M23（documents 进快照）。

## 涉及文件

- 新增：`src/services/sync/sync.service.ts`、`backup.ts`
- 新增：`src/services/sync/refresh.ts`（同步后刷新 store）
- 改：`src/stores/app.ts`（同步元数据 `syncState {lastSyncAt, remoteVersion}`）
- 新增：`src/stores/sync.ts`（同步状态/预览/进度）
- 参考：`ai-reader/services/sync/{sync.service,refresh}.ts`

## 数据格式（web-deepseek 自有，区别于 Cherry 导出）

```jsonc
// 远端 data.json（同步快照，含 documents；不是 Cherry 导出格式）
{
  "version": 1,
  "syncedAt": "ISO",
  "data": AppData            // 完整 AppData，含 documents[]
}
```

## 子任务

- [ ] 快照上传 / 下载。
  - 输入：当前 AppData、RemoteTransport。
  - 输出：`forceUpload`：test→序列化 AppData（去响应式）→putText('data.json')→更新 syncState；`forceDownload`：test→hasData→getText→`applyAppData`（替换内存 + 持久化 + refresh）。
  - 完成判定：上传后远端有 data.json；下载后本地数据被替换且 UI 刷新。

- [ ] 版本备份与回滚。
  - 输入：上传前的远端旧 data.json。
  - 输出：变更时把旧快照存为 `data.backup-{utcStamp}-{rand4}.json`；`listBackups`/`restoreFromSnapshot(name)`；`pruneBackups(max)`（默认 10）。
  - 完成判定：多次同步产生有限备份；可回滚到指定备份。

- [ ] 同步预览与安全闸。
  - 输入：本地与远端快照大小。
  - 输出：`previewSync` 返回 {localCount, remoteCount, newRemoteAt}；当远端 entities 远小于本地（疑似空库）时 abort 并提示用全量上传/下载（沿用 ai-reader `SAFEGUARD` 思路，按 AppData 顶层实体数估算）。
  - 完成判定：误连空远端不会清空本地。

- [ ] 自动同步与状态。
  - 输入：`settings.remote.autoSync`、间隔。
  - 输出：可选定时/启动时同步；顶栏显示 saving/synced/error（复用现有保存状态位）。
  - 完成判定：开关可控；失败有 toast。

## 验收

- [ ] 全量上传/下载/回滚可用。
- [ ] 安全闸阻止误删。
- [ ] documents 随快照同步；Cherry 导入导出格式不受影响。
- [ ] `npm run type-check` 通过。
