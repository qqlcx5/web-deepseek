---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_8628fc7593e111f1bafa525400287e28
    ReservedCode1: zTytLC2CrEgCnWvKPSStTleBGHOGPJWXWbmSHYjCpLVq3c3ky4Bf6jO54vl9X0keKorrdGp9MfLfi+Ip5hX9yO3C9tuo6sj0D7H5NoX9/4mvOUZCJSUXmGmMJBbv5wfdU60ge3NT/nOjMBUwH553tsxnjzwGINbgxjvpQ/ISSc/lxEprncv51FzYCWg=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_8628fc7593e111f1bafa525400287e28
    ReservedCode2: zTytLC2CrEgCnWvKPSStTleBGHOGPJWXWbmSHYjCpLVq3c3ky4Bf6jO54vl9X0keKorrdGp9MfLfi+Ip5hX9yO3C9tuo6sj0D7H5NoX9/4mvOUZCJSUXmGmMJBbv5wfdU60ge3NT/nOjMBUwH553tsxnjzwGINbgxjvpQ/ISSc/lxEprncv51FzYCWg=
---

# data.json 字段级 JSON Schema

> 源文件: `/Users/another/Documents/OpenSource/web-deepseek/data.json` (3.0 MB)
> 导出版本: 5 | 实例数在每章节标题标注

---

## 1. 顶层 (1 实例)

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `time` | `number` | 是 | 导出时间戳（毫秒） | `1758091674643` |
| `version` | `number` | 是 | 导出版本号 | `5` |
| `localStorage` | `LocalStorage` | 是 | 配置层（键值对） | 见 §2 |
| `indexedDB` | `IndexedDB` | 是 | 数据层（多 ObjectStore） | 见 §3 |

---

## 2. localStorage (1 实例)

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `language` | `string` | 是 | UI 语言 | `"zh-CN"` |
| `modelscope_token` | `string` | 否 | ModelScope API Token | `"ms-1597c95e-..."` |
| `persist:cherry-studio` | `PersistStore` | 是 | Pinia 持久化核心配置（22 个 key） | 见 §2.1 |

### 2.1 persist:cherry-studio — 顶层 Key 索引 (22 个)

| Key | 类型 | 说明 | 实例数 |
|-----|------|------|--------|
| `assistants` | `AssistantsConfig` | 助手定义 + topic 引用 | 见 §2.2 |
| `llm` | `LLMConfig` | Provider / 模型配置 | 见 §2.4 |
| `settings` | `Record<string, any>` | 全局用户设置 | 119 项 |
| `paintings` | `Record<string, PaintingProvider[]>` | 绘图 Provider（10 类） | 10 个 key |
| `shortcuts` | `Record<string, string>` | 快捷键映射 | 若干 |
| `agents` | `AgentItem[]` | AI Agent 定义 | 少量 |
| `knowledge` | `unknown` | 知识库配置 | — |
| `mcp` | `unknown` | MCP 工具配置 | — |
| `websearch` | `unknown` | 搜索引擎配置 | — |
| `minapps` | `unknown` | 小程序配置 | — |
| `memory` | `unknown` | AI 记忆配置 | — |
| `copilot` | `unknown` | Copilot 配置 | — |
| `selectionStore` | `unknown` | 文本选择偏好 | — |
| `translate` | `unknown` | 翻译引擎配置 | — |
| `note` | `unknown` | 笔记配置 | — |
| `ocr` | `unknown` | OCR 配置 | — |
| `inputTools` | `unknown` | 输入增强工具 | — |
| `preprocess` | `unknown` | 预处理配置 | — |
| `nutstore` | `unknown` | 坚果云同步 | — |
| `codeTools` | `unknown` | 代码工具 | — |
| `backup` | `unknown` | 备份配置 | — |
| `_persist` | `PersistMeta` | `{"version": number, "rehydrated": boolean}` | 1 |

### 2.2 AssistantsConfig (1 实例) — `persist:cherry-studio.assistants`

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `defaultAssistant` | `Assistant` | 是 | 默认助手完整对象 | 见 §2.3 |
| `assistants` | `Assistant[]` | 是 | 助手列表 | 3 个 |

