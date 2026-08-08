# 08 - store-app（应用数据 Store）

> 路径: `src/stores/app.ts`
> 依赖: `db`, `data-import`, `cherry-export`, `types`

---

## 任务清单

### State

- [ ] T08-1 定义 `version`、`providers`、`assistants`、`topics`、`isImported`、`loading` 等 ref

### Getters

- [ ] T08-2 `defaultAssistant` — 找 isDefault 或第一个
- [ ] T08-3 `topicById(id)` — Map 缓存查找
- [ ] T08-4 `sortedTopics` — pinned 优先 + createdAt 倒序

### 持久化

- [ ] T08-5 实现 `init()` — 从 IndexedDB 加载 AppData，hydrate 到 state
- [ ] T08-6 实现 `persist()` — 将 state 组装为 AppData，saveAppData 到 IndexedDB

### Topic CRUD

- [ ] T08-7 `addTopic(assistantId): Topic` — 生成新 topic 对象，unshift 到 topics，persist
- [ ] T08-8 `deleteTopic(id)` — 从 topics 过滤删除，persist
- [ ] T08-9 `renameTopic(id, name)` — 更新 name + isNameManuallyEdited，persist

### Message 操作

- [ ] T08-10 `addMessage(topicId, message)` — push 到 topic.messages，更新 updatedAt，persist
- [ ] T08-11 `updateMessage(topicId, message)` — 按 id 查找替换，persist

### 导入导出

- [ ] T08-12 `importData(file: File)` — 调用 `importFromFile`，hydrate 结果，isImported = true
- [ ] T08-13 `exportData(options?)` — 校验引用完整性 → buildExportJSON → downloadJson

### 内部工具

- [ ] T08-14 `hydrate(data: AppData)` — 将 AppData 字段填充到各 ref

### 验证

- [ ] T08-15 init → addTopic → addMessage → persist → 重新 init 数据一致
- [ ] T08-16 导入文件后 topics 正确填充
- [ ] T08-17 导出文件能通过 validateReferences
- [ ] T08-18 `tsc --noEmit` 类型检查通过
