# M15 模型选择与上下文 Banner

## 模块目标

补齐 ai-reader 风格的两个顶部能力：①模型选择器仅显示启用模型、默认选中、切换后提示"仅对新消息生效"；②在消息区顶部显示"当前模型 / 当前 Assistant / 上下文已就绪或未配置"banner，让用户随时知道请求会用哪个 Provider+模型。当前 `ChatTopbar.vue` 只有一个打开模态的按钮，缺少即时反馈。

## 涉及文件

- 改：`src/components/chat/ChatTopbar.vue`（模型按钮文案、上下文 banner）
- 改：`src/components/chat/ModelSelector.vue`（下拉数据源、默认选中、切换提示）
- 读：`src/stores/ui.ts`（`selectedModel` / `models`）
- 读：`src/stores/app.ts`（`providers` / `assistants` / `defaultAssistant`）
- 读：`src/stores/chat.ts`（`getActiveModel` 解析逻辑）
- 参考：`ai-reader/components/workspace/ModelSelect.vue`、`ai-reader/doc/tasks/ai-chat.md`

## 子任务

- [ ] 模型选择器只显示启用项并默认选中。
  - 输入：`uiStore.models`（已过滤启用）、`appStore.defaultAssistant.model`。
  - 输出：下拉项含模型显示名 + Provider 名 + 上下文长度；默认选中当前生效模型（`uiStore.selectedModel` ?? assistant 模型 ?? 第一个）。
  - 完成判定：禁用的 Provider/模型不出现；选中状态与请求实际使用模型一致。

- [ ] 切换模型即时反馈。
  - 输入：用户在下拉切换模型。
  - 输出：底部提示"切换后仅对新消息生效"；切换后 `uiStore.selectedModel` 更新，`ChatTopbar` 按钮文案立即变化。
  - 完成判定：不刷新即可见；历史消息保留原 `message.model`。

- [ ] 顶部上下文/状态 banner。
  - 输入：当前模型、当前 Assistant、`uiStore.online`、Provider 是否配置 apiKey。
  - 输出：消息区顶部一行轻量 banner：`{Assistant 名} · {模型名} · {Provider 状态：已就绪/缺少 API Key/未配置模型}`；断网时沿用现有 network banner。
  - 完成判定：未配置模型/Key 时明确提示并阻止发送（`canSend` 兼容）；就绪时显示绿色勾。

- [ ] 标题栏重命名/聚焦/侧栏切换保留。
  - 输入：现有 `ChatTopbar` 重命名、`uiStore.sidebarOpen`、`uiStore.focusMode`。
  - 输出：保留重命名内联编辑与布局按钮，仅替换模型按钮为带状态版本。
  - 完成判定：原有操作不回归。

## 验收

- [ ] 模型选择器只列启用项，切换即时生效且提示"仅对新消息生效"。
- [ ] 顶部 banner 能反映 Assistant/模型/Provider 就绪状态。
- [ ] 缺模型或 Key 时发送被拦截并给出原因。
- [ ] `npm run type-check` 通过。
