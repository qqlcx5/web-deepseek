---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_c49c689a929011f1bafa525400287e28
    ReservedCode1: JPKCIlJZ8fQDCHFYN+brcPQ5u2m9cGksx4SwiPtJQ6h+CRGHjhTENVMkSu1YkTdSLCcSgaf7aL8Rd182PscL68Y8GILB1nqt0OVD9ua/4ov2+bBTKRuctcjg/NkHxu2U1gZVfWWIuorI108F+5Kf0HWlezzC1moOaY0dU7SsddXhx4jfGU3njY5AqaA=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_c49c689a929011f1bafa525400287e28
    ReservedCode2: JPKCIlJZ8fQDCHFYN+brcPQ5u2m9cGksx4SwiPtJQ6h+CRGHjhTENVMkSu1YkTdSLCcSgaf7aL8Rd182PscL68Y8GILB1nqt0OVD9ua/4ov2+bBTKRuctcjg/NkHxu2U1gZVfWWIuorI108F+5Kf0HWlezzC1moOaY0dU7SsddXhx4jfGU3njY5AqaA=
---

# 对话管理 — 最小可执行任务清单

> 对应详细设计 §2  
> 目标：对话 CRUD、列表、置顶、归档、批量操作

## Pinia Store

- [ ] 创建 `useConversationStore`，定义 ConversationState 类型和初始状态
- [ ] 实现 `fetchConversations(workspaceId)`：分页加载对话列表 → `request.get('/api/conversations')`
- [ ] 实现 `loadMore()`：基于 cursor 加载下一页对话 → `request.get` 分页参数
- [ ] 实现 `createConversation(params?)`：POST 创建对话 → `request.post` → 插入列表顶部 → 路由跳转
- [ ] 实现 `updateConversation(id, data)`：乐观更新 + 失败回滚 → `request.put`
- [ ] 实现 `deleteConversation(id)`：乐观移除 + Toast 含撤销按钮
- [ ] 实现 `restoreConversation(id)`：从回收站恢复 → `request.post`
- [ ] 实现 `permanentDelete(id)`：永久删除 → `request.delete`
- [ ] 实现 `togglePin(id)`：置顶/取消置顶，更新 pinnedIds 排序 → Conversations 组件内置
- [ ] 实现 `toggleArchive(id)`：归档/取消归档 → Conversations 组件内置
- [ ] 实现 `reorder(fromIndex, toIndex)`：拖拽排序后 PUT 全量 orderedIds → Conversations 组件内置

## 组件

### ConversationList — [Element-Plus-X: Conversations]
- [ ] 实现 `ConversationListHeader`：新建对话按钮 + 搜索入口按钮
- [ ] 实现对话列表三区分组渲染：PinnedSection → RecentSection → ArchivedSection（折叠）→ Conversations 组件内置支持
- [ ] 实现列表无限滚动（IntersectionObserver + loadMore）→ Conversations 组件 `loadMore` prop
- [ ] 实现列表空状态占位（无对话时引导创建）→ ElEmpty

### ConversationItem — [Conversations 组件内置]
- [ ] 实现基础项：对话图标 + 标题 + 最后消息摘要 + 时间戳 → Conversations item 属性
- [ ] 实现标题内联编辑：双击 → `InlineEditInput`（Enter 确认 / Esc 取消）→ Conversations 内置
- [ ] 实现悬停显示操作按钮：置顶、删除 → Conversations `showBuiltInMenu`
- [ ] 实现右键菜单（ContextMenu）：置顶/取消、重命名、归档/取消、导出、删除 → Conversations `menu-command` 事件
- [ ] 实现当前活跃对话高亮样式（匹配路由 conversationId）→ Conversations `active` prop

### 多选模式 — [Conversations 组件内置]
- [ ] 实现 `BatchActionBar`：底部浮现操作栏，显示已选数量 → Conversations 批量模式
- [ ] 实现多选交互：长按/Shift+点击进入多选模式，点击切换选中 → Conversations 内置
- [ ] 实现 `enterBatchMode` / `exitBatchMode` / `toggleSelect` / `selectAll` → Conversations 内置
- [ ] 实现 `batchDelete`：批量软删除 → `request.post('/api/conversations/batch')`
- [ ] 实现 `batchArchive`：批量归档

### 回收站
- [ ] 实现 `TrashPage` 路由挂载
- [ ] 实现回收站列表：展示已删除对话（标题 + 删除时间）
- [ ] 实现单条恢复按钮 → `restoreConversation`
- [ ] 实现单条永久删除按钮 → `permanentDelete`（二次确认 → ElMessageBox）
- [ ] 实现"清空回收站"按钮 → 批量永久删除所有已删除对话（ElMessageBox 二次确认）

## API 层 — [hook-fetch: request]

- [ ] 封装 `GET /api/conversations` → `request.get`
- [ ] 封装 `POST /api/conversations` → `request.post`
- [ ] 封装 `PUT /api/conversations/:id` → `request.put`（带乐观更新）
- [ ] 封装 `DELETE /api/conversations/:id` → `request.delete`
- [ ] 封装 `POST /api/conversations/:id/restore` → `request.post`
- [ ] 封装 `DELETE /api/conversations/:id/permanent` → `request.delete`
- [ ] 封装 `POST /api/conversations/batch` → `request.post`
- [ ] 封装 `PUT /api/conversations/reorder` → `request.put`

## 依赖接口

- 依赖 `useWorkspaceStore.currentWorkspaceId`（工作区切换时触发 fetchConversations）
- 依赖 `useMessageStore.onMessageSent`（更新 lastMessagePreview → Conversations 组件自动刷新）
- 向搜索模块暴露：当前对话列表数据（供对话内搜索范围限定）

## 技术选型

| 需求 | 选型 | 说明 |
|------|------|------|
| 会话管理列表 | Element-Plus-X: `Conversations` | 内置置顶/收藏/归档/排序/批量操作/右键菜单/拖拽 |
| 空状态 | Element Plus: `ElEmpty` | 无对话时引导创建 |
| 确认弹窗 | Element Plus: `ElMessageBox` | 删除/清空回收站二次确认 |
| API 请求 | hook-fetch: `request` | `request.get/post/put/delete(url, params)`，类型安全 |
| 状态管理 | Pinia `defineStore` | 封装 CRUD + 乐观更新 |
*（内容由AI生成，仅供参考）*
