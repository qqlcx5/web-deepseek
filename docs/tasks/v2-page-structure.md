---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_c3f33804929011f18e22525400f8a581
    ReservedCode1: 4SsDtJ5iBaeSVVb0Vd2nY3ZQFtOEh/dKABa5beDm8xozARviSQATKIWQStn6KzG50fiISOxI1hpMRemH6xRPEqi3UYsjTah6p+h0sweYbh3yfQxUrqrrGDzZpvS7yaWjB9ZH4CyPvznXj+l262aRderOSRbo7dbGRzD3TpQGmpXE2qcMyw7eOQnn8K4=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_c3f33804929011f18e22525400f8a581
    ReservedCode2: 4SsDtJ5iBaeSVVb0Vd2nY3ZQFtOEh/dKABa5beDm8xozARviSQATKIWQStn6KzG50fiISOxI1hpMRemH6xRPEqi3UYsjTah6p+h0sweYbh3yfQxUrqrrGDzZpvS7yaWjB9ZH4CyPvznXj+l262aRderOSRbo7dbGRzD3TpQGmpXE2qcMyw7eOQnn8K4=
---

# V2 页面结构 — 最小可执行任务清单

> 对应详细设计 §1  
> 目标：搭建 Vue 3 路由骨架与布局体系（Vue Router + Pinia + Element-Plus-X + Element Plus）

## 路由表

- [x] 创建路由 `/` → `HomePage`（DefaultLayout），纯静态 Landing 页占位
- [x] 创建路由 `/chat` → `ChatPage`（AppLayout），无 conversationId 时显示 Welcome 组件
- [x] 创建路由 `/chat/:conversationId` → `ChatPage`（AppLayout），动态加载指定对话
- [x] 创建路由 `/workspace/:workspaceId` → `WorkspacePage`（AppLayout），工作区详情占位
- [x] 创建路由 `/settings` → `SettingsPage`（AppLayout），锚定到通用设置 tab
- [x] 创建路由 `/settings/:section` → `SettingsPage`（AppLayout），动态 section
- [x] 创建路由 `/search` → `SearchPage`（AppLayout），全局搜索页
- [x] 创建路由 `/share/:shareId` → `ShareViewPage`（MinimalLayout），公开只读分享页
- [x] 创建路由 `/admin` → `AdminPage`（AdminLayout），带管理员鉴权重定向
- [x] 创建路由 `/admin/:section` → `AdminPage`（AdminLayout），动态 section
- [x] 创建路由 `/login` → `LoginPage`（AuthLayout），居中卡片登录页
- [x] 创建路由 `/:pathMatch(.*)*` → `NotFoundPage`（MinimalLayout），404 兜底页

## 布局组件

- [x] 实现 `DefaultLayout`：Header（导航栏）+ `<router-view />` + Footer
- [x] 实现 `AppLayout`：Sidebar（左，含 Conversations 组件）+ MainContent（TopBar + `<router-view />`）+ 可选 RightPanel
- [x] 实现 `AuthLayout`：居中卡片容器 + `<router-view />`
- [x] 实现 `AdminLayout`：AdminSidebar（管理导航）+ `<router-view />`
- [x] 实现 `MinimalLayout`：纯内容无导航 + `<router-view />`
- [x] 实现 Sidebar 组件骨架：Logo + 新建对话按钮 + Conversations 组件 + WorkspaceSwitcher + UserMenu
- [x] 实现 Sidebar 可折叠逻辑（桌面端）与 ElDrawer 模式（移动端）→ 使用 ElDrawer + Conversations

## 路由守卫

- [x] 实现 `authGuard`：未登录重定向 `/login`，登录态从 Pinia store/session 读取（router.beforeEach）
- [x] 实现 `workspaceGuard`：确保 URL 中的 workspaceId 存在，不存在则 fallback 到默认工作区
- [x] 实现 `adminGuard`：检查用户 role === 'admin'，非管理员重定向 `/chat`

## 依赖接口

- 依赖 `useAuthStore`（鉴权状态，来自系统状态模块或独立 auth store）
- 依赖 `useWorkspaceStore.currentWorkspaceId`（来自工作区模块）

## 技术选型

| 需求 | 选型 | 说明 |
|------|------|------|
| 移动端 Drawer | Element Plus: `ElDrawer` | 移动端侧边栏滑入 |
| 桌面端会话列表 | Element-Plus-X: `Conversations` | 内置置顶/收藏/排序/批量操作 |
| 智能输入框 | Element-Plus-X: `XSender` | 消息输入区域 |
| 消息气泡列表 | Element-Plus-X: `BubbleList` | 消息渲染区域 |
| 欢迎页 | Element-Plus-X: `Welcome` | Landing 页 |
| 路由 | Vue Router 4 | 路由表 + router.beforeEach 守卫 |
| 状态管理 | Pinia | 全局状态共享 |
*（内容由AI生成，仅供参考）*
