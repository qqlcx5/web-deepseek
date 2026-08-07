---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_c95c0db9929011f1bafa525400287e28
    ReservedCode1: +pgYqC4EMjGbHczIaiAG31tY8KNhE8r49b2txfmfEh9ZmYbKeMM4JGWeW1ZeBJP0Zxvzh1IW8VOXJSzQYV1jkDpCY9qVQCu5tzKSLfdlhUx3Wce2CVHT8SbasKrLZcmruGBV2ozgVMbBcWNgdrC4OAVn2QTmgyBVnOvJeIo05HN/+eaT2pGV5ciH3zE=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_c95c0db9929011f1bafa525400287e28
    ReservedCode2: +pgYqC4EMjGbHczIaiAG31tY8KNhE8r49b2txfmfEh9ZmYbKeMM4JGWeW1ZeBJP0Zxvzh1IW8VOXJSzQYV1jkDpCY9qVQCu5tzKSLfdlhUx3Wce2CVHT8SbasKrLZcmruGBV2ozgVMbBcWNgdrC4OAVn2QTmgyBVnOvJeIo05HN/+eaT2pGV5ciH3zE=
---

# 响应式体验 — 最小可执行任务清单

> 对应详细设计 §10  
> 目标：三断点适配、移动端交互、CSS 变量体系

## Hooks — [自定义 Vue composables]

- [x] 实现 `useBreakpoint()` hook：基于 window.matchMedia 返回 'mobile' | 'tablet' | 'desktop'
- [x] 实现 `useIsMobile()` hook：封装 useBreakpoint，返回 boolean
- [x] 实现 `useIsTablet()` hook：封装 useBreakpoint，返回 boolean
- [x] 实现 SSR 安全的媒体查询：onMounted 内初始化，避免 hydration mismatch

## Pinia Store

- [x] 创建 `useLayoutStore`，定义 LayoutState 和初始状态
- [x] 实现 `toggleSidebar()`：移动端切换 ElDrawer / 桌面端切换折叠
- [x] 实现 `toggleRightPanel(content?)`：打开/切换右侧面板
- [x] 实现 `setBreakpoint(bp)`：响应断点变化更新 store

## Desktop 布局

- [x] 实现固定侧边栏：宽度 260px，支持折叠（→ 0px with transition）→ 内容使用 Conversations 组件
- [x] 实现折叠按钮：侧边栏顶部的 hamburger 图标
- [x] 实现右侧面板：宽度 320px，滑入滑出动画
- [x] 实现右侧面板内容切换：上下文信息 / 附件列表

## Mobile 布局

- [x] 实现 Drawer 侧边栏：从左侧滑入，宽度 85vw，点击遮罩关闭 → 使用 ElDrawer
- [x] 实现 Drawer 滑入/滑出动画 → ElDrawer 内置 CSS transition
- [x] 实现底部 TabBar：对话 / 搜索 / 设置 三个入口 → 自定义组件
- [x] 实现 FAB（Floating Action Button）：右下角新建对话浮动按钮 → 自定义组件
- [x] 实现对话列表左滑操作：左滑露出置顶/删除按钮（touch 手势）→ 自定义 hook useTouchSwipe

## 移动端交互适配 — [自定义 hooks]

- [x] 实现消息长按弹出操作菜单（替代桌面端悬停）→ 自定义 hook useLongPress
- [x] 实现附件上传调用系统相机/相册（`accept="image/*" capture`）
- [x] 实现触底自动加载更多（IntersectionObserver）→ 自定义 hook useScrollToBottom
- [x] 实现移动端输入框键盘避让 → 自定义 hook useKeyboardAvoid（visualViewport API）

## CSS 变量体系

- [x] 定义 CSS 自定义属性：`--sidebar-width`、`--sidebar-collapsed-width`、`--right-panel-width`、`--topbar-height`、`--mobile-drawer-width`
- [x] 实现断点媒体查询覆盖变量值
- [x] 实现主题色变量：`--color-primary`、`--color-bg`、`--color-surface`、`--color-text` 等
- [x] 亮色/暗色主题 CSS 变量切换（`[data-theme="dark"]` 选择器）

## 组件适配

- [x] 创建 `AppLayout` 响应式分支：`isMobile ? <MobileLayout /> : <DesktopLayout />`
- [x] 创建 `MobileLayout`：ElDrawer + MainContent + TabBar
- [x] 创建 `DesktopLayout`：固定 Sidebar（Conversations 组件） + MainContent + 可选 RightPanel
- [x] 实现 TopBar 组件：面包屑导航（桌面端）+ 汉堡菜单按钮（移动端）

## 依赖接口

- 依赖 `useSettingsStore`：theme、fontSize
- 依赖 Conversation 数据（由 Conversations 组件自行管理）
- 向所有布局级组件暴露：`useLayoutStore` 状态

## 技术选型

| 需求 | 选型 | 说明 |
|------|------|------|
| 移动端 Drawer | Element Plus: `ElDrawer` | 左侧滑入 + 遮罩关闭，内置动画 |
| 桌面侧边栏会话列表 | Element-Plus-X: `Conversations` | 内置置顶/收藏/排序/批量操作 |
| 智能输入框 | Element-Plus-X: `XSender` | 含语音交互、提及功能 |
| 断点检测 | 自定义 Vue composables | `useBreakpoint`/`useIsMobile`/`useIsTablet` |
| 触摸手势 | 自定义 hooks：`useTouchSwipe`/`useLongPress` | 左滑操作 + 长按菜单 |
| 键盘避让 | 自定义 hook：`useKeyboardAvoid` | visualViewport API |
| 触底加载 | 自定义 hook：`useScrollToBottom` | IntersectionObserver |
| 底部 TabBar / FAB | 自定义 Vue 组件 | 移动端专用 |
| 状态管理 | Pinia `defineStore` | options API |
*（内容由AI生成，仅供参考）*
