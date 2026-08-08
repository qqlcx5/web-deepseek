# Orbit Chat 详细设计文档
明白了。核心原则：基于现有静态页面和 Element-Plus-X 组件来渐进式开发，保留现有 UI 风格和结构，不做推翻重写。
> 版本: V1.0
> 基于: orbit-chat-prd.md + data-design.md + chat.html 设计稿
> 日期: 2026-08-08

---

## 0. 排除声明（Web 端一期不支持）

以下功能明确不在 Web 端一期范围内：

| 排除功能 | 原因 |
|----------|------|
| 联网搜索 | 浏览器无法代理模型请求注入搜索结果上下文 |
| 知识库 RAG | 依赖向量数据库与 Embedding 模型，Web 端无法本地运行 |
| 图片生成与多模态附件（图片理解） | `/v1/chat/completions` 仅支持纯文本，多模态需额外处理 |
| MCP 工具调用 | 依赖本地进程与文件系统，浏览器沙箱无法访问 |
| 语音输入/朗读（ASR/TTS） | 需浏览器 getUserMedia + 专用 TTS 模型，一期不纳入 |
| 助手预设市场 | 依赖服务端预设库与搜索索引，一期仅支持用户手动创建助手 |
| 文件附件上传 | Web 端不做本地文件解析注入上下文 |

> 以上功能均保留在类型定义中作为扩展字段（如 `Assistant` 中 `knowledgeBases`、`mcpServers` 预留），但 UI 不做对应入口，网络层不做对应实现。

---

## 目录

