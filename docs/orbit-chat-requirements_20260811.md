# Orbit Chat 需求文档（基于 data-schema + 组件库 Wiki 生成）

> 产品：Orbit Chat  
> 项目：`web-deepseek`  
> 文档版本：v3.0  
> 生成日期：2026-08-11  
> 基线：PRD v2.0 + data-schema.md + wiki 组件库文档  
> 数据结构前提：DATA-schema（Cherry Studio data.json v5 完整字段定义）

---

## 1. 产品定位

Orbit Chat 是本地优先的多 Provider AI 对话 Web 应用。用户配置模型服务商、创建 AI 助手、管理多话题会话，所有数据保存在浏览器 IndexedDB 中，支持 Cherry Studio v5 JSON 格式导入导出。

核心价值：**对话数据可控、Provider 可替换、状态可恢复**。

---

## 2. 数据结构契约（基于 data-schema）

### 2.1 顶层结构

```ts
interface AppData {
  version: number;           // 数据结构版本，当前 = 1
  providers: Provider[];
  assistants: Assistant[];
  topics: Topic[];
  settings: Settings;
}
```

### 2.2 Provider（源：data-schema §5 llm.providers）

```ts
interface Provider {
  id: string;                // 唯一标识（UUID 或固定标识如 "gemini"）
  name: string;              // 显示名
  type: 'openai' | 'gemini' | 'anthropic' | 'azure-openai' | 'mistral' | 'vertexai';
  apiHost: string;           // API 端点
  apiKey?: string;           // 密钥，默认导出时剔除
  enabled: boolean;
  isSystem: boolean;         // 是否系统内置
  models: ModelInfo[];
  // Cherry 兼容字段（按需存在）
  isNotSupportArrayContent?: boolean;
  isNotSupportDeveloperRole?: boolean;
  isNotSupportStreamOptions?: boolean;
  apiOptions?: {
    isNotSupportArrayContent: boolean;
    isNotSupportDeveloperRole: boolean;
    isNotSupportStreamOptions: boolean;
  };
}

interface ModelInfo {
  id: string;                // 模型 ID（Provider 内唯一）
  provider: string;          // 外键 → Provider.id
  name: string;              // 显示名
  group: string;             // 模型分组
  supported_text_delta?: boolean;  // 是否支持流式增量
  owned_by?: string;         // 归属方
  enabled: boolean;
}
```

**约束**：
- `Provider.id` 全局唯一
- 同一 Provider 内 `ModelInfo.id` 唯一
- 删除 Provider 前必须检查 Assistant 模型引用
- 禁用 Provider/Model 不出现在模型选择器

### 2.3 Assistant（源：data-schema §3 assistants）

```ts
interface Assistant {
  id: string;                // UUID，默认助手为 "default"
  name: string;
  emoji: string;             // 表情符号
  prompt: string;            // 系统提示词，可为空
  description?: string;
  enabled: boolean;
  isDefault: boolean;        // 必须且只能有一个
  model?: ModelRef;          // 当前模型引用
  defaultModel?: ModelRef;   // 默认模型引用
  settings: AssistantSettings;
  enableWebSearch?: boolean;
  knowledgeRecognition?: 'off';
  mcpServers?: string[];     // MCP 服务器绑定
  regularPhrases?: string[]; // 常用短语
  createdAt: string;
  updatedAt: string;
}

interface ModelRef {
  id: string;                // 外键 → ModelInfo.id
  provider: string;          // 外键 → Provider.id
  name: string;
  group: string;
  supported_text_delta?: boolean;
}

interface AssistantSettings {
  temperature: number;       // e.g. 0.39 / 1
  contextCount: number;      // 上下文窗口消息数，0 = 不限
  enableMaxTokens: boolean;
  maxTokens: number;
  streamOutput: boolean;
  topP: number;
  enableTopP: boolean;
  toolUseMode: 'prompt' | 'function';
  customParameters: never[]; // 始终为 []
  reasoning_effort?: string; // e.g. "low"
  qwenThinkMode?: boolean;
  enableTemperature?: boolean;
}
```

### 2.4 Topic（源：data-schema §3 TopicObject + §7 DBTopic）

```ts
interface Topic {
  id: string;                // UUID
  assistantId: string;       // 外键 → Assistant.id
  name: string;
  messages: ChatMessage[];   // 内联消息（非 ID 引用）
  isNameManuallyEdited: boolean;
  pinned: boolean;
  createdAt: string;         // ISO 8601 UTC
  updatedAt: string;
}
```

