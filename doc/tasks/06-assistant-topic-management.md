# M06 Assistant 与 Topic 管理

## 模块目标

完成 Assistant 和 Topic 的业务约束与管理界面，确保默认 Assistant、Topic 归属和级联删除行为始终有效。

## 子任务

- [x] 实现 Assistant 创建和编辑。
  - 输入：名称、图标、提示词、模型和生成参数。
  - 输出：带 `createdAt/updatedAt` 的 Assistant。
  - 完成判定：新 Assistant 可选择模型并在刷新后恢复。

- [x] 实现默认 Assistant 切换。
  - 输入：目标 Assistant ID。
  - 输出：唯一 `isDefault=true`。
  - 完成判定：切换后旧默认标记被清除；新建 Topic 使用新默认。

- [x] 处理 Assistant 删除。
  - 输入：有/无 Topic 的 Assistant。
  - 输出：无 Topic 时删除；有 Topic 时迁移选择或明确级联确认。
  - 完成判定：不允许留下没有 Assistant 的 Topic。

- [x] 完成 Topic 操作。
  - 输入：创建、重命名、置顶、清空、删除请求。
  - 输出：更新 `topics[]` 和 `updatedAt`。
  - 完成判定：排序为置顶优先、再按更新时间倒序；手动名称不会被自动命名覆盖。

- [x] 完成侧边栏状态。
  - 输入：Topic 列表和当前选中 Topic。
  - 输出：搜索、切换、重命名、置顶和删除的可操作 UI。
  - 完成判定：桌面与移动抽屉均可完成所有 Topic 操作。

## 验收

- [x] 任何时刻只有一个默认 Assistant。
- [x] 删除 Assistant 不会产生孤立 Topic。
- [x] `npm run type-check` 通过。
