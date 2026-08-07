---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_230b05ad928d11f18e22525400f8a581
    ReservedCode1: nfungUyU7YF9tZ2XiANbpgukFWGT9lsWgP91HXGguXWsXwkS/h3dk47ufFjTaIIcPGqn5aZksViu8e85lKkcb5SKK1W4+OSZTD0E52iJ3tLReykJ3fIn+2SIEfBZD+LXWA4XWTDR1gCm2Ktp8JG9XZCS4NMAGOi2QkWj9p6xDvgwPmmEgOWsBrXchDc=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_230b05ad928d11f18e22525400f8a581
    ReservedCode2: nfungUyU7YF9tZ2XiANbpgukFWGT9lsWgP91HXGguXWsXwkS/h3dk47ufFjTaIIcPGqn5aZksViu8e85lKkcb5SKK1W4+OSZTD0E52iJ3tLReykJ3fIn+2SIEfBZD+LXWA4XWTDR1gCm2Ktp8JG9XZCS4NMAGOi2QkWj9p6xDvgwPmmEgOWsBrXchDc=
---

# web-deepseek 数据架构文档

> 基于 Cherry Studio 桌面端 `data.json`（~21MB）的 Web 端数据互通方案。
> 本文档供 AI / 开发者快速了解全貌，所有引用以项目实际代码为准。

---

## 1. 总体架构

```
data.json (21MB, ~396 topics, ~1885 messages, 2608 blocks, 76 providers)
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  cherry-parser.ts         3 层 JSON 解析                 │
│  → 第一层: JSON.parse(data.json)                        │
│  → 第二层: localStorage["persist:cherry-studio"] JSON   │
│  → 第三层: persist.assistants / llm / settings JSON     │
│  输出: ParsedCherryData                                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  data-import.ts           映射 + 去重                    │
│  → providers: llm.providers 扁平化                       │
│  → assistants: cherry assistants → Assistant[]          │
│  → topics: assistant.topics + indexedDB.topics 合并     │
│  → messages: topic.messages → Message[]                 │
│  → compatZone: 未映射字段保留                           │
│  输出: { appData: AppData, stats: ImportStats }         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  stores/modules/app.ts    Pinia Store (唯一数据源)       │
│  → importData(file) → db.saveAppData(appData)           │
│  → exportData()     → cherry-export.ts                  │
│  → addMessage() / addTopic() / updateProvider() ...     │
│  → 状态: providers / assistants / topics / messages     │
│  → 视图: topicList / currentTopic / currentMessages     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  utils/db.ts              IndexedDB 持久化              │
│  数据库: cherry-studio-web, v1                          │
│  单 Store: appData, keyPath "id", 值 AppData            │
│  → saveAppData / loadAppData / clearAppData             │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 类型体系

分两层，分别对应原始 Cherry 格式和 Web 端业务视图。

### 2.1 原始类型（`types/cherry-data.ts`，304行）

面向 Cherry Studio `data.json` 的真实结构，用于解析和导出兼容。

```typescript
// ---- data.json 顶层 ----
CherryData {
  time: number                // 导出时间戳
  version: number             // 数据版本 (5)
  localStorage: {             // Cherry Studio 本地存储
    "persist:cherry-studio": string   // 又是一个 JSON 字符串
  }
  indexedDB: {
    topics: CherryTopicRecord[]       // 396条，仅 id + 元数据
    message_blocks: CherryMessageBlock[] // 2608条
    settings? / files? / translate_history? / ...  // 其他表
  }
}

// ---- persist:cherry-studio 内层 ----
CherryPersist {
  assistants: CherryAssistantsData   // 默认助手 + 助手列表
  llm: CherryLLMData                 // 模型供应商列表
  settings: object                   // 应用设置
  unifiedListOrder? / tagsOrder? / collapsedTags?
}

// ---- 助手 ----
CherryAssistantsData {
  defaultAssistant: CherryAssistant  // id/name/emoji/prompt/topics/messages
  assistants: CherryAssistant[]      // 5个
  presets: CherryAssistantPreset[]   // 10个预设
}

// ---- 供应商 ----
CherryLLMData {
  providers: CherryProvider[]        // 76个，含 id/apiHost/apiKey/models
}

// ---- IndexedDB 记录 ----
CherryTopicRecord {
  id: string
  assistantId: string
  name: string
  createdAt: string
  updatedAt: string
  isNameManuallyEdited: boolean
  pinned: boolean
  // 注意：messages 不在 indexedDB.topics 里，在 assistant.topics 里
}

CherryMessageBlock {
  id: string
  messageId: string
  type: "main_text" | "thinking" | "citation" | "error" | "tool" | "image" | ...
  createdAt: string
  status: "pending" | "success" | "error"
  content: string
  citationReferences?: unknown
}