### 2.5 Message 和 Block（源：data-schema §7.2-7.3）

```ts
type MessageRole = 'user' | 'assistant';
type MessageStatus = 'sending' | 'streaming' | 'complete' | 'error' | 'stopped';
type MessageBlockType = 'main_text' | 'thinking' | 'error' | 'citation' | 'tool' | 'unknown';
type MessageBlockStatus = 'streaming' | 'success' | 'error';

interface ChatMessage {
  id: string;
  topicId: string;           // 外键 → Topic.id
  role: MessageRole;
  assistantId: string;       // 外键 → Assistant.id
  createdAt: string;         // ISO 8601 UTC
  updatedAt?: string;
  status: MessageStatus;
  blocks: MessageBlock[];    // 内容块（内联，非 ID 引用）
  modelId?: string;          // 外键 → ModelInfo.id
  model?: ModelRef;
  // 用户消息独有
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  mentions?: string[];
  // 助手消息独有
  askId?: string;            // 对应用户消息 ID（问答对）
  metrics?: {
    completion_tokens: number;
    time_completion_millsec: number;
    time_first_token_millsec: number;
    time_thinking_millsec: number;
  };
  foldSelected?: boolean;
  multiModelMessageStyle?: 'fold' | 'horizontal';
}

interface MessageBlock {
  id: string;
  messageId: string;         // 外键 → ChatMessage.id
  type: MessageBlockType;
  createdAt: string;
  status: MessageBlockStatus;
  updatedAt?: string;
  // type='main_text'
  content?: string;
  knowledgeBaseIds?: string[];
  citationReferences?: unknown[];
  // type='thinking'
  thinking_millsec?: number;
  // type='citation'
  response?: {
    results: {
      searchEntryPoint: { renderedContent: string };
      groundingChunks: unknown;
      groundingSupports: unknown;
      webSearchQueries: unknown;
    };
    source: string;
  };
  // type='tool'
  toolId?: string;
  toolName?: string;
  metadata?: {
    rawMcpToolResponse: {
      id: string;
      toolUseId: string;
      tool: { name: string; description: string; inputSchema: object };
    };
  };
  // type='error'
  error?: {
    name: string;
    message: string;
    originalMessage: string;
    stack: string;
  };
}
```

### 2.6 Settings（源：data-schema §6，仅保留白名单字段）

```ts
interface Settings {
  // 基础
  language: 'zh-CN' | 'en-US';
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;                    // e.g. 14
  userName: string;
  // 话题
  showAssistants: boolean;
  showTopics: boolean;
  topicPosition: 'left' | 'right';
  showTopicTime: boolean;
  pinTopicsToTop: boolean;
  assistantIconType: string;           // e.g. "emoji"
  clickAssistantToShowTopic: boolean;
  enableTopicNaming: boolean;
  topicNamingPrompt: string;
  useTopicNamingForMessageTitle: boolean;
  // 输入
  sendMessageShortcut: 'Enter' | 'Ctrl+Enter' | 'Shift+Enter';
  showInputEstimatedTokens: boolean;
  pasteLongTextAsFile: boolean;
  pasteLongTextThreshold: number;      // e.g. 1500
  foldDisplayMode: 'expanded' | 'compact';
  gridColumns: number;                 // e.g. 2
  messageNavigation: string;           // e.g. "anchor"
  confirmDeleteMessage: boolean;
  confirmRegenerateMessage: boolean;
  thoughtAutoCollapse: boolean;
  // 消息显示
  messageStyle: 'plain' | 'bubble';
  messageFont: 'system' | 'serif' | 'mono';
  showMessageDivider: boolean;
  showTokens: boolean;
  showModelProviderInMarkdown: boolean;
  showModelNameInMarkdown: boolean;
  showMessageOutline: boolean;
  renderInputMessageAsMarkdown: boolean;
  // 代码
  codeShowLineNumbers: boolean;
  codeWrappable: boolean;
  codeCollapsible: boolean;
  codeEditor: {
    enabled: boolean;
    themeLight: string;
    themeDark: string;
    highlightActiveLine: boolean;
    foldGutter: boolean;
    autocompletion: boolean;
    keymap: boolean;
  };
  codePreview: { themeLight: string; themeDark: string };
  // 数学
  mathEngine: 'katex' | 'mathjax';
  mathEnableSingleDollar: boolean;
  // 翻译
  autoTranslateWithSpace: boolean;
  showTranslateConfirm: boolean;
  translateModelPrompt: string;
  targetLanguage: string;
  // 导出
  exportMenuOptions: {
    image: boolean; markdown: boolean; markdown_reason: boolean;
    notion: boolean; yuque: boolean; joplin: boolean;
    obsidian: boolean; siyuan: boolean; docx: boolean; plain_text: boolean;
  };
  // 多模型
  multiModelMessageStyle: string;      // e.g. "grid"
  enableBackspaceDeleteModel: boolean;
  enableQuickPanelTriggers: boolean;
  // 布局
  narrowMode: boolean;
  navbarPosition: 'left' | 'right';
  userTheme: { colorPrimary: string }; // e.g. "#00b96b"
  // 自定义
  customCss: string;
}
```

