# 01 - types（类型系统）

> 路径: `src/types/index.ts` + `src/types/cherry-data.ts`
> 依赖: 无（被所有模块依赖）

---

## 任务清单

### index.ts — 业务类型

- [ ] T01-1 定义 `Provider` 接口（id, name, apiHost, apiKey?, apiPath?, models, enabled）
- [ ] T01-2 定义 `ModelInfo` 接口（id, name, providerId, description?, maxTokens?, contextLength?, enabled）
- [ ] T01-3 定义 `Assistant` 接口（id, name, description?, prompt, temperature?, topP?, maxTokens?, model?, avatar?, enabled, isDefault?, tags?, emoji?, createdAt?, updatedAt?）
- [ ] T01-4 定义 `Topic` 接口（id, assistantId, name, messages, prompt?, temperature?, topP?, maxTokens?, model?, isNameManuallyEdited?, pinned?, favorite?, archived?, tags?, createdAt?, updatedAt?）
- [ ] T01-5 定义 `Message` 接口（id, topicId, role, content, reasoningContent?, model?, tokens?, blocks?, askId?, branchIndex?, parentBranchIndex?, createdAt, status）
- [ ] T01-6 定义 `AppData` 接口（version, providers, assistants, topics, settings?, cherryData?, compatZone?）
- [ ] T01-7 定义 `Settings` 接口（language?, theme?, fontSize?, sendShortcut?, maxContextLength?, autoScroll?）
- [ ] T01-8 定义 `ChatStreamDelta` 接口（id?, content?, reasoning_content?, model?, usage?）

### index.ts — UI 展示层类型

- [ ] T01-9 定义 `MessageUI extends Message`（loading?, rating?, sources?, artifact?, branches?, activeBranch?）
- [ ] T01-10 定义 `Source`（name, domain, url）
- [ ] T01-11 定义 `Artifact`（name, meta, type?, size?）
- [ ] T01-12 定义 `Attachment`（id, name, size）
- [ ] T01-13 定义 `Workspace`（id, name, color, count）
- [ ] T01-14 定义 `ModelUI`（id, name, color, description, tags）
- [ ] T01-15 定义 `Command`（id, name, icon, shortcut?, action）
- [ ] T01-16 定义 `PromptPreset`（id, name, content）

### cherry-data.ts — Cherry Studio 原始类型

- [ ] T01-17 定义 `CherryData`（data.json 顶层：time, version, localStorage, indexedDB）
- [ ] T01-18 定义 `CherryPersist`（persist:cherry-studio 结构：assistants, llm, settings, 其他未映射字段）
- [ ] T01-19 定义 `CherryAssistantsData`（defaultAssistant, assistants[], presets[]）
- [ ] T01-20 定义 `CherryLLMData`（providers[]）
- [ ] T01-21 定义 `CherryProvider`（id, name, apiHost, apiKey, apiPath, isSystem, enabled, models[]）
- [ ] T01-22 定义 `CherryAssistant`（id, name, emoji, prompt, type, settings, topics[]）
- [ ] T01-23 定义 `CherryTopicRecord`（indexedDB.topics 记录：id, assistantId, name, createdAt, updatedAt, isNameManuallyEdited, pinned — 不含 messages）
- [ ] T01-24 定义 `CherryMessage`（id, role, topicId, assistantId, createdAt, status, model, modelId, usage, traceId, askId, content, reasoning_content, blocks, branchIndex, parentBranchIndex）
- [ ] T01-25 定义 `CherryMessageBlock`（id, type, content — type 为 main_text/thinking/citation/error/tool/image/unknown）
- [ ] T01-26 定义 `ParsedCherryData`（rawData, persist, assistantsData, llmData, settings, indexedDB, compatZone）

### 验证

- [ ] T01-27 `tsc --noEmit` 类型检查通过
- [ ] T01-28 确认 `cherry-data.ts` 不被业务代码直接 import（仅被 cherry-parser/data-import/cherry-export 引用）