// ---- 解析后的统一输出 ----
ParsedCherryData {
  raw: CherryData              // 完整原始数据
  persist: CherryPersist       // 解析后的 persist
  assistants: CherryAssistant[]// 助手列表（含 default）
  defaultAssistant: CherryAssistant
  providers: CherryProvider[]  // 扁平化供应商列表
  topicRecords: CherryTopicRecord[]   // indexedDB.topics
  messageBlocks: CherryMessageBlock[] // indexedDB.message_blocks
  compatZone: Record<string, unknown> // 未映射字段保留
}
```

### 2.2 业务类型（`types/index.ts`，225行）

面向 Web 端功能使用，字段更精简、语义更清晰。

```typescript
// ---- 模型供应商 ----
Provider {
  id: string
  name: string
  apiHost: string
  apiKey?: string
  apiPath?: string
  models: ModelInfo[]
  enabled: boolean
}

// ---- 模型 ----
ModelInfo {
  id: string
  name: string
  providerId: string
  description?: string
  maxTokens?: number
  contextLength?: number
  enabled: boolean
}

// ---- 助手 ----
Assistant {
  id: string
  name: string
  description?: string
  prompt: string
  temperature?: number
  topP?: number
  maxTokens?: number
  model?: string
  avatar?: string
  enabled: boolean
  isDefault?: boolean          // 导入自 data.json 的默认助手
  tags?: string[]
  emoji?: string
  createdAt?: string
  updatedAt?: string
}

