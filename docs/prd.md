---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_cf82ba1a93e311f18e22525400f8a581
    ReservedCode1: 0/9xQNVjIDmpRAbtxD4B/V7HCKV7LZYT5Q5aqeOPXK0m5KVlQjwx91k/ZqZmM3sH8rbBqVlZt+xMF9G7iF/02HcpZCRKvLt234rIkSLEq+uhXdaRdIffqr1/SXimDl+LwOvg/z5Mh3Ml1Dpr2ijRDapK7HCFbj24O/hkQbQSXHHSgMbiJPkzwW9axvE=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_cf82ba1a93e311f18e22525400f8a581
    ReservedCode2: 0/9xQNVjIDmpRAbtxD4B/V7HCKV7LZYT5Q5aqeOPXK0m5KVlQjwx91k/ZqZmM3sH8rbBqVlZt+xMF9G7iF/02HcpZCRKvLt234rIkSLEq+uhXdaRdIffqr1/SXimDl+LwOvg/z5Mh3Ml1Dpr2ijRDapK7HCFbj24O/hkQbQSXHHSgMbiJPkzwW9axvE=
---



# Cherry Studio 产品功能需求文档 (PRD)

> **方法论**：本文档从 `data.json`（3.0 MB，导出版本 5）的存储结构反向推导产品功能。
> 每个存储节点（localStorage Key / indexedDB ObjectStore）对应一个功能模块，
> 从字段定义、数据量、枚举值反推用户故事和功能规格。
> 配套参考：`docs/data-json-schema.md`（字段级定义） / `docs/data-architecture.md`（架构分析）

---

## 1. 对话引擎（核心）

### 1.1 功能概述
多话题对话系统是 Cherry Studio 的核心模块。用户可在每个助手下创建多个话题（Topic），每个话题内含完整对话记录，支持流式消息生成和多种消息内容块类型。

### 1.2 数据依据

| 存储 | 字段 | 说明 |
|------|------|------|
| `indexedDB.topics` | `id`, `messages[]` | 43 个话题，41 个含消息，共 482 条 |
| `indexedDB.message_blocks` | `id`, `messageId`, `type`, `content`, `status` | 657 个内容块，6 种类型 |
| `Message` | `role`, `status`, `blocks[]`, `model`, `usage`, `mentions` | 11 个字段（见 schema §3.2） |

### 1.3 用户故事
- 作为用户，我可以在助手下创建多个对话话题，每个话题独立保存历史
- 作为用户，发送消息后我可以看到 AI 流式回复，包括思考过程（thinking）和最终回答

### 1.4 功能规格

| ID | 功能点 | 规格说明 |
|----|--------|---------|
| C-01 | 多话题管理 | 每个话题 `{id, title, messages[]}` 独立存储，支持创建/切换/删除 |
| C-02 | 流式消息生成 | `message_blocks` 支持 `streaming` 状态，`supported_text_delta` 标记模型是否支持增量 |
| C-03 | 消息状态追踪 | 三级状态：`pending` → `streaming`/`processing` → `success`/`error` |
| C-04 | 多类型内容块 | 6 种类型：main_text / thinking / citation / error / tool / unknown |
| C-05 | Token 用量统计 | 每条 assistant 消息记录 `usage: {prompt_tokens, completion_tokens, total_tokens}` |
| C-07 | 话题置顶 | `pinned: boolean`，与 `settings.pinTopicsToTop` 联动 |
| C-08 | 消息重发/重新生成 | `status: error` 的消息支持重新生成 |

### 1.5 优先级：P0

---

## 2. 多助手系统

### 2.1 功能概述
用户可创建多个 AI 助手，每个助手独立配置系统提示词、模型、上下文长度和温度等参数。每个助手拥有独立的话题列表。

### 2.2 数据依据

| 存储 | 字段 | 说明 |
|------|------|------|
| `assistants.defaultAssistant` | 完整的 Assistant 对象 | 默认助手 |
| `assistants.assistants[]` | `{id, name, emoji, prompt, model, topics[], settings}` | 3 个助手，34 个 topic 引用 |
| `Assistant.settings` | `{temperature, contextCount, streamOutput, ...}` | 10 个助手级参数 |

