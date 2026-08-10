# 07 数据参考（UI 设计对齐用）

> 让设计贴合真实数据形状。完整定义在 `src/types/index.ts`。
> 持久化根 = `AppData`（单记录存 IndexedDB）。
> **Cherry 兼容原则**：不引入 Cherry 没有的持久化实体；模型参数归 Assistant（Cherry 模式），systemPrompt 归 Assistant.prompt。

## 7.1 AppData（持久化根）

```ts
interface AppData {
  version: number
  providers: Provider[]
  assistants: Assistant[]
  topics: Topic[]
  settings: Settings
}
// 无 documents 实体（已砍）。附件是消息级字段，非独立实体。
```

## 7.2 Provider / ModelInfo（F2）

```ts
interface Provider {
  id: string
  name: string
  apiHost: string
  apiKey?: string
  providerType?: 'openai-compatible' | 'anthropic' | 'ollama'  // 默认 openai-compatible
  models: ModelInfo[]
  enabled: boolean
  isSystem?: boolean
}

// Model 只放身份信息；参数与 systemPrompt 归 Assistant（Cherry 模式）
interface ModelInfo {
  id: string
  name: string
  group?: string
  contextLength?: number
  maxTokens?: number
  supportedTextDelta?: boolean
  enabled: boolean
}
// 连接测试状态（untested/testing/success/failed + 延时/错误）= 纯 UI 态，不持久化进 AppData/Cherry 导出
```

## 7.3 Assistant（F1.2 / F2.4 / F2.5）— 模型参数与 systemPrompt 的归属处

```ts
interface Assistant {
  id: string
  name: string
  prompt: string             // ★ 系统提示词（Cherry 原生，对应 ai-reader 的 systemPrompt）
  enabled: boolean
  isDefault: boolean         // 全局唯一
  emoji?: string
  description?: string
  model?: string             // 模型 ID
  temperature?: number       // ★ 模型参数（Cherry 归属在 Assistant）
  topP?: number              // ★
  maxTokens?: number         // ★
  contextCount?: number      // ★ 上下文轮数（Cherry 原生）
  streamOutput?: boolean     // ★ 流式开关（Cherry 原生）
  enableWebSearch?: boolean
  createdAt: string
  updatedAt: string
}
```

> 对齐说明：ai-reader 的"每模型 systemPrompt"是因为它无 Assistant 层；web-deepseek 有 Assistant，故 systemPrompt + 参数统一归 Assistant，**完全 Cherry 兼容，零映射**。

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
  attachments?: Attachment[] // 附件（消息级，非独立实体）
  blocks: MessageBlock[]     // 内容块·唯一来源
}

interface MessageBlock {
  id: string
  type: 'main_text' | 'thinking' | 'error' | 'citation' | 'tool' | 'unknown'
  content: string
  status: 'streaming' | 'success' | 'error'
  createdAt: string
}

interface Attachment {
  id: string
  name: string
  size: string
  type?: string
  url?: string
}
```

## 7.5 Settings（Cherry 兼容 + 扩展）

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
  // 上下文（驱动 Prompt 组装）
  context: {
    maxContextTokens: number
    includeMetadataInPrompt: boolean
    includeUrlInPrompt: boolean
    includeTitleInPrompt: boolean
    includeConversationHistory: boolean
    maxHistoryMessages: number
  }
  // 同步（WebDAV 用 Cherry 原生字段；S3 为扩展通道）
  webdavHost: string
  webdavUser: string
  webdavPass: string
  webdavPath: string
  webdavAutoSync: boolean
  s3?: {                      // 扩展字段，导出 Cherry 时可剔除
    endpoint: string; region?: string; bucket: string
    accessKeyId: string; secretAccessKey: string
    basePath?: string; forcePathStyle?: boolean
  }
  remoteType?: 'none' | 's3' | 'webdav'
}
// 已砍：capture 子结构（无抓取功能）
```

## 7.6 每屏消费的数据速查

| 屏 | 主要数据 |
|---|---|
| 对话·侧栏 | `assistants[]`、`topics[]`（pinned + updatedAt 排序） |
| 对话·Topbar | 当前 `assistant`、`selectedModel`、Provider 就绪状态、`uiStore.online` |
| 对话·消息区 | `topic.messages[]`（blocks/status/usage/model/attachments） |
| 对话·输入区 | `draft`、`attachments[]`、`canSend`、`generating`、`settings.sendShortcut` |
| 对话·空态 | 当前 assistant、`prompts[]`（预设） |
| 搜索 | `topics[]` + `messages[]`（MiniSearch 派生索引） |
| 设置·Provider | `providers[]` + `models[]` + 测试状态（UI 态） |
| 设置·Assistant | `assistants[]`（含 prompt + 模型参数） |
| 设置·同步 | `settings.webdav*` / `settings.s3` + 同步状态 + 备份列表 |
| 设置·数据 | topics/messages/models 计数 + IndexedDB 占用 |

## 7.7 JSON 格式：备份 = Cherry 导出（二合一）

只有**一套**对外 JSON 格式 = Cherry Studio v5（见 `docs/data-json-schema.md`）：

| 用途 | 格式 | 说明 |
|---|---|---|
| Cherry 生态导入导出 | Cherry v5 | providers/assistants/topics/message_blocks/settings；默认不含密钥 |
| S3/WebDAV 备份 | **同一 Cherry v5** | 备份文件就是 Cherry 能导入的 data.json |

> UI 文案统一为"导出 / 备份"同一格式；不再维护第二套同步 schema。密钥默认剔除，需显式勾选才包含。
