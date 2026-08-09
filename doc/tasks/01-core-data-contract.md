# M01 核心数据契约

## 模块目标

建立 Orbit 内部唯一数据模型。业务代码只使用 `AppData`、`Provider`、`Assistant`、`Topic`、`ChatMessage`、`MessageBlock` 和 `Settings`；Cherry 类型只能存在于导入导出边界。

## 子任务

- [x] 定义严格的核心 TypeScript 类型。
  - 输入：`docs/prd.md` 第 4 节。
  - 输出：`src/types/index.ts` 中的唯一运行时与持久化类型。
  - 完成判定：`AppData` 只含 `version/providers/assistants/topics/settings` 五个字段。

- [x] 删除旧运行时数据字段和透传类型。
  - 输入：现有类型中的 `cherryData`、`compatZone`、全局 `messageBlocks`、Assistant Cherry 扩展字段。
  - 输出：运行时类型中不再包含这些字段；Cherry 类型仅由 `src/types/cherry-data.ts` 导出给边界工具。
  - 完成判定：业务 Store、组件和 composable 不导入或访问 Cherry 类型。

- [x] 固化实体引用约束。
  - 输入：Provider -> Model、Assistant -> Model、Topic -> Assistant、Message -> Topic、Message -> Block 关系。
  - 输出：类型注释和引用校验规则。
  - 完成判定：默认 Assistant 唯一、ID 不重复、Topic/Message/block 引用都可验证。

- [x] 保留内容块的单一事实来源。
  - 输入：`ChatMessage.blocks[]`。
  - 输出：正文和思考内容仅由该消息的 block 组成；不得维护全局 block 副本。
  - 完成判定：删除 Topic 或 Message 不需要跨 store block 清理。

## 验收

- [x] `npm run type-check` 通过。
- [x] `grep -RInE "cherryData|compatZone|messageBlocks" src/stores src/components src/composables` 无业务引用。
