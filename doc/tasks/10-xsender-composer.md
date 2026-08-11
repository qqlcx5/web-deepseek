# M10 XSender 输入区

## 模块目标

用手写 `<textarea>` 的 `ChatComposer.vue` 改造为基于 `vue-element-plus-x` 的 `XSender`，并通过 `useSend` 统一发送/停止的加载态与发送快捷键。发送即触发流式（见 M12/M11），不再手写 textarea 高度、按钮和快捷键。

> 依赖：M12（流式响应式）提供 `store.sendMessage` / `store.stopGeneration` / `store.generating` 的稳定契约。可先接 store 现有方法，M12 落地后无需改组件。

## 涉及文件

- 改：`src/components/chat/ChatComposer.vue`（整体重写 template + script）
- 读：`src/stores/chat.ts`（`draft` / `attachments` / `canSend` / `generating` / `sendMessage` / `stopGeneration`）
- 读：`src/stores/app.ts`（`settings.sendShortcut` / `showInputEstimatedTokens`）
- 参考：`wiki/XSender.md`、`wiki/useSend.md`

## 子任务

- [x] 用 `XSender` 替换 `<textarea>`。
  - 输入：`store.draft`、`settings.sendShortcut`。
  - 输出：`XSender` 的 `v-model` 绑定 `store.draft`；`submitType` 由 `settings.sendShortcut` 映射（`Enter`→`enter`，`Ctrl+Enter`/`Shift+Enter`→`shiftEnter`）；`@submit` 调 `store.sendMessage()`。
  - 完成判定：输入文本回车发送；Draft 在 store 与组件间双向同步；不再保留手写 `handleKeydown`。

- [x] 用 `useSend` 接管发送/停止按钮加载态。
  - 输入：`store.sendMessage`、`store.stopGeneration`、`store.generating`。
  - 输出：`useSend({ sendHandler: store.sendMessage, abortHandler: store.stopGeneration })`；`XSender` 的 `:loading="loading"` 绑定 `useSend.loading`；`store.canSend` 控制 `:disabled`。
  - 完成判定：生成中按钮显示停止态，点击可中断；无内容时发送禁用。

- [x] 附件入口与 token 预估迁移到 `#prefix` / `#header` 插槽。
  - 输入：`store.attachments`、`store.addFiles`、`store.removeAttachment`、`estimateTokens(draft)`。
  - 输出：`#prefix` 放附件上传按钮；`Attachments` 预览放 `#header`；`settings.showInputEstimatedTokens` 为真时在 `#prefix` 显示 token 预估。
  - 完成判定：附件可加/删；粘贴图片仍走 `@paste`→`store.addFiles`（XSender 若不暴露 paste 事件则保留透明覆盖层）；token 预估随输入更新。

- [x] 离线 banner 与回复上下文（branchFrom）保留。
  - 输入：`uiStore.online`、`store.replyingTo`。
  - 输出：离线 banner 放在 `XSender` 外层包裹；`store.replyingTo` 显示在 `#header`，关闭按钮清空 `store.replyingTo`。
  - 完成判定：断网提示可见；分支提示可关闭。

## 数据契约（供 M11/M12 对齐）

- `ChatComposer` 仅通过 `useChatStore` 暴露的 `draft`（双向）、`sendMessage()`、`stopGeneration()`、`canSend`、`generating`、`attachments` 交互，不新增 props。
- 发送成功后由 store 清空 draft/attachments，组件不自行清空。

## 验收

- [x] 输入消息回车发送，输入框清空。
- [x] 生成中显示停止按钮，点击可中断。
- [x] 附件、token 预估、离线提示正常。
- [x] `npm run type-check` 通过，无 `<textarea>` 手写逻辑残留（2026-08-11）。
