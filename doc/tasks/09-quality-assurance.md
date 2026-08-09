# M09 质量验证与发布检查

## 模块目标

为数据、导入导出、流式运行和界面主路径建立自动验证，并在发布前完成完整回归。

## 子任务

- [x] 编写数据契约测试。
  - 输入：合法和非法 AppData fixture。
  - 输出：默认 Assistant、重复 ID、实体引用和 block 唯一性测试。
  - 完成判定：`validateReferences` 的 errors/warnings 可预测。

- [x] 编写导入导出闭环测试。
  - 输入：多 Provider、多 Assistant、多 Topic、thinking/error block 样本。
  - 输出：导入 -> 导出 -> 再导入的比较测试。
  - 完成判定：实体数量、Topic 归属、block 顺序和正文一致；默认导出无 API Key。

- [ ] 编写持久化和流式测试。
  - 输入：fake IndexedDB、模拟 SSE、AbortError、服务端错误。
  - 输出：保存队列和消息状态机测试。
  - 完成判定：连续保存不丢数据；停止和错误状态正确落库。

- [ ] 执行质量门禁。
  - 输入：完整工作区。
  - 输出：格式、类型、构建和手工响应式检查结果。
  - 完成判定：`npm run type-check`、`npm run build`、`git diff --check` 全部通过。

## 验收

- [ ] 主要数据路径均有自动测试覆盖。
- [ ] 无 P0/P1 引用完整性问题。
- [ ] 发布前在 `doc/tasks/progress.md` 标记所有已完成模块。
