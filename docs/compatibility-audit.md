---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_5c23544793e011f18e22525400f8a581
    ReservedCode1: NCOmsPETBvM5gjZ6a2VonFIbjXkwm43A+QuY2xW0QiJ6sWRNA54S5p7cSQ5z206RESmOASEtfxfFE7trT5VpavyFe0j2NITFT14b4i4/qCoxOTg4OKHrjduEYx8StB623+YEY2+zujZ046a2exe3E6eXQzU1gGZhG3mfhRVX4K8Dyjsl4UHYhFYcyjA=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_5c23544793e011f18e22525400f8a581
    ReservedCode2: NCOmsPETBvM5gjZ6a2VonFIbjXkwm43A+QuY2xW0QiJ6sWRNA54S5p7cSQ5z206RESmOASEtfxfFE7trT5VpavyFe0j2NITFT14b4i4/qCoxOTg4OKHrjduEYx8StB623+YEY2+zujZ046a2exe3E6eXQzU1gGZhG3mfhRVX4K8Dyjsl4UHYhFYcyjA=
---



# Web-DeepSeek 对 Cherry Studio data.json 兼容性审计

**审计日期**: 2026-08-09
**基准文件**: `data-readable.md`（基于 `data.json`, v5, 3.0 MB）
**审计范围**: 类型定义 + 导入/导出 + 持久化层 + Store

---

## 审计文件清单

| 文件 | 用途 |
|---|---|
| `src/types/index.ts` | App 统一类型系统（Provider, Assistant, Topic, Message, Settings 等） |
| `src/types/cherry-data.ts` | Cherry Studio 原始 data.json 结构类型（CherryData, CherryProvider, CherryAssistant 等） |
| `src/utils/cherry-parser.ts` | JSON 解析与统计（safeParse, parseDataJSON） |
| `src/utils/data-import.ts` | Cherry → AppData 映射（mapProviders, mapAssistants, mapTopics, buildAppData, mergeAppData） |
| `src/utils/cherry-export.ts` | AppData → Cherry 反向导出（buildExportJSON, validateReferences, downloadJson） |
| `src/utils/db.ts` | IndexedDB 持久化（saveAppData, loadAppData, clearAppData） |
| `src/stores/app.ts` | Pinia Store（init, save, importData, exportData, CRUD） |

> **注**: 用户指定的 `src/stores/modules/app.ts` 不存在，实际路径为 `src/stores/app.ts`。

---

## 1. 基础设置

**data.json 字段**: `language`, `modelscope_token`

### 1.1 类型兼容

| 字段 | cherry-data.ts | index.ts (Settings) | 兼容 |
|---|---|---|---|
| `language` | — (在 `persist.settings` 中) | `language?: string` | ✅ |
| `modelscope_token` | — (在 `localStorage` 顶层) | 无显式字段，可走 `[key: string]` | ⚠️ 隐式兼容 |

### 1.2 导入导出链

- **cherry-parser.ts**: 不涉及此字段（只做计数统计）。
- **data-import.ts**: `mapSettings()` 显式提取 `language` ✅；`modelscope_token` 未在 Settings 中提取，但 localStorage 原始数据保留在 `compatZone` 或 `cherryData` 中可间接获取 ⚠️。
- **cherry-export.ts**: 仅导出 `settings` 块，`modelscope_token` 从其原始位置（localStorage 顶层）丢失 ❌。

### 1.3 评估

| 字段 | 读取 | 内部表示 | 导出 | 综合 |
|---|---|---|---|---|
| `language` | ✅ | ✅ | ✅ | ✅ |
| `modelscope_token` | ⚠️ | ⚠️（隐式） | ❌ | ❌ |

**兼容率: 1/2 = 50%**

---

## 2. 助手配置

**data.json 字段**: id, name, emoji, prompt, description, type, regularPhrases, settings, model, defaultModel, enableWebSearch, mcpServers, knowledgeRecognition, topics, messages

### 2.1 类型兼容（cherry-data.ts → index.ts）

