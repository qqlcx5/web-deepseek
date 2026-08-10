# M19 质量验证与发布检查

## 模块目标

为 UI 重建（M10–M18）补充自动与手工验证，确保发布前质量门禁全绿。承接被取代的旧 M09，并新增针对组件化对话主路径的用例。

## 涉及文件

- 改：`tests/`（新增/补充组件与服务用例）
- 读：`vitest.config.ts`、`src/services/chat-service.ts`、`src/stores/chat.ts`、`src/components/chat/*.vue`
- 参考：`ai-reader/components/workspace/*.test.ts`（组件测试范式）

## 子任务

- [ ] 流式响应式与状态机用例。
  - 输入：fake SSE（含 content/reasoning_content/usage）、`AbortError`、非 2xx。
  - 输出：断言 `message.content`/`blocks[].content` 增量命中响应式；状态机 sending→streaming→complete|stopped|error；停止保留内容；节流持久化次数受控。
  - 完成判定：`pnpm test` 新增用例通过。

- [ ] 组件映射用例。
  - 输入：`ChatMessage[]` fixture。
  - 输出：BubbleList items 映射、placement、loading、block 顺序、工具栏事件触发（复制/重生成）。
  - 完成判定：`ChatMessages`/`ChatComposer` 关键交互可单测或通过 mount 断言。

- [ ] 设置即时生效用例。
  - 输入：修改 `appStore.settings` 各字段。
  - 输出：断言 `submitType`、`autoScroll`、`fontSize` 等 computed 跟随变化。
  - 完成判定：无需刷新，computed 输出正确。

- [ ] 导入导出闭环回归。
  - 输入：多 Provider/Assistant/Topic、thinking/error block 样本。
  - 输出：导入→导出→再导入，实体数量、Topic 归属、block 顺序、正文一致；默认导出无 API Key。
  - 完成判定：现有 M09 数据契约用例继续通过。

- [ ] 发布质量门禁。
  - 输入：完整工作区。
  - 输出：`pnpm lint`、`pnpm type-check`、`pnpm build`、`git diff --check` 全绿；手工响应式（桌面/平板/移动）与流式/停止/错误/重生成主路径手测通过。
  - 完成判定：无新增 TS 错误；门禁命令全部通过。

## 验收

- [ ] 主要路径（数据 + 流式 + 组件 + 设置）均有测试覆盖。
- [ ] `pnpm type-check`、`pnpm build`、`pnpm lint` 全部通过。
- [ ] 发布前在 `doc/tasks/progress.md` 将 M10–M19 标记为 `[x]` 并记录验证日期。
