# M12 流式响应式修复与状态机

## 模块目标

修复当前最关键的 bug："发送没有流"。根因：`services/chat-service.ts` 直接变异传入的原始 `assistantMessage` 对象，该引用绕过了 Vue 响应式代理，导致 `store.messages` 内的代理对象不感知 `content`/`blocks[].content` 增量，UI 不逐字更新。本模块把流式增量改为通过响应式路径写入，并对齐停止/重生成/错误状态机，保留节流持久化。

> 这是 M10/M11 的前置：UI 改用 XSender/Bubble 后，若响应式没修，仍然看不到增量。

## 涉及文件

- 改：`src/services/chat-service.ts`（变异方式）
- 改：`src/stores/chat.ts`（`messages` 响应式策略、`sendMessage`/`streamChat`/`regenerate`/`stopGeneration`）
- 读：`src/utils/sse.ts`（`consumeSSEStream`，已实现，无需改）
- 读：`src/api/chat-api.ts`（`chatApi.chatStream`）
- 参考：`wiki/useXStream.md`、`wiki/useSend.md`、`ai-reader/components/workspace/ChatMessage.vue`（节流重渲染思路）

## 子任务

- [ ] 让流式增量命中 Vue 响应式。
  - 输入：`assistantMessage`（store 内代理对象引用）、SSE delta。
  - 输出：`streamAssistantMessage` 不再持有原始对象，改为通过回调 `onDelta(mutator)` 由 store 在响应式对象上执行写入；或 store 传入 `messages.value` 中已代理的引用并在 chat-service 内用 `mutate message.xxx`（确保是代理引用）。
  - 完成判定：流式过程中 `message.content` / `blocks[].content` 增量能驱动 `watch` 和 `Bubble` 重渲染；控制台无"原始对象被直接修改"的旁路。

- [ ] 校验并修复 `store.messages` 响应式容器。
  - 输入：`messages = ref([])`、`sendMessage` 内 `messages.value = [...messages.value, ...]`。
  - 输出：确认 `ref` 深响应；推送后立即从 `messages.value` 取回代理引用传给 `streamChat`；`regenerate` 同理定位代理对象。
  - 完成判定：新增/重生成消息均能被响应式追踪；`vue-devtools` 中 messages 项为 reactive。

- [ ] 接入 `useSend`/`useXStream`（可选，若不引入则保证等价状态）。
  - 输入：`store.generating`、`abortController`。
  - 输出：在 `ChatPage` 或 `ChatComposer` 用 `useSend` 包裹 `sendMessage`/`stopGeneration`，`loading` 与 `store.generating` 双向一致；或在 store 内用 `useXStream` 替换手写 AbortController。
  - 完成判定：只有一个加载态来源；停止按钮与流式生命周期一致。

- [ ] 对齐停止 / 重生成 / 错误状态机。
  - 输入：正常完成、`AbortError`、非 2xx、无响应体、异常事件。
  - 输出：`sending → streaming → complete|stopped|error`；停止保留已收内容；失败总是产出可渲染的 `error` block；重生成不重复创建占位消息。
  - 完成判定：与 PRD 4.5 / M07 约定一致，UI（M11）能据此显示"已停止/失败/生成中"。

- [ ] 保留流式节流持久化。
  - 输入：连续 token delta。
  - 输出：开始、约每 400ms、结束时落 IndexedDB（`appStore.updateMessage`）。
  - 完成判定：不对每个字符写库；停止/失败时最后一次状态已落库。

## 验收

- [ ] 发送一条消息，能看到正文逐字出现（修复"没有流"）。
- [ ] 停止生成后正文与思考内容保留，状态为已停止。
- [ ] 断开/错误的 Provider 发送，显示红色 error block 并可重生成。
- [ ] 流式期间 IndexedDB 写入频率受控（手动观察或单测）。
- [ ] `npm run type-check` 通过；现有 `tests/` 中流式相关用例通过。
