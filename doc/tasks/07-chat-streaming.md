# M07 流式对话运行时

## 模块目标

将对话发送、SSE 增量、取消、重试和内容块渲染收敛为一条状态流程，并在流式期间进行节流持久化。

## 子任务

- [x] 创建用户消息和 Assistant 占位消息。
  - 输入：草稿、附件、当前 Topic、当前模型。
  - 输出：带唯一 ID、createdAt、状态和 main_text block 的消息。
  - 完成判定：用户消息立即显示；Assistant 消息初始状态为 sending。

- [x] 实现单一 SSE 处理函数。
  - 输入：OpenAI-compatible `data:` 事件流。
  - 输出：正文写入 main_text、思考写入 thinking、usage 写入 Message。
  - 完成判定：不能保留两份独立流式循环；每个 block 有正确状态和创建时间。

- [x] 实现状态结束分支。
  - 输入：正常完成、AbortError、非 2xx、无响应体、异常事件。
  - 输出：complete、stopped 或 error Message 状态和错误块。
  - 完成判定：停止生成保留内容；失败总有可渲染的 error block。

- [x] 实现重新生成和分支上下文。
  - 输入：目标 Assistant Message、历史消息。
  - 输出：重置后的消息和正确的请求上下文。
  - 完成判定：重新生成不创建重复占位消息；分支消息保留 parentBranchId。

- [x] 实现流式保存节流。
  - 输入：连续 token delta。
  - 输出：开始、定期批次、结束时的 appStore 保存请求。
  - 完成判定：不对每个字符发起 IndexedDB 写入。

## 验收

- [x] 正文、thinking、usage、停止和错误均可在 UI 正确呈现。
- [x] 每个 Message 的 content 与 main_text blocks 一致。
- [x] `npm run type-check` 通过。
