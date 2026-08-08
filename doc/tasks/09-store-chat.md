# 09 - store-chat（对话运行态 Store）

> 路径: `src/stores/chat.ts`
> 依赖: `chat-api`, `store-app`, `store-ui`, `types`

---

## 任务清单

### State

- [ ] T09-1 定义 `activeTopicId`、`messages`、`draft`、`replyingTo`、`generating`、`abortController`、`attachments`

### Getters

- [ ] T09-2 `activeTopic` — 从 appStore.topicById 查找
- [ ] T09-3 `canSend` — draft 非空或 attachments 非空，且非 generating

### 会话切换

- [ ] T09-4 `selectTopic(id)` — 设置 activeTopicId，加载 topic.messages 到 messages，关闭抽屉
- [ ] T09-5 `newTopic()` — appStore.addTopic → selectTopic → showToast

### 消息发送

- [ ] T09-6 `sendMessage()` — 构造 user Message → appStore.addMessage → 追加到 messages
- [ ] T09-7 清空 draft / attachments / replyingTo
- [ ] T09-8 构造 assistant 占位 Message（status=pending, loading=true）→ appStore.addMessage
- [ ] T09-9 调用 `streamChat(assistantMsg)`

### 流式请求

- [ ] T09-10 `streamChat(assistantMsg)` — 创建 AbortController，调用 chatApi.chatStream
- [ ] T09-11 reader.read() 循环 — TextDecoder 解码，按 `\n` 分行，过滤 `data: ` 前缀
- [ ] T09-12 JSON.parse delta — 累加 `content` 和 `reasoning_content` 到 assistantMsg
- [ ] T09-13 `[DONE]` 或 done=true → status=done
- [ ] T09-14 catch AbortError → status=done，保留已生成内容
- [ ] T09-15 catch 其他 error → status=error，写入错误信息
- [ ] T09-16 finally → loading=false, generating=false, abortController=null, appStore.updateMessage

### 停止生成

- [ ] T09-17 `stopGeneration()` — abortController.abort()

### 消息操作

- [ ] T09-18 `copyMessage(msg)` — navigator.clipboard.writeText + showToast
- [ ] T09-19 `rateMessage(msg, rating)` — 切换 rating 状态 + updateMessage + showToast
- [ ] T09-20 `regenerate(msg)` — branches++ + activeBranch 更新 + showToast + updateMessage
- [ ] T09-21 `branchFrom(msg)` — 设置 replyingTo + showToast
- [ ] T09-22 `editMessage(msg)` — 回填 draft + 设置 replyingTo

### 附件操作

- [ ] T09-23 `addFiles(files)` — 最多 6 个，push 到 attachments + showToast
- [ ] T09-24 `removeAttachment(file)` — splice 移除 + showToast(undo)

### 草稿持久化

- [ ] T09-25 watch(draft) → localStorage.setItem('orbit-draft', val)
- [ ] T09-26 初始化时从 localStorage 恢复 draft

### 验证

- [ ] T09-27 mock chatApi.chatStream 测试完整流式发送流程
- [ ] T09-28 测试 stopGeneration 正确中断
- [ ] T09-29 测试附件增删 + undo 恢复
- [ ] T09-30 `tsc --noEmit` 类型检查通过