### 2.7 关联关系图

```
Provider.id ──────────────► ModelInfo.provider
ModelInfo.id ─────────────► ModelRef.id
Provider.id ──────────────► ModelRef.provider
Assistant.id ─────────────► Topic.assistantId
Assistant.id ─────────────► ChatMessage.assistantId
Topic.id ─────────────────► ChatMessage.topicId
ChatMessage.id ───────────► ChatMessage.askId (问答对)
ChatMessage.id ───────────► MessageBlock.messageId
MessageBlock.id ──────────► ChatMessage.blocks[] (内联，非 ID 引用)
```

---

## 3. 组件库映射（Element-Plus-X Wiki → Orbit Chat 功能）

基于 wiki 组件文档，以下组件直接映射到 Orbit Chat 的功能模块：

| 组件 | Wiki 来源 | Orbit Chat 用途 | 对应需求 |
|------|-----------|----------------|----------|
| **BubbleList** | BubbleList.md | 对话消息列表（虚拟滚动、自动追底、未读计数） | F-04 对话和流式生成 |
| **Bubble** | Bubble.md | 单条对话气泡（头像、placement、header/footer） | F-04 对话和流式生成 |
| **XMarkdown** | XMarkdown.md | Markdown 渲染（代码高亮、表格、任务列表、流式动画） | F-04 对话和流式生成 |
| **Thinking** | Thinking.md | 思考过程展示（start/thinking/end/error 状态） | F-04 thinking block |
| **ThoughtChain** | ThoughtChain.md | 思维链时间轴（多步骤思考、success/loading/error） | F-04 thinking block |
| **Conversations** | Conversations.md | 话题列表（分组、菜单、搜索、排序、置顶） | F-03 Topic 管理 |
| **XSender** | XSender.md | 输入发送框（指令弹窗、提及、附件、快捷操作） | F-04 用户输入 |
| **Attachments** | Attachments.md | 附件上传管理（拖拽、文件列表、上传控制） | F-04 附件 |
| **FilesCard** | FilesCard.md | 文件卡片展示（16 种文件类型图标、状态、自定义） | F-04 附件展示 |
| **Prompts** | Prompts.md | 提示词推荐集（点击发送、样式定制） | F-09 欢迎页提示 |
| **Welcome** | Welcome.md | 欢迎页卡片（标题、描述、图标、布局方向） | F-09 欢迎页 |
| **ConfigProvider** | ConfigProvider.md | 全局配置（主题切换、命名空间、变量覆盖） | F-08 设置与界面 |
| **useSend** | useSend.md | 请求发送 hook（XRequest、loading 状态、abort） | F-04 流式请求 |
| **useXStream** | useXStream.md | 流式传输 hook（SSE/SIP、data/cancel/error） | F-04 SSE 流处理 |
| **useRecord** | useRecord.md | 语音录音 hook（浏览器语音转文字） | F-10 语音输入（P2） |
| **HookFetch** | HookFetch.md | HTTP 客户端封装（插件化拦截器、Auth/Error 插件） | F-04 请求层 |

---

## 4. 功能需求

### F-01 Provider 管理（P0）

**数据源**：data-schema §5 `llm.providers[]`

**功能**：
1. 创建、编辑、启用、禁用、删除 Provider
2. Provider 编辑页支持 API Host、API Key、模型列表维护
3. 模型支持创建、重命名、启用、禁用、删除
4. Provider `type` 支持：`openai` | `gemini` | `anthropic` | `azure-openai` | `mistral` | `vertexai`
5. `isSystem=true` 的 Provider 不允许删除，可禁用
6. `apiOptions` 中的三个兼容标志（`isNotSupportArrayContent`、`isNotSupportDeveloperRole`、`isNotSupportStreamOptions`）影响请求构造
7. 删除存在 Assistant 模型引用的 Provider/Model 时，UI 阻止并说明引用位置
8. 模型选择器按 `enabled` 状态展示

