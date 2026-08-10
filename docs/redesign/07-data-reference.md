# 07 数据参考（UI 设计对齐用）

> 让设计贴合真实数据形状。完整定义在 `src/types/index.ts`。
> 持久化根 = `AppData`（单记录存 IndexedDB）。Cherry v5 是导入导出交换格式，与运行时分离。

## 7.1 AppData（持久化根）

```ts
interface AppData {
  version: number
  providers: Provider[]
  assistants: Assistant[]
  topics: Topic[]
  documents: DocumentEntity[]   // 新增·阅读功能·不进 Cherry 导出
  settings: Settings
}
```

## 7.2 Provider / ModelInfo（F2）

```ts
interface Provider {
  id: string
  name: string
  apiHost: string
  apiKey?: string
  providerType?: 'openai-compatible' | 'anthropic' | 'ollama'  // 新增·默认 openai-compatible
  models: ModelInfo[]
  enabled: boolean
  isSystem?: boolean
}

interface ModelInfo {
  id: string
  name: string
  group?: string
  contextLength?: number
  maxTokens?: number
  supportedTextDelta?: boolean
  enabled: boolean
  // 新增·模型级配置
  systemPrompt?: string
  temperature?: number
  contextWindow?: number
  lastTestStatus?: 'untested' | 'testing' | 'success' | 'failed'
  lastTestLatency?: number
  lastTestError?: string
}
```

## 7.3 Assistant（F1.2）

```ts
interface Assistant {
  id: string
  name: string
  prompt: string             // 系统提示词
  enabled: boolean
  isDefault: boolean         // 全局唯一
  emoji?: string
  model?: string             // 模型 ID
  temperature?: number
  topP?: number
  maxTokens?: number
  enableWebSearch?: boolean
  createdAt: string
  updatedAt: string
}
```

## 7.4 Topic + ChatMessage + MessageBlock（F1 核心）

```ts
interface Topic {
  id: string
  assistantId: string
  name: string
  messages: ChatMessage[]
  isNameManuallyEdited: boolean
  pinned: boolean
  createdAt: string
  updatedAt: string
  documentId?: string        // 新增·可选关联文档·不进 Cherry 导出
}

interface ChatMessage {
  id: string
  topicId: string
  role: 'user' | 'assistant' | 'system'
  content: string            // 正文缓存
  createdAt: string
  status: 'sending' | 'streaming' | 'complete' | 'error' | 'stopped'
  model?: string
  rating?: '' | 'up' | 'down'
  loading?: boolean
  error?: string
  reasoningContent?: string  // 思考缓存
  usage?: { prompt_tokens?; completion_tokens?; total_tokens? }
  attachments?: Attachment[]
  blocks: MessageBlock[]     // 内容块·唯一来源
}

interface MessageBlock {
  id: string
  type: 'main_text' | 'thinking' | 'error' | 'citation' | 'tool' | 'unknown'
  content: string
  status: 'streaming' | 'success' | 'error'
  createdAt: string
}
```

## 7.5 DocumentEntity（新增·阅读/记忆库 F3/F4）

```ts
interface DocumentEntity {
  id: string
  url: string
  canonicalUrl?: string
  title: string
  siteName?: string
  author?: string
  description?: string
  publishedAt?: string
  markdown: string
  rawText?: string
  rawHtml?: string
  rawHtmlCompressed?: boolean
  excerpt?: string
  wordCount: number
  tokenCount: number
  contentHash: string
  extractionMethod: 'defuddle' | 'fallback' | 'manual'
  source: 'current-page' | 'library'
  capturedAt: string
  updatedAt: string
  lastOpenedAt?: string
  tags?: string[]
  syncStatus?: 'local-only' | 'synced' | 'pending' | 'conflict'
}
```

## 7.6 Settings（含新增子结构）

