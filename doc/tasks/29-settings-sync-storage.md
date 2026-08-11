# M29 同步与存储设置 UI

## 模块目标

设置面板补齐同步与存储管理 UI：① S3 / WebDAV 配置 + 测试（WebDAV 用 Cherry 原生字段）② 存储统计 ③ 数据管理（Cherry 导入/导出/重建索引/清空）。明确文案"备份 = Cherry 导出格式"。复用现有 SettingsPanel（M17）。

> 依赖：M26（重建索引）、M27（远端测试）、M28（同步引擎）。

## 涉及文件

- 新增：`src/components/settings/StorageSettings.vue`、`S3Settings.vue`、`WebDAVSettings.vue`、`SyncPanel.vue`、`DataManager.vue`
- 改：`src/components/chat/SettingsPanel.vue`（挂载"同步与存储"+"数据管理"分组）
- 读：`src/stores/app.ts`（settings.webdav*/s3/remoteType、topics/messages 计数）
- 参考：`ai-reader/doc/detail.md` §4.9

## 子任务

- [x] 远端类型选择 + S3 / WebDAV 配置。
  - 输入：`settings.remoteType`、`settings.s3`、`settings.webdav*`（Cherry 原生字段）。
  - 输出：单选远端类型（none/s3/webdav）；S3 表单（endpoint/region/bucket/key/secret/basePath/forcePathStyle）；WebDAV 表单（host/user/pass/path/autoSync）；密钥默认掩码。
  - 完成判定：切换类型后 M28 用对应 transport；配置持久。

- [x] 测试连接。
  - 输入：M27 `createS3Remote/createWebDAVRemote(...).test()`。
  - 输出：测试按钮 + 状态灯（灰/testing/绿/红）+ 错误信息。
  - 完成判定：S3 与 WebDAV 均可测试并显示结果。

- [x] 同步操作。
  - 输入：M28 forceUpload/forceDownload/listBackups/restoreFromSnapshot。
  - 输出：全量上传/下载按钮（确认）；备份列表（时间排序）+ 回滚（确认）；安全闸触发时显示阻止文案。
  - 完成判定：操作齐全；破坏性操作二次确认。

- [x] 存储统计。
  - 输入：topics/messages/models/assistants 计数、IndexedDB 估算占用。
  - 输出：统计卡片；最近更新时间。
  - 完成判定：数据准确。

- [x] 数据管理。
  - 输入：Cherry 导入/导出（M03/M04）、重建索引（M26）、清空（appStore）。
  - 输出：导出（默认无 Key，可勾选含 Key）/导入文件；重建搜索索引；清空本地数据（二次确认，文案"不可撤销"）。
  - 完成判定：导入导出闭环；清空有确认；文案说明"导出/备份同格式（Cherry v5）"。

## 验收

- [x] S3/WebDAV 可配置、测试、上传/下载、回滚。
- [x] 存储统计准确。
- [x] 导入/导出/清空/重建索引有确认与反馈。
- [x] 默认导出/备份无密钥。
- [x] `npm run type-check` 通过。