**UI 组件**：Element Plus 表单 + 表格

### F-02 Assistant 管理（P0）

**数据源**：data-schema §3 `assistants.assistants[]` + `assistants.defaultAssistant`

**功能**：
1. 创建、编辑、启用、禁用、删除 Assistant
2. 编辑项：name、emoji、prompt、description、model、defaultModel、settings（temperature/contextCount/maxTokens/streamOutput/topP/toolUseMode）、enableWebSearch、mcpServers
3. `isDefault` 唯一约束：设置默认时清除其他
4. 删除有 Topic 的 Assistant：选择迁移目标或级联删除
5. 导入助手（JSON 文件 / 剪贴板 / URL）

**UI 组件**：Element Plus Dialog + Form + Tabs

### F-03 Topic 管理（P0）

**数据源**：data-schema §3 `TopicObject` + §7.1 `DBTopic`

**功能**：
1. 在 Assistant 下新建 Topic
2. 切换、搜索、重命名、置顶、清空消息、删除
3. 自动命名从首条用户消息生成，最大 30 字符；`isNameManuallyEdited=true` 时不被覆盖
4. 排序：`pinned=true` 优先，其余按 `updatedAt` 倒序
5. `clickAssistantToShowTopic` 设置控制点击助手时是否展开话题

**UI 组件**：**Conversations** 组件
- `items` 绑定 Topic 列表
- `groupable` 按 Assistant 分组
- 菜单项：重命名、置顶、清空、删除
- `active` 双向绑定当前选中 Topic ID
- 自定义样式：`itemsStyle` / `itemsHoverStyle` / `itemsActiveStyle`

### F-04 对话和流式生成（P0）

**数据源**：data-schema §7.2 `DBMessage` + §7.3 `MessageBlock`

**功能**：
1. 用户发送文本后立即创建 `role='user'` 消息，至少一个 `main_text` block
2. 系统创建 `role='assistant'` 占位消息，处理 SSE 流
3. SSE 增量写入 `main_text` block 的 `content`
4. `reasoning_content` 增量写入 `thinking` block，记录 `thinking_millsec`
5. 停止生成后保留已收到内容，状态转为 `stopped`
6. 错误写入 `error` block，含 `name`/`message`/`stack`
7. 工具调用写入 `tool` block，含 `toolId`/`toolName`/`metadata`
8. 引用写入 `citation` block
9. `usage`（prompt_tokens/completion_tokens/total_tokens）记录在用户消息
10. `metrics`（completion_tokens/time_completion_millsec/time_first_token_millsec/time_thinking_millsec）记录在助手消息
11. `askId` 建立问答对关联
12. `multiModelMessageStyle` 支持 `fold` / `horizontal`

**UI 组件**：

| 区域 | 组件 | 配置 |
|------|------|------|
| 消息列表 | **BubbleList** | `list` 绑定消息数组，`autoScroll` 流式追底，`showBackButton` 回底按钮，`@scroll-state-change` / `@unread-count-change` 事件 |
| 单条消息 | **Bubble** | `placement`：user=`end`，assistant=`start`；`avatar` 头像；`#header` 显示模型名/时间；`#footer` 显示操作按钮 |
| Markdown 正文 | **XMarkdown** | `MarkdownRenderer` 组件，`markdown` 属性绑定 `main_text` block 内容，`enable-animate` 流式动画，`is-dark` 暗色模式 |
| 思考过程 | **Thinking** | `status` 绑定 `thinking` block 状态（start/thinking/end/error），`content` 绑定思考内容，`autoCollapse` 配合 `thoughtAutoCollapse` 设置 |
| 思维链 | **ThoughtChain** | `thinkingItems` 绑定多步骤思考数组，`status` 为 success/loading/error |
| 错误展示 | **Bubble** | `variant="error"` 或 `#content` 插槽自定义错误样式 |

**请求层**：

| 层 | 组件/Hook | 说明 |
|----|-----------|------|
| HTTP 客户端 | **HookFetch** | `hookFetch.create()`，baseURL 来自环境变量，plugins=[authPlugin, errorPlugin] |
| 流式请求 | **useSend** / **XRequest** | `XRequest.send()` 发起，`.abort()` 中止；`transformer` 转换响应；`onMessage`/`onError`/`onAbort`/`onFinish` 回调 |
| 流式处理 | **useXStream** | `startStream({ readableStream })` 启动，`cancel()` 中止，`data` 响应式数据，`isLoading` 状态 |
| Chat API | `chatApi.chatStream()` | 封装 `ChatRequestParams`，返回 `ReadableStream<Uint8Array>` |