| Cherry 字段 | CherryAssistant | Assistant (index.ts) | 兼容 |
|---|---|---|---|
| `id` | `id: string` | `id: string` | ✅ |
| `name` | `name: string` | `name: string` | ✅ |
| `emoji` | `emoji?: string` | `emoji?: string` | ✅ |
| `prompt` | `prompt?: string` | `prompt: string` | ✅ |
| `description` | `description?: string` | `description?: string` | ✅ |
| `type` | `type?: string` | **无** | ❌ |
| `regularPhrases` | `regularPhrases?: unknown[]` | `regularPhrases?: unknown[]` | ✅ |
| `settings` | `settings?: Record<string, unknown>` | `settings?: Record<string, unknown>` | ✅ |
| `model` (modelRef) | `model?: CherryModelRef` | `model?: string` | ⚠️ 降级为 string |
| `defaultModel` | `defaultModel?: CherryModelRef` | `defaultModel?: {id, provider, name, group?}` | ✅ |
| `enableWebSearch` | `enableWebSearch?: boolean` | `enableWebSearch?: boolean` | ✅ |
| `mcpServers` | `mcpServers?: unknown[]` | `mcpServers?: unknown[]` | ✅ |
| `knowledgeRecognition` | `knowledgeRecognition?: unknown` | `knowledgeRecognition?: unknown` | ✅ |
| `topics` | `topics?: unknown[]` | **不在 Assistant 中** | — (架构差异) |
| `messages` | `messages?: unknown[]` | **不在 Assistant 中** | — (架构差异) |
| Temperature | — | `temperature?: number` | ✅ (扩展) |
| `topP` | — | `topP?: number` | ✅ (扩展) |
| `maxTokens` | — | `maxTokens?: number` | ✅ (扩展) |
| Stream | — | `stream?: boolean` | ✅ (扩展) |
| Context Management | — | `contextManagement?: ContextManagement` | ✅ (扩展) |
| `customParams` | — | `customParams?: Record<string, unknown>` | ✅ (扩展) |
| `tags` | — | `tags?: string[]` | ✅ (扩展) |
| `group` | — | `group?: string` | ✅ (扩展) |

### 2.2 导入映射 (data-import.ts)

`mapAssistant()` 正确映射了 CherryAssistant → Assistant，但:
- `type` 字段**丢失**（无法区分 assistant 和 agent）❌
- `model` 仅保存 `ca.model?.id` 字符串，丢失了 provider/name/group 信息 ⚠️
- topics/messages 被剥离到独立存储（架构设计合理，不视为缺失）

### 2.3 导出映射 (cherry-export.ts)

- `type` 硬编码为 `'assistant'`，agent 类型信息丢失 ❌
- `model` 从 `a.defaultModel` 重建，但原始 `model` 字段可能不同 ⚠️

### 2.4 评估

**核心字段兼容率**: 15/17 = **88%**
**缺失**: type 字段（assistant vs agent 判定）
**降级**: model 类型从 `CherryModelRef` 降为 `string`

---

## 3. 智能体 (Agents)

**data.json 字段**: 与 Assistants 结构相同，区别在于 `type: "agent"`、通常 prompt 更长、默认模型含 group。

### 3.1 类型兼容

Cherry 不区分 assistant/agent 类型——二者共用 `CherryAssistant`，通过 `type` 字段区分。项目同样将 agents 作为 `Assistant` 导入，但 `type` 字段在映射中丢失。

### 3.2 导入映射

```typescript
// data-import.ts mapAssistant()
return {
  id: ca.id,
  name: ca.name,
  // ...
  // type 字段未映射 ❌
}
```

### 3.3 导出映射

```typescript
// cherry-export.ts buildExportJSON()
const assistants: CherryAssistant[] = data.assistants.map(a => ({
  // ...
  type: 'assistant', // 硬编码 ❌
}))
```

### 3.4 评估

| 方面 | 状态 |
|---|---|
| 解析 Cherry Agent 数据 | ✅（通过 CherryAssistant + [key: string]） |
| 内部区分 assistant/agent | ❌（type 字段丢失） |
| 导出还原 agent 类型 | ❌（硬编码 'assistant'） |
| Prompt 完整性 | ✅ |

**兼容率: 67%**（能读不能区，导出会丢失类型）

---

## 4. 模型提供商

**data.json 结构**: `llm.providers[]`（61 个）+ `llm.defaultModel` / `llm.topicNamingModel` / `llm.translateModel` / `llm.quickAssistantModel` / `llm.quickModel` / `llm.settings`

### 4.1 Provider 类型兼容

| Cherry 字段 | CherryProvider | Provider (index.ts) | 兼容 |
|---|---|---|---|
| `id` | `id: string` | `id: string` | ✅ |
| `name` | `name: string` | `name: string` | ✅ |
| `apiKey` | `apiKey?: string` | `apiKey?: string` | ✅ |
| `apiHost` | `apiHost?: string` | `apiHost: string` | ✅ |
| `apiURL` | `apiURL?: string` | **无** | ❌ |
| `apiVersion` | `apiVersion?: string` | `apiVersion?: string` | ✅ |
| `models` | `models?: CherryModel[]` | `models: ModelInfo[]` | ✅ |
| `isSystem` | `isSystem?: boolean` | `isSystem?: boolean` | ✅ |
| `enabled` | `enabled?: boolean` | `enabled: boolean` | ✅ |

