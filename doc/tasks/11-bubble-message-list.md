# M11 Bubble 消息列表

## 模块目标

把 `ChatMessages.vue` 的手写 `<article>` + `MarkdownRenderer` 渲染，改为 `vue-element-plus-x` 的 `BubbleList`（虚拟滚动 + 自动追底 + 未读角标）+ `Bubble`（气泡）+ `XMarkdown`（正文）。消息内容块（main_text / thinking / error / citation / tool）通过 `Bubble` 的 `#header` / `#content` / `#footer` 插槽组合，消息工具栏用 `#footer`。

> 依赖：M12（流式响应式）必须先修好，否则 Bubble 内增量看不到。

## 涉及文件

- 改：`src/components/chat/ChatMessages.vue`（template 大改，script 改映射）
- 读：`src/types/index.ts`（`ChatMessage` / `MessageBlock`）
- 读：`src/stores/chat.ts`（`messages` / `copyMessage` / `rateMessage` / `regenerate` / `branchFrom` / `editMessage`）
- 读：`src/composables/useTheme.ts`（`isDark`，给 XMarkdown）
- 参考：`wiki/Bubble.md`、`wiki/BubbleList.md`、`wiki/XMarkdown.md`、`wiki/Thinking.md`

## 子任务

- [x] 用 `BubbleList` 替换消息滚动容器。
  - 输入：`store.messages`。
  - 输出：`computed` 把 `ChatMessage[]` 映射为 `BubbleList` 的 `items`（`key`、`role`→`placement` user=end/assistant=start、`loading`、`content`）；`autoScroll` 绑定 `settings.autoScroll`；`@scroll-state-change` 同步 `uiStore.nearBottom`。
  - 完成判定：消息列表渲染、自动追底、上滑后不再被强制拉回；手写 `messageScroller` / `scrollToBottom` / `handleScroll` 可删除或仅保留追底按钮联动。

- [x] 用 `Bubble` + `XMarkdown` 渲染正文。
  - 输入：`message.content`（与所有 `main_text` block 拼接一致）、`settings.fontSize`、`settings.messageStyle`、`isDark`。
  - 输出：`Bubble` `placement`/`avatar`/`loading`；正文用 `XMarkdown`（`isDark`、`codeShowLineNumbers`、`codeWrappable`、`codeCollapsible`、`mathEngine`、`foldDisplayMode`）；`fontSize` 通过 `customStyle` 或外层 CSS 变量注入。
  - 完成判定：Markdown（含代码高亮、公式、mermaid）正确渲染；用户消息气泡右对齐、AI 左对齐；`messageStyle==='plain'` 时无气泡底色。

- [x] thinking / error / citation / tool block 用对应组件渲染。
  - 输入：`message.blocks`。
  - 输出：`thinking` 用 `Thinking`（流式时 status=thinking，结束 end，auto-collapse）；`error` 渲染红色块；`citation`/`tool` 渲染为自定义插槽块；所有 block 按 `message.blocks[]` 顺序。
  - 完成判定：思考过程可折叠、流式中显示"思考中"；错误有可读文案；block 顺序与数据一致。

- [x] 消息工具栏与 usage 渲染迁移到 `#footer`。
  - 输入：`store.copyMessage` / `rateMessage` / `regenerate` / `branchFrom` / `editMessage`、`message.usage`、`message.model`。
  - 输出：`#header` 放模型名/时间/状态；`#footer` 放复制/赞踩/重生成/分支/编辑按钮（hover 显隐）与 usage tokens。
  - 完成判定：所有工具按钮可用；usage 显示 prompt/completion/total；移动端工具栏常显。

- [x] 代码查看抽屉（CodeViewer）保留或下沉。
  - 输入：现有 `codeViewer` Teleport 抽屉。
  - 输出：若 XMarkdown 自带代码操作，则删除自写抽屉；否则保留并通过 `codeBlockActions` 触发。
  - 完成判定：查看代码可复制、可关闭。

## 数据契约

- `ChatMessages` 只消费 `useChatStore` 与 `useAppStore.settings`，不新建本地消息副本。
- `BubbleList` items 是 `store.messages` 的纯映射 `computed`，禁止在组件内 push/splice 消息。

## 验收

- [x] 消息渲染使用 Bubble/BubbleList/XMarkdown，无 `<article>` 手写结构。
- [x] 滚动追底、未读角标、回底按钮正常。
- [x] 思考、错误、引用、工具、usage 全部可渲染。
- [x] `npm run type-check` 通过（2026-08-11）。