**状态机**：
```
sending → streaming → complete
                ↓         ↓
              error     stopped
```

### F-05 本地持久化（P0）

**数据源**：data-schema 全部模块

**功能**：
1. `AppData` 保存在 IndexedDB（database: `orbit-chat`，store: `appData`，key: `main`）
2. 应用启动恢复全部业务数据
3. 保存采用串行 + 200ms 防抖，流式过程中仅在开始/批次/结束时写入
4. 保存状态（保存中/失败/完成）在顶栏可见
5. `AppData.version` 变更时提供逐版本迁移
6. 旧数据含 `cherryData`/`compatZone`/`messageBlocks` 时迁移删除，保留内嵌 `blocks[]`

### F-06 导入（P0）

**数据源**：data-schema 全部（Cherry Studio v5 JSON）

**功能**：
1. 选择 Cherry Studio v5 JSON 文件
2. 解析后显示 Provider、Assistant、Topic、Message、Block 数量和 warning 数
3. 映射规则：

| Cherry v5 源 | Orbit 目标 | 规则 |
|---|---|---|
| `llm.providers[]` | `providers[]` | 仅导入 Provider + Model 声明字段 |
| `assistants.defaultAssistant` | `Assistant.isDefault` | 以 ID 标记 |
| `assistants.assistants[]` | `assistants[]` | 按 ID 去重 |
| `assistant.topics[]` | Topic 元数据索引 | 以 Topic ID 关联 |
| `indexedDB.topics[]` | `topics[]` | 导入消息并合并 |
| `message_blocks[]` | `ChatMessage.blocks[]` | 按 block ID 顺序映射 |
| `persist.settings` | `settings` | 仅白名单字段 |

4. 无法关联的 Topic 回退到默认 Assistant，列入 warning
5. 无法关联的 block 不进入目标数据
6. 导入后执行：ID 唯一性检查、Topic→Assistant 检查、Message→Topic 检查、block 引用检查、默认 Assistant 唯一性检查

### F-07 导出（P1）

**功能**：
1. 导出文件使用 Cherry v5 可读 JSON 外壳
2. 默认不含 API Key；用户显式勾选才导出
3. 写入 Assistant Topic 引用、Topic 元数据、消息与 block 关联
4. 默认 Assistant 由 `isDefault=true` 决定
5. 导出前引用校验；存在错误时阻止下载并显示错误列表

### F-08 设置与界面（P1）

**数据源**：data-schema §6 `settings`

**功能**：
1. 设置面板仅展示 §2.6 Settings 中声明的字段
2. 主题/字号/消息样式/代码显示/发送快捷键/Token 显示立即生效
3. **ConfigProvider** 组件包裹应用根节点，提供：
   - `theme`: 'light' | 'dark'，绑定 `settings.theme`
   - `themeOverrides`: 绑定 `settings.userTheme` → `{ colorPrimary }` → `--elx-color-primary`
   - `namespace`: 'elx'
   - `applyTo`: 'root'
4. 三栏布局（桌面）：侧边栏 + 消息区 + 会话检查器
5. 平板：隐藏固定检查器，提供抽屉入口
6. 移动端：底部导航 + 侧栏抽屉

### F-09 欢迎页与提示（P1）

**UI 组件**：
- **Welcome** 组件：`title` / `description` / `icon` / `direction`（ltr/rtl）/ `variant`（filled/borderless）
- **Prompts** 组件：`items` 绑定提示词列表，`@item-click` 点击发送到输入框，`wrap` 换行控制

**功能**：
1. 新建 Topic 时显示 Welcome + Prompts
2. Prompts 内容可按 Assistant 配置或全局默认
3. 点击 Prompt 项将内容填入 XSender

### F-10 语音输入（P2）

**UI 组件**：**useRecord** hook

**功能**：
1. 调用浏览器原生语音识别 API
2. `start()` / `stop()` 控制，`loading` 状态，`value` 实时识别文本
3. 集成到 XSender 的 `#action-list` 插槽

### F-11 附件管理（P1）

**UI 组件**：**Attachments** + **FilesCard**

**功能**：
1. 拖拽/点击上传文件
2. `before-upload` 校验文件大小/类型
3. `http-request` 自定义上传逻辑
4. `@upload-drop` / `@delete-card` 事件
5. FilesCard 展示：16 种文件类型图标、文件名、描述、状态
6. `imgVariant`: square / circle
7. `showDelIcon` 控制删除按钮

---

## 5. 非功能需求

