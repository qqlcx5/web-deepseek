# 04 - Assistant 管理

> 需求来源：§3 F-02  
> 优先级：P0  
> 目标：Assistant CRUD、isDefault 唯一约束、删除迁移、导入

## 任务清单

### 4.1 Assistant 列表

- [ ] 创建 `src/views/AssistantView.vue`，展示 Assistant 列表（emoji, name, model, 状态）
- [ ] 支持启用/禁用切换
- [ ] 默认 Assistant 标记徽章

### 4.2 Assistant 编辑表单

- [ ] 创建 `src/components/AssistantForm.vue`（Dialog + Form + Tabs）
- [ ] 基本信息页：name, emoji, description, prompt
- [ ] 模型页：model 选择器（按 Provider 分组）, defaultModel 选择器
- [ ] 设置页：temperature, contextCount, enableMaxTokens, maxTokens, streamOutput, topP, enableTopP, toolUseMode, reasoning_effort, qwenThinkMode, enableTemperature
- [ ] 功能开关：enableWebSearch, knowledgeRecognition, mcpServers, regularPhrases

### 4.3 isDefault 唯一约束

- [ ] 设置默认时清除其他 Assistant 的 isDefault
- [ ] 必须且只能有一个 isDefault=true
- [ ] 删除默认 Assistant 时自动将第一个剩余 Assistant 设为默认

### 4.4 删除与迁移

- [ ] 删除有 Topic 的 Assistant 时弹出选择对话框
- [ ] 选项 1：迁移 Topic 到目标 Assistant（选择下拉）
- [ ] 选项 2：级联删除所有关联 Topic
- [ ] 迁移时更新所有 Topic.assistantId 和 ChatMessage.assistantId

### 4.5 导入 Assistant

- [ ] 支持 JSON 文件导入
- [ ] 支持剪贴板粘贴 JSON 导入
- [ ] 支持 URL 导入（fetch JSON）
- [ ] 导入后按 ID 去重，已存在的 ID 跳过并提示

### 4.6 Store Actions

- [ ] `createAssistant(data)`, `updateAssistant(id, patch)`, `deleteAssistant(id, options)`
- [ ] `setDefaultAssistant(id)`
- [ ] `importAssistants(data[])`

## 验收

- CRUD 功能正常
- isDefault 唯一性始终满足
- 删除带 Topic 的 Assistant 时迁移/级联正常
- 导入 Assistant 去重正常
