# 需求梳理（数据 = Cherry Studio schema）

> 数据结构唯一权威：`docs/data-schema.md`（从 Cherry Studio v5 `data.json` 真实值提取）
> 功能来源：`docs/chat.md`（对话-助手）
> **本项目数据结构 = Cherry Studio v5 schema，不存在独立的「Orbit 数据结构」。** `src/types` 必须是 `CherryData` 及其嵌套类型的 TypeScript 表达，不允许自创扁平投影或自加字段。

---

## 0. 立场

1. 数据就是 Cherry Studio 的 `data.json` 结构。`src/types` = `CherryData` 完整定义。
2. 持久化 = Cherry 原生的 **localStorage + indexedDB 分离**（见 §1.2），不另造表结构。
3. 导入 / 导出 = Cherry JSON 原生格式，**无需转换层**（因为结构本就一致）。
4. 运行时可从分离存储**构建临时对象图**用于渲染（视图层），但数据结构、持久化、契约一律以 Cherry schema 为准——视图不是数据结构。

---

## 1. 数据结构（Cherry schema 摘要）

### 1.1 顶层

```ts
interface CherryData {
  time: number          // Unix 毫秒
  version: 5
  localStorage: LocalStorageData
  indexedDB: IndexedDBData
}
```

### 1.2 存储分离（核心契约）

对话数据分**三处**，不可合并：

| 层 | 位置 | 内容 |
|---|---|---|
| 元数据 | `localStorage.persist:cherry-studio.assistants[].topics[]` | `TopicObject`，**`messages` 恒为 `[]`** |
| 消息 | `indexedDB.topics[]` | `DBTopic { id, messages: DBMessage[] }` |
| 块 | `indexedDB.message_blocks[]` | `MessageBlock`，`DBMessage.blocks` 是 **block id 数组**（外键） |

→ 一条助手回复 = 1 条 `DBMessage` + N 个 `MessageBlock`（main_text / thinking / tool / …），块内容不在消息里，靠 id 关联。

### 1.3 核心实体（Cherry 原生类型名）

| 类型 | 位置 | 职责 |
|---|---|---|
| `Provider` | `localStorage.llm.providers[]` | 提供商 + `models: ModelInfo[]` |
| `ModelInfo` | `Provider.models[]` | 单个模型 |
| `ModelRef` | 多处外键 | 模型轻量引用 `{id, provider, name, group}` |
| `AssistantObject` | `localStorage.assistants.assistants[]` | 角色（`prompt` + `settings: AssistantSettings`） |
| `TopicObject` | `AssistantObject.topics[]` | 话题元数据（`messages` 恒空） |
| `DBTopic` | `indexedDB.topics[]` | 话题消息容器 `{id, messages}` |
| `DBMessage` | `DBTopic.messages[]` | 单条消息 |
| `MessageBlock` | `indexedDB.message_blocks[]` | 内容块（6 类，见 1.6） |
| `SettingsModule` | `localStorage.settings` | 全局设置 |

### 1.4 外键关系图

```
Provider.id ─────► ModelInfo.provider / ModelRef.provider
ModelInfo.id ─────► ModelRef.id
AssistantObject.id ─► TopicObject.assistantId / DBMessage.assistantId
TopicObject.id ───► DBTopic.id ───► DBMessage.topicId
DBMessage.id ─────► DBMessage.askId（问答链）/ MessageBlock.messageId
MessageBlock.id ──► DBMessage.blocks[]
```

### 1.5 状态机（Cherry 原生，勿扩展）

- `DBMessage.status`：`success | pending | error`
- `MessageBlock.status`：`success | error | pending`

### 1.6 MessageBlock 六类

| type | 关键字段 |
|---|---|
| `main_text` | `content`, `knowledgeBaseIds`, `citationReferences` |
| `thinking` | `content`, `thinking_millsec` |
| `citation` | `response.results.{searchEntryPoint,groundingChunks,...}` |
| `tool` | `toolId`, `toolName`, `metadata.rawMcpToolResponse` |
| `error` | `error.{name,message,originalMessage,stack}` |
| `unknown` | `status` 恒 `error` |

---

## 2. 功能需求（chat.md → 操作 Cherry 实体）

### 2.1 助手 ↔ 话题（两层）

- 助手 = 角色（`prompt` + `AssistantSettings`）；话题 = 一段交流
- 一个 `AssistantObject` 下多个 `TopicObject`，共享助手设置
- 创建话题 = `AssistantObject.topics[]` push `TopicObject` + `indexedDB.topics` 建 `DBTopic`

### 2.2 助手管理（5 标签页 → 字段）

