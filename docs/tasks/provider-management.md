# 03 - Provider 管理

> 需求来源：§3 F-01  
> 优先级：P0  
> 目标：Provider/Model 的 CRUD 管理，引用保护，模型选择器

## 任务清单

### 3.1 Provider 列表页

- [ ] 创建 `src/views/ProviderView.vue`，展示 Provider 列表（名称、类型、状态、模型数）
- [ ] 支持启用/禁用切换（Switch）
- [ ] `isSystem=true` 的 Provider 禁用删除按钮，允许禁用

### 3.2 Provider 编辑表单

- [ ] 创建 `src/components/ProviderForm.vue`（Dialog + Form）
- [ ] 字段：name, type（6 种）, apiHost, apiKey, enabled, isSystem
- [ ] apiOptions 三个兼容标志的编辑（isNotSupportArrayContent, isNotSupportDeveloperRole, isNotSupportStreamOptions）
- [ ] 保存时校验：name 非空、apiHost 格式

### 3.3 模型管理

- [ ] Provider 编辑页内嵌模型列表表格
- [ ] 模型 CRUD：创建（id, name, group, enabled）、重命名、启用/禁用、删除
- [ ] 同一 Provider 内 ModelInfo.id 唯一性校验
- [ ] 模型选择器只展示 `enabled=true` 的模型

### 3.4 删除引用保护

- [ ] 删除 Provider 前：扫描所有 Assistant 的 model.provider 引用
- [ ] 删除 Model 前：扫描所有 Assistant 的 model.id 引用
- [ ] 存在引用时弹出 ElMessage 阻止删除，列出引用的 Assistant 名称

### 3.5 Store Actions

- [ ] `createProvider(data)`, `updateProvider(id, patch)`, `deleteProvider(id)`
- [ ] `createModel(providerId, data)`, `updateModel(providerId, modelId, patch)`, `deleteModel(providerId, modelId)`
- [ ] 删除操作前调用引用检查函数

## 验收

- 创建/编辑/删除 Provider 和 Model 功能正常
- isSystem Provider 不可删除
- 删除被引用的 Provider/Model 被阻止并提示
