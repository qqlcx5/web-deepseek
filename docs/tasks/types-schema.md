# 01 - 类型系统对齐

> 需求来源：§2 数据结构契约  
> 优先级：P0  
> 目标：将 `src/types/index.ts` 中现有简化类型完全替换为需求文档 §2.1–2.6 定义的完整类型

## 任务清单

### 1.1 基础类型枚举

- [ ] 定义 `MessageRole = 'user' | 'assistant'`（移除 `'system'`）
- [ ] 定义 `MessageStatus = 'sending' | 'streaming' | 'complete' | 'error' | 'stopped'`
- [ ] 定义 `MessageBlockType = 'main_text' | 'thinking' | 'error' | 'citation' | 'tool' | 'unknown'`
- [ ] 定义 `MessageBlockStatus = 'streaming' | 'success' | 'error'`
- [ ] 定义 `ProviderType = 'openai' | 'gemini' | 'anthropic' | 'azure-openai' | 'mistral' | 'vertexai'`

### 1.2 ModelInfo 与 ModelRef

- [ ] 定义 `ModelInfo`：id, provider, name, group, supported_text_delta?, owned_by?, enabled
- [ ] 定义 `ModelRef`：id, provider, name, group, supported_text_delta?

### 1.3 Provider

- [ ] 定义 `Provider` 接口（含 apiOptions 三字段 + isSystem + isNotSupport* 兼容字段）
- [ ] 确保 `Provider.models: ModelInfo[]` 中 ModelInfo.provider 指向 Provider.id

### 1.4 AssistantSettings 与 Assistant

- [ ] 定义 `AssistantSettings`：temperature, contextCount, enableMaxTokens, maxTokens, streamOutput, topP, enableTopP, toolUseMode, customParameters, reasoning_effort?, qwenThinkMode?, enableTemperature?
- [ ] 定义 `Assistant`：含 model?, defaultModel?, enableWebSearch?, knowledgeRecognition?, mcpServers?, regularPhrases?, settings, createdAt, updatedAt
- [ ] `isDefault` 唯一约束体现在类型注释中

### 1.5 ChatMessage 与 MessageBlock

- [ ] 定义 `MessageBlock` 完整接口（含 content?, knowledgeBaseIds?, citationReferences?, thinking_millsec?, response?, toolId?, toolName?, metadata?, error?）
- [ ] 定义 `ChatMessage` 完整接口（含 blocks: MessageBlock[], modelId?, model?, usage?, mentions?, askId?, metrics?, foldSelected?, multiModelMessageStyle?）

### 1.6 Topic

- [ ] 定义 `Topic`：id, assistantId, name, messages: ChatMessage[], isNameManuallyEdited, pinned, createdAt, updatedAt

### 1.7 Settings

- [ ] 定义 `Settings` 接口，包含 §2.6 全部白名单字段（基础/话题/输入/消息显示/代码/数学/翻译/导出/多模型/布局/自定义）

### 1.8 AppData 顶层

- [ ] 定义 `AppData`：version, providers, assistants, topics, settings
- [ ] 移除旧 `AppSettings` 类型，替换为 `Settings`

### 1.9 全局替换

- [ ] 更新 `src/stores/app.ts` 中对旧类型的引用
- [ ] 更新所有 `.vue` 组件中对旧类型的引用
- [ ] 确认 `tsc --noEmit` 通过

## 验收

- `src/types/index.ts` 与需求文档 §2 完全一致
- TypeScript 编译无错误
- 所有引用旧类型的文件已更新
