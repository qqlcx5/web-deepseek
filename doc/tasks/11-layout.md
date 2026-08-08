# 11 - layout（布局系统）

> 路径: `src/views/chat/ChatPage.vue` + `src/styles/chat.css`
> 依赖: `store-ui`, 各子组件

---

## 任务清单

### CSS 变量体系

- [ ] T11-1 在 `chat.css :root` 定义品牌色变量（--brand, --brand-hover, --brand-soft）
- [ ] T11-2 定义文本/边线/表面/语义色变量（--text, --muted, --faint, --line, --line-strong, --surface, --surface-2, --surface-3, --success, --danger, --warning）
- [ ] T11-3 定义布局尺寸变量（--sidebar: 276px, --inspector: 304px, --header: 60px, --mobile-nav: 58px）

### 三栏 Grid

- [ ] T11-4 `.app` grid-template-columns: `var(--sidebar) minmax(0, 1fr) var(--inspector)`
- [ ] T11-5 `.app.inspector-hidden` — 两栏（隐藏 Inspector）
- [ ] T11-6 `.app.focus-mode` — 单栏（隐藏侧栏 + Inspector）
- [ ] T11-7 `.main` flex-column 布局（Topbar + Messages + Composer）

### 响应式：平板 (≤1180px)

- [ ] T11-8 grid 降级为两栏，Inspector 变为 `position:fixed` 右侧抽屉
- [ ] T11-9 `.inspector-panel-open .inspector { transform: translateX(0) }`
- [ ] T11-10 mobile-backdrop 可见性控制

### 响应式：移动端 (≤760px)

- [ ] T11-11 `.app` 改为 `display: block`
- [ ] T11-12 sidebar / inspector 全屏抽屉，transform 滑入滑出
- [ ] T11-13 底部导航 `.mobile-nav` 4 列 grid 显示（对话/搜索/文件/会话）
- [ ] T11-14 `.main` padding-bottom 留出底部导航空间 + safe-area-inset

### 响应式：超小屏 (≤390px)

- [ ] T11-15 进一步缩小间距和模型按钮

### ConfigProvider 包裹

- [ ] T11-16 ChatPage 根节点用 `<ConfigProvider>` 包裹，确保 Element-Plus-X 主题生效

### 全局快捷键

- [ ] T11-17 `onMounted` 注册 `keydown` 监听：⌘K → 命令面板、⌘N → 新建对话、⌘⇧F → 专注模式、ESC → 关闭弹窗/抽屉
- [ ] T11-18 `onMounted` 注册 `resize` 监听 → `uiStore.handleResize()`
- [ ] T11-19 `onMounted` 调用 `appStore.init()` 加载数据
- [ ] T11-20 `onUnmounted` 移除所有事件监听

### 弹窗遮罩

- [ ] T11-21 `.overlay` fixed inset:0 遮罩层，点击关闭 modal
- [ ] T11-22 条件渲染各弹窗组件（CommandPalette / ModelSelector / PromptEditor）
- [ ] T11-23 ToastNotification 渲染

### 验证

- [ ] T11-24 桌面端三栏正确显示，切换 Inspector / 专注模式正常
- [ ] T11-25 平板端 Inspector 变抽屉，backdrop 正常
- [ ] T11-26 移动端底部导航显示，侧栏/Inspector 全屏抽屉
- [ ] T11-27 快捷键全部生效