### 2.3 Assistant — `assistants[i]` (3 实例)

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `id` | `string` | 是 | 助手 UUID | `"b88d85c6-cffb-4a80-84a0-6ab11cbf2722"` |
| `name` | `string` | 是 | 助手名称 | `"临时助手"` |
| `emoji` | `string` | 是 | 图标 emoji | `"😀"` |
| `prompt` | `string` | 是 | 系统提示词 | `""` |
| `type` | `string` | 是 | 固定值 | `"assistant"` |
| `model` | `ModelRef` | 否 | 当前选用的模型引用 | `{"id":"gemini-2.5-flash", ...}` |
| `defaultModel` | `ModelRef` | 否 | 默认模型引用 | `{"id":"gemini-2.5-pro", ...}` |
| `topics` | `TopicRef[]` | 是 | 话题引用列表（仅含 ID + 元数据） | 见 §2.3a |
| `messages` | `any[]` | 是 | 消息数组（导出时为空，真实数据在 indexedDB） | `[]` |
| `regularPhrases` | `string[]` | 是 | 常用预设短语 | `[]` |
| `settings` | `AssistantSettings` | 是 | 助手级参数配置 | 见 §2.3b |
| `knowledgeRecognition` | `boolean` | 否 | 启用知识库识别 | `false` |
| `enableWebSearch` | `boolean` | 否 | 启用联网搜索 | `false` |

#### 2.3a TopicRef — `assistant.topics[i]` (共 34 引用)

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `id` | `string` | 是 | Topic UUID | `"7d621c01-2b2b-..."` |
| `assistantId` | `string` | 是 | 所属助手 UUID | `"b88d85c6-cffb-..."` |
| `name` | `string` | 是 | 话题名称 | `"三体介绍"` |
| `createdAt` | `string` | 是 | 创建时间 (ISO 8601) | `"2025-09-17T05:12:00.728Z"` |
| `updatedAt` | `string` | 是 | 更新时间 (ISO 8601) | `"2025-09-17T05:12:00.728Z"` |
| `messages` | `any[]` | 是 | 导出时固定为空数组（真实 messages 在 indexedDB） | `[]` |
| `isNameManuallyEdited` | `boolean` | 是 | 名称是否手动编辑过 | `false` |

#### 2.3b AssistantSettings — `assistant.settings`

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `temperature` | `number` | 是 | 采样温度 | `1` |
| `contextCount` | `number` | 是 | 上下文轮数 | `5` |
| `enableMaxTokens` | `boolean` | 是 | 启用最大 Token 限制 | `false` |
| `maxTokens` | `number` | 是 | 最大 Token 数 | `0` |
| `streamOutput` | `boolean` | 是 | 启用流式输出 | `true` |
| `customParameters` | `unknown[]` | 是 | 自定义参数 | `[]` |
| `toolUseMode` | `string` | 是 | 工具使用模式 | `"prompt"` |
| `reasoning_effort` | `string` | 否 | 推理深度 | — |
| `reasoning_effort_cache` | `string` | 否 | 推理缓存策略 | — |
| `qwenThinkMode` | `string` | 否 | 通义千问思考模式 | — |

### 2.4 LLMConfig — `persist:cherry-studio.llm` (1 实例)

#### 顶层标量

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `defaultModel` | `ModelRef` | 是 | 全局默认模型 | `{"id":"gemini-2.5-pro","provider":"7515a8ce-...","name":"gemini-2.5-pro","group":"gemini-2.5"}` |
| `topicNamingModel` | `ModelRef` | 是 | 话题自动命名模型 | 同结构 |
| `translateModel` | `ModelRef` | 是 | 翻译模型 | 同结构 |
| `quickAssistantModel` | `ModelRef` | 是 | 快捷助手模型 | 同结构 |
| `quickAssistantId` | `string` | 是 | 快捷助手 UUID | `"b88d85c6-cffb-..."` |
| `quickModel` | `ModelRef` | 是 | 快捷模型 | 同结构 |
| `providers` | `Provider[]` | 是 | Provider 列表 | 61 个（52 系统 + 9 用户） |
| `settings` | `LLMSettings` | 是 | LLM 全局设置 | 见 §2.4c |