| 维度 | 要求 |
|------|------|
| 数据完整性 | 不能生成孤立 Topic/Message/block 引用 |
| 性能 | 100 Topic、5,000 Message 下打开会话不阻塞主线程；BubbleList 虚拟滚动 |
| 可恢复性 | 刷新后恢复最后保存状态；中断生成保留已接收内容 |
| 安全 | 默认导出不含 API Key；前端提示本地密钥存储风险 |
| 可维护性 | 业务代码只依赖 Orbit 类型，Cherry 类型仅位于导入导出工具 |
| 可访问性 | 所有图标按钮有 tooltip 或可访问名称；键盘可触发主要操作 |
| 响应式 | 桌面三栏 / 平板抽屉 / 移动端底部导航 |
| 主题 | ConfigProvider 支持 light/dark/auto + themeOverrides 自定义 |

---

## 6. 导入映射详细规则

### 6.1 Provider 映射

| Cherry 字段 | Orbit 字段 | 转换规则 |
|---|---|---|
| `id` | `id` | 直接 |
| `name` | `name` | 直接 |
| `type` | `type` | 直接 |
| `apiKey` | `apiKey` | 直接（导入保留，导出默认剔除） |
| `apiHost` | `apiHost` | 直接 |
| `enabled` | `enabled` | 直接 |
| `isSystem` | `isSystem` | 直接 |
| `models[]` | `models[]` | 逐字段映射 |
| `isNotSupportArrayContent` | `isNotSupportArrayContent` | 直接 |
| `isNotSupportDeveloperRole` | `isNotSupportDeveloperRole` | 直接 |
| `isNotSupportStreamOptions` | `isNotSupportStreamOptions` | 直接 |
| `apiOptions` | `apiOptions` | 直接 |

### 6.2 Assistant 映射

| Cherry 字段 | Orbit 字段 | 转换规则 |
|---|---|---|
| `id` | `id` | 直接 |
| `name` | `name` | 直接 |
| `emoji` | `emoji` | 直接 |
| `prompt` | `prompt` | 直接 |
| `description` | `description` | 直接 |
| `type` | — | 丢弃（固定 "assistant"） |
| `model` | `model` | 直接（ModelRef 对象） |
| `defaultModel` | `defaultModel` | 直接 |
| `settings.temperature` | `settings.temperature` | 直接 |
| `settings.contextCount` | `settings.contextCount` | 直接 |
| `settings.enableMaxTokens` | `settings.enableMaxTokens` | 直接 |
| `settings.maxTokens` | `settings.maxTokens` | 直接 |
| `settings.streamOutput` | `settings.streamOutput` | 直接 |
| `settings.topP` | `settings.topP` | 直接 |
| `settings.enableTopP` | `settings.enableTopP` | 直接 |
| `settings.toolUseMode` | `settings.toolUseMode` | 直接 |
| `settings.reasoning_effort` | `settings.reasoning_effort` | 直接 |
| `settings.qwenThinkMode` | `settings.qwenThinkMode` | 直接 |
| `enableWebSearch` | `enableWebSearch` | 直接 |
| `knowledgeRecognition` | `knowledgeRecognition` | 直接 |
| `mcpServers` | `mcpServers` | 直接 |
| `regularPhrases` | `regularPhrases` | 直接 |
| `topics[]` | — | 用于建立 Topic 归属索引 |
| `messages` | — | 始终为 []，实际消息从 indexedDB.topics 导入 |

### 6.3 Topic 映射

| Cherry 字段 | Orbit 字段 | 转换规则 |
|---|---|---|
| `id` | `id` | 直接 |
| `assistantId` | `assistantId` | 直接，校验存在性 |
| `name` | `name` | 直接 |
| `isNameManuallyEdited` | `isNameManuallyEdited` | 直接 |
| `createdAt` | `createdAt` | 直接 |
| `updatedAt` | `updatedAt` | 直接 |
| `messages[]`（from indexedDB） | `messages[]` | 逐条映射为 ChatMessage |

### 6.4 Message 映射

| Cherry 字段 | Orbit 字段 | 转换规则 |
|---|---|---|
| `id` | `id` | 直接 |
| `role` | `role` | 直接（user/assistant） |
| `topicId` | `topicId` | 直接 |
| `assistantId` | `assistantId` | 直接 |
| `createdAt` | `createdAt` | 直接 |
| `updatedAt` | `updatedAt` | 直接 |
| `status` | `status` | success→complete, pending→sending, error→error |
| `blocks[]` | `blocks[]` | 按 ID 顺序从 message_blocks 查找并内联 |
| `modelId` | `modelId` | 直接 |
| `model` | `model` | 直接 |
| `usage` | `usage` | 直接 |
| `askId` | `askId` | 直接 |
| `metrics` | `metrics` | 直接 |
| `foldSelected` | `foldSelected` | 直接 |
| `multiModelMessageStyle` | `multiModelMessageStyle` | 直接 |
| `mentions` | `mentions` | 直接 |