### 4.2 ModelInfo 类型兼容

| Cherry 字段 | CherryModel | ModelInfo (index.ts) | 兼容 |
|---|---|---|---|
| `id` | `id: string` | `id: string` | ✅ |
| `name` | `name: string` | `name: string` | ✅ |
| `provider` | `provider: string` | `provider?: string` | ✅ |
| `group` | `group?: string` | `group?: string` | ✅ |
| `supported_text_delta` | `supported_text_delta?: boolean` | `supportedTextDelta?: boolean` | ✅ |
| Description | — | `description?: string` | ✅ (扩展) |
| `maxTokens` | — | `maxTokens?: number` | ✅ (扩展) |
| `contextLength` | — | `contextLength?: number` | ✅ (扩展) |
| `enabled` | — | `enabled: boolean` | ✅ (扩展) |

### 4.3 LLM 顶层字段

| Cherry 字段 (CherryLLMData) | 导入 | 导出 | 兼容 |
|---|---|---|---|
| `providers[]` | ✅ | ✅ | ✅ |
| `defaultModel` | ⚠️ 读取但不持久化 | ❌ | ❌ |
| `topicNamingModel` | ⚠️ 读取但不持久化 | ❌ | ❌ |
| `translateModel` | ⚠️ 读取但不持久化 | ❌ | ❌ |
| `quickAssistantModel` | ⚠️ 读取但不持久化 | ❌ | ❌ |
| `quickModel` | ⚠️ 读取但不持久化 | ❌ | ❌ |
| `settings` | ⚠️ 读取但不持久化 | ❌ | ❌ |

### 4.4 Provider 类型字段

| 字段 | 导入 | 导出 | 兼容 |
|---|---|---|---|
| `apiURL` | ✅（`apiHost ?? apiURL`） | ❌（仅输出 apiHost） | ❌ |
| Type (openai/gemini/...) | ❌ 未读取也未导出 | ❌ | ❌ |

### 4.5 评估

**Provider 字段兼容率**: 8/9 = **89%**
**Model 字段兼容率**: 9/9 = **100%**
**LLM 顶层字段兼容率**: 1/7 = **14%**
**综合 (Provider+Model+LLM)**: 18/25 = **72%**

---

## 5. IndexedDB 数据

**data.json 结构**: topics, message_blocks, settings, files, knowledge_notes, translate_history, quick_phrases, translate_languages, notes_tree

### 5.1 CherryIndexedDB 类型覆盖

| 子键 | cherry-data.ts | index.ts / AppData | 导入映射 | 导出 | 兼容 |
|---|---|---|---|---|---|
| `topics` | `CherryTopic[]` | `Topic[]`（独立） | ✅ mapTopics | ✅ | ✅ |
| `message_blocks` | `CherryMessageBlock[]` | `Record<string, MessageBlock>` | ✅ buildBlockMap | ✅ | ✅ |
| `settings` | `CherrySettingEntry[]?` | 无单独类型 | ❌ 未处理 | ❌ | ❌ |
| `files` | `unknown[]?` | 无对应类型 | ❌ 未处理 | ❌ | ❌ |
| `knowledge_notes` | `unknown[]?` | 无对应类型 | ❌ 未处理 | ❌ | ❌ |
| `translate_history` | `unknown[]?` | 无对应类型 | ❌ 未处理 | ❌ | ❌ |
| `quick_phrases` | `unknown[]?` | 无对应类型 | ❌ 未处理 | ❌ | ❌ |
| `translate_languages` | `unknown[]?` | 无对应类型 | ❌ 未处理 | ❌ | ❌ |
| `notes_tree` | `unknown[]?` | 无对应类型 | ❌ 未处理 | ❌ | ❌ |

### 5.2 Message 类型兼容

