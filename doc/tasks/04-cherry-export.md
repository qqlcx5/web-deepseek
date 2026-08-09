# M04 Cherry 兼容导出

## 模块目标

从 `AppData` 重建 Cherry v5 交换文件，导出前阻断无效引用，默认保护 API Key，并支持重新导入的数据闭环。

## 子任务

- [x] 实现 AppData 引用校验。
  - 输入：完整 `AppData`。
  - 输出：`errors[]`、`warnings[]`、`ok`。
  - 完成判定：检查重复 ID、默认 Assistant 数量、Assistant 模型、Topic Assistant、Message Topic 和 block ID。

- [x] 导出 Provider 和模型引用。
  - 输入：`providers[]` 与 Assistant/Message 的模型 ID。
  - 输出：Cherry Provider、Model 和 ModelRef。
  - 完成判定：默认不输出 API Key；显式选项才可输出。

- [x] 导出 Assistant TopicRef 和 Topic。
  - 输入：Assistant 与其 Topic。
  - 输出：每个 Assistant 的 `topics[]`，含标题、时间和手动命名状态。
  - 完成判定：默认 Assistant 按 `isDefault` 选择，不依赖数组顺序。

- [x] 导出 Message 和扁平 blocks。
  - 输入：Message 内嵌 `blocks[]`。
  - 输出：Cherry Message 的 block ID 列表和 `message_blocks[]`。
  - 完成判定：无 blocks 但有正文时生成 `main_text`；createdAt 使用时间戳。

- [x] 接入下载反馈。
  - 输入：校验结果。
  - 输出：通过时下载 JSON，失败时显示第一条和完整错误列表入口。
  - 完成判定：有 error 时绝不下载文件。

## 验收

- [x] 默认导出文件不包含 `apiKey`。
- [x] 导出文件重新导入后实体数量和 Topic 归属闭环。
- [x] `npm run type-check` 通过。
