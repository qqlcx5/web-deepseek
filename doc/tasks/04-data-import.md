# 04 - data-import（数据导入与合并模块）

> 路径: `src/utils/data-import.ts`
> 依赖: `cherry-parser`, `db`, `types`

---

## 任务清单

### Provider 映射

- [ ] T04-1 实现 `mapProviders(llmData: CherryLLMData): Provider[]` — 扁平化 models，`provider` 重命名为 `providerId`（反填父 provider.id）
- [ ] T04-2 处理 `enabled` 默认值为 true
- [ ] T04-3 保留可选字段 `apiPath`、`maxTokens`、`contextLength`

### Assistant 映射

- [ ] T04-4 实现 `mapAssistants(data: CherryAssistantsData): Assistant[]` — 合并 defaultAssistant + assistants[]
- [ ] T04-5 从 `ca.settings` 提取 `temperature`、`topP`、`maxTokens`
- [ ] T04-6 标记 `isDefault`（id === defaultAssistant.id）

### Topic 映射

- [ ] T04-7 实现 `mapTopics(parsed: ParsedCherryData): Topic[]` — 第 1 轮遍历 `assistant.topics`（含 messages）
- [ ] T04-8 第 2 轮补充 `indexedDB.topics`（仅元数据无 messages，空消息列表）
- [ ] T04-9 `name` 为空时兜底为 "未命名会话"
- [ ] T04-10 排序：pinned 优先，同优先级按 createdAt 倒序

### Message 映射

- [ ] T04-11 实现 `mapMessage(msg: CherryMessage): Message` — `reasoning_content` → `reasoningContent`
- [ ] T04-12 `status: "success"` → `"done"` 映射
- [ ] T04-13 `model.id` 或 `modelId` → `model` 字段
- [ ] T04-14 role 类型收窄为 `"user" | "assistant" | "system" | "tool"`

### buildAppData

- [ ] T04-15 实现 `buildAppData(parsed: ParsedCherryData): AppData` — 组装 version、providers、assistants、topics、settings、cherryData、compatZone

### mergeAppData

- [ ] T04-16 实现 `mergeAppData(existing: AppData, imported: AppData): AppData` — providers/assistants 按 id 覆盖
- [ ] T04-17 topics 按 id 合并：已有 topic 保留消息 + 追加新消息（按消息 id 去重）
- [ ] T04-18 settings / cherryData / compatZone 新数据覆盖

### importFromFile

- [ ] T04-19 实现 `importFromFile(file: File): Promise<AppData>` — `file.text()` → `parseDataJSON` → `buildAppData` → `loadAppData` → `mergeAppData` → `saveAppData`

### 验证

- [ ] T04-20 用真实 data.json 样例测试完整导入流程
- [ ] T04-21 测试增量导入（导入两次同一文件，数据不重复）
- [ ] T04-22 `tsc --noEmit` 类型检查通过
