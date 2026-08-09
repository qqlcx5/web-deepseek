# M05 Provider 与模型管理

## 模块目标

将静态 Provider 管理面板变为完整业务界面，所有操作使用规范化 Provider/Model 数据并保证引用安全。

## 子任务

- [x] 实现 Provider CRUD。
  - 输入：名称、API Host、API Key、启用状态。
  - 输出：持久化的 Provider 记录。
  - 完成判定：ID 重复不可保存；名称和 Host 必填；编辑后模型列表不丢失。

- [x] 实现模型 CRUD 和启用状态。
  - 输入：模型 ID、显示名、分组、上下文长度、流式能力。
  - 输出：Provider 内唯一模型列表。
  - 完成判定：禁用模型不出现在模型选择器；重复模型 ID 有明确提示。

- [x] 增加删除引用保护。
  - 输入：删除 Provider 或模型请求。
  - 输出：阻止信息或删除结果。
  - 完成判定：被 Assistant 使用的模型不能静默删除。

- [x] 对齐模型选择器。
  - 输入：启用的 Provider/Model 列表。
  - 输出：模型显示名、Provider 名、上下文长度和稳定的 `providerId`。
  - 完成判定：请求总是使用所选模型对应 Provider 的 Host 与 API Key。

## 验收

- [x] 可在 UI 中新建、编辑、禁用和删除无引用 Provider。
- [x] 删除有引用 Provider 时 UI 显示具体 Assistant 名称。
- [x] `npm run type-check` 通过。
