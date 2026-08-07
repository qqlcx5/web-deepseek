---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_23be9f07928d11f18e22525400f8a581
    ReservedCode1: YnKVSO9MZLwgJXwYpRoKRbrPfSglMl+RY6a4hwu1b2uh1HI2/hDAj7lnrph1AUewaDgUp8n9rN6ja+gWbRKSuukPc1YLSGf56cFLnUBK3gxsMOYIUHf7b7FY80mssKKf7tBNn4LxA+/2TpO4Rt6vIwvy+vvjTZHILqJIlbndouRvHeFPRF9CLN2gzw4=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_23be9f07928d11f18e22525400f8a581
    ReservedCode2: YnKVSO9MZLwgJXwYpRoKRbrPfSglMl+RY6a4hwu1b2uh1HI2/hDAj7lnrph1AUewaDgUp8n9rN6ja+gWbRKSuukPc1YLSGf56cFLnUBK3gxsMOYIUHf7b7FY80mssKKf7tBNn4LxA+/2TpO4Rt6vIwvy+vvjTZHILqJIlbndouRvHeFPRF9CLN2gzw4=
---

# web-deepseek 数据设计与底层架构

> 从 Cherry Studio 桌面端 `data.json`（~21MB）到 Web 端运行态的完整数据设计方案。
> 所有字段均来自对真实 data.json（396 会话、1885 消息、2608 块、76 供应商）的逆向分析。

---

## 目录

