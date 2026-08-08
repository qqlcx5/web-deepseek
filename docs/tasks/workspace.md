---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_c5370c47929011f18e22525400f8a581
    ReservedCode1: mxFHP1XJCTc8Y9dD4WxyARrdVL5oJCsIdxOL6Il0lgrtBpBj5JIIeqLYoKxe6sRfBpIcZ5aEXEEL6qhlx7Zto54d7AzrTlt6JUgLiJbyPJJ8GxUeyj3Vy7m0AiZYNwsse3ybEH/9/w3YPZvEQBUGUsq8cudQukqeTIwnJR4EPtMfvFL81/wS1Gsx2q4=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_c5370c47929011f18e22525400f8a581
    ReservedCode2: mxFHP1XJCTc8Y9dD4WxyARrdVL5oJCsIdxOL6Il0lgrtBpBj5JIIeqLYoKxe6sRfBpIcZ5aEXEEL6qhlx7Zto54d7AzrTlt6JUgLiJbyPJJ8GxUeyj3Vy7m0AiZYNwsse3ybEH/9/w3YPZvEQBUGUsq8cudQukqeTIwnJR4EPtMfvFL81/wS1Gsx2q4=
---

# 工作区 — 最小可执行任务清单

> 对应详细设计 §3  
> 目标：多工作区创建、切换、设置、导出导入

## Pinia Store

- [x] 创建 `useWorkspaceStore`，定义 WorkspaceState 类型和初始状态
- [x] 实现 `fetchWorkspaces()`：加载所有工作区列表 → `request.get('/api/workspaces')`
- [x] 实现 `setCurrentWorkspace(id)`：切换当前工作区 + 触发全局事件 `workspace:changed`
- [x] 实现 `createWorkspace(data)`：POST 创建工作区 → `request.post` → 插入列表 → 自动切换
- [x] 实现 `updateWorkspace(id, data)`：PUT 更新工作区设置 → `request.put`
- [x] 实现 `deleteWorkspace(id)`：DELETE 删除工作区（ElMessageBox 二次确认 + 输入名称确认）
- [x] 实现 `exportWorkspace(id)`：GET 下载压缩包 → `request.get` blob 下载
- [x] 实现 `importWorkspace(file)`：POST 上传压缩包 → `request.post` multipart/form-data

## 组件

### WorkspaceSwitcher — [ElDropdown + ElDialog]
- [x] 实现 `CurrentWorkspaceDisplay`：显示当前工作区名称 + 图标 + 下拉箭头
- [x] 实现 `WorkspaceDropdown`：列出所有工作区，点击切换 → ElDropdown
- [x] 实现"管理工作区"入口链接，跳转 `/settings` 工作区管理 section
- [x] 实现 `CreateWorkspaceModal`：名称输入 + 描述输入 + 默认模型选择 + 确认创建 → ElDialog

### WorkspaceSettingsPanel — [ElForm + ElSelect + ElSlider]
- [x] 实现通用设置区：名称输入（ElInput）、图标选择器（Emoji Picker）、描述文本域（ElInput textarea）
- [x] 实现默认值设置区：默认模型下拉选择（ElSelect）、默认系统提示词编辑器（ElInput textarea）、Temperature 滑块（ElSlider）、TopP 滑块（ElSlider）
- [x] 实现危险操作区：导出工作区按钮、删除工作区按钮（ElMessageBox 二次确认 + 输入名称确认）

## API 层 — [hook-fetch: request]

- [x] 封装 `GET /api/workspaces` → `request.get`
- [x] 封装 `POST /api/workspaces` → `request.post`
- [x] 封装 `GET /api/workspaces/:id` → `request.get`
- [x] 封装 `PUT /api/workspaces/:id` → `request.put`
- [x] 封装 `DELETE /api/workspaces/:id` → `request.delete`
- [x] 封装 `GET /api/workspaces/:id/export` → `request.get` + blob 下载
- [x] 封装 `POST /api/workspaces/import` → `request.post` multipart/form-data

## 依赖接口

- 向对话管理模块暴露：`currentWorkspaceId`（切换时触发对话列表重载）
- 向模型控制模块暴露：当前工作区的默认模型设置
- 依赖 `useModelStore.fetchProviders`（创建工作区时选择默认模型）

## 技术选型

| 需求 | 选型 | 说明 |
|------|------|------|
| 弹窗新建/编辑 | Element Plus: `ElDialog` | 工作区新建/编辑表单 |
| 表单控件 | Element Plus: `ElForm` / `ElInput` / `ElSelect` / `ElSlider` | 工作区设置表单 |
| 确认弹窗 | Element Plus: `ElMessageBox` | 删除工作区二次确认 |
| API 请求 | hook-fetch: `request` | `request.get/post/put/delete(url, params)` |
| 状态管理 | Pinia `defineStore` | 封装 CRUD |
*（内容由AI生成，仅供参考）*