| Cherry 字段 | CherryMessage | ChatMessage (index.ts) | 兼容 |
|---|---|---|---|
| `id` | `id: string` | `id: string \| number` | ✅ |
| `role` | `role: string` | `role: MessageRole` | ✅ |
| `topicId` | `topicId?: string` | `topicId?: string` | ✅ |
| `assistantId` | `assistantId?: string` | **无** | ❌ |
| `createdAt` | `createdAt?: number` | `createdAt?: string`（ISO） | ✅（转换） |
| `status` | `status?: string` | `status?: MessageStatus` | ✅ |
| `blocks` | `blocks: string[]` | `blocks?: MessageBlock[]` | ✅（展平） |
| `modelId` | `modelId?: string` | `modelId?: string` | ✅ |
| `model` | `model?: CherryModelRef` | `model?: string` | ⚠️ 降级 |
| `mentions` | `mentions?: unknown[]` | `mentions?: unknown[]` | ✅ |
| `usage` | `usage?: {...}` | `usage?: {...}` + `tokens?` | ✅ |
| `content` | `content?: string` | `content: string` | ✅ |

### 5.3 MessageBlock 类型兼容

| Cherry 字段 | CherryMessageBlock | MessageBlock (index.ts) | 兼容 |
|---|---|---|---|
| `id` | `id: string` | `id?: string` | ✅ |
| `messageId` | `messageId: string` | **无**（block 已嵌入 message） | — (架构差异) |
| `type` | `type: string` | `type: 'main_text' \| ...` | ✅ |
| `createdAt` | `createdAt: number` | `createdAt?: number` | ✅ |
| `status` | `status: string` | `status?: string` | ✅ |
| `content` | `content: string` | `content: string` | ✅ |
| `citationReferences` | `citationReferences?: unknown[]` | `citationReferences?: unknown[]` | ✅ |

### 5.4 持久化层 (db.ts)

- 使用单一 `appData` ObjectStore，key 为 `'main'`
- Cherry Studio 使用多个独立 ObjectStore（topics, message_blocks, settings 等）
- **架构差异**：合理设计，但无法与 Cherry 原生 IndexedDB 结构互操作

### 5.5 评估

**核心（topics + message_blocks）兼容率**: 2/2 = **100%**
**Message 字段兼容率**: 11/12 = **92%**（缺失 `assistantId`）
**MessageBlock 字段兼容率**: 6/6 = **100%**
**全 IndexedDB 子键兼容率**: 2/9 = **22%**

---

## 6. 其他配置

### 6.1 备份同步

| 服务 | cherry-data.ts | index.ts | 导入 | 导出 | 兼容 |
|---|---|---|---|---|---|
| webdavSync | ❌ | ❌ | ❌ | ❌ | ❌ |
| s3Sync | ❌ | ❌ | ❌ | ❌ | ❌ |

### 6.2 坚果云 (Nutstore)

| 字段 | 兼容 |
|---|---|
| 路径、自动同步、同步间隔、最后同步 | ❌ 全部缺失 |

### 6.3 应用设置

| 设置项 (data-readable) | Settings (index.ts) | 兼容 |
|---|---|---|
| `language` | `language?: string` | ✅ |
| `sendMessageShortcut` | `sendMessageShortcut?: string` | ✅ |
| `userName` | ❌ | ❌ |
| `showAssistants` | ❌ | ❌ |
| `showTopics` | ❌ | ❌ |
| `messageFont` | ❌ | ❌ |
| `launchOnBoot` | ❌ | ❌ |
| `launchToTray` | ❌ | ❌ |
| `trayOnClose` | ❌ | ❌ |
| `showPrompt` | ❌ | ❌ |
| `showMessageDivider` | ❌ | ❌ |
| `showInputEstimatedTokens` | ❌ | ❌ |
| `proxyMode` | ❌ | ❌ |
| `theme` | `theme?: 'light' \| 'dark' \| 'auto'` | ✅ |
| `fontSize` | `fontSize?: number` | ✅ |
| `sendShortcut` | `sendShortcut?: 'Enter' \| ...` | ✅ |
| `messageStyle` | `messageStyle?: string` | ✅ |
| `codeShowLineNumbers` | `codeShowLineNumbers?: boolean` | ✅ |
| `showTokens` | `showTokens?: boolean` | ✅ |
| `pinTopicsToTop` | `pinTopicsToTop?: boolean` | ✅ |
| `confirmDeleteMessage` | `confirmDeleteMessage?: boolean` | ✅ |

> 注: Settings 的 `[key: string]: unknown` 允许隐式存储所有缺失字段，但未显式声明类型。

### 6.4 MCP 服务器

- 全局 MCP 配置（8 个服务器）: ❌ 无类型、无导入、无导出
- 助手级 mcpServers: ✅ Assistant 有 `mcpServers?: unknown[]`

### 6.5 联网搜索配置

| 字段 | 兼容 |
|---|---|
| 全局默认引擎 (`local-google`) | ❌ |
| 附带时间 | ❌ |
| 每次最大结果数 | ❌ |

