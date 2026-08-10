# M16 附件 FilesCard

## 模块目标

把附件能力从"输入区预览 + 消息正文里只显示文件名"升级为：输入区用 `Attachments` 预览（已具备），消息气泡内用 `vue-element-plus-x` 的 `FilesCard` 展示已发送附件卡片（图标、文件名、大小），并补齐上传/粘贴/移除闭环。

## 涉及文件

- 改：`src/components/chat/ChatMessages.vue`（用户消息气泡内渲染附件 FilesCard）
- 读：`src/components/chat/ChatComposer.vue`（M10 已用 Attachments 预览）
- 读：`src/stores/chat.ts`（`attachments` / `addFiles` / `removeAttachment`、用户消息携带的附件）
- 读：`src/types/index.ts`（附件字段，可能需在 `ChatMessage` 增加 `attachments` 或读取 block）
- 参考：`wiki/FilesCard.md`、`wiki/Attachments.md`、`ai-reader` 附件标记思路

## 子任务

- [ ] 用户消息携带附件信息。
  - 输入：发送时的 `store.attachments`。
  - 输出：`sendMessage` 把附件元信息（id/name/size/type）写入用户消息（`message.attachments` 或一个 `tool`/`citation` 之外的展示字段）；附件内容描述随 content。
  - 完成判定：发送后消息内可取回附件列表；刷新后仍存在。

- [ ] 消息气泡内用 `FilesCard` 展示附件。
  - 输入：`message.attachments`。
  - 输出：用户气泡底部渲染 `FilesCard`（文件类型图标、名称、大小、可选下载/预览）。
  - 完成判定：图片可点开预览（复用现有预览逻辑或 FilesCard 能力）；文档显示对应图标。

- [ ] 输入区附件闭环。
  - 输入：`store.addFiles` / `store.removeAttachment`、粘贴事件。
  - 输出：点击/拖拽/粘贴均可添加；`Attachments` 项可删除；超限或类型不支持给出 toast。
  - 完成判定：添加后出现在预览栏；删除后消失；发送后预览栏清空。

- [ ] 大文本粘贴为文件（可选，对齐 settings）。
  - 输入：`settings.pasteLongTextAsFile`、`settings.pasteLongTextThreshold`。
  - 输出：粘贴超过阈值时转为 `.txt` 附件而非直接插入文本。
  - 完成判定：阈值切换行为正确。

## 验收

- [ ] 消息内附件以 FilesCard 卡片展示。
- [ ] 输入区附件增删/粘贴闭环正常。
- [ ] 刷新后附件信息保留。
- [ ] `npm run type-check` 通过。
