# M29 阅读与存储设置 UI

## 模块目标

参考 ai-reader `components/settings/{ContextSettings,CaptureSettings,StorageSettings,S3Settings,WebDAVSettings}.vue`，在 web-deepseek 设置面板补齐三组 UI：① 上下文设置（M21 截断/注入开关）② 抓取设置（M24 开关）③ 存储与同步（M27/M28 远端配置 + 存储统计 + 清空/重建索引）。复用现有 SettingsPanel（M17）。

> 依赖：M21/M24/M27/M28。承接 ai-reader `settings-management` + `data-layer` 的 UI 部分。

## 涉及文件

- 新增：`src/components/settings/ContextSettings.vue`、`CaptureSettings.vue`、`StorageSettings.vue`、`S3Settings.vue`、`WebDAVSettings.vue`、`SyncPanel.vue`
- 改：`src/components/chat/SettingsPanel.vue`（挂载新分组）
- 读：`src/stores/app.ts`（settings.context/capture/remote、documents/topics 计数）
- 参考：`ai-reader/doc/detail.md` §4.7/4.8/4.9

## 子任务

- [ ] 上下文设置 UI。
  - 输入：`settings.context`（maxContextTokens、includeMetadata/Url/Title/CapturedAt、includeConversationHistory、maxHistoryMessages）。
  - 输出：表单读写并即时生效（驱动 M21 builder）。
  - 完成判定：改完无需刷新，下一次请求按新设置注入。

- [ ] 抓取设置 UI。
  - 输入：`settings.capture`（autoExtractOnOpen/autoExtractOnTabChange/preferCache/saveRawHtml/compressRawHtml）。
  - 输出：表单读写；SPA 下 `autoExtractOnTabChange` 标注"扩展专属，SPA 不生效"。
  - 完成判定：开关持久；saveRawHtml/compressRawHtml 影响 M24 落库。

- [ ] S3 / WebDAV 配置 UI。
  - 输入：`settings.remote.s3` / `settings.remote.webdav`。
  - 输出：连接表单（endpoint/region/bucket/key/secret/basePath/forcePathStyle；url/user/pass/basePath）+ 测试连接按钮（M27）+ 选择当前远端类型；密钥默认掩码，导出剔除。
  - 完成判定：测试连通返回结果；切换远端类型后 M28 用对应 transport。

- [ ] 存储统计与数据操作。
  - 输入：documents/topics/models 计数、IndexedDB 估算占用、索引状态。
  - 输出：统计卡片；操作：导出 JSON（Cherry，不含 documents）、导入 JSON、全量上传/下载（M28）、备份回滚、重建搜索索引（M26）、清空本地数据（二次确认）。
  - 完成判定：操作齐全；清空/回滚有二次确认；不静默失败。

## 验收

- [ ] 三组设置可读写并即时/下次生效。
- [ ] S3/WebDAV 可配置并测试。
- [ ] 存储统计准确，数据操作有确认与反馈。
- [ ] `npm run type-check` 通过。