### 6.5 Block 映射

| Cherry 字段 | Orbit 字段 | 转换规则 |
|---|---|---|
| `id` | `id` | 直接 |
| `messageId` | `messageId` | 直接 |
| `type` | `type` | 直接（main_text/thinking/citation/tool/error/unknown） |
| `createdAt` | `createdAt` | 直接 |
| `status` | `status` | 直接 |
| `updatedAt` | `updatedAt` | 直接 |
| `content` | `content` | type=main_text 时直接 |
| `knowledgeBaseIds` | `knowledgeBaseIds` | 直接 |
| `citationReferences` | `citationReferences` | 直接 |
| `thinking_millsec` | `thinking_millsec` | type=thinking 时直接 |
| `response` | `response` | type=citation 时直接 |
| `toolId` | `toolId` | type=tool 时直接 |
| `toolName` | `toolName` | 直接 |
| `metadata` | `metadata` | 直接 |
| `error` | `error` | type=error 时直接 |

### 6.6 Settings 映射

| Cherry 字段 | Orbit 字段 | 转换规则 |
|---|---|---|
| `language` | `language` | 直接 |
| `theme` | `theme` | 直接 |
| `fontSize` | `fontSize` | 直接 |
| `userName` | `userName` | 直接 |
| `messageStyle` | `messageStyle` | 直接 |
| `messageFont` | `messageFont` | 直接 |
| `showMessageDivider` | `showMessageDivider` | 直接 |
| `showTokens` | `showTokens` | 直接 |
| `showModelProviderInMarkdown` | `showModelProviderInMarkdown` | 直接 |
| `showModelNameInMarkdown` | `showModelNameInMarkdown` | 直接 |
| `showMessageOutline` | `showMessageOutline` | 直接 |
| `renderInputMessageAsMarkdown` | `renderInputMessageAsMarkdown` | 直接 |
| `codeShowLineNumbers` | `codeShowLineNumbers` | 直接 |
| `codeWrappable` | `codeWrappable` | 直接 |
| `codeCollapsible` | `codeCollapsible` | 直接 |
| `mathEngine` | `mathEngine` | 直接 |
| `mathEnableSingleDollar` | `mathEnableSingleDollar` | 直接 |
| `sendMessageShortcut` | `sendMessageShortcut` | 直接 |
| `showInputEstimatedTokens` | `showInputEstimatedTokens` | 直接 |
| `pasteLongTextAsFile` | `pasteLongTextAsFile` | 直接 |
| `pasteLongTextThreshold` | `pasteLongTextThreshold` | 直接 |
| `foldDisplayMode` | `foldDisplayMode` | 直接 |
| `gridColumns` | `gridColumns` | 直接 |
| `messageNavigation` | `messageNavigation` | 直接 |
| `confirmDeleteMessage` | `confirmDeleteMessage` | 直接 |
| `confirmRegenerateMessage` | `confirmRegenerateMessage` | 直接 |
| `thoughtAutoCollapse` | `thoughtAutoCollapse` | 直接 |
| `showAssistants` | `showAssistants` | 直接 |
| `showTopics` | `showTopics` | 直接 |
| `topicPosition` | `topicPosition` | 直接 |
| `showTopicTime` | `showTopicTime` | 直接 |
| `pinTopicsToTop` | `pinTopicsToTop` | 直接 |
| `assistantIconType` | `assistantIconType` | 直接 |
| `clickAssistantToShowTopic` | `clickAssistantToShowTopic` | 直接 |
| `enableTopicNaming` | `enableTopicNaming` | 直接 |
| `topicNamingPrompt` | `topicNamingPrompt` | 直接 |
| `useTopicNamingForMessageTitle` | `useTopicNamingForMessageTitle` | 直接 |
| `autoTranslateWithSpace` | `autoTranslateWithSpace` | 直接 |
| `showTranslateConfirm` | `showTranslateConfirm` | 直接 |
| `translateModelPrompt` | `translateModelPrompt` | 直接 |
| `targetLanguage` | `targetLanguage` | 直接 |
| `multiModelMessageStyle` | `multiModelMessageStyle` | 直接 |
| `enableBackspaceDeleteModel` | `enableBackspaceDeleteModel` | 直接 |
| `enableQuickPanelTriggers` | `enableQuickPanelTriggers` | 直接 |
| `narrowMode` | `narrowMode` | 直接 |
| `navbarPosition` | `navbarPosition` | 直接 |
| `userTheme.colorPrimary` | `userTheme.colorPrimary` | 直接 |
| `customCss` | `customCss` | 直接 |
| `exportMenuOptions` | `exportMenuOptions` | 直接 |
| `codeEditor.*` | `codeEditor.*` | 直接 |
| `codePreview.*` | `codePreview.*` | 直接 |
| 其他字段 | — | 丢弃 |