| 标签页 | 字段 |
|---|---|
| 基础 | `emoji` / `name` / `description` / `model`(ModelRef) |
| 模型 | `AssistantSettings`（temperature / topP / maxTokens / streamOutput / contextCount / toolUseMode / enableMaxTokens / enableTopP / reasoning_effort） |
| 提示词 | `prompt` |
| 知识库 | `knowledgeBaseIds`（→ TextBlock） |
| MCP | `mcpServers`（→ ToolBlock） |

默认模型优先级：`AssistantObject.model` > `LLM.defaultModel`（全局）。

### 2.3 对话发送流程（数据视角）

1. 用户输入 → 建 `user` Message（`role:user, status:success`）+ `main_text` block（写入 `message_blocks`，message.blocks 存其 id）
2. 建 `assistant` Message 占位（`role:assistant, status:pending, askId=user.id`）
3. 流式 → 创建/更新 `MessageBlock`（main_text 流式 `content` + `status:pending`），可选 thinking block
4. 完成 → `status:success`，填 `metrics`（`completion_tokens` / `time_first_token_millsec` / `time_completion_millsec` / `time_thinking_millsec`）
5. 失败 → `status:error` + 写入 `ErrorBlock`

### 2.4 输入工具栏 → 数据落点

| 工具 | 落点 |
|---|---|
| 新对话 | 新 `TopicObject` + `DBTopic` |
| 网络搜索 | `citation` block |
| 知识库 | `TextBlock.knowledgeBaseIds` |
| 附件 | `indexedDB.files` |
| MCP | `ToolBlock` |
| 清除上下文 | 不删消息，截断请求上下文（`contextCount`） |
| `@` 引用话题 | 被引话题消息并入请求上下文 |

### 2.5 设置分层

- **全局**（`SettingsModule`）：消息显示 / 输入 / 代码 / 数学，对所有助手生效
- **按助手**（`AssistantSettings`）：温度 / TopP / MaxToken / stream / 上下文管理

---

## 3. 不变量（实现必须保证）

1. `AssistantObject.topics[].messages` 恒 `[]`（分离存储）。
2. `DBMessage.blocks` 是 block **id 数组**，块实体在 `indexedDB.message_blocks`。
3. `askId` 形成问答链（user.id ↔ assistant.askId）。
4. `ModelRef.{id,provider}` 必须能解析回 `Provider.models[]`。
5. 删除须 cascade：Topic → 其 messages → 其 blocks；Assistant → 其 topics。
6. `isNameManuallyEdited` 保护自动命名不覆盖手改名。

---

## 4. `src/types` 当前偏离（待修正，非设计选择）

当前 `src/types/index.ts` 定义的是自创扁平结构，**不是 Cherry schema**，必须重写为 `CherryData`：

| # | 当前（错） | 应为（Cherry schema） |
|---|---|---|
| 1 | 顶层 `AppData { version, providers, assistants, topics, settings }` | `CherryData { time, version:5, localStorage, indexedDB }` |
| 2 | `Topic.messages: ChatMessage[]` 内联 | `TopicObject.messages` 恒 `[]`；消息在 `indexedDB.topics` 的 `DBTopic` |
| 3 | `ChatMessage.blocks: MessageBlock[]` 内联 | `DBMessage.blocks: string[]`（id）+ `MessageBlock` 单表 |
| 4 | `MessageStatus` 5 态（sending/streaming/...） | `success \| pending \| error` 3 态 |
| 5 | 自加 `pinned` / `enabled` / `isDefault` / `createdAt` | schema 无，删除（置顶/启用/默认用 Cherry 原生机制：`DBSetting` / `AssistantObject` 顺序 / `assistants.defaultAssistant`） |
| 6 | 砍掉 Cherry 多数模块 | 类型定义应覆盖 `CherryData` 完整结构（运行时可只填用到的子集） |

> 运行时流式进度（首 token、已接收长度）属于视图态，不入数据结构，放组件局部 state。

---

## 5. 待办（按依赖排序）

| 优先级 | 项 | 依据 |
|---|---|---|
| P0 | `src/types` 重写为 `CherryData` 完整定义（含 localStorage 全模块 + indexedDB 全表） | §0 立场、§4 |
| P0 | `db.ts` / store 改为 localStorage + indexedDB 分离读写（topics / message_blocks 分表） | §1.2、不变量 1/2 |
| P0 | 导入 / 导出 = Cherry JSON 原生（结构一致，删掉任何"扁平↔分离"转换） | §0.3 |
| P1 | ModelRef 外键解析 + dangling ref 检测 | 不变量 4 |
| P1 | 置顶 / 启用 / 默认改用 Cherry 原生机制（`DBSetting` 等） | §4 #5 |
| P2 | ToolBlock / citation block 业务接入（MCP / 搜索） | §2.4 |
