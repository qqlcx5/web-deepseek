# M22 模型配置增强

## 模块目标

参考 ai-reader `model-config`，在现有 `Provider/ModelInfo` 与 `ModelSelector`/`ProviderSettings` 基础上，补齐：模型级 **systemPrompt**、**contextWindow**、**temperature**、**测试连接状态**（untested/testing/success/failed + 延时 + 错误）。让"每模型独立人设与参数"可用，并与 M20 的测试连接服务联动。

> 依赖：M20（测试连接服务）。与 M15（模型选择器）协同。

## 涉及文件

- 改：`src/types/index.ts`（`ModelInfo` 增字段）、`Provider`/`Assistant`（systemPrompt 归属）
- 改：`src/components/chat/ProviderSettings.vue`（模型编辑表单）、`ModelSelector.vue`
- 读：`src/stores/app.ts`、`src/stores/ui.ts`（`models`/`selectedModel`）
- 参考：`ai-reader/doc/detail.md` §4.6、`ai-reader/components/settings/*`（reka-ui 版仅参考字段）

## 子任务

- [ ] 扩展 ModelInfo 字段。
  - 输入：现有 `ModelInfo`。
  - 输出：新增可选 `systemPrompt?`、`contextWindow?`、`temperature?`、`lastTestStatus?`、`lastTestLatency?`、`lastTestError?`；默认值与 ai-reader 一致。
  - 完成判定：旧数据加载有默认值；不破坏 Cherry 导入导出（额外字段在导出时丢弃，见 M01 白名单）。

- [ ] 模型编辑表单补字段。
  - 输入：ProviderSettings 的模型编辑区。
  - 输出：表单含 modelId/name/contextWindow/temperature/systemPrompt/enabled；校验 temperature∈[0,2]、contextWindow>0、baseUrl 合法 URL（localhost 允许）。
  - 完成判定：保存后字段持久化；刷新恢复。

- [ ] 测试连接按钮与状态。
  - 输入：M20 `testConnection(model)`。
  - 输出：模型卡/编辑弹窗显示测试按钮 + 状态灯（灰/loading/绿/红）+ 延时/错误；结果写回 `lastTestStatus` 等字段。
  - 完成判定：点测试后状态正确流转并持久化。

- [ ] systemPrompt 优先级。
  - 输入：model.systemPrompt、Assistant.prompt、全局。
  - 输出：解析顺序 model > assistant > 全局 > 不发；M21 builder 已消费。
  - 完成判定：切换模型后新请求用新 systemPrompt；历史消息不受影响。

## 验收

- [ ] 可为每个模型单独配置 systemPrompt 与参数。
- [ ] 测试连接状态可见且持久。
- [ ] Cherry 导入导出不回归（额外字段被白名单过滤）。
- [ ] `npm run type-check` 通过。