1. [数据源结构：data.json 真实格式](#1-数据源结构datajson-真实格式)
2. [三层 JSON 嵌套与解析策略](#2-三层-json-嵌套与解析策略)
3. [字段映射表：原始 → 业务视图](#3-字段映射表原始--业务视图)
4. [IndexedDB 存储设计](#4-indexeddb-存储设计)
5. [导入流程：全链路状态机](#5-导入流程全链路状态机)
6. [导出流程：反向序列化](#6-导出流程反向序列化)
7. [合并策略：增量导入](#7-合并策略增量导入)
8. [类型文件职责边界](#8-类型文件职责边界)
9. [模块依赖拓扑图](#9-模块依赖拓扑图)

---

## 1. 数据源结构：data.json 真实格式

### 1.1 顶层结构

```jsonc
{
  "time": 1749464400000,       // 导出时间戳 (ms)
  "version": 5,                // Cherry Studio 数据格式版本
  "localStorage": {            // 桌面端 localStorage 快照
    "persist:cherry-studio": "<JSON字符串>",  // 核心数据，又是 JSON！
    // 可能还有其他 localStorage key...
  },
  "indexedDB": {               // 桌面端 IndexedDB 快照
    "topics":           [],    // 396 条会话元数据（不含消息体）
    "message_blocks":   [],    // 2608 条消息块
    "settings":         [],    // 22 条应用设置
    "files":            [],    // 0 条文件
    "translate_history":[],    // 24 条翻译历史
    "knowledge_notes":  [],    // 0 条知识库笔记
    "quick_phrases":    [],    // 0 条快捷短语
    "translate_languages":[]   // 0 条翻译语言
  }
}
```

### 1.2 `persist:cherry-studio` 内层（JSON 字符串 → 解析后）

```jsonc
{
  "assistants": "<JSON字符串>",  // 第三层！需再次 JSON.parse
  "llm":        "<JSON字符串>",  // 第三层！需再次 JSON.parse
  "settings":   "<JSON字符串或对象>",
  "unifiedListOrder": [...],
  "tagsOrder": [...],
  "collapsedTags": {...},
  // 以下为未映射字段，全部进入 compatZone
  "shortcuts":   "{...}",
  "codeTools":   "{...}",
  "mcp":         "{...}",
  "websearch":   "{...}",
  "knowledge":   "{...}",
  "memory":      "{...}",
  "minapps":     "{...}",
  "paintings":   "{...}",
  "copilot":     "{...}",
  "openclaw":    "{...}",
  "selectionStore": "{...}",
  "preprocess":  "{...}",
  "inputTools":  "{...}",
  "translate":   "{...}",
  "ocr":         "{...}",
  "note":        "{...}",
  "_persist":    "{...}"
}
```

### 1.3 assistants 内层（JSON 字符串 → 解析后）

```jsonc
{
  "defaultAssistant": {
    "id": "default",
    "name": "默认助手",
    "emoji": "😀",
    "prompt": "你是...",
    "type": "assistant",
    "settings": { "temperature": 0.7, ... },
    "topics": [                    // ⚠️ 消息体在这里！
      {
        "id": "topic-uuid-1",
        "assistantId": "default",
        "name": "某次对话",
        "createdAt": "2025-...",
        "updatedAt": "2025-...",
        "isNameManuallyEdited": false,
        "pinned": false,
        "messages": [              // ⚠️ 完整消息列表
          {
            "id": "msg-uuid-1",
            "role": "user",
            "topicId": "topic-uuid-1",
            "assistantId": "default",
            "createdAt": "2025-...",
            "status": "success",
            "model": { "id": "...", "name": "..." },
            "modelId": "...",
            "usage": { "prompt_tokens": 100, "completion_tokens": 50 },
            "traceId": "...",
            "askId": "msg-uuid-1",          // assistant 消息指向触发它的 user 消息
            "content": "回复内容...",
            "reasoning_content": "思考过程...",
            "blocks": ["block-uuid-1", "block-uuid-2"],
            "branchIndex": 0,
            "parentBranchIndex": -1
          }
          // ...更多消息
        ]
      }
      // ...更多 topics
    ]
  },
  "assistants": [           // 其他助手（5个）
    {
      "id": "assistant-2",
      "name": "编程助手",
      "emoji": "💻",
      "prompt": "你是编程专家...",
      "topics": [...],
      // ...同上
    }
    // ...更多
  ],
  "presets": [              // 助手预设（10个）
    { "id": "...", "name": "...", "emoji": "..." }
  ]
}
```

### 1.4 indexedDB.topics vs assistant.topics（关键差异）

| 字段 | `indexedDB.topics[]` | `assistant.topics[].messages[]` |
|------|---------------------|--------------------------------|
| id | ✅ | ✅ |
| assistantId | ✅ | ✅ (在 message 上) |
| name | ✅ | ✅ |
| createdAt | ✅ | ✅ |
| updatedAt | ✅ | ✅ |
| isNameManuallyEdited | ✅ | 无 |
| pinned | ✅ | 无 |
| messages | ❌ **不含** | ✅ **完整消息数组** |

**结论**：必须合并两处来源。`indexedDB.topics` 提供元数据，`assistant.topics` 提供消息体。

### 1.5 message_blocks 类型分布（2608 条）

```
main_text:  1860  (71.3%)   主文本内容
thinking:    635  (24.3%)   思维链/推理过程
citation:     59  ( 2.3%)   引用来源
error:        30  ( 1.2%)   错误消息
tool:          9  ( 0.3%)   工具调用结果
image:         1  ( 0.04%)  图片
unknown:      14  ( 0.5%)   未识别类型
```

### 1.6 providers 真实结构（76 个供应商）

```jsonc
{
  "id": "provider-uuid",
  "name": "Anthropic",
  "apiHost": "https://api.anthropic.com",
  "apiKey": "sk-ant-...",           // 导出时可能保留或清空
  "apiPath": "/v1/messages",
  "isSystem": false,
  "enabled": true,
  "models": [
    {
      "id": "claude-sonnet-4-20250514",
      "name": "Claude Sonnet 4",
      "provider": "Anthropic",
      "group": "Claude",
      "enabled": true,
      "capabilities": [{ "type": "vision" }],
      "pricing": {
        "input_per_million_tokens": 3.0,
        "output_per_million_tokens": 15.0
      }
    }
  ]
}
```

---

## 2. 三层 JSON 嵌套与解析策略

### 2.1 解析层级图

```
data.json (21MB 单行)
    │
    ├─ [第 1 层] JSON.parse(data.json)
    │   产出: { time, version, localStorage, indexedDB }
    │
    ├─ [第 2 层] JSON.parse(localStorage["persist:cherry-studio"])
    │   产出: { assistants:"...", llm:"...", settings:"...", ... }
    │
    └─ [第 3 层] JSON.parse(persist.assistants)
              JSON.parse(persist.llm)
              JSON.parse(persist.settings)  或直接取对象
        产出: CherryAssistantsData, CherryLLMData, Settings
```

### 2.2 安全解析函数

```typescript
// src/utils/cherry-parser.ts
function safeParse<T>(value: unknown, label: string): T {
  if (typeof value === 'string') {
    return JSON.parse(value) as T;    // 字符串 → 解析
  }
  if (typeof value === 'object' && value !== null) {
    return value as T;                 // 已是对象 → 直接返回
  }
  throw new Error(`数据格式错误：${label}`);
}
```

**设计理由**：Cherry Studio 不同版本中，`assistants`/`llm`/`settings` 有时是字符串，有时已是对象。`safeParse` 兼容两种情况。

### 2.3 兼容保留区（compatZone）

解析过程中，所有未被 Web 端显式映射的字段统一收集到 `compatZone`，确保导出时原样写回。

```typescript
// persist 层未映射字段 → compatZone["persist.xxx"]
compatZone["persist.shortcuts"] = persistBase.shortcuts;
compatZone["persist.mcp"] = persistBase.mcp;
// ...

// localStorage 层未映射字段 → compatZone["localStorage.xxx"]
compatZone["localStorage.other_key"] = localStorageRaw.other_key;
```

---

## 3. 字段映射表：原始 → 业务视图

### 3.1 Provider 映射

| 原始字段 (CherryProvider) | 目标字段 (Provider) | 映射逻辑 |
|--------------------------|-------------------|---------|
| `id` | `id` | 直传 |
| `name` | `name` | 直传 |
| `apiHost` | `apiHost` | 直传 |
| `apiKey` | `apiKey` | 直传，导出时可清空 |
| `apiPath` | `apiPath` | 可选 |
| `enabled` | `enabled` | 默认 true |
| `models[].id` | `models[].id` | 直传 |
| `models[].name` | `models[].name` | 直传 |
| `models[].provider` | `models[].providerId` | **重命名**，反填父 provider.id |
| `models[].description` | `models[].description` | 可选 |
| `models[].maxTokens` | `models[].maxTokens` | 可选 |
| `models[].contextLength` | `models[].contextLength` | 可选 |
| - | `models[].temperature` | Web 端不映射（运行时默认） |
| - | `models[].topP` | Web 端不映射（运行时默认） |

### 3.2 Assistant 映射

| 原始字段 (CherryAssistant) | 目标字段 (Assistant) | 映射逻辑 |
|---------------------------|--------------------|---------|
| `id` | `id` | 直传 |
| `name` | `name` | 直传 |
| `emoji` | `emoji` | 直传 |
| `prompt` | `prompt` | 直传 |
| `settings.temperature` | `temperature` | 可选，来源 `ca.settings?.temperature` |
| `settings.topP` | `topP` | 可选 |
| `settings.maxTokens` | `maxTokens` | 可选 |
| - | `model` | Web 端不映射（导入时不绑定模型） |
| - | `avatar` | Web 端不映射 |
| - | `description` | Web 端不映射 |
| `id === defaultAssistant.id` | `isDefault` | 计算字段 |

### 3.3 Topic 映射

| 原始字段 | 目标字段 (Topic) | 映射逻辑 |
|---------|-----------------|---------|
| `ct.id` (assistant.topics) | `id` | 直传 |
| `ct.assistantId` | `assistantId` | 直传 |
| `ct.name` | `name` | 直传，空则 "未命名会话" |
| `ct.messages[]` | `messages[]` | **逐个映射**（见 3.4） |
| `ct.isNameManuallyEdited` | `isNameManuallyEdited` | 可选 |
| `ct.pinned` | `pinned` | 可选 |
| `ct.createdAt` | `createdAt` | 直传 |
| `ct.updatedAt` | `updatedAt` | 直传 |
| `tr.id` (indexedDB.topics) | `id` | 仅当 assistant.topics 中没有此 id 时 |
| `tr.assistantId` | `assistantId` | 同上 |
| `tr.name` | `name` | 同上 |

### 3.4 Message 映射

| 原始字段 (CherryMessage) | 目标字段 (Message) | 映射逻辑 |
|-------------------------|-------------------|---------|
| `id` | `id` | 直传 |
| `topicId` | `topicId` | 直传 |
| `role` | `role` | 类型收窄为 `"user" \| "assistant" \| "system" \| "tool"` |
| `content` | `content` | 直传 |
| `reasoning_content` | `reasoningContent` | **重命名**（camelCase） |
| `model?.id` 或 `modelId` | `model` | 取 `model.id` 或 `modelId` |
| `blocks` | `blocks` | 直传（block ID 数组） |
| `askId` | `askId` | 直传 |
| `createdAt` | `createdAt` | 直传 |
| `status` | `status` | 映射：`"success"` → `"done"`，其他保持 |
| `branchIndex` | `branchIndex` | 可选 |
| `parentBranchIndex` | `parentBranchIndex` | 可选 |
| - | `tokens` | Web 端不映射（按需从 usage 计算） |

---

## 4. IndexedDB 存储设计

### 4.1 数据库 Schema

```
数据库名: cherry-studio-web
版本号:   1
Object Store: appData

┌────────────────────────────────────┐
│  Store: appData                    │
│  keyPath: "id"                     │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ key: "main"                  │  │
│  │ value: AppData (完整JSON)    │  │
│  │ {                            │  │
│  │   version: "5",              │  │
│  │   providers: [...],          │  │
│  │   assistants: [...],         │  │
│  │   topics: [                  │  │
│  │     {                        │  │
│  │       id: "...",             │  │
│  │       messages: [...]       │  │
│  │     }                        │  │
│  │   ],                         │  │
│  │   settings: {...},           │  │
│  │   cherryData: {...},         │  │
│  │   compatZone: {...}          │  │
│  │ }                            │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

### 4.2 单 Store vs 多 Store 设计决策

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| **单 Store**（当前） | 读写原子性、无跨表引用断裂、简单 | 更新整个对象时需序列化 | ✅ 采用 |
| 多 Store（已删除的 idb.ts） | 可单独读写 topics/blocks | 跨表引用易断裂、事务复杂 | ❌ 废弃 |

**决策依据**：话题-消息-消息块是强关联数据，一次对话操作常同时涉及三者，单 Store 保证原子性。

### 4.3 API 设计

```typescript
// src/utils/db.ts

// 打开数据库（懒初始化，单例）
openDB(): Promise<IDBDatabase>

// 读写
saveAppData(data: AppData): Promise<void>   // put({ id: "main", ...data })
loadAppData(): Promise<AppData | null>      // get("main") → 解包
clearAppData(): Promise<void>               // delete("main")
```

---

## 5. 导入流程：全链路状态机

### 5.1 导入入口

```
用户操作                     代码路径                       状态变化
─────────                   ─────────                     ────────
拖拽/选择 data.json 文件
  │
  ▼
FileReader.readAsText       importFromFile()              File → UTF-8 字符串
  │
  ▼
JSON 校验 + 三层解析         parseDataJSON()              文本 → ParsedCherryData
  │                          ├─ JSON.parse 第一层
  │                          ├─ JSON.parse 第二层
  │                          └─ JSON.parse 第三层
  ▼
字段映射 + 去重合并           buildAppData()               ParsedCherryData → AppData
  │                          ├─ providers 扁平化
  │                          ├─ assistants 映射
  │                          ├─ topics 合并 (assistant + indexedDB)
  │                          ├─ messages 逐个映射
  │                          └─ compatZone 收集
  ▼
与已有数据合并               mergeAppData()               (existing, imported) → AppData
  │                          ├─ providers/assistants 按 id 覆盖
  │                          ├─ topics 按 id 合并 messages
  │                          └─ settings 覆盖
  ▼
写入 IndexedDB              store.importData()            AppData → IndexedDB
  │                          └─ db.saveAppData()
  ▼
更新 Store 状态             isImported = true             触发 UI 切换
```

### 5.2 topic 合并去重逻辑（核心）

```typescript
// 伪代码
const topicMap = new Map<string, Topic>()

// 第 1 轮：遍历 assistant.topics（含 messages）
for (const assistant of assistants) {
  for (const ct of assistant.topics) {
    if (topicMap.has(ct.id)) continue  // 已存在则跳过
    topicMap.set(ct.id, {
      id: ct.id,
      assistantId: ct.assistantId,
      name: ct.name || "未命名会话",
      messages: ct.messages.map(toMessage),  // 完整映射
      pinned: ct.pinned,
      createdAt: ct.createdAt,
      updatedAt: ct.updatedAt,
    })
  }
}

// 第 2 轮：补充 indexedDB.topics（仅元数据，无 messages）
for (const tr of indexedDB.topics) {
  if (topicMap.has(tr.id)) continue       // 已有则跳过
  topicMap.set(tr.id, {
    id: tr.id,
    assistantId: tr.assistantId,
    name: tr.name || "未命名会话",
    messages: [],                          // 空消息列表
    pinned: tr.pinned,
    createdAt: tr.createdAt,
    updatedAt: tr.updatedAt,
  })
}
```

### 5.3 排序规则

```typescript
topics.sort((a, b) => {
  if (a.pinned && !b.pinned) return -1    // 置顶优先
  if (!a.pinned && b.pinned) return 1
  return new Date(b.createdAt) - new Date(a.createdAt)  // 时间倒序
})
```

---

## 6. 导出流程：反向序列化

### 6.1 两条导出路径

```
                          loadAppData()
                               │
                    ┌──────────┴──────────┐
                    │                     │
             cherryData 存在?       cherryData 不存在?
                    │                     │
                    ▼                     ▼
          buildExportFromRaw()    buildExportFromScratch()
                    │                     │
             基于原始结构          从业务视图构建
             原地更新字段           完整 data.json
                    │                     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  validateReferences │
                    │  → 助手引用完整性   │
                    │  → 模型引用完整性   │
                    │  → block 引用完整性 │
                    └──────────┬──────────┘
                               │
                               ▼
                     JSON.stringify()
                               │
                               ▼
                       downloadJson()
```

### 6.2 API Key 安全处理

```typescript
// 导出时默认移除 API Key
if (!includeApiKeys) {
  for (const provider of dataToExport.providers) {
    delete provider.apiKey
  }
}
```

---

## 7. 合并策略：增量导入

用户可能多次导入 data.json（例如桌面端导出 → Web 端增量同步）。

```
mergeAppData(existing, imported):

  providers  ──→ 按 id 覆盖（新数据优先）
  assistants ──→ 按 id 覆盖（新数据优先）
  topics     ──→ 按 id 合并：
                   已有 topic → 保留已有消息 + 追加新消息（按消息 id 去重）
                   新 topic   → 直接加入
  settings   ──→ 新数据覆盖
  cherryData ──→ 新数据覆盖
  compatZone ──→ 新数据覆盖
```

**去重逻辑**：
```typescript
const existingMsgIds = new Set(existingTopic.messages.map(m => m.id))
const newMessages = imported.messages.filter(m => !existingMsgIds.has(m.id))
existingTopic.messages.push(...newMessages)
```

---

## 8. 类型文件职责边界

```
src/types/
├── index.ts            业务视图类型
│   ├── Provider, ModelInfo      模型供应商
│   ├── Assistant                助手
│   ├── Topic, Message           会话与消息
│   ├── Settings                 应用设置
│   ├── AppData                  根数据结构（IndexedDB 存储单元）
│   └── ChatStreamDelta          流式响应增量
│
└── cherry-data.ts      原始 Cherry Studio 类型
    ├── CherryData                data.json 顶层
    ├── CherryPersist             persist:cherry-studio 结构
    ├── CherryAssistantsData      助手数据（default + list）
    ├── CherryLLMData             模型供应商数据
    ├── CherryAssistant           单个助手
    ├── CherryProvider            单个供应商
    ├── CherryTopicRecord         indexedDB.topics 记录
    ├── CherryMessage             原始消息结构
    ├── CherryMessageBlock        消息块
    └── ParsedCherryData          解析后统一输出
```

**引用规则**：
- `types/index.ts` → 被 Store / 页面 / composable 引用
- `types/cherry-data.ts` → **仅**被 `cherry-parser.ts`、`data-import.ts`、`cherry-export.ts` 引用
- 业务代码**不直接** import `types/cherry-data.ts`

---

## 9. 模块依赖拓扑图

```
                    ┌──────────────────────────────┐
                    │       types/cherry-data.ts    │
                    │   (CherryData, CherryPersist, │
                    │    ParsedCherryData, ...)     │
                    └──────┬───────────┬───────────┘
                           │           │
              ┌────────────┘           └────────────┐
              ▼                                     ▼
┌──────────────────────────┐        ┌──────────────────────────┐
│   utils/cherry-parser.ts │        │   utils/data-import.ts   │
│   parseDataJSON()        │───────→│   buildAppData()         │
│   → ParsedCherryData     │        │   mergeAppData()         │
└──────────────────────────┘        └───────────┬──────────────┘
                                                │
                         ┌──────────────────────┘
                         ▼
              ┌──────────────────────────┐
              │      types/index.ts      │
              │  (AppData, Provider,     │
              │   Assistant, Topic, ...) │
              └──────┬───────────┬───────┘
                     │           │
        ┌────────────┘           └──────────────┐
        ▼                                       ▼
┌─────────────────┐                  ┌──────────────────────┐
│   utils/db.ts   │                  │ utils/cherry-export  │
│   saveAppData() │                  │ buildExportJSON()    │
│   loadAppData() │                  │ validateReferences() │
└────────┬────────┘                  └──────────┬───────────┘
         │                                      │
         └──────────────────┬───────────────────┘
                            ▼
              ┌──────────────────────────┐
              │ stores/modules/app.ts    │
              │   useAppStore (Pinia)    │
              │   importData / exportData│
              │   addMessage / addTopic  │
              └──────────────┬───────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
  ┌────────────┐    ┌────────────────┐    ┌──────────────┐
  │pages/index │    │useChatState.ts │    │useOrbitState │
  │ 导入/导出   │    │   聊天状态      │    │  演示态数据   │
  └────────────┘    └────────────────┘    └──────────────┘
```

**依赖方向**：单向无环。`types → utils → stores → pages`。

---

## 附录：数据规模参考

| 指标 | 值 |
|------|-----|
| data.json 文件大小 | ~21.3 MB |
| 供应商数量 | 76 |
| 助手数量 | 5（含 1 个默认） |
| 助手预设 | 10 |
| 会话数量 | 396 |
| 消息数量 | 1,885 |
| 消息块数量 | 2,608 |
| IndexedDB 持久化后 AppData 大小 | ~15-20 MB (JSON) |
*（内容由AI生成，仅供参考）*
