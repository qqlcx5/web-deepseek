# M14 Welcome + Prompts 空状态

## 模块目标

统一空状态入口：当前 `ChatMessages.vue` 手写了一段 `.empty-state`，而 `WelcomeScreen.vue`（已用 `Welcome`）却没被接入。本模块用 `vue-element-plus-x` 的 `Welcome` + `Prompts` 渲染欢迎页/空状态，提供可点击的预设提示词，点击直接发送或填入输入框。

> 参考：ai-reader 在新建对话时显示欢迎页 + 推荐问题。

## 涉及文件

- 改：`src/components/chat/WelcomeScreen.vue`（增强：接收 prompts 并渲染 Prompts）
- 改：`src/components/chat/ChatMessages.vue`（删除手写 `.empty-state`，`messages.length===0` 时渲染 `WelcomeScreen`）
- 读：`src/stores/chat.ts`（`messages` / `draft` / `sendMessage` / `activeChatId`）
- 读：`src/config/commands.ts`（如已有提示词预设则复用）
- 参考：`wiki/Welcome.md`、`wiki/Prompts.md`

## 子任务

- [x] `ChatMessages` 接入 `WelcomeScreen` 作为唯一空状态。
  - 输入：`store.messages.length === 0`。
  - 输出：渲染 `WelcomeScreen`；删除 `.empty-state` 手写块。
  - 完成判定：无话题/空话题时只出现一处欢迎页，无重复空态。

- [x] `WelcomeScreen` 渲染 `Welcome` + `Prompts`。
  - 输入：当前 Assistant 名称、模型名、预设提示词列表。
  - 输出：`Welcome` 的 `icon/title/description/variant`；下方 `Prompts` 列出 3–6 条预设（label + description）。
  - 完成判定：欢迎页展示助手/模型信息；Prompts 项可见、可滚动。

- [x] 点击预设提示词。
  - 输入：预设项 key/label、`store.draft`、`store.sendMessage`。
  - 输出：点击 → 设置 `store.draft = label`（或带占位描述）并立即 `sendMessage()`；或仅填入 draft 等用户编辑后发送（二选一，默认直接发送）。
  - 完成判定：点击后生成用户消息并进入流式（依赖 M12）；输入框清空。

- [x] 提示词来源与配置。
  - 输入：`src/config/commands.ts` 或 Assistant 的默认提示词。
  - 输出：导出一个 `welcomePrompts: PromptsItemsProps[]` 常量；可按 Assistant 类别切换。
  - 完成判定：预设与项目定位（DeepSeek Chat）一致，无占位 Lorem。

## 验收

- [x] 空状态只有一处，使用 Welcome + Prompts。
- [x] 点击预设提示词可触发一次对话。
- [x] 切换 Assistant 时欢迎信息更新。
- [x] `npm run type-check` 通过。（验证日期：2026-08-11）
