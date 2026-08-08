---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_c654a886929011f18e22525400f8a581
    ReservedCode1: nmVkhiDXx+mu6bRjS7QyJIIKtYvmjMAeillK3c/tCPUem6seq0Ymho8nYkqF15xXR1DfvmofqnMy/6Jne53SCvM1ObiSK5z9d8vqm0O5lq+8qZu1dWiJFFQiFCX1RBdzMFDqsZlem2OrKbacDj0/r2+sJdoV+1e+v6/HgVipTvEe2823OD6sA0lpPFw=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_c654a886929011f18e22525400f8a581
    ReservedCode2: nmVkhiDXx+mu6bRjS7QyJIIKtYvmjMAeillK3c/tCPUem6seq0Ymho8nYkqF15xXR1DfvmofqnMy/6Jne53SCvM1ObiSK5z9d8vqm0O5lq+8qZu1dWiJFFQiFCX1RBdzMFDqsZlem2OrKbacDj0/r2+sJdoV+1e+v6/HgVipTvEe2823OD6sA0lpPFw=
---

# 消息功能 — 最小可执行任务清单

> 对应详细设计 §5  
> 目标：消息收发、流式渲染、Markdown 渲染、消息操作、分支对话

## Pinia Store

- [ ] 创建 `useMessageStore`，定义 MessageState 类型和初始状态
- [ ] 实现 `sendMessage(req)`：POST → 触发 SSE 流式连接 → useXStream
- [ ] 实现 `stopStreaming()`：POST stop + abort SSE 连接 → useXStream
- [ ] 实现 `regenerate(req)`：对已有消息重新生成 → `request.post`
- [ ] 实现 `continueGeneration(messageId)`：截断消息继续生成 → `request.post`
- [ ] 实现 `editMessage(req)`：PUT 编辑已发送用户消息 → 自动重新生成 AI 回复 → `request.put`
- [ ] 实现 `deleteMessage(messageId)`：DELETE 删除单条消息 → `request.delete`
- [ ] 实现 `submitFeedback(messageId, feedback)`：POST 点赞/点踩 → `request.post`
- [ ] 实现 `forkConversation(messageId)`：POST 从指定消息创建分支对话 → `request.post`

## SSE 流式处理 — [Element-Plus-X: useXStream]

- [x] 实现 SSE 流式连接：基于 useXStream hooks 封装 fetch + ReadableStream + AbortController
- [x] 实现 chunk 解析：useXStream 内置 `data:` 行分割 + JSON.parse
- [x] 实现 `handleStreamChunk`：根据 chunk.type（text/tool_call/error/done）分发处理
- [x] 实现 `appendStreamContent`：增量拼接 AI 消息内容，触发 Vue 响应式重渲染
- [x] 实现 `finalizeStream`：流结束后的收尾处理（设置消息 status=done、更新 token 用量）
- [x] 实现错误处理：网络错误 → 状态标记 error + 显示重试按钮
- [x] 实现断线重连：指数退避（1s/2s/4s/8s），携带 Last-Event-ID 断点续传

## 组件

### ChatView
- [x] 实现 `ChatView` 主容器：BubbleList + XSender，自适应高度

### MessageList — [Element-Plus-X: BubbleList]
- [x] 实现消息列表：用 BubbleList 组件渲染，内置虚拟滚动支持超长对话（1000+ 条）
- [x] 实现消息分组渲染：SystemMessage / UserMessage / AssistantMessage → BubbleList 内置
- [x] 实现新消息自动滚动到底部，用户手动上滚时不强制滚动 → BubbleList 内置
- [x] 实现 ScrollToBottomButton：用户上滚后显示浮按钮

### SystemMessage
- [x] 实现系统通知：模型切换提示、上下文截断警告

### UserMessage — [Element-Plus-X: Bubble]
- [x] 实现用户消息气泡（右对齐，主题色背景）→ Bubble role="user"
- [x] 实现 Markdown 渲染用户消息内容
- [x] 实现悬停显示操作按钮：复制、编辑、删除 → Bubble 内置

