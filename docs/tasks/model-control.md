---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_c5c86ed5929011f18e22525400f8a581
    ReservedCode1: A/ezVbyDVlVv32aqQo+mL4PkaMWfqpgiC3Ab0mtpXS5zsbggQ2Ry40PfekVmW4Nx2jR9KjRNM+ssakg/xNE7jCJvkbGE0HUl3GGhuSk0GaEcZYsDza2O3hoWMLDI6mPiHixOaeV0x2tKmCz1ILEjnXUeImES0utlhqozey5gBU7WEp/kCfYOxz3gFA0=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_c5c86ed5929011f18e22525400f8a581
    ReservedCode2: A/ezVbyDVlVv32aqQo+mL4PkaMWfqpgiC3Ab0mtpXS5zsbggQ2Ry40PfekVmW4Nx2jR9KjRNM+ssakg/xNE7jCJvkbGE0HUl3GGhuSk0GaEcZYsDza2O3hoWMLDI6mPiHixOaeV0x2tKmCz1ILEjnXUeImES0utlhqozey5gBU7WEp/kCfYOxz3gFA0=
---

# 模型控制 — 最小可执行任务清单

> 对应详细设计 §4  
> 目标：模型选择器、参数面板、API Key 管理、Token 可视化

## Pinia Store

- [ ] 创建 `useModelStore`，定义 ModelState 类型和初始状态
- [ ] 实现 `fetchProviders()`：加载所有提供商及模型列表 → `request.get('/api/models/providers')`
- [ ] 实现 `setModel(modelId, providerId)`：切换当前模型 → `request.put` 更新对话 modelId
- [ ] 实现 `updateParams(params)`：更新当前对话模型参数（防抖 300ms 后持久化 → `request.put`）
- [ ] 实现 `saveApiKey(providerId, key, baseUrl?)`：POST 保存 API Key → `request.post`
- [ ] 实现 `testConnection(providerId)`：POST 测试连接 → `request.post` → 返回是否成功
- [ ] 实现 `removeApiKey(providerId)`：DELETE 移除 API Key → `request.delete`
- [ ] 实现 `addCustomProvider(config)`：POST 添加自定义兼容端点 → `request.post`

## 组件

### ModelSelector — [ElSelect / ElDropdown]
- [ ] 实现 TriggerButton：显示当前模型名称 + Provider 小图标，点击展开下拉 → ElDropdown
- [ ] 实现 DropdownPanel：搜索输入框 + 按 Provider 分组列表 → ElSelect + ElOption
- [ ] 实现 ProviderGroup：每组显示 Provider 名称 + API 连接状态点（绿/红）+ 展开模型列表
- [ ] 实现 ModelOption：模型名称 + 能力标签（vision/tool-call/reasoning 等 Tag）
- [ ] 实现"添加自定义 Provider"入口按钮
- [ ] 实现选择模型后：更新当前对话 modelId + 输入框提示更新

### ModelParametersPanel — [ElSlider / ElInputNumber]
- [ ] 实现 Temperature 控制器：Slider（ElSlider）+ 数字输入框（ElInputNumber）（0-2，步长 0.1）
- [ ] 实现 TopP 控制器：ElSlider + ElInputNumber（0-1，步长 0.01）
- [ ] 实现 MaxTokens 控制器：ElInputNumber
- [ ] 实现高级参数折叠区：PresencePenalty + FrequencyPenalty（ElInputNumber，-2 到 2）

### TokenUsageBar — [自定义组件 + ElProgress]
- [ ] 实现进度条组件：已用/总数，颜色分级（绿 <60% / 黄 60-90% / 红 >90%）→ ElProgress
- [ ] 实现 Token 数字标签："12,345 / 128,000 tokens"
- [ ] 实现接近上限时的警告提示（黄色/红色文字 + 图标）

### ProviderSettingsPage — [ElForm + ElInput + ElSwitch]
- [ ] 实现 ProviderCard 列表：每个 Provider 显示 Logo + 名称 → ElCard
- [ ] 实现 API Key 输入框（password 类型，已有密钥显示 ****）→ ElInput type="password"
- [ ] 实现"测试连接"按钮（ElButton）+ 结果显示（成功/失败图标）
- [ ] 实现 BaseUrlInput（仅自定义 Provider 可见）→ ElInput
- [ ] 实现启用/禁用开关 → ElSwitch
- [ ] 实现"添加自定义 Provider"卡片：名称 + Base URL + API Key 表单 → ElForm

## Token 估算工具

- [ ] 实现 `estimateTokens(text: string): number`：按需加载 tiktoken WASM 或使用近似公式

## API 层 — [hook-fetch: request]

- [ ] 封装 `GET /api/models/providers` → `request.get`
- [ ] 封装 `GET /api/models/providers/:id/models` → `request.get`
- [ ] 封装 `POST /api/user/api-keys` → `request.post`
- [ ] 封装 `DELETE /api/user/api-keys/:providerId` → `request.delete`
- [ ] 封装 `POST /api/user/api-keys/:providerId/test` → `request.post`
- [ ] 封装 `POST /api/providers/custom` → `request.post`
- [ ] 封装 `DELETE /api/providers/custom/:id` → `request.delete`
- [ ] 封装 `GET /api/conversations/:id/token-usage` → `request.get`

## 依赖接口

- 向对话管理模块暴露：`currentModelId`、`currentProviderId`
- 向消息功能模块暴露：当前模型参数（发送消息时携带）
- 依赖 `useConversationStore`：获取当前对话 ID 以更新 modelId

## 技术选型

| 需求 | 选型 | 说明 |
|------|------|------|
| 模型选择器 | Element Plus: `ElSelect` / `ElDropdown` | 分组下拉 + 搜索 |
| 参数滑块 | Element Plus: `ElSlider` + `ElInputNumber` | Temperature / TopP / MaxTokens |
| 进度条 | Element Plus: `ElProgress` | Token 用量展示 |
| 表单控件 | Element Plus: `ElForm` / `ElInput` / `ElSwitch` / `ElCard` | Provider 设置页 |
| API 请求 | hook-fetch: `request` | `request.get/post/put/delete(url, params)` |
| 状态管理 | Pinia `defineStore` | 封装模型选择 + 参数更新 |
*（内容由AI生成，仅供参考）*
