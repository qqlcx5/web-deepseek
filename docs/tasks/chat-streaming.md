# 06 - 对话与流式生成

> 需求来源：§3 F-04  
> 优先级：P0  
> 目标：用户发送消息 → 创建消息 → SSE 流式接收 → 写入 blocks → 状态机管理

## 任务清单

### 6.1 消息创建流程

- [ ] 用户发送文本 → 立即创建 `role='user'` 消息，至少一个 `main_text` block
- [ ] 同时创建 `role='assistant'` 占位消息，status='sending'
- [ ] 设置 `askId` 关联问答对
- [ ] 记录 `usage`（用户消息）和 `metrics`（助手消息）占位

### 6.2 SSE 流处理

- [ ] `main_text` block：SSE `content` 增量写入 `block.content`，status='streaming'
- [ ] `thinking` block：`reasoning_content` 增量写入，记录 `thinking_millsec`
- [ ] `error` block：错误写入 `block.error`（name, message, originalMessage, stack）
- [ ] `tool` block：工具调用写入 `toolId`, `toolName`, `metadata`
- [ ] `citation` block：引用写入 `block.response`

### 6.3 状态机

- [ ] 实现 `sending → streaming → complete` 主路径
- [ ] 实现 `streaming → error` 错误路径
- [ ] 实现 `streaming → stopped` 手动停止路径
- [ ] 状态变更时更新 `message.status` 和相关 `block.status`

### 6.4 停止生成

- [ ] 调用 `abort()` 中止 SSE 流
- [ ] 保留已收到的 `main_text` 和 `thinking` 内容
- [ ] 状态转为 `stopped`，block 状态转为 `success`

### 6.5 usage 与 metrics

- [ ] 用户消息记录 `usage`：prompt_tokens, completion_tokens, total_tokens
- [ ] 助手消息记录 `metrics`：completion_tokens, time_completion_millsec, time_first_token_millsec, time_thinking_millsec
- [ ] 流结束时从 SSE 最终帧解析

### 6.6 多模型消息

- [ ] `multiModelMessageStyle` 支持 `fold`（折叠）和 `horizontal`（横向并排）
- [ ] 折叠模式下显示选中模型的消息，其余收起
- [ ] 横向模式下多个助手消息并排显示

### 6.7 流式持久化

- [ ] 流开始时触发一次保存
- [ ] 流过程中每 N 条消息批次保存（N=10 或 2s 间隔）
- [ ] 流结束时触发保存

## 验收

- 发送消息 → 用户消息立即显示 → 助手消息流式渲染
- 停止生成后已有内容保留
- 错误时 error block 正确显示
- usage 和 metrics 正确记录
- 状态机转换符合定义