### 2.3 用户故事
- 作为用户，我可以创建多个不同用途的 AI 助手（如编程助手、写作助手），每个配置不同提示词和模型
- 作为用户，我可以在对话过程中随时切换助手

### 2.4 功能规格

| ID | 功能点 | 规格说明 |
|----|--------|---------|
| A-01 | 助手 CRUD | 创建/编辑/删除助手，必填：`name`、`prompt`；选填：`emoji`、`model` |
| A-02 | 默认助手 | `defaultAssistant` 字段记录当前默认，新会话自动使用 |
| A-03 | 助手切换 | 界面支持在不同助手间切换，每个助手下话题独立 |
| A-04 | 系统提示词 | `prompt: string`，支持 Markdown，所有该助手下的消息自动注入 |
| A-05 | 温度控制 | `settings.temperature: 0-2`，`enableTemperature` 控制是否启用 |
| A-06 | 上下文轮数 | `settings.contextCount: number`，控制发送给 LLM 的历史消息轮数 |
| A-07 | 流式开关 | `settings.streamOutput: boolean` |
| A-08 | 最大 Token | `settings.enableMaxTokens` + `settings.maxTokens` |
| A-09 | 工具模式 | `settings.toolUseMode: "prompt"`，定义工具调用行为 |
| A-10 | 推理深度 | `settings.reasoning_effort` / `qwenThinkMode`，针对特定模型 |
| A-11 | 常用短语 | `regularPhrases: string[]`，快速输入预设文本 |
| A-12 | 知识库联动 | `knowledgeRecognition: boolean`，启用时检索知识库 |
| A-13 | 网络搜索联动 | `enableWebSearch: boolean`，启用时联网搜索 |

### 2.5 优先级：P0

---

## 3. 多模型 / Provider 管理

### 3.1 功能概述
统一的 LLM Provider 接入层，支持 OpenAI 兼容接口、Gemini 等 61 个预置 Provider（52 系统 + 9 用户自定义），用户可配置 API Key、自定义 API Host、管理模型列表。

### 3.2 数据依据

| 存储 | 字段 | 说明 |
|------|------|------|
| `llm.providers[]` | `{id, name, type, apiKey, apiHost, models[], enabled, isSystem}` | 61 个 Provider |
| `llm.defaultModel` | `ModelRef` | 全局默认模型 |
| `llm.topicNamingModel` | `ModelRef` | 话题自动命名模型 |
| `llm.translateModel` | `ModelRef` | 翻译模型 |
| `llm.quickAssistantModel` | `ModelRef` | 快捷助手模型 |
| `ModelRef` | `{id, provider, name, group, supported_text_delta}` | 模型引用结构 |

### 3.3 用户故事
- 作为用户，我可以添加自定义 Provider（如 OpenAI 兼容 API），配置 API Key 和地址后使用其模型
- 作为用户，我可以为不同场景（对话/翻译/话题命名）分别指定不同模型

### 3.4 功能规格

| ID | 功能点 | 规格说明 |
|----|--------|---------|
| P-01 | Provider 管理 | CRUD，字段：`name` / `type` / `apiKey` / `apiHost`；系统预置 `isSystem=true` 不可删除 |
| P-02 | API Key 管理 | 输入框 + 显示/隐藏切换；建议支持加密存储 |
| P-03 | 模型列表 | 每个 Provider 下 `models[]`，字段：`id` / `name` / `group` |
| P-04 | 分组展示 | 模型按 `group` 分组（如 `gemini-2.5` 组含 gemini-2.5-pro / gemini-2.5-flash） |
| P-05 | 启用/禁用 Provider | `enabled: boolean`，禁用后模型不在选择列表中显示 |
| P-06 | 多场景模型绑定 | `defaultModel` / `topicNamingModel` / `translateModel` 独立绑定 |
| P-07 | 快捷助手模型 | `quickAssistantModel` + `quickAssistantId`，一键唤起快捷问答 |
| P-08 | 本地模型支持 | `llm.settings.ollama/lmstudio/gpustack` 配置保活时间 |
| P-09 | Vertex AI | `llm.settings.vertexai` 配置 serviceAccount / projectId / location |

### 3.5 优先级：P0

---

## 4. 思考链（Thinking）