#### 2.4a Provider — `llm.providers[i]` (61 实例)

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `id` | `string` | 是 | Provider UUID | `"7515a8ce-1d29-4886-b221-0cf378de9309"` |
| `name` | `string` | 是 | 显示名称 | `"Google Gemini"` |
| `type` | `string` | 是 | Provider 类型 | `"gemini"` |
| `apiKey` | `string` | 是 | API 密钥 | `"sk-..."` |
| `apiHost` | `string` | 是 | API 地址 | `"https://..."` |
| `models` | `Model[]` | 是 | 支持的模型列表 | 见 §2.4b |
| `enabled` | `boolean` | 是 | 是否启用 | `true` |
| `isSystem` | `boolean` | 是 | 是否为系统预置 | `true` |

#### 2.4b Model — `provider.models[i]`

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `id` | `string` | 是 | 模型 ID | `"gemini-2.5-pro"` |
| `provider` | `string` | 是 | 所属 Provider UUID | `"7515a8ce-..."` |
| `name` | `string` | 是 | 模型显示名 | `"gemini-2.5-pro"` |
| `group` | `string` | 是 | 模型分组 | `"gemini-2.5"` |
| `supported_text_delta` | `boolean` | 是 | 支持文本增量推送 | `true` |

#### 2.4c LLMSettings — `llm.settings`

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `ollama` | `{ keepAliveTime: number }` | 是 | Ollama 保活时间 |
| `lmstudio` | `{ keepAliveTime: number }` | 是 | LM Studio 保活时间 |
| `gpustack` | `{ keepAliveTime: number }` | 是 | GPUStack 保活时间 |
| `vertexai` | `{ serviceAccount, projectId, location }` | 是 | Google Vertex AI 凭证 |

### 2.5 Settings — `persist:cherry-studio.settings` (119 项，列出核心 40 项)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `showAssistants` | `boolean` | 显示助手面板 |
| `showTopics` | `boolean` | 显示话题列表 |
| `sendMessageShortcut` | `string` | 发送快捷键（`"Enter"`） |
| `language` | `string` | 界面语言（`"zh-CN"`） |
| `targetLanguage` | `string` | 翻译目标语言（`"zh-cn"`） |
| `proxyMode` | `string` | 代理模式（`"system"` / `"manual"` / `"none"`） |
| `userName` | `string` | 用户名 |
| `showPrompt` | `boolean` | 显示提示词 |
| `showMessageDivider` | `boolean` | 消息间分隔线 |
| `messageFont` | `string` | 消息字体（`"system"`） |
| `launchOnBoot` | `boolean` | 开机启动 |
| `trayOnClose` | `boolean` | 关闭到托盘 |
| `theme` | `string` | 主题（`"system"` / `"light"` / `"dark"`） |
| `windowStyle` | `string` | 窗口样式（`"opaque"`） |
| `fontSize` | `number` | 字号（`14`） |
| `topicPosition` | `string` | 话题列表位置（`"left"`） |
| `pinTopicsToTop` | `boolean` | 置顶话题到顶部 |
| `autoCheckUpdate` | `boolean` | 自动检查更新 |
| `codeExecution` | `object` | 代码执行配置 `{enabled, timeoutMinutes}` |
| `codeEditor` | `object` | 代码编辑器主题配置 |
| `codePreview` | `object` | 代码预览主题配置 |
| `mathEngine` | `string` | 数学渲染引擎（`"KaTeX"`） |
| `messageStyle` | `string` | 消息样式（`"bubble"` / `"flat"`） |
| `foldDisplayMode` | `string` | 折叠显示模式（`"expanded"`） |
| `messageNavigation` | `string` | 消息导航模式（`"anchor"`） |
| `webdavHost` | `string` | WebDAV 主机 |
| `webdavUser` | `string` | WebDAV 用户名 |
| `webdavPass` | `string` | WebDAV 密码 |
| `webdavPath` | `string` | WebDAV 路径 |
| `webdavAutoSync` | `boolean` | WebDAV 自动同步 |
| `enableTopicNaming` | `boolean` | 启用话题自动命名 |
| `narrowMode` | `boolean` | 窄屏模式 |
| `enableQuickAssistant` | `boolean` | 启用快捷助手 |
| `thoughtAutoCollapse` | `boolean` | 思考过程自动折叠 |
| `enableDataCollection` | `boolean` | 启用数据收集 |
| `exportMenuOptions` | `object` | 导出菜单配置 |
| `sidebarIcons` | `object` | 侧边栏图标配置 |
| `notification` | `object` | 通知配置 |
| `userTheme` | `object` | 用户自定义主题 |
| `spellCheckLanguages` | `string[]` | 拼写检查语言列表 |

