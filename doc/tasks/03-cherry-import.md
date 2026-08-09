# M03 Cherry 数据导入

## 模块目标

将 Cherry Studio v5 文件转换为严格 `AppData`，只导入 PRD 声明字段，并完整恢复多 Assistant 的 Topic 归属与消息 block 顺序。

## 子任务

- [x] 定义 Cherry v5 边界类型和基础解析。
  - 输入：JSON 文件文本。
  - 输出：`CherryData` 或明确的解析错误、对象数量统计。
  - 完成判定：非法 JSON、缺少 persist、缺少 topics 或 blocks 时均有具体错误。

- [x] 映射 Provider、Model 和 Assistant。
  - 输入：`llm.providers[]`、默认 Assistant、Assistant 列表。
  - 输出：去重后的 `providers[]`、`assistants[]`，且仅一个默认 Assistant。
  - 完成判定：`apiURL` 可回退为 `apiHost`；模型和助手 ID 去重。

- [x] 建立 TopicRef 索引并恢复元数据。
  - 输入：`assistant.topics[]`、`indexedDB.topics[]`。
  - 输出：正确的 `assistantId/name/createdAt/updatedAt/isNameManuallyEdited`。
  - 完成判定：多 Assistant 样本导入后 Topic 不会全部挂在默认 Assistant 下。

- [x] 按 block ID 顺序组装 Message。
  - 输入：`message.blocks[]` 与扁平 `message_blocks[]`。
  - 输出：内嵌 `ChatMessage.blocks[]`，正文与思考缓存。
  - 完成判定：block 顺序严格遵循 Message 的 ID 列表；孤立 block 直接丢弃并记录 warning。

- [x] 导入白名单 Settings。
  - 输入：Cherry `persist.settings`。
  - 输出：完整的严格 `Settings` 对象。
  - 完成判定：未声明外部设置不进入 AppData。

## 验收

- [x] 导入多 Assistant 样本后，Provider、Assistant、Topic、Message、Block 数量和关联正确。
- [x] 无效 role/status/type 均降级为支持的安全枚举值。
- [x] `npm run type-check` 通过。