1. [系统架构](#1-系统架构)
2. [模块划分](#2-模块划分)
3. [技术选型与约束](#3-技术选型与约束)
4. [数据层详细设计](#4-数据层详细设计)
5. [状态层详细设计](#5-状态层详细设计)
6. [网络层详细设计](#6-网络层详细设计)
7. [UI 组件层详细设计](#7-ui-组件层详细设计)
8. [布局系统详细设计](#8-布局系统详细设计)
9. [功能模块详细设计](#9-功能模块详细设计)
10. [工具与辅助模块](#10-工具与辅助模块)
11. [类型系统完整定义](#11-类型系统完整定义)
12. [模块依赖关系](#12-模块依赖关系)
13. [待确认问题](#13-待确认问题)
14. [模型服务与设置模块](#14-模型服务与设置模块)
15. [助手管理模块](#15-助手管理模块)
16. [全局设置模块](#16-全局设置模块)

---

## 1. 系统架构

### 1.1 整体分层

```
┌──────────────────────────────────────────────────────┐
│                    UI 组件层                          │
│   ChatPage > Sidebar / Topbar / Messages /            │
│   Composer / Inspector / CommandPalette /             │
│   ModelSelector / PromptEditor / Toast                │
├──────────────────────────────────────────────────────┤
│                    状态层 (Pinia)                     │
│   useAppStore    useChatStore    useUIStore            │
│   (数据持久化)    (对话状态)      (UI 交互状态)         │
├──────────────────────────────────────────────────────┤
│                    网络层                             │
│   hook-fetch 实例 + 流式请求封装                       │
│   chat-api.ts (对话)  data-api.ts (导入导出)           │
├──────────────────────────────────────────────────────┤
│                    数据层                             │
│   db.ts (IndexedDB)  cherry-parser.ts                 │
│   data-import.ts  cherry-export.ts                    │
├──────────────────────────────────────────────────────┤
│                    类型层                             │
│   types/index.ts  types/cherry-data.ts                │
└──────────────────────────────────────────────────────┘
```

### 1.2 数据流

```
用户操作 → UI 组件 → Pinia Action → ┬→ 网络层 (hook-fetch)
                                     ├→ 数据层 (IndexedDB)
                                     └→ 更新 State → UI 响应式刷新
```

### 1.3 设计原则

- **模块独立性**：每个模块可独立开发、测试，通过明确接口交互
- **单向数据流**：UI → Store → DB/API → Store → UI，不反向
- **类型驱动**：所有模块边界由 TypeScript 类型约束
- **组件复用**：优先使用 Element-Plus-X 组件，减少自造轮子

---

## 2. 模块划分

### 2.1 模块总览

| 模块 | 路径 | 职责 | 依赖 |
|------|------|------|------|
| **types** | `src/types/` | 全局类型定义 | 无 |
| **db** | `src/utils/db.ts` | IndexedDB 读写 | types |
| **cherry-parser** | `src/utils/cherry-parser.ts` | data.json 三层解析 | types/cherry-data |
| **data-import** | `src/utils/data-import.ts` | 导入合并 | cherry-parser, db, types |
| **cherry-export** | `src/utils/cherry-export.ts` | 导出校验 | types, db |
| **http** | `src/utils/http.ts` | hook-fetch 实例与拦截器 | hook-fetch |
| **chat-api** | `src/api/chat-api.ts` | 对话请求封装 | http, types |
| **store-app** | `src/stores/app.ts` | 应用数据（Provider/Assistant/Topic） | db, data-import, types |
| **store-chat** | `src/stores/chat.ts` | 对话运行态（消息/流式/分支） | chat-api, types |
| **store-ui** | `src/stores/ui.ts` | UI 交互态（布局/弹窗/Toast） | 无 |
| **layout** | `src/layouts/` + `src/views/chat/ChatPage.vue` | 三栏布局与响应式 | store-ui |
| **components** | `src/components/chat/` | 9 个 UI 组件 | 各 store |

### 2.2 模块独立性矩阵

```
types          ←── 无依赖，被所有模块依赖
db             ←── 仅依赖 types
cherry-parser  ←── 仅依赖 types/cherry-data
http           ←── 仅依赖 hook-fetch
                ↓
data-import    ←── cherry-parser + db + types
cherry-export  ←── types + db
chat-api       ←── http + types
                ↓
store-app      ←── db + data-import + types
store-chat     ←── chat-api + types
store-ui       ←── 无外部依赖
                ↓
components     ←── store-chat + store-ui + store-app
layout         ←── store-ui + components
```

每个模块可单独 mock 依赖进行测试。

---

## 3. 技术选型与约束

### 3.1 UI 组件：Element-Plus-X

使用 Element-Plus-X 组件替代现有手写 UI，映射关系如下：

| PRD 功能 | 现有实现 | 替换为 Element-Plus-X | 说明 |
|----------|---------|----------------------|------|
| 消息气泡 | 手写 `<article>` + CSS | **Bubble** + **BubbleList** | 支持虚拟滚动、自动触底、backButton |
| 消息列表 | 手写 `<div>` scroll | **BubbleList** | 内置 autoScroll / scrollState / virtual |
| 输入框 | 手写 `<textarea>` | **XSender** | 支持 mention / trigger / pasteFile / submitType |
| 附件系统 | 手写 attachment cards | **Attachments** + **FilesCard** | 内置上传 / 删除 / 文件类型图标 |
| 会话列表 | 手写 chat list | **Conversations** | 支持 groupable / menu / active / tooltip |
| 提示词预设 | 手写 preset list | **Prompts** | 支持 label / description / itemClick |
| 欢迎页 | 无 | **Welcome** | 空对话时展示 |
| 思考链 | 无 | **Thinking** | 流式 reasoningContent 展示 |
| 思维链时间线 | 无 | **ThoughtChain** | Inspector 中展示推理节点 |
| Markdown 渲染 | XMarkdownVue | **XMarkdownVue** (保留) | 已集成，与 Bubble 配合使用 |

#### 组件使用约束

```typescript
// main.ts 全局注册
import ElementPlusX from 'vue-element-plus-x'
import 'vue-element-plus-x/dist/es/index.css'
app.use(ElementPlusX)
```

**BubbleList 配置要点**：
- `virtual: true` 当消息 > 500 条时启用虚拟滚动
- `autoScroll: true` 配合 `shouldFollowContent` 精细控制
- `showBackButton: true` 自动管理"回到底部"按钮
- `itemKey: 'id'` 保证消息 key 稳定

**XSender 配置要点**：
- `submitType: 'enter'` 默认 Enter 发送
- `maxLength: 12000` 限制输入长度
- `loading` 绑定 store.generating 控制发送/停止状态
- `@pasteFile` 处理粘贴文件

### 3.2 网络请求：hook-fetch

替代原生 fetch / XHR，使用 hook-fetch 统一管理请求生命周期。

```typescript
// src/utils/http.ts
import hookFetch from 'hook-fetch'

export const http = hookFetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
  plugins: [
    // 请求前注入 Authorization
    {
      name: 'auth',
      priority: 100,
      beforeRequest(config) {
        const apiKey = getApiKey(config.extra?.providerId)
        if (apiKey) {
          config.headers = { ...config.headers, Authorization: `Bearer ${apiKey}` }
        }
        return config
      },
    },
    // 统一错误处理
    {
      name: 'error-handler',
      priority: 50,
      onError(error, config) {
        console.error(`[HTTP Error] ${config.method} ${config.url}:`, error)
        return error
      },
    },
  ],
})
```

#### 流式请求封装

```typescript
// src/api/chat-api.ts
import { http } from '@/utils/http'
import type { ChatStreamDelta, Message } from '@/types'

export interface ChatRequestParams {
  messages: { role: string; content: string }[]
  model: string
  temperature?: number
  maxTokens?: number
  signal?: AbortSignal
}

export interface ChatApi {
  /** 非流式对话 */
  chat(params: ChatRequestParams): Promise<Message>
  /** 流式对话，返回 ReadableStream */
  chatStream(params: ChatRequestParams): Promise<ReadableStream<Uint8Array>>
}
```

hook-fetch 流式请求通过 `transformStreamChunk` 插件处理 SSE 解析：

```typescript
// 流式插件：解析 SSE data 行
const ssePlugin: HookFetchPlugin = {
  name: 'sse-parser',
  priority: 80,
  transformStreamChunk(context) {
    const { result, source } = context
    // result 是已解析的字符串，source 是原始 Uint8Array
    return context
  },
}
```

### 3.3 状态管理：Pinia 多 Store

现有单 `useChatStore` 拆分为 3 个 Store，降低耦合：

| Store | 文件 | 职责 |
|-------|------|------|
| `useAppStore` | `stores/app.ts` | AppData 持久化、Provider/Assistant/Topic CRUD、导入导出 |
| `useChatStore` | `stores/chat.ts` | 当前对话运行态：消息列表、流式输出、分支、草稿 |
| `useUIStore` | `stores/ui.ts` | 布局状态、弹窗、Toast、命令面板 |

---

## 4. 数据层详细设计

### 4.1 IndexedDB 模块 (`src/utils/db.ts`)

```typescript
// src/utils/db.ts
import type { AppData } from '@/types'

const DB_NAME = 'cherry-studio-web'
const DB_VERSION = 1
const STORE_NAME = 'appData'
const RECORD_KEY = 'main'

let dbInstance: IDBDatabase | null = null

/** 懒初始化数据库连接（单例） */
export function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance)
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => {
      dbInstance = req.result
      resolve(dbInstance)
    }
    req.onerror = () => reject(req.error)
  })
}

/** 写入完整 AppData（原子覆盖） */
export async function saveAppData(data: AppData): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put({ id: RECORD_KEY, ...data })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** 读取完整 AppData */
export async function loadAppData(): Promise<AppData | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(RECORD_KEY)
    req.onsuccess = () => {
      if (!req.result) return resolve(null)
      const { id, ...data } = req.result
      resolve(data as AppData)
    }
    req.onerror = () => reject(req.error)
  })
}

/** 清空数据 */
export async function clearAppData(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(RECORD_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
```

**设计要点**：
- 单 Store 原子读写，避免跨表引用断裂
- `put` 覆盖写入，保证原子性
- 懒初始化，首次调用时创建数据库
- 写入性能要求 < 500ms（AppData < 20MB）

### 4.2 Cherry Studio 解析模块 (`src/utils/cherry-parser.ts`)

```typescript
// src/utils/cherry-parser.ts
import type {
  CherryData, CherryPersist, CherryAssistantsData,
  CherryLLMData, ParsedCherryData,
} from '@/types/cherry-data'

/** 安全 JSON 解析：兼容字符串/对象两种形态 */
function safeParse<T>(value: unknown, label: string): T {
  if (typeof value === 'string') return JSON.parse(value) as T
  if (typeof value === 'object' && value !== null) return value as T
  throw new Error(`数据格式错误：${label}`)
}

/** 三层解析入口 */
export function parseDataJSON(rawText: string): ParsedCherryData {
  // 第 1 层：data.json 顶层
  const rawData = JSON.parse(rawText) as CherryData

  // 第 2 层：persist:cherry-studio
  const persistRaw = rawData.localStorage?.['persist:cherry-studio']
  const persist = safeParse<CherryPersist>(persistRaw, 'persist:cherry-studio')

  // 第 3 层：assistants / llm / settings
  const assistantsData = safeParse<CherryAssistantsData>(persist.assistants, 'assistants')
  const llmData = safeParse<CherryLLMData>(persist.llm, 'llm')
  const settings = safeParse<Record<string, unknown>>(persist.settings, 'settings')

  // 收集未映射字段到 compatZone
  const compatZone: Record<string, unknown> = {}

  // persist 层未映射字段
  const persistKeysToPreserve = [
    'shortcuts', 'codeTools', 'mcp', 'websearch', 'knowledge', 'memory',
    'minapps', 'paintings', 'copilot', 'openclaw', 'selectionStore',
    'preprocess', 'inputTools', 'translate', 'ocr', 'note', '_persist',
  ]
  for (const key of persistKeysToPreserve) {
    if (key in persist) compatZone[`persist.${key}`] = (persist as any)[key]
  }

  // localStorage 层其他 key
  for (const [k, v] of Object.entries(rawData.localStorage || {})) {
    if (k !== 'persist:cherry-studio') compatZone[`localStorage.${k}`] = v
  }

  return {
    rawData,
    persist,
    assistantsData,
    llmData,
    settings,
    indexedDB: rawData.indexedDB || {},
    compatZone,
  }
}
```

### 4.3 导入模块 (`src/utils/data-import.ts`)

```typescript
// src/utils/data-import.ts
import { parseDataJSON } from './cherry-parser'
import { saveAppData } from './db'
import type { AppData, Provider, Assistant, Topic, Message } from '@/types'
import type { ParsedCherryData } from '@/types/cherry-data'

/** 从 ParsedCherryData 构建 AppData */
export function buildAppData(parsed: ParsedCherryData): AppData {
  return {
    version: String(parsed.rawData.version || '5'),
    providers: mapProviders(parsed.llmData),
    assistants: mapAssistants(parsed.assistantsData),
    topics: mapTopics(parsed),
    settings: mapSettings(parsed.settings),
    cherryData: parsed.rawData,
    compatZone: parsed.compatZone,
  }
}

/** Provider 映射：扁平化 models，重命名 provider → providerId */
function mapProviders(llmData: CherryLLMData): Provider[] { ... }

/** Assistant 映射：提取 settings 字段，标记 isDefault */
function mapAssistants(data: CherryAssistantsData): Assistant[] { ... }

/** Topic 映射：合并 assistant.topics（含 messages）+ indexedDB.topics（仅元数据） */
function mapTopics(parsed: ParsedCherryData): Topic[] { ... }

/** Message 映射：status "success" → "done"，reasoning_content → reasoningContent */
function mapMessage(msg: CherryMessage): Message { ... }

/** 合并策略：按 id 去重，新数据优先 */
export function mergeAppData(existing: AppData, imported: AppData): AppData {
  // providers / assistants：按 id 覆盖
  // topics：按 id 合并，messages 按消息 id 去重追加
  // settings / compatZone：新数据覆盖
}

/** 完整导入流程 */
export async function importFromFile(file: File): Promise<AppData> {
  const text = await file.text()
  const parsed = parseDataJSON(text)
  const imported = buildAppData(parsed)
  const existing = await loadAppData()
  const merged = existing ? mergeAppData(existing, imported) : imported
  await saveAppData(merged)
  return merged
}
```

### 4.4 导出模块 (`src/utils/cherry-export.ts`)

```typescript
// src/utils/cherry-export.ts
import type { AppData } from '@/types'

export interface ExportOptions {
  includeApiKeys?: boolean  // 默认 false
}

/** 引用完整性校验 */
export function validateReferences(data: AppData): string[] {
  const errors: string[] = []
  const assistantIds = new Set(data.assistants.map(a => a.id))
  const providerIds = new Set(data.providers.map(p => p.id))

  for (const topic of data.topics) {
    if (!assistantIds.has(topic.assistantId))
      errors.push(`Topic ${topic.id} 引用了不存在的 assistant: ${topic.assistantId}`)
  }
  for (const provider of data.providers) {
    for (const model of provider.models) {
      if (model.providerId !== provider.id)
        errors.push(`Model ${model.id} 的 providerId 与所属 Provider 不匹配`)
    }
  }
  return errors
}

/** 反向构建 data.json */
export function buildExportJSON(data: AppData, options: ExportOptions = {}): string {
  // 1. 校验引用完整性
  // 2. 处理 API Key（默认移除）
  // 3. 基于 cherryData 原地更新或从零构建
  // 4. JSON.stringify
}

/** 触发浏览器下载 */
export function downloadJson(jsonStr: string, filename: string): void {
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

---

## 5. 状态层详细设计

### 5.1 useAppStore (`src/stores/app.ts`)

**职责**：管理 AppData 的生命周期，与 IndexedDB 同步。

```typescript
// src/stores/app.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppData, Provider, Assistant, Topic } from '@/types'
import { loadAppData, saveAppData, clearAppData } from '@/utils/db'
import { importFromFile, mergeAppData } from '@/utils/data-import'
import { buildExportJSON, downloadJson, validateReferences } from '@/utils/cherry-export'

export const useAppStore = defineStore('app', () => {
  // ─── State ───
  const version = ref('5')
  const providers = ref<Provider[]>([])
  const assistants = ref<Assistant[]>([])
  const topics = ref<Topic[]>([])
  const isImported = ref(false)
  const loading = ref(false)

  // ─── Getters ───
  const defaultAssistant = computed(() =>
    assistants.value.find(a => a.isDefault) ?? assistants.value[0],
  )
  const topicById = computed(() => {
    const map = new Map(topics.value.map(t => [t.id, t]))
    return (id: string) => map.get(id)
  })
  const sortedTopics = computed(() => {
    return [...topics.value].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    })
  })

  // ─── Actions: 持久化 ───
  async function init() {
    loading.value = true
    const data = await loadAppData()
    if (data) {
      hydrate(data)
      isImported.value = true
    }
    loading.value = false
  }

  async function persist() {
    const data: AppData = {
      version: version.value,
      providers: providers.value,
      assistants: assistants.value,
      topics: topics.value,
    }
    await saveAppData(data)
  }

  // ─── Actions: CRUD ───
  function addTopic(assistantId: string): Topic {
    const topic: Topic = {
      id: `topic-${Date.now()}`,
      assistantId,
      name: '新对话',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    topics.value.unshift(topic)
    persist()
    return topic
  }

  function deleteTopic(id: string) {
    // 移至回收站（保留恢复能力）
    topics.value = topics.value.filter(t => t.id !== id)
    persist()
  }

  function renameTopic(id: string, name: string) {
    const topic = topics.value.find(t => t.id === id)
    if (topic) {
      topic.name = name
      topic.isNameManuallyEdited = true
      persist()
    }
  }

  function addMessage(topicId: string, message: Message) {
    const topic = topics.value.find(t => t.id === topicId)
    if (topic) {
      topic.messages.push(message)
      topic.updatedAt = new Date().toISOString()
      persist()
    }
  }

  function updateMessage(topicId: string, message: Message) {
    const topic = topics.value.find(t => t.id === topicId)
    if (topic) {
      const idx = topic.messages.findIndex(m => m.id === message.id)
      if (idx !== -1) {
        topic.messages[idx] = message
        persist()
      }
    }
  }

  // ─── Actions: 导入导出 ───
  async function importData(file: File) {
    const data = await importFromFile(file)
    hydrate(data)
    isImported.value = true
  }

  function exportData(options?: { includeApiKeys?: boolean }) {
    const data: AppData = {
      version: version.value,
      providers: providers.value,
      assistants: assistants.value,
      topics: topics.value,
    }
    const errors = validateReferences(data)
    if (errors.length) throw new Error(`引用完整性校验失败:\n${errors.join('\n')}`)
    const json = buildExportJSON(data, options)
    downloadJson(json, `orbit-chat-${Date.now()}.json`)
  }

  // ─── 内部工具 ───
  function hydrate(data: AppData) {
    version.value = data.version
    providers.value = data.providers
    assistants.value = data.assistants
    topics.value = data.topics
  }

  return {
    version, providers, assistants, topics, isImported, loading,
    defaultAssistant, topicById, sortedTopics,
    init, persist,
    addTopic, deleteTopic, renameTopic, addMessage, updateMessage,
    importData, exportData,
  }
})
```

### 5.2 useChatStore (`src/stores/chat.ts`)

**职责**：管理当前对话的运行态——消息列表、流式输出、分支、草稿。

```typescript
// src/stores/chat.ts
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Message, Topic } from '@/types'
import { useAppStore } from './app'
import { useUIStore } from './ui'
import { chatApi, type ChatRequestParams } from '@/api/chat-api'

export const useChatStore = defineStore('chat', () => {
  const appStore = useAppStore()
  const uiStore = useUIStore()

  // ─── State ───
  const activeTopicId = ref<string | null>(null)
  const messages = ref<Message[]>([])
  const draft = ref('')
  const replyingTo = ref<string>('')        // 分支回复上下文
  const generating = ref(false)
  const abortController = ref<AbortController | null>(null)
  const attachments = ref<Attachment[]>([])  // UI 层附件

  // ─── Getters ───
  const activeTopic = computed<Topic | undefined>(() =>
    activeTopicId.value ? appStore.topicById(activeTopicId.value) : undefined,
  )

  const canSend = computed(() =>
    Boolean(draft.value.trim() || attachments.value.length) && !generating.value,
  )

  // ─── Actions: 会话切换 ───
  function selectTopic(id: string) {
    activeTopicId.value = id
    const topic = appStore.topicById(id)
    messages.value = topic?.messages ?? []
    uiStore.closeDrawers()
  }

  function newTopic() {
    const topic = appStore.addTopic(appStore.defaultAssistant?.id ?? 'default')
    selectTopic(topic.id)
    uiStore.showToast('新对话已创建')
  }

  // ─── Actions: 消息发送 ───
  async function sendMessage() {
    if (!canSend.value || !activeTopicId.value) return

    const content = draft.value.trim() ||
      `请分析附件：${attachments.value.map(f => f.name).join('、')}`
    const topicId = activeTopicId.value

    // 构造 user 消息
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      topicId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
      status: 'done',
    }
    appStore.addMessage(topicId, userMsg)
    messages.value = [...messages.value, userMsg]

    // 清空输入
    draft.value = ''
    attachments.value = []
    replyingTo.value = ''

    // 构造 assistant 占位消息
    const assistantMsg: Message = {
      id: `msg-${Date.now() + 1}`,
      topicId,
      role: 'assistant',
      model: uiStore.selectedModel?.name,
      content: '',
      reasoningContent: '',
      createdAt: new Date().toISOString(),
      status: 'pending',
    }
    appStore.addMessage(topicId, assistantMsg)
    messages.value = [...messages.value, assistantMsg]

    // 启动流式请求
    await streamChat(assistantMsg)
  }

  // ─── Actions: 流式请求 ───
  async function streamChat(assistantMsg: Message) {
    generating.value = true
    assistantMsg.status = 'streaming'
    assistantMsg.loading = true

    abortController.value = new AbortController()

    const params: ChatRequestParams = {
      messages: messages.value
        .filter(m => m.status === 'done' || m.status === 'streaming')
        .map(m => ({ role: m.role, content: m.content })),
      model: uiStore.selectedModel?.id ?? 'gpt-4o-mini',
      signal: abortController.value.signal,
    }

    try {
      const stream = await chatApi.chatStream(params)

      // 读取流
      const reader = stream.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        // 解析 SSE data
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          const json = line.slice(6).trim()
          if (json === '[DONE]') continue
          const delta = JSON.parse(json) as ChatStreamDelta

          if (delta.reasoning_content) {
            assistantMsg.reasoningContent += delta.reasoning_content
          }
          if (delta.content) {
            assistantMsg.content += delta.content
          }
        }
      }

      assistantMsg.status = 'done'
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        assistantMsg.status = 'done'
        assistantMsg.content ||= '_生成已停止。_'
      } else {
        assistantMsg.status = 'error'
        assistantMsg.content = `请求失败：${(err as Error).message}`
      }
    } finally {
      assistantMsg.loading = false
      generating.value = false
      abortController.value = null
      appStore.updateMessage(assistantMsg.topicId, assistantMsg)
    }
  }

  function stopGeneration() {
    abortController.value?.abort()
  }

  // ─── Actions: 消息操作 ───
  function copyMessage(msg: Message) {
    navigator.clipboard.writeText(msg.content).then(
      () => uiStore.showToast('消息已复制'),
      () => uiStore.showToast('浏览器未授予剪贴板权限'),
    )
  }

  function rateMessage(msg: Message, rating: 'up' | 'down') {
    msg.rating = msg.rating === rating ? '' : rating
    uiStore.showToast(msg.rating ? '反馈已记录' : '反馈已取消')
    appStore.updateMessage(msg.topicId, msg)
  }

  function regenerate(msg: Message) {
    msg.branches = (msg.branches ?? 1) + 1
    msg.activeBranch = msg.branches
    uiStore.showToast('已创建新的回复分支')
    appStore.updateMessage(msg.topicId, msg)
  }

  function branchFrom(msg: Message) {
    replyingTo.value = msg.content.slice(0, 42)
    uiStore.showToast('下一条消息将在新分支中发送')
  }

  function editMessage(msg: Message) {
    draft.value = msg.content
    replyingTo.value = '编辑历史消息后重新发送'
  }

  // ─── Actions: 附件 ───
  function addFiles(files: File[]) {
    const max = 6
    const remaining = max - attachments.value.length
    files.slice(0, remaining).forEach(file => {
      attachments.value.push({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size < 1024 * 1024
          ? `${Math.max(1, Math.round(file.size / 1024))} KB`
          : `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      })
    })
    uiStore.showToast(`${files.length} 个文件已加入上下文`)
  }

  function removeAttachment(file: Attachment) {
    const index = attachments.value.findIndex(a => a.id === file.id)
    if (index === -1) return
    const removed = attachments.value.splice(index, 1)[0]
    uiStore.showToast('附件已移除', () => {
      attachments.value.splice(index, 0, removed)
    })
  }

  return {
    activeTopicId, messages, draft, replyingTo, generating, attachments,
    activeTopic, canSend,
    selectTopic, newTopic,
    sendMessage, stopGeneration,
    copyMessage, rateMessage, regenerate, branchFrom, editMessage,
    addFiles, removeAttachment,
  }
})
```

### 5.3 useUIStore (`src/stores/ui.ts`)

**职责**：管理布局状态、弹窗、Toast、命令面板、模型选择等纯 UI 交互。

```typescript
// src/stores/ui.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ModelUI, Command, PromptPreset, Workspace } from '@/types'

const TABLET_BP = 1180
const MOBILE_BP = 760

export const useUIStore = defineStore('ui', () => {
  // ─── 布局状态 ───
  const sidebarOpen = ref(false)         // 移动端侧栏抽屉
  const inspectorOpen = ref(false)       // 移动端 Inspector 抽屉
  const inspectorVisible = ref(true)     // 桌面端 Inspector 显隐
  const focusMode = ref(false)
  const online = ref(navigator.onLine)
  const saving = ref(false)

  // ─── 弹窗 ───
  const modal = ref<'' | 'command' | 'model' | 'prompt'>('')
  const commandQuery = ref('')

  // ─── Toast ───
  const toast = ref('')
  const undoAction = ref<(() => void) | null>(null)

  // ─── 模型选择 ───
  const models = ref<ModelUI[]>([])
  const selectedModel = ref<ModelUI | null>(null)

  // ─── 工作区 ───
  const activeWorkspaceId = ref<string | null>(null)

  // ─── 输入状态 ───
  const nearBottom = ref(true)
  const promptDraft = ref('')

  // ─── 常量数据 ───
  const workspaces: Workspace[] = [
    { id: 'personal', name: '个人空间', color: '#5b56d6', count: 8 },
    { id: 'product', name: '产品研发', color: '#16875d', count: 5 },
    { id: 'content', name: '内容创作', color: '#d97706', count: 3 },
  ]

  const promptPresets: PromptPreset[] = [
    { id: 'tech', name: '技术评审', content: '你是一名资深软件架构师...' },
    { id: 'product', name: '产品评审', content: '你是一名资深产品经理...' },
    { id: 'concise', name: '简洁回答', content: '使用简洁中文回答...' },
  ]

  const commands: Command[] = [
    { id: 'new', name: '新建对话', icon: 'square-pen', shortcut: '⌘N', action: 'new' },
    { id: 'model', name: '切换模型', icon: 'sparkles', action: 'model' },
    { id: 'prompt', name: '编辑系统提示词', icon: 'bot', action: 'prompt' },
    { id: 'focus', name: '切换专注模式', icon: 'maximize-2', shortcut: '⌘⇧F', action: 'focus' },
    { id: 'offline', name: '模拟离线状态', icon: 'wifi-off', action: 'offline' },
  ]

  // ─── Getters ───
  const filteredCommands = computed(() => {
    const q = commandQuery.value.trim().toLowerCase()
    if (!q) return commands
    return commands.filter(c => `${c.name} ${c.action}`.toLowerCase().includes(q))
  })

  // ─── Actions: 布局 ───
  function toggleFocusMode() {
    focusMode.value = !focusMode.value
    if (focusMode.value) {
      inspectorVisible.value = false
      inspectorOpen.value = false
    } else if (window.innerWidth > TABLET_BP) {
      inspectorVisible.value = true
    }
  }

  function toggleInspector() {
    if (window.innerWidth <= TABLET_BP) {
      inspectorOpen.value = !inspectorOpen.value
    } else {
      inspectorVisible.value = !inspectorVisible.value
    }
  }

  function closeInspector() {
    inspectorOpen.value = false
    inspectorVisible.value = false
  }

  function closeDrawers() {
    sidebarOpen.value = false
    inspectorOpen.value = false
  }

  function handleResize() {
    if (window.innerWidth > TABLET_BP && !focusMode.value) {
      inspectorVisible.value = true
      inspectorOpen.value = false
    } else {
      inspectorVisible.value = false
    }
    if (window.innerWidth > MOBILE_BP) {
      sidebarOpen.value = false
    }
  }

  // ─── Actions: Toast ───
  function showToast(message: string, undo?: () => void) {
    toast.value = message
    undoAction.value = undo ?? null
    setTimeout(() => {
      if (toast.value === message) {
        toast.value = ''
        undoAction.value = null
      }
    }, 3200)
  }

  function undo() {
    undoAction.value?.()
    toast.value = ''
    undoAction.value = null
  }

  // ─── Actions: 模型 ───
  function selectModel(model: ModelUI) {
    selectedModel.value = model
    modal.value = ''
    showToast(`已切换到 ${model.name}`)
  }

  // ─── Actions: 命令 ───
  function runCommand(cmd: Command) {
    modal.value = ''
    switch (cmd.action) {
      case 'new': /* 由 chatStore 触发 */ break
      case 'model': modal.value = 'model'; break
      case 'prompt': modal.value = 'prompt'; break
      case 'focus': toggleFocusMode(); break
      case 'offline':
        online.value = !online.value
        showToast(online.value ? '网络连接已恢复' : '已切换到离线演示状态')
        break
    }
  }

  function savePrompt() {
    modal.value = ''
    showToast('系统提示词新版本已保存')
  }

  return {
    sidebarOpen, inspectorOpen, inspectorVisible, focusMode, online, saving,
    modal, commandQuery, toast, undoAction,
    models, selectedModel, activeWorkspaceId,
    nearBottom, promptDraft,
    workspaces, promptPresets, commands,
    filteredCommands,
    toggleFocusMode, toggleInspector, closeInspector, closeDrawers, handleResize,
    showToast, undo,
    selectModel, runCommand, savePrompt,
  }
})
```

---

## 6. 网络层详细设计

### 6.1 HTTP 实例 (`src/utils/http.ts`)

```typescript
// src/utils/http.ts
import hookFetch from 'hook-fetch'
import type { HookFetchPlugin } from 'hook-fetch'

/** 从 extra 中提取 providerId，查找对应 apiKey */
function getApiKey(providerId?: string): string | undefined {
  if (!providerId) return undefined
  // 从 appStore 或 localStorage 读取
  const providers = JSON.parse(localStorage.getItem('providers') || '[]')
  return providers.find((p: any) => p.id === providerId)?.apiKey
}

// 鉴权插件
const authPlugin: HookFetchPlugin = {
  name: 'auth',
  priority: 100,
  beforeRequest(config) {
    const apiKey = getApiKey(config.extra?.providerId as string)
    if (apiKey) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${apiKey}`,
      }
    }
    return config
  },
}

// 错误处理插件
const errorPlugin: HookFetchPlugin = {
  name: 'error-handler',
  priority: 50,
  onError(error, config) {
    console.error(`[HTTP] ${config.method} ${config.url}:`, error)
    return error
  },
}

export const http = hookFetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
  plugins: [authPlugin, errorPlugin],
})
```

### 6.2 对话 API (`src/api/chat-api.ts`)

```typescript
// src/api/chat-api.ts
import { http } from '@/utils/http'
import type { ChatStreamDelta } from '@/types'

export interface ChatRequestParams {
  messages: { role: string; content: string }[]
  model: string
  temperature?: number
  maxTokens?: number
  signal?: AbortSignal
  providerId?: string
  apiHost?: string    // 自定义 API Host
}

export const chatApi = {
  /** 流式对话：返回 ReadableStream，由调用方逐 chunk 读取 */
  async chatStream(params: ChatRequestParams): Promise<ReadableStream<Uint8Array>> {
    const req = http.post<{ stream: boolean }>(
      '/chat/completions',
      {
        model: params.model,
        messages: params.messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens,
        stream: true,
      },
      {
        baseURL: params.apiHost || http.baseURL,
        method: 'POST',
        extra: { providerId: params.providerId },
        signal: params.signal,
      },
    )
    const res = await req
    // hook-fetch 返回 Response，取 body 作为 ReadableStream
    return (res as unknown as Response).body as ReadableStream<Uint8Array>
  },

  /** 非流式对话 */
  async chat(params: ChatRequestParams) {
    return http.post<{
      id: string
      choices: { message: { role: string; content: string } }[]
      usage: { prompt_tokens: number; completion_tokens: number }
    }>('/chat/completions', {
      model: params.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens,
      stream: false,
    }, {
      baseURL: params.apiHost || http.baseURL,
      method: 'POST',
      extra: { providerId: params.providerId },
      signal: params.signal,
    })
  },
}
```

### 6.3 SSE 解析策略

流式响应采用 SSE (Server-Sent Events) 格式，解析逻辑在 `useChatStore.streamChat()` 中实现：

```
SSE 数据格式：
data: {"id":"xxx","choices":[{"delta":{"content":"Hello"}}]}
data: {"id":"xxx","choices":[{"delta":{"content":" world"}}]}
data: [DONE]
```

**解析步骤**：
1. `ReadableStream.getReader()` 获取 reader
2. `TextDecoder` 解码 Uint8Array → 字符串
3. 按 `\n` 分行，过滤 `data: ` 前缀
4. `JSON.parse` 解析 delta，累加到 `assistantMsg.content`
5. `[DONE]` 标记结束

---

## 7. UI 组件层详细设计

### 7.1 组件总览

| 组件 | 文件 | Element-Plus-X 依赖 | 职责 |
|------|------|---------------------|------|
| ChatPage | `views/chat/ChatPage.vue` | ConfigProvider | 三栏布局容器 |
| ChatSidebar | `components/chat/ChatSidebar.vue` | Conversations | 侧栏：工作区 + 会话列表 |
| ChatTopbar | `components/chat/ChatTopbar.vue` | — | 顶栏：标题 + 模型 + 工具按钮 |
| ChatMessages | `components/chat/ChatMessages.vue` | BubbleList, Bubble, Thinking | 消息列表 |
| ChatComposer | `components/chat/ChatComposer.vue` | XSender, Attachments, FilesCard | 输入区 |
| ChatInspector | `components/chat/ChatInspector.vue` | ThoughtChain, Prompts | 右侧信息面板 |
| CommandPalette | `components/chat/CommandPalette.vue` | Prompts | 命令面板 |
| ModelSelector | `components/chat/ModelSelector.vue` | — | 模型选择弹窗 |
| PromptEditor | `components/chat/PromptEditor.vue` | Prompts | 提示词编辑弹窗 |
| ToastNotification | `components/chat/ToastNotification.vue` | — | Toast 通知 |

### 7.2 ChatPage（布局容器）

```vue
<!-- src/views/chat/ChatPage.vue -->
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useAppStore } from '@/stores/app'
import { ConfigProvider } from 'vue-element-plus-x'

const uiStore = useUIStore()
const appStore = useAppStore()

function handleKeydown(e: KeyboardEvent) {
  const meta = e.metaKey || e.ctrlKey
  if (meta && e.key.toLowerCase() === 'k') { e.preventDefault(); uiStore.modal = 'command' }
  if (meta && e.key.toLowerCase() === 'n') { e.preventDefault(); /* newTopic */ }
  if (meta && e.shiftKey && e.key.toLowerCase() === 'f') { e.preventDefault(); uiStore.toggleFocusMode() }
  if (e.key === 'Escape') { uiStore.modal = ''; uiStore.closeDrawers() }
}

onMounted(() => {
  uiStore.handleResize()
  appStore.init()
  window.addEventListener('resize', uiStore.handleResize)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', uiStore.handleResize)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <ConfigProvider>
    <div class="app" :class="{
      'inspector-hidden': !uiStore.inspectorVisible,
      'sidebar-open': uiStore.sidebarOpen,
      'inspector-panel-open': uiStore.inspectorOpen,
      'focus-mode': uiStore.focusMode,
    }">
      <!-- 三栏 Grid -->
      <ChatSidebar />
      <main class="main">
        <ChatTopbar />
        <ChatMessages />
        <ChatComposer />
      </main>
      <ChatInspector />

      <!-- 移动端底部导航 -->
      <nav class="mobile-nav">...</nav>

      <!-- 弹窗层 -->
      <div v-if="uiStore.modal" class="overlay" @click="uiStore.modal = ''" />
      <CommandPalette v-if="uiStore.modal === 'command'" />
      <ModelSelector v-if="uiStore.modal === 'model'" />
      <PromptEditor v-if="uiStore.modal === 'prompt'" />
      <ToastNotification />
    </div>
  </ConfigProvider>
</template>
```

### 7.3 ChatSidebar（侧栏）

使用 **Conversations** 组件渲染会话列表：

```vue
<!-- 核心结构 -->
<template>
  <aside class="sidebar">
    <!-- 品牌区 -->
    <div class="brand">
      <Icon icon="tabler:orbit" />
      <span>Orbit AI</span>
      <span class="status">{{ online ? '在线' : '离线' }}</span>
      <button @click="uiStore.toggleFocusMode()">收起</button>
    </div>

    <!-- 新建对话 -->
    <button class="primary-btn" @click="chatStore.newTopic()">
      <Icon icon="tabler:square-pen" /> 新建对话
    </button>

    <!-- 搜索/命令入口 -->
    <button class="search-btn" @click="uiStore.modal = 'command'">
      搜索对话或输入命令...
      <kbd>⌘K</kbd>
    </button>

    <!-- 工作区列表 -->
    <div class="section">
      <div class="section-title">工作区</div>
      <div v-for="ws in uiStore.workspaces" :key="ws.id" class="workspace-item"
           :class="{ active: uiStore.activeWorkspaceId === ws.id }"
           @click="uiStore.activeWorkspaceId = ws.id">
        <span class="dot" :style="{ background: ws.color }" />
        <span>{{ ws.name }}</span>
        <span class="count">{{ ws.count }}</span>
      </div>
    </div>

    <!-- 会话列表 - 使用 Conversations 组件 -->
    <Conversations
      :active="chatStore.activeTopicId"
      :items="conversationItems"
      :groupable="{ sort: (a, b) => a.localeCompare(b) }"
      :menu="conversationMenu"
      show-built-in-menu
      @change="(item) => chatStore.selectTopic(item.key)"
      @menu-command="handleMenuCommand"
    />
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Conversations } from 'vue-element-plus-x'
import { useAppStore } from '@/stores/app'
import { useChatStore } from '@/stores/chat'
import { useUIStore } from '@/stores/ui'

const appStore = useAppStore()
const chatStore = useChatStore()
const uiStore = useUIStore()

// 将 Topic 列表转换为 Conversations 组件所需格式
const conversationItems = computed(() =>
  appStore.sortedTopics.map(t => ({
    key: t.id,
    label: t.name,
    group: t.pinned ? '置顶' : '最近对话',
  }))
)

const conversationMenu = [
  { label: '重命名', key: 'rename', icon: undefined },
  { label: '删除', key: 'delete', icon: undefined, divided: true },
]

function handleMenuCommand(command: string, item: any) {
  if (command === 'rename') { /* 内联重命名 */ }
  if (command === 'delete') { appStore.deleteTopic(item.key) }
}
</script>
```

### 7.4 ChatMessages（消息区）

使用 **BubbleList** + **Bubble** + **Thinking** 替代手写消息列表：

```vue
<!-- 核心结构 -->
<template>
  <section class="chat-area">
    <!-- Welcome 空态 -->
    <Welcome
      v-if="messages.length === 0"
      icon="tabler:sparkles"
      title="开始与 Orbit AI 对话"
      description="输入问题或粘贴文件，AI 将为你解答"
    />

    <!-- BubbleList: 消息列表 -->
    <BubbleList
      v-else
      ref="bubbleListRef"
      :list="bubbleList"
      :auto-scroll="true"
      :show-back-button="true"
      :virtual="messages.length > 500"
      :item-key="'id'"
      @scroll-state-change="onScrollStateChange"
    >
      <!-- 自定义 Bubble 内容 -->
      <template #default="{ item }">
        <Bubble
          :placement="item.placement"
          :loading="item.loading"
          :avatar="item.avatar"
          :variant="item.placement === 'end' ? 'filled' : 'borderless'"
        >
          <!-- 消息头部 -->
          <template #header>
            <span class="msg-author">{{ item.role === 'assistant' ? 'Orbit' : '林晓舟' }}</span>
            <span v-if="item.model" class="msg-model">{{ item.model }}</span>
          </template>

          <!-- Thinking: 推理过程折叠 -->
          <Thinking
            v-if="item.reasoningContent"
            :content="item.reasoningContent"
            :status="item.loading ? 'thinking' : 'end'"
            :auto-collapse="true"
          />

          <!-- Markdown 内容 -->
          <XMarkdownVue v-if="!item.loading" :content="item.content" />

          <!-- 引用来源 -->
          <div v-if="item.sources?.length" class="sources">
            <div class="sources-title">
              <Icon icon="tabler:book-open" :width="14" /> 引用来源
            </div>
            <div class="source-list">
              <a v-for="(src, i) in item.sources" :key="i" :href="src.url" class="source" target="_blank">
                <span class="source-index">{{ i + 1 }}</span>
                <span class="source-name">{{ src.name }}</span>
                <span class="source-domain">{{ src.domain }}</span>
              </a>
            </div>
          </div>

          <!-- 产物卡片 -->
          <div v-if="item.artifact" class="artifact">
            <Icon icon="tabler:file-code-2" :width="16" />
            <span>{{ item.artifact.name }}</span>
            <span class="artifact-meta">{{ item.artifact.meta }}</span>
            <button @click="uiStore.showToast('已在右侧打开产物预览')">打开</button>
          </div>

          <!-- 消息工具栏 -->
          <template #footer>
            <div class="message-tools">
              <button @click="chatStore.copyMessage(item)"><Icon icon="tabler:copy" /></button>
              <template v-if="item.role === 'assistant'">
                <button :class="{ active: item.rating === 'up' }" @click="chatStore.rateMessage(item, 'up')">
                  <Icon icon="tabler:thumbs-up" />
                </button>
                <button :class="{ active: item.rating === 'down' }" @click="chatStore.rateMessage(item, 'down')">
                  <Icon icon="tabler:thumbs-down" />
                </button>
                <button @click="chatStore.regenerate(item)"><Icon icon="tabler:rotate-cw" /></button>
                <button @click="chatStore.branchFrom(item)"><Icon icon="tabler:git-branch" /></button>
              </template>
              <template v-else>
                <button @click="chatStore.editMessage(item)"><Icon icon="tabler:pencil" /></button>
              </template>
              <!-- 分支切换器 -->
              <div v-if="(item.branches ?? 0) > 1" class="branch-switcher">
                <button><Icon icon="tabler:chevron-left" /></button>
                {{ item.activeBranch }}/{{ item.branches }}
                <button><Icon icon="tabler:chevron-right" /></button>
              </div>
            </div>
          </template>
        </Bubble>
      </template>
    </BubbleList>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { BubbleList, Bubble, Thinking, Welcome } from 'vue-element-plus-x'
import { Icon } from '@iconify/vue'
import XMarkdownVue from 'x-markdown-vue'
import 'x-markdown-vue/style'
import { useChatStore } from '@/stores/chat'
import { useUIStore } from '@/stores/ui'

const chatStore = useChatStore()
const uiStore = useUIStore()
const bubbleListRef = ref()

const messages = computed(() => chatStore.messages)

// 转换为 BubbleList 需要的格式
const bubbleList = computed(() =>
  messages.value.map(m => ({
    id: m.id,
    placement: m.role === 'user' ? 'end' : 'start',
    loading: m.loading,
    avatar: m.role === 'user' ? undefined : 'tabler:sparkles',
    // 附加数据供自定义渲染使用
    role: m.role,
    model: m.model,
    content: m.content,
    reasoningContent: m.reasoningContent,
    sources: m.sources,
    artifact: m.artifact,
    rating: m.rating,
    branches: m.branches,
    activeBranch: m.activeBranch,
  }))
)

function onScrollStateChange(state: 'AT_BOTTOM' | 'SCROLLED_UP' | 'HAS_NEW_MESSAGES') {
  uiStore.nearBottom = state === 'AT_BOTTOM'
}
</script>
```

**BubbleList 优势**：
- 内置 `autoScroll` + `shouldFollowContent` 智能跟随
- 内置 `showBackButton` 回到底部按钮
- `virtual: true` 支持虚拟滚动（>500 条消息）
- `scrollStateChange` 事件替代手写 scroll 监听

### 7.5 ChatComposer（输入区）

使用 **XSender** + **Attachments** 替代手写 textarea：

```vue
<!-- 核心结构 -->
<template>
  <section class="composer">
    <!-- 网络离线横幅 -->
    <div v-if="!uiStore.online" class="offline-banner">
      <Icon icon="tabler:wifi-off" />
      网络已断开。消息将保存在本地...
    </div>

    <!-- 回复上下文（分支提示） -->
    <div v-if="chatStore.replyingTo" class="reply-context">
      <Icon icon="tabler:git-branch" />
      正在从"{{ chatStore.replyingTo }}"创建新分支
      <button @click="chatStore.replyingTo = ''"><Icon icon="tabler:x" /></button>
    </div>

    <!-- 附件区 - 使用 Attachments + FilesCard -->
    <Attachments
      v-if="chatStore.attachments.length"
      :items="attachmentItems"
      :overflow="'scrollX'"
      :limit="6"
      :hide-upload="true"
      @delete-card="handleDeleteAttachment"
    />

    <!-- XSender 输入框 -->
    <XSender
      v-model="chatStore.draft"
      placeholder="输入消息..."
      :loading="chatStore.generating"
      :max-length="12000"
      submit-type="enter"
      :auto-focus="true"
      :tip-config="true"
      @submit="chatStore.sendMessage()"
      @cancel="chatStore.stopGeneration()"
      @paste-file="handlePasteFile"
    >
      <!-- 工具栏插槽：默认 2 项（新对话 / 清除上下文） -->
      <!-- Web 端一期移除了联网、知识库、附件上传、图片生成、提示词、MCP、引用笔记 -->
      <template #header>
        <button class="tool-btn" @click="chatStore.newTopic()" title="新对话 (⌘N)">
          <Icon icon="tabler:square-pen" /> 新对话
        </button>
        <button class="tool-btn" @click="handleClearContext" title="清除上下文">
          <Icon icon="tabler:eraser" /> 清除上下文
        </button>
        <span class="context-chip" @click="uiStore.inspectorOpen = true">
          上下文 {{ contextPercent }}%
        </span>
        <span class="hint">Enter 发送 · Shift+Enter 换行</span>
      </template>
    </XSender>

    <input ref="fileInput" type="file" multiple hidden @change="onFileChange" />
  </section>
</template>

<script setup lang="ts">
import { XSender } from 'vue-element-plus-x'
import { Icon } from '@iconify/vue'
import { useChatStore } from '@/stores/chat'
import { useUIStore } from '@/stores/ui'

const chatStore = useChatStore()
const uiStore = useUIStore()
const fileInput = ref<HTMLInputElement>()

// 附件转 FilesCard 格式
const attachmentItems = computed(() =>
  chatStore.attachments.map(a => ({
    uid: a.id,
    name: a.name,
    fileType: 'file' as const,
    description: `已加入上下文 · ${a.size}`,
    showDelIcon: true,
  }))
)

const contextPercent = computed(() => {
  // 基于消息 token 数 / 模型 contextLength 计算
  return 38
})

function triggerFileInput() { fileInput.value?.click() }

function onFileChange(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  chatStore.addFiles(files)
}

function handlePasteFile(file: File, fileList: FileList) {
  chatStore.addFiles(Array.from(fileList))
}

function handleDeleteAttachment(item: any) {
  const att = chatStore.attachments.find(a => a.id === item.uid)
  if (att) chatStore.removeAttachment(att)
}
</script>
```

### 7.6 ChatInspector（信息面板）

使用 **ThoughtChain** 展示推理节点，**Prompts** 展示提示词预设：

```vue
<!-- 核心结构 -->
<template>
  <aside class="inspector">
    <!-- 系统提示词 -->
    <section class="panel">
      <h3>系统提示词</h3>
      <div class="prompt-preview">{{ uiStore.promptDraft.slice(0, 200) }}...</div>
      <button @click="uiStore.modal = 'prompt'">编辑</button>
    </section>

    <!-- 上下文用量 -->
    <section class="panel">
      <h3>上下文用量</h3>
      <div class="token-info">
        <span class="token-num">{{ totalTokens }}</span>
        <span class="token-pct">{{ contextPercent }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :class="contextLevel" :style="{ width: contextPercent + '%' }" />
      </div>
      <span class="hint">还可继续输入约 {{ remainingChars }} 字符</span>
    </section>

    <!-- 上下文文件 -->
    <section class="panel">
      <h3>上下文文件</h3>
      <FilesCard
        v-for="file in contextFiles"
        :key="file.uid"
        :name="file.name"
        :file-type="file.type"
        :description="file.desc"
      />
      <button class="add-btn">添加</button>
    </section>

    <!-- 对话分支 - 使用 ThoughtChain -->
    <section class="panel">
      <h3>对话分支</h3>
      <ThoughtChain
        :thinking-items="branchItems"
        :dot-size="'small'"
      />
    </section>

    <!-- 会话消耗 -->
    <section class="panel">
      <h3>会话消耗</h3>
      <div class="stats-grid">
        <div class="stat"><span class="label">输入 Token</span><span class="value">{{ inputTokens }}</span></div>
        <div class="stat"><span class="label">输出 Token</span><span class="value">{{ outputTokens }}</span></div>
        <div class="stat"><span class="label">预计费用</span><span class="value">${{ estimatedCost }}</span></div>
        <div class="stat"><span class="label">响应时间</span><span class="value">{{ responseTime }}ms</span></div>
      </div>
    </section>
  </aside>
</template>
```

### 7.7 CommandPalette（命令面板）

使用 **Prompts** 组件展示命令列表：

```vue
<template>
  <div class="command-palette">
    <input
      v-model="uiStore.commandQuery"
      placeholder="搜索对话或输入命令..."
      autofocus
    />
    <!-- 快捷操作 -->
    <div v-if="uiStore.filteredCommands.length" class="section">
      <div class="section-title">快捷操作</div>
      <Prompts
        :items="commandItems"
        @item-click="(item) => uiStore.runCommand(commands.find(c => c.id === item.key)!)"
      />
    </div>
    <!-- 最近对话 -->
    <div class="section">
      <div class="section-title">最近对话</div>
      <div v-for="topic in recentTopics" :key="topic.id" class="topic-item"
           @click="chatStore.selectTopic(topic.id)">
        {{ topic.name }}
      </div>
    </div>
  </div>
</template>
```

### 7.8 ModelSelector（模型选择弹窗）

```vue
<template>
  <div class="modal model-selector">
    <h2>选择模型</h2>
    <div class="model-list">
      <div
        v-for="model in uiStore.models"
        :key="model.id"
        class="model-item"
        :class="{ active: uiStore.selectedModel?.id === model.id }"
        @click="uiStore.selectModel(model)"
      >
        <span class="dot" :style="{ background: model.color }" />
        <div class="info">
          <span class="name">{{ model.name }}</span>
          <span class="desc">{{ model.description }}</span>
        </div>
        <div class="tags">
          <span v-for="tag in model.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <Icon v-if="uiStore.selectedModel?.id === model.id" icon="tabler:check" />
      </div>
    </div>
  </div>
</template>
```

### 7.9 PromptEditor（提示词编辑弹窗）

```vue
<template>
  <div class="modal prompt-editor">
    <h2>编辑系统提示词</h2>
    <!-- 预设区 -->
    <Prompts
      :items="presetItems"
      @item-click="onPresetClick"
    />
    <!-- 编辑区 -->
    <textarea v-model="uiStore.promptDraft" rows="8" />
    <button @click="uiStore.savePrompt()">保存版本</button>
  </div>
</template>
```

### 7.10 ToastNotification

```vue
<template>
  <Transition name="toast">
    <div v-if="uiStore.toast" class="toast">
      <Icon icon="tabler:circle-check" />
      <span>{{ uiStore.toast }}</span>
      <button v-if="uiStore.undoAction" class="undo" @click="uiStore.undo()">撤销</button>
    </div>
  </Transition>
</template>
```

---

## 8. 布局系统详细设计

### 8.1 CSS 变量体系

```css
:root {
  /* 品牌色 */
  --brand: #5b56d6;
  --brand-hover: #4a45bd;
  --brand-soft: #efefff;

  /* 文本 */
  --text: #172033;
  --muted: #667085;
  --faint: #98a2b3;

  /* 边线 */
  --line: #e5e7eb;
  --line-strong: #d0d5dd;

  /* 表面 */
  --surface: #ffffff;
  --surface-2: #f8fafc;
  --surface-3: #f2f4f7;

  /* 语义色 */
  --success: #16875d;
  --danger: #d92d20;
  --warning: #b54708;

  /* 布局尺寸 */
  --sidebar: 276px;
  --inspector: 304px;
  --header: 60px;
  --mobile-nav: 58px;
}
```

### 8.2 响应式断点策略

```
>1180px     三栏 Grid: [sidebar] [main] [inspector]
760-1180px  两栏 + 抽屉: [sidebar] [main] + inspector(drawer)
<760px      单栏 + 底部导航: [main] + sidebar(drawer) + inspector(drawer)
<390px      进一步缩减间距
```

### 8.3 Grid 布局实现

```css
.app {
  display: grid;
  grid-template-columns: var(--sidebar) minmax(0, 1fr) var(--inspector);
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

.app.inspector-hidden {
  grid-template-columns: var(--sidebar) minmax(0, 1fr);
}

.app.focus-mode {
  grid-template-columns: 0 minmax(0, 1fr);
}

.app.focus-mode .sidebar { display: none; }

@media (max-width: 1180px) {
  .app, .app.inspector-hidden {
    grid-template-columns: var(--sidebar) minmax(0, 1fr);
  }
  /* Inspector 变为 fixed 抽屉 */
  .inspector {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: var(--inspector);
    transform: translateX(100%);
    transition: transform 200ms ease;
    z-index: 60;
  }
  .inspector-panel-open .inspector { transform: translateX(0); }
}

@media (max-width: 760px) {
  .app { display: block; }
  .sidebar, .inspector {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    z-index: 60;
    transform: translateX(-100%); /* sidebar */
  }
  .inspector { transform: translateX(100%); }
  .sidebar-open .sidebar { transform: translateX(0); }
  .inspector-panel-open .inspector { transform: translateX(0); }
}
```

### 8.4 全局快捷键处理

```typescript
// ChatPage.vue 中注册
function handleKeydown(e: KeyboardEvent) {
  const meta = e.metaKey || e.ctrlKey
  if (meta && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    uiStore.modal = 'command'
  }
  if (meta && e.key.toLowerCase() === 'n') {
    e.preventDefault()
    chatStore.newTopic()
  }
  if (meta && e.shiftKey && e.key.toLowerCase() === 'f') {
    e.preventDefault()
    uiStore.toggleFocusMode()
  }
  if (e.key === 'Escape') {
    uiStore.modal = ''
    uiStore.closeDrawers()
  }
}
```

---

## 9. 功能模块详细设计

### 9.1 流式输出模块

**时序图**：

```
用户点击发送
    │
    ▼
useChatStore.sendMessage()
    │
    ├→ 创建 user Message → appStore.addMessage() → IndexedDB
    ├→ 创建 assistant Message (status=pending) → appStore.addMessage()
    ├→ 清空 draft / attachments
    └→ streamChat(assistantMsg)
         │
         ├→ generating = true, status = streaming
         ├→ chatApi.chatStream(params) → hook-fetch POST
         │                                    │
         │                              ← ReadableStream
         │
         ├→ reader.read() 循环
         │   ├→ TextDecoder.decode()
         │   ├→ SSE 行解析 (data: ...)
         │   ├→ JSON.parse(delta)
         │   ├→ 累加 content / reasoningContent
         │   └→ 响应式更新 → BubbleList 自动刷新
         │
         ├→ [DONE] 或 reader.done → status = done
         ├→ 异常 → status = error / abort
         └→ appStore.updateMessage() → IndexedDB 持久化
```

**停止生成**：
- 用户点击 XSender 的 cancel 按钮
- → `abortController.abort()`
- → fetch 请求中断
- → catch AbortError → status = done, content 保留已生成部分

### 9.2 分支系统

**数据结构**（基于 data-design.md Message.block 方案）：

```
Message {
  id: "msg-001"
  askId: "msg-000"       // 指向触发的 user 消息
  branchIndex: 0          // 当前分支索引
  parentBranchIndex: -1   // 父分支索引
  blocks: ["block-001"]   // 消息块 ID 数组
}
```

**分支创建流程**：

```
1. 用户点击"重新生成" 或 "从这里分支"
       │
       ▼
2. 找到目标 assistant 消息
   msg.branches = (msg.branches ?? 1) + 1
   msg.activeBranch = msg.branches
       │
       ▼
3. 创建新 Message:
   id = 新 UUID
   askId = 原 user 消息 id
   branchIndex = msg.branches - 1
   parentBranchIndex = 原 branchIndex
       │
       ▼
4. 追加到 topic.messages 末尾
   → appStore.addMessage() → IndexedDB
       │
       ▼
5. 触发新的 streamChat()
```

**分支切换**：
- `branch-switcher` 的 ←/→ 按钮切换 `activeBranch`
- 根据 `branchIndex` 过滤显示对应分支的消息
- 同一 `askId` 下的消息按 `branchIndex` 分组

### 9.3 命令面板

```typescript
// 命令面板逻辑
const uiStore = useUIStore()
const chatStore = useChatStore()

// 搜索过滤
const filteredCommands = computed(() => {
  const q = uiStore.commandQuery.trim().toLowerCase()
  if (!q) return uiStore.commands
  return uiStore.commands.filter(c =>
    `${c.name} ${c.action}`.toLowerCase().includes(q)
  )
})

const filteredTopics = computed(() => {
  const q = uiStore.commandQuery.trim().toLowerCase()
  const topics = appStore.sortedTopics
  if (!q) return topics.slice(0, 4)
  return topics.filter(t => t.name.toLowerCase().includes(q))
})

// 执行命令
function execute(cmd: Command) {
  uiStore.modal = ''
  switch (cmd.action) {
    case 'new': chatStore.newTopic(); break
    case 'model': uiStore.modal = 'model'; break
    case 'prompt': uiStore.modal = 'prompt'; break
    case 'focus': uiStore.toggleFocusMode(); break
    case 'offline':
      uiStore.online = !uiStore.online
      uiStore.showToast(uiStore.online ? '网络连接已恢复' : '已切换到离线演示状态')
      break
  }
}
```

### 9.4 导入导出模块

**导入流程**（状态机）：

```
[选文件] → [FileReader] → [JSON.parse 三层] → [字段映射] → [合并去重] → [IndexedDB] → [UI 刷新]
    │            │              │                  │             │             │
    │            │              │                  │             │             ├→ isImported = true
    │            │              │                  │             │             └→ showToast
    │            │              │                  │             └→ mergeAppData
    │            │              │                  └→ buildAppData
    │            │              └→ parseDataJSON
    │            └→ file.text()
    └→ <input type="file">
```

**导出流程**：

```
[触发导出] → [validateReferences] → [API Key 处理] → [buildExportJSON] → [JSON.stringify] → [downloadJson]
                 │
                 └→ 校验失败 → throw Error
```

### 9.5 网络状态管理

```typescript
// useUIStore 中
const online = ref(navigator.onLine)

// 监听网络事件
window.addEventListener('online', () => {
  online.value = true
  showToast('网络连接已恢复')
})
window.addEventListener('offline', () => {
  online.value = false
})

// 离线横幅
// Composer 中 v-if="!uiStore.online" 显示横幅
// 网络恢复后自动隐藏 + toast 通知
```

### 9.6 草稿持久化

```typescript
// 草稿仅保存当前输入框内容到 localStorage
// useChatStore 中
watch(draft, (val) => {
  localStorage.setItem('orbit-draft', val)
})

// 初始化时恢复
const savedDraft = localStorage.getItem('orbit-draft')
if (savedDraft) draft.value = savedDraft
```

---

## 10. 工具与辅助模块

### 10.1 模块清单

| 模块 | 路径 | 职责 |
|------|------|------|
| `cn` | `src/utils/cn.ts` | CSS 类名合并工具 |
| `format` | `src/utils/format.ts` | 时间格式化、文件大小格式化 |
| `scroll` | `src/utils/scroll.ts` | 滚动辅助函数（由 BubbleList 替代） |
| `token-counter` | `src/utils/token-counter.ts` | Token 用量估算 |

### 10.2 Token 估算

```typescript
// src/utils/token-counter.ts
// 粗略估算：1 token ≈ 4 字符（英文）/ 1.5 字符（中文）
export function estimateTokens(text: string): number {
  if (!text) return 0
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
  const otherChars = text.length - chineseChars
  return Math.ceil(chineseChars / 1.5 + otherChars / 4)
}

export function estimateContextPercent(messages: Message[], contextLength: number): number {
  const totalTokens = messages.reduce((sum, m) =>
    sum + estimateTokens(m.content) + estimateTokens(m.reasoningContent ?? ''),
  0)
  return Math.min(100, Math.round((totalTokens / contextLength) * 100))
}
```

---

## 11. 类型系统完整定义

### 11.1 业务类型 (`src/types/index.ts`)

```typescript
// src/types/index.ts

// ─── 核心实体 ───

export interface Provider {
  id: string
  name: string
  apiHost: string
  apiKey?: string
  apiPath?: string
  models: ModelInfo[]
  enabled: boolean
}

export interface ModelInfo {
  id: string
  name: string
  providerId: string
  description?: string
  maxTokens?: number
  contextLength?: number
  enabled: boolean
}

export interface Assistant {
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
  isDefault?: boolean
  tags?: string[]
  emoji?: string
  group?: string
  stream?: boolean
  contextManagement?: {
    enabled: boolean
    strategy?: 'compress' | 'truncate'
    maxContextTokens?: number
  }
  customParams?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

export interface Topic {
  id: string
  assistantId: string
  name: string
  messages: Message[]
  prompt?: string
  temperature?: number
  topP?: number
  maxTokens?: number
  model?: string
  isNameManuallyEdited?: boolean
  pinned?: boolean
  favorite?: boolean
  archived?: boolean
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface Message {
  id: string
  topicId: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  reasoningContent?: string
  model?: string
  tokens?: number
  blocks?: string[]
  askId?: string
  branchIndex?: number
  parentBranchIndex?: number
  createdAt: string
  status: 'pending' | 'streaming' | 'done' | 'error'
}

export interface AppData {
  version: string
  providers: Provider[]
  assistants: Assistant[]
  topics: Topic[]
  settings?: Settings
  cherryData?: unknown
  compatZone?: Record<string, unknown>
}

// ─── UI 展示层类型 ───

export interface MessageUI extends Message {
  loading?: boolean
  rating?: '' | 'up' | 'down'
  sources?: Source[]
  artifact?: Artifact
  branches?: number
  activeBranch?: number
}

export interface Source {
  name: string
  domain: string
  url: string
}

export interface Artifact {
  name: string
  meta: string
  type?: string
  size?: string
}

export interface Attachment {
  id: string
  name: string
  size: string
}

export interface Workspace {
  id: string
  name: string
  color: string
  count: number
}

export interface ModelUI {
  id: string
  name: string
  color: string
  description: string
  tags: string[]
}

export interface Command {
  id: string
  name: string
  icon: string
  shortcut?: string
  action: string
}

export interface PromptPreset {
  id: string
  name: string
  content: string
}

export interface Settings {
  language?: 'zh' | 'en'
  theme?: 'light'
  fontSize?: number
  sendShortcut?: 'enter' | 'cmdEnter'
  maxContextLength?: number
  autoScroll?: boolean
}

// ─── 流式响应 ───

export interface ChatStreamDelta {
  id?: string
  content?: string
  reasoning_content?: string
  model?: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
  }
}
```

### 11.2 Cherry Studio 类型 (`src/types/cherry-data.ts`)

> 与 data-design.md 一致，包含 CherryData / CherryPersist / CherryAssistantsData / CherryLLMData / CherryProvider / CherryAssistant / CherryTopicRecord / CherryMessage / CherryMessageBlock / ParsedCherryData

（类型定义已在 data-design.md 中完整描述，此处不再重复，直接引用。）

---

## 12. 模块依赖关系

### 12.1 完整依赖图

```
types/index.ts ←────────────────────────────────────────────────────┐
types/cherry-data.ts ←──────────────────────────────────┐           │
    │                                                   │           │
    ▼                                                   │           │
utils/cherry-parser.ts ──→ utils/data-import.ts ──→ utils/db.ts ───┤
                              │                                   │
                              ▼                                   │
                        utils/cherry-export.ts                     │
                              │                                   │
                              ▼                                   │
                        stores/app.ts ────────────────────────────┤
                              │                                   │
    ┌─────────────────────────┤                                   │
    ▼                         ▼                                   │
stores/chat.ts           stores/ui.ts                              │
    │                         │                                   │
    │ ←── api/chat-api.ts ←── utils/http.ts                        │
    │                                                               │
    ▼                                                               │
components/chat/*.vue ──────────────────────────────────────────────┘
    │
    ▼
views/chat/ChatPage.vue
```

### 12.2 引用规则

| 文件 | 可引用 | 禁止引用 |
|------|--------|---------|
| `types/index.ts` | 无限制 | — |
| `types/cherry-data.ts` | 仅被 cherry-parser / data-import / cherry-export 引用 | 页面 / 组件 / Store |
| `utils/db.ts` | 仅被 stores/app.ts 引用 | 组件 / 页面 |
| `utils/cherry-parser.ts` | 仅被 utils/data-import.ts 引用 | 其他 |
| `utils/data-import.ts` | 仅被 stores/app.ts 引用 | 组件 / 页面 |
| `stores/app.ts` | 被 stores/chat.ts / 组件引用 | 直接操作 IndexedDB |
| `stores/chat.ts` | 被组件引用 | 直接操作 IndexedDB |
| `stores/ui.ts` | 被组件引用 | 无限制 |
| `api/chat-api.ts` | 仅被 stores/chat.ts 引用 | 组件 |

---

## 13. 待确认问题

### 13.1 需要决策的技术问题

| 序号 | 问题 | 影响范围 | 当前方案 | 需要确认 |
|------|------|---------|---------|---------|
| Q-1 | hook-fetch 流式响应的 API 形态 | chat-api.ts, chat store | 方案 A：`chatStream()` 返回 `ReadableStream<Uint8Array>`，由 store 手动读取解析 SSE | hook-fetch 的 `beforeStream` / `transformStreamChunk` 插件是否已自动解析 SSE？还是需要业务层自行解析？ |
| Q-2 | hook-fetch `post()` 返回值类型 | http.ts, chat-api.ts | 当前假设返回 Response 对象，取 `.body` 获取 ReadableStream | hook-fetch `post()` 的返回值是 `HookFetchRequest`，其 `.send()` 返回的是 Response 还是已解析的 data？ |
| Q-3 | BubbleList 自定义渲染插槽 | ChatMessages.vue | 方案 A：使用 `#default` 插槽完全自定义 Bubble 内容 | BubbleList 是否支持 item 级别的完全自定义渲染？还是只能通过 Bubble 的 props 控制？ |
| Q-4 | XSender v-model 绑定 | ChatComposer.vue | 方案：`v-model="chatStore.draft"` 绑定字符串 | XSender 的 v-model 接受 string 还是 ModelValue（TagData + html + text）？如果后者，需要适配层转换 |
| Q-5 | Conversations 组件的 item 数据格式 | ChatSidebar.vue | 方案：`{ key, label, group }` | Conversations 的 `items` 是否需要 `uniqueKey` 字段？`change` 事件回调参数是 item 还是 key？ |
| Q-6 | Provider apiKey 存储位置 | http.ts, stores/app.ts | 方案：存在 IndexedDB 的 Provider.apiKey 中，http 插件从 localStorage 缓存读取 | apiKey 是否应该单独加密存储而非明文存在 AppData JSON 中？一期是否需要加密？ |
| Q-7 | 虚拟滚动阈值 | ChatMessages.vue | 方案：`messages.length > 500` 时启用 `virtual: true` | 500 条阈值是否合理？虚拟滚动模式下 Bubble 的自定义渲染是否受限？ |
| Q-8 | 离线消息队列 | stores/chat.ts | 一期方案：离线时仅显示横幅提示，不实现消息队列重试 | 一期是否需要实现离线消息持久化队列 + 重试？还是仅 UI 提示即可？ |

### 13.2 边界条件

| 序号 | 场景 | 当前处理 |
|------|------|---------|
| B-1 | AppData > 20MB 时 IndexedDB 写入性能 | 单 Store put 操作，预计 < 500ms。若超时需考虑分片写入 |
| B-2 | 消息 > 500 条时渲染性能 | BubbleList virtual 模式 |
| B-3 | 流式输出期间用户切换 Topic | 应 abort 当前请求，切换后加载新 topic 消息 |
| B-4 | 流式输出期间网络断开 | catch error → status = error → 保留已生成内容 |
| B-5 | 导入文件非 data.json 格式 | parseDataJSON throw → try-catch → showToast 错误信息 |
| B-6 | 导入文件 > 50MB | FileReader.readAsText 可能卡顿，需考虑 Web Worker |
| B-7 | 同一 topic 多次分支后消息膨胀 | 分支消息共享 askId，显示时按 activeBranch 过滤 |
| B-8 | XSender maxLength=12000 时的输入卡顿 | XSender 内部应已优化；若卡顿考虑 debounce |
| B-9 | 移动端 `100dvh` 在 iOS Safari < 15 不支持 | 降级为 `100vh` |
| B-10 | IndexedDB 在隐私模式不可用 | catch error → 降级为纯内存模式 + toast 提示 |

---

> 本文档基于 PRD V1.0 和 data-design.md 编写，待 Q-1 ~ Q-8 确认后可进入开发阶段。
