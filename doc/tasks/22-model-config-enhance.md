# M22 模型配置增强（Cherry 兼容）

## 模块目标

补齐多模型管理 UI 与连接测试，**严格遵循 Cherry 归属**：模型参数（temperature/topP/maxTokens/contextCount/stream）与 systemPrompt 放在 **Assistant** 上（`types/index.ts` 已具备 temperature/topP/maxTokens，补 contextCount/streamOutput）；`ModelInfo` 只放身份信息，不加参数字段。连接测试为**纯 UI 态**，不持久化进 AppData / 不进 Cherry 导出。

> 依赖：M20（测试连接服务）。与 M15（模型选择器）协同。
> 纠正：此前版本误把 systemPrompt/temperature 加到 ModelInfo，违反 Cherry 模式，已废止。

## 涉及文件

- 改：`src/types/index.ts`（`Assistant` 补 `contextCount?`、`streamOutput?`；`ModelInfo` **不加**参数字段）
- 改：`src/components/chat/ProviderSettings.vue`（Provider 类型选择 + 模型 CRUD + 测试连接按钮）
- 改：`src/components/chat/AssistantSettings.vue`（systemPrompt + 模型参数表单）
- 改：`src/components/chat/ModelSelector.vue`（启用模型 + 当前选中 + 切换提示）
- 读：`src/stores/app.ts`、`src/stores/ui.ts`
- 参考：`docs/data-json-schema.md` §2.3b（Assistant.settings）、§2.4b（Model）

## 子任务

- [x] Provider 类型字段。
  - 输入：现有 `Provider`。
  - 输出：新增可选 `providerType: 'openai-compatible'|'anthropic'|'ollama'`，默认 `openai-compatible`；ProviderSettings 编辑表单提供类型选择。
  - 完成判定：旧数据默认 openai-compatible；M20 工厂按此路由。

- [x] Assistant 参数补全（Cherry 归属）。
  - 输入：现有 `Assistant`（已有 temperature/topP/maxTokens）。
  - 输出：补 `contextCount?`（上下文轮数）、`streamOutput?`（流式开关）；AssistantSettings 表单展示并编辑 prompt + 全部参数。
  - 完成判定：参数编辑后持久化；刷新恢复；M21 builder 读 Assistant 参数。

- [x] systemPrompt 优先级。
  - 输入：`assistant.prompt`、全局（可选）。
  - 输出：解析顺序 assistant.prompt > 全局 > 不发 system role；为空则不注入。
  - 完成判定：切换 Assistant 后新请求用新 prompt；历史消息不受影响。

- [x] 连接测试（纯 UI 态）。
  - 输入：M20 `testConnection(model, provider)`。
  - 输出：模型卡显示测试按钮 + 状态灯（灰/testing/绿/红）+ 延时/错误；状态存组件/localStorage，**不写 AppData、不进 Cherry 导出**。
  - 完成判定：测试结果即时可见；刷新后状态重置为 untested（可接受）。

- [x] 校验与引用保护。
  - 输入：temperature∈[0,2]、contextCount≥0；删除被 Assistant 使用的模型/Provider。
  - 输出：表单校验；删除引用时阻止并提示 Assistant 名称。
  - 完成判定：非法值不可保存；无静默失效引用。

## 数据契约（Cherry 兼容）

- `ModelInfo` 字段集合 = Cherry §2.4b 子集（id/name/group/supported_text_delta + 扩展 contextLength/maxTokens/enabled），**不含** systemPrompt/temperature/lastTestStatus。
- `Assistant` 参数字段语义对齐 Cherry §2.3b（temperature/contextCount/maxTokens/streamOutput）。
- 导出 Cherry 时：Assistant 参数映射到 Cherry `assistant.settings`；ModelInfo 映射到 Cherry `provider.models[i]`。零字段丢失。

## 验收

- [x] 可在 Assistant 上配置 systemPrompt 与全部模型参数。
- [x] 连接测试状态可见（不持久化）。
- [x] Cherry 导入导出闭环：Assistant 参数与模型身份无损往返。
- [x] `npm run type-check` 通过。
