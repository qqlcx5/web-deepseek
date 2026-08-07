---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_c77d63ff929011f1bafa525400287e28
    ReservedCode1: rAIqTbBDSTUBBXhfDdZGy8AYt+eh1whZ8TeJjRI4E6hrZAOB/Pk52oD2278r7WyYee47cbnjSpfnDQhpjj/6Fztg3nt8UEdH/bX/L6K1+sOn2E1vbXHWFfB5knHOI7ztdYny9jhioFCM13zjLtv5gqCTiaojeeGAnujz1ARgB7+ao5Q9JI1mndcRwtY=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_c77d63ff929011f1bafa525400287e28
    ReservedCode2: rAIqTbBDSTUBBXhfDdZGy8AYt+eh1whZ8TeJjRI4E6hrZAOB/Pk52oD2278r7WyYee47cbnjSpfnDQhpjj/6Fztg3nt8UEdH/bX/L6K1+sOn2E1vbXHWFfB5knHOI7ztdYny9jhioFCM13zjLtv5gqCTiaojeeGAnujz1ARgB7+ao5Q9JI1mndcRwtY=
---

# 导出与迁移 — 最小可执行任务清单

> 对应详细设计 §7  
> 目标：对话导出、批量导出、数据迁移、分享链接

## Pinia Store

- [ ] 创建 `useExportStore`，管理导出状态（格式选择、进度、错误）
- [ ] 实现 `exportConversations(options: ExportOptions)`：触发导出文件下载 → `request.post` blob
- [ ] 实现 `exportWorkspace(workspaceId)`：导出整个工作区 → `request.get` blob
- [ ] 实现 `exportAll()`：导出全部数据 → `request.get` blob
- [ ] 实现 `importData(file)`：上传并导入数据，展示 ImportResult → `request.post` multipart/form-data
- [ ] 创建 `useShareStore`，管理分享链接 CRUD
- [ ] 实现 `createShareLink(conversationId, options)`：创建分享链接 → `request.post`
- [ ] 实现 `revokeShareLink(shareId)`：撤销分享 → `request.delete`

## 组件

### ExportDialog — [ElDialog + ElForm]
- [ ] 实现 FormatSelector：单选组 Markdown / PDF / JSON → ElRadioGroup
- [ ] 实现 ConversationCheckboxList：勾选要导出的对话 → ElCheckbox
- [ ] 实现 OptionsSection：包含附件复选框 + 包含系统消息复选框 → ElCheckbox
- [ ] 实现 PreviewButton：预览导出内容（Markdown 渲染预览）
- [ ] 实现 ExportButton（ElButton）：触发导出下载 + 进度指示

### ShareDialog — [ElDialog + ElInput]
- [ ] 实现 LinkDisplay：展示分享 URL + 一键复制按钮（ElInput + ElButton）
- [ ] 实现 PasswordInput：可选设置访问密码 → ElInput type="password"
- [ ] 实现 ExpirationSelect：下拉选择有效期 → ElSelect
- [ ] 实现 MaxViewsInput：可选限制最大查看次数 → ElInputNumber
- [ ] 实现 CreateLinkButton（ElButton）/ RevokeButton（ElButton）

### ImportDialog — [ElDialog]
- [ ] 实现 FileDropZone：拖拽或点击选择 .zip / .json 文件
- [ ] 实现 ImportProgress：解析进度 + 导入条目计数
- [ ] 实现 ImportResultSummary：成功数 / 失败数 / 错误详情列表

## API 层 — [hook-fetch: request]

- [ ] 封装 `POST /api/export/conversations` → `request.post` blob 下载
- [ ] 封装 `POST /api/export/workspace/:id` → `request.get` blob
- [ ] 封装 `GET /api/export/all` → `request.get` blob
- [ ] 封装 `POST /api/import` → `request.post` multipart/form-data
- [ ] 封装 `POST /api/share` → `request.post`
- [ ] 封装 `GET /api/share/:id` → 公开接口，不需要鉴权
- [ ] 封装 `DELETE /api/share/:id` → `request.delete`

## 分享页

- [ ] 实现 `ShareViewPage`（路由 `/share/[shareId]`）：只读对话展示
- [ ] 实现密码验证：如设置了密码则显示密码输入框
- [ ] 实现过期/次数耗尽处理：显示友好提示页

## 依赖接口

- 依赖 `useConversationStore`：对话列表（供导出选择）
- 依赖 `useMessageStore.getMessagesForExport`：获取完整消息

## 技术选型

| 需求 | 选型 | 说明 |
|------|------|------|
| 弹窗 | Element Plus: `ElDialog` | 导出/分享/导入弹窗 |
| 表单控件 | Element Plus: `ElForm` / `ElInput` / `ElSelect` / `ElRadioGroup` / `ElCheckbox` / `ElInputNumber` | 导出配置 + 分享设置 |
| 按钮 | Element Plus: `ElButton` | 触发操作 |
| API 请求 | hook-fetch: `request` | `request.get/post/put/delete(url, params)`，blob 下载 |
| 状态管理 | Pinia `defineStore` | 导出状态 + 分享管理 |
*（内容由AI生成，仅供参考）*
