# M17 设置面板即时生效

## 模块目标

让 `SettingsPanel.vue` 只展示并写入 PRD 4.6 的 `Settings` 字段，且主题、字号、消息样式、代码显示、发送快捷键、Token 显示、数学引擎等修改无需刷新立即生效并持久化。承接被取代的旧 M08（设置部分）。

## 涉及文件

- 改：`src/components/chat/SettingsPanel.vue`
- 读：`src/stores/app.ts`（`settings` 及各字段）、`src/stores/ui.ts`
- 读：`src/composables/useTheme.ts`（主题联动）
- 读：`src/components/chat/ChatComposer.vue`（sendShortcut，M10 已接）、`ChatMessages.vue`（fontSize/消息样式/代码，M11 已接）
- 参考：`docs/prd.md` 第 4.6 节

## 子任务

- [x] 字段白名单收紧。
  - 输入：PRD 4.6 `Settings`。
  - 输出：面板只渲染声明的字段；移除任何 `sendMessageShortcut`、`topicPosition` 等未声明项。
  - 完成判定：面板字段集合 == PRD 4.6；保存只写白名单字段。

- [x] 外观类设置即时生效。
  - 输入：`theme` / `fontSize` / `messageStyle` / `messageFont` / `codeShowLineNumbers` / `codeWrappable` / `codeCollapsible` / `foldDisplayMode` / `mathEngine` / `showMessageDivider`。
  - 输出：通过 `appStore.settings` 响应式驱动（M11 已消费）；主题经 `useTheme` 应用到根 `data-theme`。
  - 完成判定：拖动/切换后消息区立即变化，无需刷新。

- [x] 输入类设置即时生效。
  - 输入：`sendShortcut` / `showInputEstimatedTokens` / `renderInputMessageAsMarkdown` / `autoScroll` / `confirmDeleteMessage` / `confirmRegenerateMessage`。
  - 输出：XSender（M10）的 `submitType`、token 预估、BubbleList 的 `autoScroll` 均绑定对应 setting。
  - 完成判定：切换快捷键后立即按新键发送；autoScroll 关闭后不再追底。

- [x] 数据管理反馈（导入/导出/保存状态/删除结果）。
  - 输入：导入文件、导出校验结果、`appStore.saving`、Provider/Assistant 删除结果。
  - 输出：成功/失败/警告/禁用操作均有明确 toast/dialog；校验失败不显示成功。
  - 完成判定：无静默失败；导出无 Key（默认）有提示。

## 验收

- [x] 面板字段与 PRD 4.6 完全一致，无未声明字段。
- [x] 外观与输入类设置改完即时生效，刷新后保持。
- [x] 导入导出/删除有明确反馈。
- [x] `npm run type-check` 通过。