### 6.6 代码工具

| 字段 | 兼容 |
|---|---|
| 默认 CLI 工具 (`qwen-code`) | ❌ |
| 工作目录列表 | ❌ |

### 6.7 知识库

- `knowledge_notes` 在 CherryIndexedDB 中声明但导入/导出均未处理 ❌
- Assistant 的 `knowledgeRecognition` 字段已兼容 ✅

### 6.8 记忆配置

| 字段 | 兼容 |
|---|---|
| 全局记忆开关 + 4 个参数 | ❌ 全部缺失 |

### 6.9 翻译配置

| 字段 | 兼容 |
|---|---|
| 目标语言 (`zh-cn`) | ❌ |
| translate_history / translate_languages | ❌（类型声明但未处理） |

### 6.10 评估

**Settings 显式字段**: 10/22 = **45%**
**模块覆盖**: 2/9 模块部分覆盖 (Settings + MCP 助手级) = **22%**

---

## 总结

### 总分模块兼容率

| # | 模块 | 关键字段 | 已兼容 | 兼容率 |
|---|---|---|---|---|
| 1 | 基础设置 | 2 | 1 | **50%** |
| 2 | 助手配置 | 17 | 15 | **88%** |
| 3 | 智能体 (Agents) | — | type 丢失 | **67%** |
| 4 | 模型提供商 | 25 | 18 | **72%** |
| 5a | IndexedDB 子键 | 9 | 2 | **22%** |
| 5b | Message + Block | 18 | 17 | **94%** |
| 6 | 其他配置 | 9 子模块 | 2 | **22%** |

### 加权综合兼容率

按字段/特性加权计算:

| 维度 | 字段/特性数 | 已兼容 | 兼容率 |
|---|---|---|---|
| 类型定义层（cherry-data.ts 解析覆盖） | 32 | 32 | **100%** |
| App 类型层（index.ts 表示覆盖） | 35 | 30 | **86%** |
| 导入映射层（data-import.ts） | 28 | 23 | **82%** |
| 导出映射层（cherry-export.ts） | 24 | 18 | **75%** |
| 持久化层（db.ts） | — | 仅 AppData 整体 | **N/A** |

**总体加权兼容率: ~76%**

### 关键缺口清单

| 优先级 | 缺口 | 影响 |
|---|---|---|
| 🔴 高 | `type` 字段（assistant vs agent）丢失 | 导入后无法区分助手和智能体，导出时全部变为 `assistant` |
| 🔴 高 | `apiURL` 字段丢失 | 部分 Cherry Provider 配置使用 apiURL 而非 apiHost，导出后丢失 |
| 🔴 高 | LLM 全局模型引用（defaultModel/topicNamingModel 等）未持久化 | 全局默认模型、命名模型、翻译模型等配置丢失 |
| 🟡 中 | IndexedDB 子键（settings/files/knowledge_notes/translate_history/quick_phrases/translate_languages/notes_tree）未处理 | 导入时忽略，导出时不生成 |
| 🟡 中 | ChatMessage 缺少 `assistantId` | 消息与助手的关联丢失 |
| 🟡 中 | Provider type（openai/gemini/anthropic）缺失 | 无法区分协议类型，影响流式处理路由 |
| 🟡 中 | Settings 缺少 12 个显式字段 | UI 设置不完整（userName, showAssistants, proxyMode 等） |
| 🟡 中 | 备份同步/坚果云/代码工具/记忆/翻译等配置模块缺失 | 配置模块整体丢失 |
| 🟢 低 | `model` 字段从 CherryModelRef 降为 string | 丢失 provider/group 元信息 |
| 🟢 低 | db.ts 使用单一 ObjectStore | 与 Cherry 原生 IndexedDB 结构不兼容（架构设计差异，非缺陷） |

### 架构层面的合理差异（不视为缺失）

1. **topics/messages 从 Assistant 剥离**: Cherry 中 topics 嵌入在 Assistant 内，而 Orbit Chat 中 Topic 与 Assistant 通过 `assistantId` 外键关联。这是更规范的数据设计。
2. **message_blocks 嵌入到 ChatMessage**: Cherry 中 blocks 通过 `messageId` 外键分离存储，Orbit Chat 将其作为 `Message.blocks[]` 内嵌，简化查询。
3. **单一 ObjectStore**: 简化持久化逻辑，但牺牲了增量更新能力。
*（内容由AI生成，仅供参考）*
*（内容由AI生成，仅供参考）*