### 4.1 功能概述
展示 AI 模型的推理思考过程。`message_blocks` 中 `type="thinking"` 类型（91 条）专门存储思考内容，与正文（main_text）分离展示。

### 4.2 数据依据

| 存储 | 字段 | 说明 |
|------|------|------|
| `message_blocks[type="thinking"]` | `content` (91 条) | 思考过程文本 |
| `settings.thoughtAutoCollapse` | `boolean` | 是否自动折叠思考块 |

### 4.3 用户故事
- 作为用户，我可以在 AI 回答中看到它的思考过程，点击折叠/展开

### 4.4 功能规格

| ID | 功能点 | 规格说明 |
|----|--------|---------|
| T-01 | 思考过程展示 | 消息中 `thinking` block 独立渲染，样式区别于 main_text |
| T-02 | 折叠/展开 | 单击 toggle；`thoughtAutoCollapse=true` 时默认折叠 |
| T-03 | 流式显示 | thinking 块在 `streaming` 状态下实时增量显示 |

### 4.5 优先级：P1

---

## 5. 引用来源（Citation）

### 5.1 功能概述
AI 回答中展示引用来源。`message_blocks` 中 `type="citation"`（8 条）存储引用信息，`citationReferences` 字段存储结构化来源数据。

### 5.2 数据依据

| 存储 | 字段 | 说明 |
|------|------|------|
| `message_blocks[type="citation"]` | `content` (8 条) | 引用文本 |
| `message_blocks[].citationReferences` | `unknown[]` | 引用来源结构数组 |

### 5.3 用户故事
- 作为用户，当 AI 回答引用外部资料时，我可以看到来源链接并点击跳转

### 5.4 功能规格

| ID | 功能点 | 规格说明 |
|----|--------|---------|
| CI-01 | 引用展示 | citation block 以脚注或卡片形式展示来源 |
| CI-02 | 来源跳转 | citationReferences 包含 URL，点击可跳转 |

### 5.5 优先级：P1

---

## 6. 工具调用

### 6.1 功能概述
展示模型工具调用（Function Calling）的执行过程和结果。`type="tool"`（6 条）在 message_blocks 中独立存储。

### 6.2 数据依据

| 存储 | 字段 | 说明 |
|------|------|------|
| `message_blocks[type="tool"]` | `content` (6 条) | 工具调用代码/结果 |
| `Assistant.settings.toolUseMode` | `"prompt"` | 工具使用模式 |

### 6.3 用户故事
- 作为用户，当 AI 使用工具查询外部数据时，我可以看到调用了什么工具及其返回结果

### 6.4 功能规格

| ID | 功能点 | 规格说明 |
|----|--------|---------|
| TL-01 | 工具调用展示 | tool block 以可折叠卡片形式展示工具名、参数、返回结果 |
| TL-02 | 状态指示 | tool 块包含 `status`：成功/失败/执行中 |

### 6.5 优先级：P2

---

## 7. 云同步 / 备份

### 7.1 功能概述
多后端数据备份与同步，支持 WebDAV / S3 / 坚果云，支持自动同步和备份版本管理。

### 7.2 数据依据

| 存储 | 字段 | 说明 |
|------|------|------|
| `backup` | — | 备份配置 |
| `nutstore` | — | 坚果云同步配置 |
| `settings.webdav*` | `host/user/pass/path/autoSync/interval/maxBackups` | WebDAV 7 项 |
| `settings.s3` | `object` | S3 配置 |
| `settings.skipBackupFile` | `boolean` | 备份时跳过文件 |
| `settings.webdavSkipBackupFile` | `boolean` | WebDAV 跳过文件 |

### 7.3 用户故事
- 作为用户，我可以将数据和配置自动备份到 WebDAV/坚果云/S3，换设备后可恢复

### 7.4 功能规格

| ID | 功能点 | 规格说明 |
|----|--------|---------|
| SY-01 | WebDAV 同步 | 配置 host/user/pass/path，支持自动同步 |
| SY-02 | 坚果云同步 | 坚果云 OAuth / 密码模式 |
| SY-03 | S3 存储 | S3 兼容的对象存储备份 |
| SY-04 | 自动同步 | `webdavAutoSync` + `webdavSyncInterval`（分钟） |
| SY-05 | 备份版本 | `webdavMaxBackups` 控制最大备份数量 |
| SY-06 | 导出/导入 | `exportMenuOptions` 自定义导出内容项 |
| SY-07 | 备份过滤 | `skipBackupFile` 跳过文件类数据 |