// ---- 会话 ----
Topic {
  id: string
  assistantId: string
  name: string
  messages: Message[]
  prompt?: string              // 覆盖提示词
  temperature?: number
  topP?: number
  maxTokens?: number
  model?: string               // 覆盖模型
  isNameManuallyEdited?: boolean
  pinned?: boolean
  favorite?: boolean
  archived?: boolean
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

// ---- 消息 ----
Message {
  id: string
  topicId: string
  role: "user" | "assistant" | "system" | "tool"
  content: string              // 正文
  reasoningContent?: string    // 思维链内容
  model?: string
  tokens?: number
  blocks?: string[]            // 关联 message_block ID
  askId?: string
  branchIndex?: number
  parentBranchIndex?: number
  createdAt: string
  status: "pending" | "streaming" | "done" | "error"
}

// ---- 设置 ----
Settings {
  language: string             // "zh-CN"
  theme: string                // "light" | "dark" | "auto"
  fontSize: number
  sendShortcut: string
  maxContext: number
  autoScroll: boolean
}

// ---- 根数据 ----
AppData {
  version: string
  providers: Provider[]
  assistants: Assistant[]
  topics: Topic[]
  settings?: Settings
  cherryData?: unknown         // 原始导入数据，导出兼容用
  compatZone?: Record<string, unknown>  // 未映射字段
}

// ---- 流式响应 ----
ChatStreamDelta {
  content?: string
  reasoning_content?: string
}
```

---

## 3. 解析管线（`cherry-parser.ts` → `data-import.ts`）

### 3.1 三层 JSON 解析

```
data.json (单行文本)
  │ JSON.parse()
  ├─ time: number
  ├─ version: 5
  ├─ localStorage["persist:cherry-studio"]: string (又是 JSON)
  │   └─ JSON.parse()
  │       ├─ assistants: string (又是 JSON)
  │       │   └─ JSON.parse() → CherryAssistantsData
  │       ├─ llm: string (又是 JSON)
  │       │   └─ JSON.parse() → CherryLLMData
  │       └─ settings: string | object
  └─ indexedDB
      ├─ topics: CherryTopicRecord[]
      └─ message_blocks: CherryMessageBlock[]
```

**关键发现**：`data.json` 中的 `topic` 对象**只含 `id + messages[]`**（含完整消息体），而 `indexedDB.topics` 含 `id + assistantId + name + createdAt` 等元数据**但不含 messages**。两者需合并。

### 3.2 导入映射规则

| 原始字段 | 映射为 | 说明 |
|---------|-------|------|
| `llm.providers[].models[]` | `Provider.models → ModelInfo[]` | 扁平化，补充 providerId |
| `assistants.defaultAssistant` | `Assistant (isDefault=true)` | 默认助手 |
| `assistants.assistants[]` | `Assistant[]` | 其余助手 |
| `assistant.topics[]` (含 messages) | `Topic.messages → Message[]` | 按 id 去重 |
| `indexedDB.topics[]` (仅元数据) | `Topic` (无 messages) | 补充无消息的空会话 |
| `indexedDB.message_blocks[]` | 仅统计，不映射到 Message | block 数据供消息渲染时查询 |
| 未识别字段 | `compatZone` | persist 和 localStorage 未映射键 |

### 3.3 合并策略（重复导入时）

```typescript
mergeAppData(existing, imported):
  providers  → 按 id 覆盖
  assistants → 按 id 覆盖
  topics     → 按 id 合并 messages（已有消息保留 + 新消息去重追加）
  settings   → 新数据覆盖
  cherryData / compatZone → 新数据覆盖
```

---

## 4. 导出管线（`cherry-export.ts`）

两种导出路径：

| 场景 | 路径 | 说明 |
|------|------|------|
| 原始数据存在 | `buildExportFromRaw()` | 基于 `cherryData` 原地更新 persist + indexedDB |
| 无原始数据 | `buildExportFromScratch()` | 从业务视图从头构建 data.json |

导出前执行 `validateReferences(data)` 校验：
- 助手 ID 是否存在
- 模型 ID 是否存在
- message_blocks 引用完整性
- 模型 ID 跨供应商去重警告

---

## 5. 存储层（`db.ts`）

```
数据库: cherry-studio-web
版本:   1
Store:  appData (单 Store 设计)

Schema:
  keyPath: "id" (固定值 "main")
  value:   AppData (完整 JSON 对象)

API:
  saveAppData(data: AppData) → Promise<void>
  loadAppData()              → Promise<AppData | null>
  clearAppData()             → Promise<void>
```

**为什么单 Store？** 整个 `AppData` 对象作为一个事务单元读写，保持一致性，避免多 Store 间的引用断裂。

---

## 6. Store 层（`stores/modules/app.ts`）

```typescript
useAppStore = defineStore("app", {
  state: {
    providers:   Provider[]     // 供应商列表
    assistants:  Assistant[]    // 助手列表
    topics:      Topic[]        // 会话列表（已排序：置顶优先 → 时间倒序）
    settings:    Settings       // 应用设置
    cherryData:  unknown        // 原始数据
    compatZone:  object         // 兼容区

    // 视图状态
    isImported:       boolean   // 是否已导入数据
    activeAssistantId: string   // 当前助手
    activeTopicId:     string   // 当前会话
    searchKeyword:     string   // 搜索关键词
  },

  getters: {
    topicList         // 过滤 + 搜索后的会话列表
    currentAssistant  // 当前助手对象
    currentTopic      // 当前会话对象
    currentMessages   // 当前消息列表
    defaultAssistant  // 默认助手
    defaultModel      // 默认模型
  },

  actions: {
    importData(file)      // 文件 → parse → build → merge → saveAppData
    exportData()          // loadAppData → buildExportJSON → downloadJson
    addMessage(msg)       // 追加消息 + 持久化
    addTopic(topic)       // 新建会话 + 持久化
    updateProvider()      // 更新供应商配置
    deleteTopic(id)       // 删除会话 + 持久化
    clearAllData()        // 清空全部数据
    // ... 更多增删改
  }
})
```

**`isImported` 切换逻辑**：`importData` 成功后设为 `true`；`clearAllData` 后设为 `false`。页面 `index.vue` 据此切换导入视图 / 聊天视图。

---

## 7. 数据统计（实际导入 data.json）

| 项目 | 数量 |
|------|------|
| 文件大小 | ~21.3 MB |
| 数据版本 | 5 |
| 供应商 (providers) | 76 |
| 助手 (assistants) | 5（含 1 个默认助手） |
| 助手预设 (presets) | 10 |
| 会话 (topics) | 396 |
| 消息 (messages) | 1,885 |
| 消息块 (message_blocks) | 2,608 |
| 消息块类型分布 | main_text: 1860 / thinking: 635 / citation: 59 / error: 30 / tool: 9 / image: 1 / unknown: 14 |
| IndexedDB settings | 22 条 |
| 其他保留表 | files(0), knowledge_notes(0), translate_history(24), quick_phrases(0) |

---

## 8. 文件清单（关键路径）

```
src/
├── types/
│   ├── index.ts              # 业务类型：Provider, Assistant, Topic, Message, AppData, ChatStreamDelta
│   └── cherry-data.ts        # 原始类型：CherryData, CherryPersist, ParsedCherryData
├── utils/
│   ├── db.ts                 # IndexedDB 单 Store CRUD
│   ├── cherry-parser.ts      # 3 层 JSON 解析 → ParsedCherryData
│   ├── data-import.ts        # 文件导入 → buildAppData / mergeAppData
│   ├── cherry-export.ts      # AppData → data.json 格式导出
│   ├── data-export.ts        # 通用 JSON 导出 + 浏览器下载
│   └── stream-chat.ts        # hook-fetch SSE 流式对话
├── stores/
│   └── modules/
│       ├── app.ts            # 核心 Store（Pinia）：数据导入/导出/增删改
│       ├── chat.ts           # 后端 API 聊天 Store（独立）
│       └── session.ts        # 后端 API 会话 Store（独立）
└── pages/
    ├── index.vue             # 入口：按 isImported 切换导入/聊天
    └── chat/
        ├── composables/
        │   └── useChatState.ts       # 聊天页业务逻辑
        └── layouts/
            └── OrbitChat/
                ├── index.vue         # OrbitChat 聊天 UI
                └── useOrbitState.ts  # OrbitChat 演示态数据
```

---

## 9. 与后端 API Store 的关系

`stores/modules/chat.ts` 和 `stores/modules/session.ts` 是**独立的后端 API 集成**，使用 `@/api` 下的接口类型（`ChatMessageVo`、`ChatSessionVo`），与 Cherry Studio 数据层**不交叉**。两者通过不同页面路由使用，互不干扰。