---

## 7. 持久化和版本迁移

### 7.1 IndexedDB

```
Database: orbit-chat
ObjectStore: appData
Record: { key: 'main', data: AppData }
```

单记录存储。保存串行化 + 200ms 防抖。流式消息仅在开始/批次/结束时持久化。

### 7.2 迁移规则

- `AppData.version` 是数据结构版本
- 启动时按版本顺序执行迁移
- 迁移前保留原记录；失败时不覆盖
- 旧数据含 `cherryData`/`compatZone`/`messageBlocks` 时删除，保留内嵌 `blocks[]`

---

## 8. 验收标准

1. 创建 Provider、模型、Assistant、Topic 后刷新页面，数据不变
2. 同一时刻只能有一个默认 Assistant
3. 删除被 Topic 使用的 Assistant 或模型时，页面不留失效引用
4. 用户消息、Assistant 正文、思考内容、错误和 Token 用量在流式过程中正确显示
5. 停止生成后，已收到的正文和 thinking 内容保留
6. BubbleList 自动追底、未读计数、回底按钮正常工作
7. Thinking 组件状态随 thinking block 的 status 变化（start→thinking→end）
8. XMarkdown 正确渲染代码高亮、表格、任务列表
9. Conversations 组件支持分组、搜索、菜单操作、置顶排序
10. XSender 支持发送、附件、指令弹窗
11. ConfigProvider 主题切换（light/dark）和 themeOverrides 生效
12. 导入多 Assistant Cherry v5 文件后，Topic 归属、标题、时间一致
13. 导出 JSON 不含 API Key，再次导入后数量闭环
14. 导出前无效引用时，下载被阻止并显示问题
15. 桌面/平板/移动端可完成新建对话、发送消息、切换模型、打开设置、管理 Topic

---

## 9. 实施顺序

1. 收紧类型、清理旧字段、加入默认值和版本迁移
2. 重写导入导出映射及引用校验
3. appStore 保存改为串行防抖，补充删除引用保护
4. 对齐 chatStore 的消息状态与 block 写入
5. 集成 BubbleList + Bubble + XMarkdown 对话界面
6. 集成 Conversations 话题管理界面
7. 集成 XSender 输入框 + Attachments 附件
8. 集成 Thinking / ThoughtChain 思考展示
9. 集成 Welcome + Prompts 欢迎页
10. 集成 ConfigProvider 主题系统
11. 集成 HookFetch + useSend + useXStream 请求层
12. 数据层单元测试、导入导出闭环测试、响应式界面回归测试

---

## 10. 字段存在性差异速查（data-schema 验证）

| 字段 | defaultAssistant | 普通助手 | agent |
|------|-----------------|---------|-------|
| `messages` | ✅ (=[]) | ✅ (=[]) | ✅ (=[]) |
| `type` | ✅ | ✅ | ✅ |
| `model` | ❌ | ✅ | ❌ (null) |
| `settings` | ✅ | ✅ | ❌ ({}) |
| `mcpServers` | ❌ | ❌ | ❌ |
| `knowledgeRecognition` | ❌ | ✅ | ❌ |
| `enableWebSearch` | ❌ | ✅ | ❌ |
| `description` | ❌ | ❌ | ❌ |

---

## 11. Block 类型分布参考（data-schema 统计）

| Block 类型 | 数量占比 | 说明 |
|-----------|---------|------|
| `main_text` | ~72% | 正文内容 |
| `thinking` | ~14% | 思考过程 |
| `unknown` | ~7% | 未知（始终 error 状态） |
| `error` | ~5% | 错误信息 |
| `citation` | ~1% | 引用来源 |
| `tool` | ~1% | 工具调用 |

---

*本文档基于 data-schema.md（Cherry Studio data.json v5 完整字段定义）+ wiki 组件库文档（Element-Plus-X）+ PRD v2.0 综合生成。*
