# Orbit Chat 产品需求文档

> 产品：Orbit Chat
> 项目：`web-deepseek`
> 文档版本：v2.0
> 状态：实施基线

## 1. 产品定位

Orbit Chat 是本地优先的多 Provider AI 对话应用。用户可以配置模型服务商、创建不同角色的 AI 助手、管理多话题会话，并在浏览器中保存、导入和导出自己的数据。

产品以“对话数据可控、Provider 可替换、状态可恢复”为核心，不复制外部应用的存储结构。Cherry Studio `data.json` 只是一种导入和导出交换格式，不参与应用运行时数据建模。

## 2. 目标与边界

### 2.1 产品目标

1. 用户可以配置多个 OpenAI-compatible Provider 和模型，并选择模型发起对话。
2. 用户可以创建多个 Assistant，每个 Assistant 有独立提示词、模型和生成参数。
3. 每个 Assistant 下可以创建、搜索、重命名、置顶和删除 Topic。
4. 对话支持流式正文、思考内容、错误、引用和工具调用等内容块。
5. 刷新页面后业务数据完整恢复；用户可导入 Cherry v5 文件或导出兼容 JSON。
6. API Key 默认不写入导出文件。

### 2.2 不在本期范围

- 服务端账户、云端同步和多人协作。
- 多端冲突自动合并。
- 模型调用的服务端密钥托管。
- 将 Cherry 的知识库、MCP、绘图、笔记和小程序配置直接映射为 Orbit 功能。
- 保留 Cherry 的 localStorage、多个 IndexedDB ObjectStore 或原始对象镜像。

## 3. 核心架构

```text
Cherry data.json v5
  -> 导入解析和映射
  -> AppData
  -> Pinia appStore
  -> IndexedDB

chatStore
  -> 读取 appStore 的 Topic 和 Assistant
  -> 请求 OpenAI-compatible API
  -> 处理 SSE 流
  -> 回写 appStore

AppData
  -> 引用校验
  -> Cherry-compatible export JSON
```

### 3.1 架构原则

- `AppData` 是唯一持久化业务数据根。
- `appStore` 是 Provider、Assistant、Topic 和 Settings 的唯一事实来源。
- `chatStore` 只保存当前对话、草稿、附件、流式请求和其他短生命周期状态。
- Message 的 `blocks[]` 是内容块唯一来源；不得再维护独立全局 block 镜像。
- 所有业务关系使用 ID 引用，删除父实体时必须显式处理子实体。
- 外部交换格式只存在于导入导出边界，页面和 Store 不依赖 Cherry 类型。

## 4. 唯一数据契约

### 4.1 AppData

```ts
interface AppData {
  version: number
  providers: Provider[]
  assistants: Assistant[]
  topics: Topic[]
  settings: Settings
}
```

`AppData` 不包含 `cherryData`、`compatZone`、全局 `messageBlocks` 或任何外部应用的原始持久化对象。

### 4.2 Provider 和模型

```ts
interface Provider {
  id: string
  name: string
  apiHost: string
  apiKey?: string
  models: ModelInfo[]
  enabled: boolean
}

interface ModelInfo {
  id: string
  name: string
  group?: string
  supportedTextDelta?: boolean
  description?: string
  maxTokens?: number
  contextLength?: number
  enabled: boolean
}
```

约束：

- `Provider.id` 全局唯一。
- 同一个 Provider 内 `ModelInfo.id` 唯一。
- 禁用 Provider 或模型不会出现在模型选择器中。
- 删除 Provider 前必须检查是否有 Assistant 使用其模型；有引用时要求先迁移模型或明确删除引用。
- API Key 可以保存在浏览器 IndexedDB，但默认导出时必须剔除。

### 4.3 Assistant

```ts
interface Assistant {
  id: string
  name: string
  prompt: string
  enabled: boolean
  isDefault: boolean
  emoji?: string
  description?: string
  model?: string
  temperature?: number
  topP?: number
  maxTokens?: number
  enableWebSearch?: boolean
  createdAt: string
  updatedAt: string
}
```

约束：

- `Assistant.id` 全局唯一。
- 必须且只能有一个 `isDefault=true` 的 Assistant。
- `prompt` 允许为空字符串。
- `model` 是模型 ID；未设置时使用当前选择模型。
- 删除 Assistant 前必须处理其 Topic：迁移到另一个 Assistant 或同时删除。

### 4.4 Topic

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
```

约束：

- `Topic.id` 全局唯一。
- `assistantId` 必须引用存在的 Assistant。
- Topic 和消息均使用 ISO 8601 UTC 时间。
- 自动命名只能覆盖 `isNameManuallyEdited=false` 的 Topic。
- `pinned=true` 的 Topic 在侧边栏优先展示，其余按 `updatedAt` 倒序。

### 4.5 Message 和内容块

```ts
type MessageRole = 'user' | 'assistant' | 'system'
type MessageStatus = 'sending' | 'streaming' | 'complete' | 'error' | 'stopped'
type MessageBlockType = 'main_text' | 'thinking' | 'error' | 'citation' | 'tool' | 'unknown'
type MessageBlockStatus = 'streaming' | 'success' | 'error'