### 7.5 优先级：P1

---

## 8. 全局设置

### 8.1 功能概述
119 项全局用户偏好设置，覆盖外观、交互、功能开关、隐私等。

### 8.2 数据依据

| 存储 | 字段 | 说明 |
|------|------|------|
| `settings` | 119 项配置 | 涵盖：外观/编辑器/同步/通知/快捷键/隐私 |

### 8.3 设置项分类

| 分类 | 字段示例 | 项数 |
|------|---------|------|
| **外观** | `theme`, `fontSize`, `windowStyle`, `messageStyle`, `messageFont`, `userTheme`, `narrowMode` | 18 |
| **布局** | `showAssistants`, `showTopics`, `topicPosition`, `sidebarIcons`, `showMessageDivider` | 10 |
| **对话交互** | `sendMessageShortcut`, `messageNavigation`, `foldDisplayMode`, `autoTranslateWithSpace` | 8 |
| **通知** | `notification`, `launchOnBoot`, `tray`, `trayOnClose`, `autoCheckUpdate` | 6 |
| **同步/备份** | `webdav*` (7), `s3`, `backup`, `skipBackupFile` | 10 |
| **截图/OCR** | `ocr` 配置 | 3 |
| **隐私** | `enableDataCollection`, `readClipboardAtStartup` | 4 |
| **快捷键** | `sendMessageShortcut`, `shortcuts` | 8 |
| **数学/公式** | `mathEngine`, `forceDollarMathInMarkdown` | 3 |
| **其他** | `proxyMode`, `exportMenuOptions`, `spellCheckLanguages` | 34 |

### 8.4 优先级

| 分类 | 优先级 |
|------|--------|
| 外观 / 布局 / 对话交互 | P0 |
| 同步 / 备份 | P1 |
| 通知 / 数学 / 快捷键 | P1 |
| 截图 / OCR / 隐私 | P2 |

---

## 附录 A：完整功能优先级矩阵

| # | 功能模块 | 优先级 | 核心存储 | 数据量 |
|---|---------|--------|---------|--------|
| 1 | 对话引擎 | P0 | `topics` + `message_blocks` | 43 话题 / 482 消息 / 657 blocks |
| 2 | 多助手系统 | P0 | `assistants` | 3 助手 / 34 topic 引用 |
| 3 | Provider / 模型管理 | P0 | `llm.providers` | 61 Provider（52 系统 + 9 用户） |
| 4 | 思考链 (Thinking) | P1 | `message_blocks[thinking]` | 91 条 |
| 5 | 引用来源 (Citation) | P1 | `message_blocks[citation]` | 8 条 |
| 6 | 工具调用 | P2 | `message_blocks[tool]` | 6 条 |
| 7 | 云同步 / 备份 | P1 | `backup` / `nutstore` / `webdav*` | — |
| 8 | 全局设置 | P0 | `settings` (119 项) | — |

## 附录 B：核心数据模型关系

```
Provider (61) ──1:N──> Model ──引用──> Assistant.model / Assistant.defaultModel
                                              │
Assistant (3) ──1:N──> TopicRef (34) ──ID引用──> Topic (43)
                        │                            │
                        ├─ name                      └──1:N──> Message (482)
                        ├─ createdAt/updatedAt                     │
                        └─ isNameManuallyEdited                    ├── blocks[] (block ID refs)
                                                                   ├── usage (TokenUsage)
                                                                   └── modelId (Provider ref)
                                                                              │
Message ──1:N──> MessageBlock (657, 通过 messageId 关联)
                   ├── type: main_text | thinking | citation | error | tool | unknown
                   ├── status: success | error | streaming | processing
                   ├── content: string
                   └── citationReferences: unknown[]
```

> **文档版本**: v1.0 | **基于**: `data.json` v5, 3.0 MB | **配套**: `docs/data-json-schema.md` `docs/data-architecture.md`