---

## 3. indexedDB (9 个 ObjectStore)

### 3.1 topics (43 实例)

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `id` | `string` | 是 | Topic UUID | `"a23f9768-d39b-..."` |
| `messages` | `Message[]` | 是 | 消息数组（内联存储） | 见 §3.2 |

> 共 41 个 topic 含消息，总计 482 条消息。2 个 topic 消息为空。

### 3.2 Message — `topics[i].messages[j]` (482 实例)

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `id` | `string` | 是 | 消息 UUID | `"abc123..."` |
| `role` | `"user"` \| `"assistant"` | 是 | 消息角色 | `"user"` |
| `topicId` | `string` | 是 | 所属 Topic UUID | `"a23f9768-d39b-..."` |
| `assistantId` | `string` | 是 | 所属 Assistant UUID | `"default"` |
| `createdAt` | `string` | 是 | 创建时间 (ISO 8601) | `"2025-06-03T01:10:12.055Z"` |
| `status` | `"success"` \| `"pending"` \| `"error"` | 是 | 消息状态 | `"success"` |
| `blocks` | `string[]` | 是 | 内容块 ID 引用数组，指向 `message_blocks[id]` | `["blk-uuid-1", "blk-uuid-2"]` |
| `modelId` | `string` | 是 | 使用的模型 provider 引用 | `"7515a8ce-..."` |
| `model` | `string` | 是 | 模型名称 | `"gemini-2.5-flash"` |
| `mentions` | `string[]` | 是 | @提及列表 | `[]` |
| `usage` | `TokenUsage` | 否 | Token 用量（仅 `assistant` 角色） | 见 §3.2a |

#### 3.2a TokenUsage — `message.usage`

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `prompt_tokens` | `number` | 是 | 输入 Token 数 | `823` |
| `completion_tokens` | `number` | 是 | 输出 Token 数 | `156` |
| `total_tokens` | `number` | 是 | 总 Token 数 | `979` |

### 3.3 message_blocks (657 实例)

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `id` | `string` | 是 | Block UUID（被 `Message.blocks[]` 引用） | `"blk-abc123"` |
| `messageId` | `string` | 是 | 所属 Message UUID（关联 `Message.id`） | `"msg-abc123"` |
| `type` | `MessageBlockType` | 是 | 内容块类型 | `"main_text"` |
| `status` | `"success"` \| `"error"` \| `"streaming"` \| `"processing"` | 是 | 内容块状态 | `"success"` |
| `content` | `string` | 是 | 实际文本内容 | `"你好，请帮我..."` |
| `createdAt` | `string` | 是 | 创建时间 (ISO 8601) | `"2025-06-03T01:10:12.055Z"` |
| `citationReferences` | `unknown[]` | 否 | 引用来源列表 | `[]` 或 `undefined` |

**MessageBlockType 枚举**：

| 值 | 数量 | 说明 |
|----|------|------|
| `"main_text"` | 474 | 用户输入 / AI 回答正文 |
| `"thinking"` | 91 | AI 思考过程（推理链） |
| `"unknown"` | 46 | 类型未识别或标记异常 |
| `"error"` | 32 | 生成错误信息 |
| `"citation"` | 8 | 引用 / 来源链接 |
| `"tool"` | 6 | 工具调用 / 工具返回 |

**已知异常**：32 个 block 的 `messageId` 在 `topics[].messages[]` 中无对应 Message 记录（孤立 block）。

### 3.4 settings (10 实例)

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `id` | `string` | 是 | 配置项 ID（格式 `image://provider-{uuid}` 等） | `"image://provider-0fe18fc0-..."` |
| `value` | `any` | 是 | 配置值（多为 JSON 字符串或空字符串） | `""` |

### 3.5 translate_history (2 实例)

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| `id` | `string` | 是 | 翻译记录 UUID | `"th-..."` |
| `sourceText` | `string` | 是 | 源文本 | `"Hello world"` |
| `targetText` | `string` | 是 | 译文 | `"你好世界"` |
| `sourceLanguage` | `string` | 是 | 源语言 | `"en"` |
| `targetLanguage` | `string` | 是 | 目标语言 | `"zh-cn"` |
| `createdAt` | `string` | 是 | 创建时间 (ISO 8601) | `"2025-08-01T..."` |