```ts
interface Settings {
  // 外观
  language: 'zh-CN' | 'en-US'
  theme: 'light' | 'dark' | 'auto'
  fontSize: number
  messageStyle: 'plain' | 'bubble'
  messageFont: 'system' | 'serif' | 'mono'
  mathEngine: 'katex' | 'mathjax'
  codeShowLineNumbers: boolean
  codeWrappable: boolean
  codeCollapsible: boolean
  foldDisplayMode: 'full' | 'compact'
  showMessageDivider: boolean
  showMessageOutline: boolean
  messageNavigation: boolean
  // 输入
  sendShortcut: 'Enter' | 'Ctrl+Enter' | 'Shift+Enter'
  showInputEstimatedTokens: boolean
  renderInputMessageAsMarkdown: boolean
  pasteLongTextAsFile: boolean
  pasteLongTextThreshold: number
  confirmDeleteMessage: boolean
  confirmRegenerateMessage: boolean
  autoScroll: boolean
  // 对话
  showTokens: boolean
  enableTopicNaming: boolean
  pinTopicsToTop: boolean
  showTopics: boolean
  showTopicTime: boolean
  autoCheckUpdate: boolean
  targetLanguage: string
  // 新增·上下文（驱动 Prompt 组装）
  context: {
    maxContextTokens: number
    includeMetadataInPrompt: boolean
    includeUrlInPrompt: boolean
    includeTitleInPrompt: boolean
    includeCapturedAtInPrompt: boolean
    includeConversationHistory: boolean
    maxHistoryMessages: number
  }
  // 新增·抓取
  capture: {
    autoExtractOnOpen: boolean       // SPA 部分不生效·UI 标注
    autoExtractOnTabChange: boolean  // 扩展专属·SPA 不生效·禁用
    preferCache: boolean
    saveRawHtml: boolean
    compressRawHtml: boolean
  }
  // 新增·同步
  remote: {
    type: 'none' | 's3' | 'webdav'
    autoSync: boolean
    s3?: S3Config
    webdav?: WebDAVConfig
  }
}

interface S3Config {
  endpoint: string; region?: string; bucket: string
  accessKeyId: string; secretAccessKey: string
  basePath?: string; forcePathStyle?: boolean
}
interface WebDAVConfig {
  url: string; username: string; password: string; basePath?: string
}
```

## 7.7 每屏消费的数据速查

| 屏 | 主要数据 |
|---|---|
| 对话·侧栏 | `assistants[]`、`topics[]`（pinned + updatedAt 排序） |
| 对话·Topbar | 当前 `assistant`、`selectedModel`、Provider 就绪状态、`uiStore.online` |
| 对话·消息区 | `topic.messages[]`（blocks/status/usage/model） |
| 对话·输入区 | `draft`、`attachments[]`、`canSend`、`generating`、`settings.sendShortcut` |
| 对话·空态 | 当前 assistant、`prompts[]`（预设） |
| 阅读·抓取栏 | 当前 `DocumentEntity` + 抓取状态机 |
| 阅读·预览 | `document.markdown/rawText/rawHtml` + metadata 全字段 |
| 记忆库 | `documents[]`（MiniSearch 索引） |
| 设置·Provider | `providers[]` + `models[]` + 测试状态 |
| 设置·同步 | `settings.remote` + 同步状态 + 备份列表 |
| 设置·数据 | documents/topics/models 计数 + IndexedDB 占用 |

## 7.8 两套 JSON 格式（重要）

| 格式 | 内容 | 用途 |
|---|---|---|
| **Cherry v5**（`docs/data-json-schema.md`） | providers/assistants/topics/settings/message_blocks，**不含** documents、不含密钥 | 生态兼容的导入导出 |
| **web-deepseek 备份快照** | 完整 `AppData`（含 documents）+ 同步元数据 | S3/WebDAV 备份/同步/回滚 |

> UI 上两者都要有入口：Cherry 导入导出在"数据管理"；备份上下传/回滚在"同步与存储"。文案要区分清楚，不要混淆。