interface MessageBlock {
  id: string
  type: MessageBlockType
  content: string
  status: MessageBlockStatus
  createdAt: string
  citationReferences?: unknown[]
}

interface ChatMessage {
  id: string
  topicId: string
  role: MessageRole
  content: string
  createdAt: string
  status: MessageStatus
  model?: string
  rating?: '' | 'up' | 'down'
  error?: string
  reasoningContent?: string
  blocks: MessageBlock[]
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}
```

约束：

- `ChatMessage.id` 全局唯一，`topicId` 必须等于所在 Topic 的 `id`。
- 用户消息至少有一个 `main_text` block。
- Assistant 消息的正文写入 `main_text` block；推理内容写入 `thinking` block；失败写入 `error` block。
- `content` 是正文的渲染缓存，与所有 `main_text` block 拼接结果一致。
- `reasoningContent` 是思考内容的渲染缓存，与所有 `thinking` block 拼接结果一致。
- Message 状态机：`sending -> streaming -> complete`，异常转为 `error`，用户取消转为 `stopped`。
- 任何 block 的顺序必须遵循 `ChatMessage.blocks[]`，不得依赖外部扁平数组的排列。

### 4.6 Settings

```ts
interface Settings {
  language: 'zh-CN' | 'en-US'
  theme: 'light' | 'dark' | 'auto'
  fontSize: number
  sendShortcut: 'Enter' | 'Ctrl+Enter' | 'Shift+Enter'
  autoScroll: boolean
  autoCheckUpdate: boolean
  messageStyle: 'plain' | 'bubble'
  messageFont: 'system' | 'serif' | 'mono'
  codeShowLineNumbers: boolean
  codeWrappable: boolean
  codeCollapsible: boolean
  foldDisplayMode: 'full' | 'compact'
  confirmDeleteMessage: boolean
  confirmRegenerateMessage: boolean
  showTokens: boolean
  showMessageDivider: boolean
  showMessageOutline: boolean
  messageNavigation: boolean
  enableTopicNaming: boolean
  pinTopicsToTop: boolean
  showTopics: boolean
  showTopicTime: boolean
  showInputEstimatedTokens: boolean
  pasteLongTextAsFile: boolean
  pasteLongTextThreshold: number
  renderInputMessageAsMarkdown: boolean
  mathEngine: 'katex' | 'mathjax'
  targetLanguage: string
}
```

未声明的设置不进入运行时或持久化结构。导入时只转换此列表中的字段，其余外部设置直接丢弃。

## 5. 功能需求

### F-01 Provider 管理

- 支持创建、编辑、启用、禁用和删除 Provider。
- Provider 编辑页支持维护 API Host、API Key 和模型列表。
- 模型支持创建、重命名、启用、禁用和删除。
- 删除存在 Assistant 模型引用的 Provider 或模型时，界面必须阻止并说明引用位置。
- 模型选择器按启用状态展示 Provider 与模型。

优先级：P0。

### F-02 Assistant 管理

- 支持创建、编辑、设为默认、启用、禁用和删除 Assistant。
- 编辑项包括名称、图标、系统提示词、模型、temperature、topP、最大输出 Token 和联网搜索开关。
- 设置默认 Assistant 时必须清除其他 Assistant 的默认标记。
- 删除有 Topic 的 Assistant 时必须让用户选择迁移目标或确认级联删除。

优先级：P0。

### F-03 Topic 管理

- 支持在默认或当前 Assistant 下新建 Topic。
- 支持切换、搜索、重命名、置顶、清空消息和删除 Topic。
- 自动命名从首条用户消息生成，最大 30 个字符；手动重命名后不再自动覆盖。
- 按置顶和最近更新时间排序。

优先级：P0。

### F-04 对话和流式生成

- 用户发送文本或附件描述后立即创建用户消息。
- 系统创建 Assistant 占位消息，并处理 SSE `content`、`reasoning_content`、`usage` 增量。
- 思考与正文分块渲染；停止生成后保留已收到内容。
- 网络、认证或服务端错误必须显示错误块，并允许重新生成。
- 模型请求使用当前选中模型；未显式选择时使用默认 Assistant 的模型或第一个可用模型。

优先级：P0。

### F-05 本地持久化

- 所有 `AppData` 保存在 IndexedDB 中。
- 应用启动时恢复全部业务数据。
- 多个连续变更采用串行、防抖保存，避免流式过程中频繁全量写入和旧快照覆盖。
- 保存中、保存失败和保存完成状态应在顶栏可见。
- IndexedDB schema 或 `AppData.version` 变更必须提供逐版本迁移。

优先级：P0。

### F-06 导入

- 支持选择 Cherry Studio v5 JSON 文件。
- 解析后显示 Provider、Assistant、Topic、Message、Block 数量和 warning 数量。
- 必须从 Assistant 的 Topic 引用恢复 Topic 的归属、标题、创建时间、更新时间和手动命名状态。
- Block 必须按 `Message.blocks[]` ID 顺序恢复。
- 无法关联的 Topic 回退到默认 Assistant，并列入 warning。
- 无法关联的 block 不进入目标数据。
- 只导入第 4 节声明的字段，外部冗余字段丢弃。

优先级：P0。

### F-07 导出

- 导出文件使用 Cherry v5 可读取的 JSON 外壳。
- 默认不包含 API Key；用户需要显式勾选才允许导出密钥。
- 导出必须写入 Assistant Topic 引用、Topic 元数据、消息与 block 关联。
- 默认 Assistant 由 `isDefault=true` 决定，不能依赖数组顺序。
- 导出前进行引用校验；存在错误时阻止下载并显示错误列表。

优先级：P1。

### F-08 设置与界面

- 设置面板只展示第 4.6 节的设置项。
- 主题、字号、消息样式、代码显示、发送快捷键和 Token 显示立即生效。
- 桌面端使用侧边栏、消息区、会话检查器三栏布局。
- 平板端隐藏固定检查器并提供抽屉入口。
- 移动端使用底部导航与侧栏抽屉，所有文字和控件在窄屏可用。

优先级：P1。

## 6. 导入映射规则

| Cherry v5 源 | Orbit 目标 | 规则 |
|---|---|---|
| `llm.providers[]` | `providers[]` | 仅导入 Provider 和 Model 声明字段 |
| `assistants.defaultAssistant` | `Assistant.isDefault` | 以 ID 标记默认 Assistant |
| `assistants.assistants[]` | `assistants[]` | 按 ID 去重后导入 |
| `assistant.topics[]` | Topic 元数据索引 | 以 Topic ID 关联归属和元数据 |
| `indexedDB.topics[]` | `topics[]` | 导入消息并与 Topic 元数据合并 |
| `message_blocks[]` | `ChatMessage.blocks[]` | 按 Message 的 block ID 顺序映射 |
| `persist.settings` | `settings` | 仅白名单字段转换 |

导入后必须执行：ID 唯一性检查、Topic -> Assistant 检查、Message -> Topic 检查、block 引用检查和默认 Assistant 唯一性检查。

## 7. 持久化和版本迁移

### 7.1 IndexedDB

```text
Database: orbit-chat
ObjectStore: appData
Record key: main
Record: { key: 'main', data: AppData }
```

业务数据采用单记录以保持初期实现简单。保存操作必须串行化，并以 200ms 防抖合并连续更新。流式消息仅在开始、每个批次和结束时持久化，不能每个 SSE 字符都写数据库。

### 7.2 迁移

- `AppData.version` 是数据结构版本，不等同于导入文件版本。
- 启动时按版本顺序执行迁移，直到当前版本。
- 迁移前保留原记录；迁移失败时不覆盖旧记录。
- 旧数据含有 `cherryData`、`compatZone`、`messageBlocks` 时，迁移必须删除这些字段，并保留每条 Message 的内嵌 `blocks[]`。

## 8. 非功能需求

| 维度 | 要求 |
|---|---|
| 数据完整性 | 不能生成孤立 Topic、Message 或 block 引用 |
| 性能 | 100 个 Topic、5,000 条 Message 下打开会话不阻塞主线程 |
| 可恢复性 | 刷新后恢复最后保存状态；中断生成保留已接收内容 |
| 安全 | 默认导出不包含 API Key；前端明确提示本地密钥存储风险 |
| 可维护性 | 业务代码只依赖 Orbit 类型，Cherry 类型仅位于导入导出工具 |
| 可访问性 | 所有图标按钮具有 tooltip 或可访问名称；键盘可触发主要操作 |

## 9. 验收标准

1. 创建 Provider、模型、Assistant 和 Topic 后刷新页面，数据保持不变。
2. 同一时刻只能有一个默认 Assistant。
3. 删除被 Topic 使用的 Assistant 或模型时，页面不会静默留下失效引用。
4. 用户消息、Assistant 正文、思考内容、错误和 Token 用量可在流式过程中正确显示。
5. 停止生成后，已收到的正文和 thinking 内容仍保留。
6. 导入多 Assistant Cherry v5 文件后，Topic 的归属、标题和时间与源数据一致。
7. 导出后的 JSON 不含 API Key，且再次导入后 Provider、Assistant、Topic、Message 和 block 数量闭环。
8. 导出前发现无效引用时，下载被阻止并显示具体问题。
9. 桌面、平板、移动端可完成新建对话、发送消息、切换模型、打开设置和管理 Topic。

## 10. 实施顺序

1. 收紧类型、清理旧字段、加入默认值和版本迁移。
2. 重写导入导出映射及引用校验。
3. 将 appStore 保存改为串行防抖，并补充删除引用保护。
4. 对齐 chatStore 的消息状态与 block 写入。
5. 完善 Provider、Assistant、Topic 管理界面和导入报告。
6. 增加数据层单元测试、导入导出闭环测试和响应式界面回归测试。