### 3.6 空 ObjectStore

以下 ObjectStore 存在索引但记录数为 0：

| Store | 说明 |
|-------|------|
| `files` | 文件存储（空） |
| `knowledge_notes` | 知识库笔记（空） |
| `quick_phrases` | 快捷短语（空） |
| `translate_languages` | 翻译语言配置（空） |
| `notes_tree` | 笔记树（空） |

---

## 4. 共享类型定义

### 4.1 ModelRef

```typescript
// 所有模型引用使用此结构
interface ModelRef {
  id: string            // 模型 ID，如 "gemini-2.5-pro"
  provider: string      // Provider UUID，如 "7515a8ce-..."
  name: string          // 模型显示名，如 "gemini-2.5-pro"
  group: string         // 分组，如 "gemini-2.5"
  supported_text_delta?: boolean  // 支持文本增量推送
}
```

### 4.2 PaintingProvider — `persist:cherry-studio.paintings.<provider_name>[i]`

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | `string` | Provider 配置 UUID |
| `model` | `string` | 绘图模型名 |
| `aspectRatio` | `string` | 画幅比例（如 `"ASPECT_1_1"`） |
| `numImages` | `number` | 每次生成图片数 |
| `styleType` | `string` | 风格类型（如 `"AUTO"`） |
| `prompt` | `string` | 正向提示词 |
| `negativePrompt` | `string` | 负向提示词 |
| `magicPromptOption` | `boolean` | 启用魔改提示词 |
| `seed` | `string` | 随机种子 |
| `imageWeight` | `number` | 图片权重 |
| `resemblance` | `number` | 相似度 |

绘图 Provider Key 列表（共 10 个）：

| Key | 配置数 |
|-----|--------|
| `siliconflow_paintings` | 0 |
| `dmxapi_paintings` | 0 |
| `tokenflux_paintings` | 0 |
| `zhipu_paintings` | 0 |
| `aihubmix_image_generate` | 1 |
| `aihubmix_image_remix` | 0 |
| `aihubmix_image_edit` | 0 |
| `aihubmix_image_upscale` | 0 |
| `openai_image_generate` | 0 |
| `openai_image_edit` | 0 |

---

## 5. 快速查询索引

| 需求场景 | 字段路径 |
|---------|---------|
| 获取导出时间 | `data.time` |
| 获取导出版本 | `data.version` |
| 获取界面语言 | `data.localStorage.language` |
| 获取所有助手 | `data.localStorage["persist:cherry-studio"].assistants.assistants[]` |
| 获取默认助手 | `data.localStorage["persist:cherry-studio"].assistants.defaultAssistant` |
| 获取某助手的 topic 列表 | `assistant.topics[]` → 仅含 ID 引用 |
| 获取某助手的配置参数 | `assistant.settings` |
| 获取所有 Provider 配置 | `data.localStorage["persist:cherry-studio"].llm.providers[]` |
| 获取全局默认模型 | `data.localStorage["persist:cherry-studio"].llm.defaultModel` |
| 获取用户全局设置 | `data.localStorage["persist:cherry-studio"].settings` |
| 获取某设置项 | `data.localStorage["persist:cherry-studio"].settings.<key>` |
| 获取所有话题（含消息） | `data.indexedDB.topics[]` |
| 获取某话题的全部消息 | `data.indexedDB.topics[i].messages[]` |
| 获取消息的块 ID 列表 | `message.blocks[]` |
| 按块 ID 获取内容 | `data.indexedDB.message_blocks[]` → 按 `id` 匹配 |
| 获取消息内容（完整） | `message.blocks[]` → 逐个 `message_blocks[id].content` → 按 `blocks[]` 顺序拼接 |
| 获取消息 Token 用量 | `message.usage`（仅 `role === "assistant"`） |
| 获取翻译历史 | `data.indexedDB.translate_history[]` |
| 统计 block 类型分布 | 遍历 `message_blocks[]`，对 `type` 分组计数 |
| 验证 message-block 关联完整性 | 检查 `message_blocks[i].messageId` 是否存在于 `topics[].messages[].id` |
*（内容由AI生成，仅供参考）*
