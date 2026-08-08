# 03 - cherry-parser（Cherry Studio 数据解析模块）

> 路径: `src/utils/cherry-parser.ts`
> 依赖: `types/cherry-data.ts`

---

## 任务清单

### 安全解析函数

- [ ] T03-1 实现 `safeParse<T>(value: unknown, label: string): T` — 兼容 string（JSON.parse）和 object（直接返回），其他 throw Error

### 三层解析

- [ ] T03-2 实现 `parseDataJSON(rawText: string): ParsedCherryData` 入口函数
- [ ] T03-3 第 1 层：`JSON.parse(rawText)` → `CherryData`（含 time, version, localStorage, indexedDB）
- [ ] T03-4 第 2 层：`safeParse(localStorage['persist:cherry-studio'])` → `CherryPersist`
- [ ] T03-5 第 3 层：`safeParse(persist.assistants)` → `CherryAssistantsData`
- [ ] T03-6 第 3 层：`safeParse(persist.llm)` → `CherryLLMData`
- [ ] T03-7 第 3 层：`safeParse(persist.settings)` → `Record<string, unknown>`（兼容字符串或对象）

### compatZone 收集

- [ ] T03-8 收集 persist 层未映射字段到 `compatZone['persist.xxx']`（shortcuts, codeTools, mcp, websearch, knowledge, memory, minapps, paintings, copilot, openclaw, selectionStore, preprocess, inputTools, translate, ocr, note, _persist）
- [ ] T03-9 收集 localStorage 层其他 key 到 `compatZone['localStorage.xxx']`

### 防御处理

- [ ] T03-10 `localStorage` 或 `persist:cherry-studio` 字段缺失时，给空对象兜底不崩溃
- [ ] T03-11 `assistants` / `llm` / `settings` 字段同时缺失时 throw 明确错误

### 验证

- [ ] T03-12 准备一个最小 data.json 样例文件，解析后字段完整
- [ ] T03-13 验证 compatZone 中保留了所有未映射字段
- [ ] T03-14 `tsc --noEmit` 类型检查通过