### AssistantMessage — [Element-Plus-X: Bubble + ThoughtChain + Thinking]
- [x] 实现 AI 消息气泡（左对齐，带模型头像 + ModelBadge）→ Bubble role="assistant"
- [x] 实现 ThinkingBlock：可折叠的推理过程区域 → Thinking 组件
- [x] 实现 ThoughtChain：多步推理链展示 → ThoughtChain 组件
- [x] 实现 ToolCallCard：工具调用展示卡片（名称 + 参数 + 状态 + 结果可展开）
- [x] 实现 TokenUsageInfo：本条消息消耗 token 显示
- [x] 实现 StreamingCursor：流式输出中闪烁光标动画
- [x] 实现悬停显示操作按钮：复制、重新生成、继续、分支、点赞/点踩 → Bubble 内置

### MarkdownRenderer — [x-markdown-vue: MarkdownRenderer]
- [x] 集成 x-markdown-vue MarkdownRenderer（代码高亮 Shiki + 流式渲染 + LaTeX + Mermaid + 深色模式）
- [x] 实现 XSS 防护
- [x] 实现图片点击放大（灯箱模式）

### MessageActions
- [x] 实现复制消息：复制纯文本和 Markdown 两种模式可选
- [x] 实现 InlineEditor：点击编辑按钮 → 用户消息变为可编辑 textarea → 保存/取消
- [x] 实现 RegenerateButton：重新生成 AI 回复
- [x] 实现 ContinueButton：截断消息显示"继续生成"按钮
- [x] 实现 BranchButton → BranchDialog：确认 fork 并跳转新对话
- [x] 实现 LikeButton/DislikeButton → 点赞/点踩

### ChatInput — [Element-Plus-X: XSender]
- [x] 实现自适应高度输入框 → XSender 内置（min 1行 / max 8行）
- [x] 实现 Enter 发送 / Shift+Enter 换行 → XSender 内置
- [x] 实现 ModelSelectorTrigger（内嵌模型切换入口）→ XSender 内置
- [x] 实现 SendButton（发送中显示 StopButton）→ XSender 内置
- [x] 实现字数统计 / Token 估算显示
- [x] 实现粘贴图片自动上传（clipboard paste event）
- [x] 实现拖拽文件到输入框触发上传

### Welcome / Prompts — [Element-Plus-X: Welcome + Prompts]
- [x] 实现 Welcome 欢迎页：无对话时展示 → Welcome 组件
- [x] 实现 Prompts 提示集：快捷引导提示 → Prompts 组件

## API 层 — [hook-fetch: request + useXStream]

- [x] 封装 `POST /api/chat/stream` → useXStream SSE 连接管理
- [x] 封装 `POST /api/chat/stop` → `request.post`
- [x] 封装 `POST /api/messages/:id/regenerate` → `request.post`
- [x] 封装 `POST /api/messages/:id/continue` → `request.post`
- [x] 封装 `PUT /api/messages/:id` → `request.put`
- [x] 封装 `DELETE /api/messages/:id` → `request.delete`
- [x] 封装 `POST /api/messages/:id/fork` → `request.post`
- [x] 封装 `POST /api/messages/:id/feedback` → `request.post`
- [x] 封装 `GET /api/conversations/:id/messages` → `request.get`（分页加载历史消息）

## 依赖接口

- 依赖 `useConversationStore`：当前 conversationId
- 依赖 `useModelStore`：当前模型 ID、参数
- 依赖 `useAttachmentStore`：发送消息时携带附件引用
- 向对话管理模块暴露：`onMessageSent` 事件（更新 lastMessagePreview）
- 向搜索模块暴露：消息数据（供索引）

## 技术选型

| 需求 | 选型 | 说明 |
|------|------|------|
| 消息气泡 | Element-Plus-X: `Bubble` / `BubbleList` | 用户/AI 消息渲染，内置虚拟滚动 |
| 智能输入框 | Element-Plus-X: `XSender` | 含语音、提及、附件入口、模型切换 |
| 流式响应 | Element-Plus-X: `useXStream` | SSE 流管理 hooks |
| 思考链 | Element-Plus-X: `Thinking` / `ThoughtChain` | 推理过程可折叠展示 |
| 欢迎页 | Element-Plus-X: `Welcome` | 空状态引导 |
| 提示集 | Element-Plus-X: `Prompts` | 快捷引导提示 |
| Markdown | x-markdown-vue: `MarkdownRenderer` | Shiki 代码高亮 + 流式 + LaTeX + Mermaid |
| API 请求 | hook-fetch: `request` + `useXStream` | 常规请求 + SSE 流管理 |
| 状态管理 | Pinia `defineStore` | 消息收发 + 流式管理 |
*（内容由AI生成，仅供参考）*
