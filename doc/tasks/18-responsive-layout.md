# M18 响应式布局回归

## 模块目标

对齐 PRD F-08 与非功能需求中的响应式要求：桌面三栏（侧栏 + 消息 + 检查器）、平板隐藏固定检查器提供抽屉、移动端底部导航 + 侧栏/检查器抽屉。所有文字与控件在窄屏可用，图标按钮有 tooltip 或可访问名。承接被取代的旧 M08（响应式部分）。

## 涉及文件

- 改：`src/views/chat/ChatPage.vue`（栅格断点、抽屉、移动 nav）
- 读：`src/config/breakpoints.ts`、`src/stores/ui.ts`（`handleResize` / `sidebarOpen` / `inspectorOpen` / `device`）
- 读：`src/components/chat/ChatComposer.vue`（M10，移动端边距）、`ChatMessages.vue`（M11，移动端 padding）
- 参考：`docs/prd.md` F-08、第 8 节可访问性

## 子任务

- [ ] 三栏 → 双栏 → 抽屉切换。
  - 输入：视口宽度断点（桌面 ≥1180 / 平板 760–1180 / 移动 ≤760）。
  - 输出：`ChatPage` grid 列模板按断点切换；平板隐藏固定检查器，提供顶部抽屉入口；移动端 sidebar/inspector 变为覆盖式抽屉 + backdrop。
  - 完成判定：拖动浏览器宽度时三态平滑切换；无内容溢出或被遮挡。

- [ ] 移动端底部导航。
  - 输入：`uiStore` 各入口。
  - 输出：底部 4 项（对话/搜索/文件/会话）切到对应面板；发送区不被遮挡（`padding-bottom: var(--mobile-nav)`）。
  - 完成判定：底部 nav 与 Composer 不重叠；安全区 `env(safe-area-inset-bottom)` 生效。

- [ ] 控件可访问性。
  - 输入：所有图标按钮（Composer/Sidebar/Topbar/Messages 工具栏）。
  - 输出：每个图标按钮有 `title`/`aria-label` 或 `tooltip`；键盘可聚焦与触发。
  - 完成判定：屏幕阅读器能读出按钮用途；Tab 顺序合理。

- [ ] 长文本与窄屏。
  - 输入：长 Topic 名、长消息、模型名。
  - 输出：省略号或换行；气泡最大宽度自适应；代码块横向滚动。
  - 完成判定：390px 宽下无横向溢出、无截断不可读。

## 验收

- [ ] 桌面/平板/移动三态下：新建对话、发送、切换模型、打开设置、管理 Topic 均可完成。
- [ ] 所有图标按钮有可访问名。
- [ ] 无横向滚动条（除代码块）。
- [ ] `npm run type-check` 通过。
