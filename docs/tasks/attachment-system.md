---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_c6e9f43f929011f1bafa525400287e28
    ReservedCode1: rACNsr8IzL0cH9uEeaxe/yzfmjIlge7pB3RFyr/sQoa9hD7dnL/N2Y3ChJH7ASaLconWkVVckRm3sh4+6/eg7PAtV5Zb2E5otlj+F2aXQ+0lYcAjv3nmrnl9wg1uoF24OLIHs5f0OT0lGww7rAXuTGvxPUF9eDZ3Cx+X7UyoL/H+7CCW7RSb0a4fcp0=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_c6e9f43f929011f1bafa525400287e28
    ReservedCode2: rACNsr8IzL0cH9uEeaxe/yzfmjIlge7pB3RFyr/sQoa9hD7dnL/N2Y3ChJH7ASaLconWkVVckRm3sh4+6/eg7PAtV5Zb2E5otlj+F2aXQ+0lYcAjv3nmrnl9wg1uoF24OLIHs5f0OT0lGww7rAXuTGvxPUF9eDZ3Cx+X7UyoL/H+7CCW7RSb0a4fcp0=
---

# 附件系统 — 最小可执行任务清单

> 对应详细设计 §6  
> 目标：文件上传、预览、解析、管理

## Pinia Store

- [x] 创建 `useAttachmentStore`，定义 AttachmentState 类型和初始状态
- [x] 实现 `uploadFile(conversationId, file)`：单文件上传 → `request.post`
- [x] 实现 `uploadFiles(conversationId, files)`：批量上传，并行控制最大并发数 3 → `request.post`
- [x] 实现 `cancelUpload(attachmentId)`：取消进行中的上传
- [x] 实现 `deleteAttachment(attachmentId)`：DELETE 删除附件 → `request.delete`
- [x] 实现 `getAttachments(conversationId)`：加载对话附件列表 → `request.get`
- [x] 实现 `extractText(attachmentId)`：触发文本提取 → `request.post`
- [x] 实现上传进度追踪：`uploading` Map 维护每个附件的 { progress, status }

## 组件

### AttachmentUploader — [Element-Plus-X: Attachments]
- [x] 实现 DropZone：拖拽文件到消息区域 → Attachments 组件内置
- [x] 实现 PasteHandler：全局监听 paste 事件 → Attachments 组件内置
- [x] 实现 FileInput（隐藏）：点击按钮触发系统文件选择器 → Attachments 组件内置
- [x] 实现文件类型 + 大小校验：前端拦截不支持的格式和超限文件（默认 20MB）→ Attachments 组件内置
- [x] 实现 UploadProgressList：显示上传中文件（文件名 + 进度条 + 取消按钮）→ Attachments 组件内置

### AttachmentPreview — [Element-Plus-X: FilesCard]
- [x] 实现 ImagePreview（灯箱）：点击放大 + 缩放控件 + 旋转按钮 + 左右切换
- [x] 实现 PDFPreview：内嵌 iframe 渲染 PDF（使用浏览器内置 PDF 查看器）
- [x] 实现 FileCard（通用文件）：文件图标 + 文件名 + 大小 + 下载按钮 → FilesCard 组件
- [x] 实现预览关闭：点击遮罩 / Esc 键

### AttachmentList（对话附件面板）
- [x] 实现 FilterTabs：全部 / 图片 / 文档 / 其他
- [x] 实现 AttachmentGrid：缩略图网格（图片）或列表（文档）
- [x] 实现 AttachmentCard：文件图标/缩略图 + 文件名 + 大小 + 操作菜单（下载/删除）
- [x] 实现空状态提示 → ElEmpty

## API 层 — [hook-fetch: request]

- [x] 封装 `POST /api/attachments/upload-url` → `request.post`
- [x] 实现 PUT 直传到预签名 URL（fetch 或 XMLHttpRequest with progress）
- [x] 封装 `POST /api/attachments/:id/confirm` → `request.post`
- [x] 封装 `GET /api/attachments/:id` → `request.get`
- [x] 实现附件下载：`GET /api/attachments/:id/download` → `request.get` + blob
- [x] 封装 `DELETE /api/attachments/:id` → `request.delete`
- [x] 封装 `GET /api/conversations/:id/attachments` → `request.get`
- [x] 封装 `POST /api/attachments/:id/extract` → `request.post`

## 依赖接口

- 依赖 `useConversationStore`：当前 conversationId
- 向消息功能模块暴露：已上传附件的 AttachmentRef[]（发送消息时携带）

## 技术选型

| 需求 | 选型 | 说明 |
|------|------|------|
| 文件上传 | Element-Plus-X: `Attachments` | 内置拖拽/粘贴/多文件/预览/进度 |
| 文件卡片展示 | Element-Plus-X: `FilesCard` | 通用文件卡片 + 操作菜单 |
| 空状态 | Element Plus: `ElEmpty` | 无附件时引导展示 |
| API 请求 | hook-fetch: `request` | `request.get/post/put/delete(url, params)` |
| 状态管理 | Pinia `defineStore` | 上传队列管理 + 进度追踪 |
*（内容由AI生成，仅供参考）*
