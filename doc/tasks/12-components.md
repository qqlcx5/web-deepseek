# 12 - components（UI 组件层）

> 路径: `src/components/chat/`
> 依赖: `store-chat`, `store-ui`, `store-app`, Element-Plus-X

---

## 任务清单

### 12a — ChatSidebar（侧栏）

- [ ] T12a-1 品牌区：Orbit 图标 + "Orbit AI" + 在线状态 + 收起按钮
- [ ] T12a-2 新建对话按钮（primary，全宽）→ `chatStore.newTopic()`
- [ ] T12a-3 搜索/命令入口按钮 → `uiStore.modal = 'command'`，右侧显示 ⌘K 标识
- [ ] T12a-4 工作区列表：彩色圆点 + 名称 + 计数，点击切换 activeWorkspaceId
- [ ] T12a-5 使用 `<Conversations>` 组件渲染会话列表 — `:active` / `:items` / `:groupable` / `:menu`
- [ ] T12a-6 会话列表 items 格式转换：Topic → `{ key, label, group }`（pinned → "置顶"组，其他 → "最近对话"组）
- [ ] T12a-7 会话右键菜单：重命名 / 删除（Conversations menu）
- [ ] T12a-8 `@change` 事件 → `chatStore.selectTopic(item.key)`
- [ ] T12a-9 `@menuCommand` 事件 → 重命名 / 删除处理
- [ ] T12a-10 用户信息区：头像 + 名称 + 计划（底部固定）

### 12b — ChatTopbar（顶栏）

- [ ] T12b-1 对话标题显示（当前 activeTopic.name）
- [ ] T12b-2 重命名按钮（悬停显示，桌面端）→ 内联编辑
- [ ] T12b-3 保存状态：云同步图标 + 消息数量
- [ ] T12b-4 模型切换按钮：当前模型名 + 下拉箭头 → `uiStore.modal = 'model'`
- [ ] T12b-5 移动端 ≤390px 仅显示彩色圆点
- [ ] T12b-6 专注模式切换按钮（桌面端）→ `uiStore.toggleFocusMode()`
- [ ] T12b-7 Inspector 切换按钮 → `uiStore.toggleInspector()`
- [ ] T12b-8 菜单按钮（移动端）→ `uiStore.sidebarOpen = true`

### 12c — ChatMessages（消息区）

- [ ] T12c-1 空态：使用 `<Welcome>` 组件展示欢迎页
- [ ] T12c-2 消息列表：使用 `<BubbleList>` 组件 — `:list` / `:auto-scroll` / `:show-back-button` / `:virtual` / `:item-key`
- [ ] T12c-3 消息 → BubbleList item 格式转换（placement / loading / avatar / 附加数据）
- [ ] T12c-4 自定义 Bubble 内容渲染：`<Bubble>` + `#header` / `#default` / `#footer` 插槽
- [ ] T12c-5 日期分割线 "今天"
- [ ] T12c-6 assistant 头像：火花图标，user 头像：用户名首字
- [ ] T12c-7 loading 状态：Bubble `:loading="true"` 显示加载动画
- [ ] T12c-8 Markdown 渲染：`<XMarkdownVue :content="msg.content" />`
- [ ] T12c-9 Thinking 组件：`reasoningContent` 存在时展示推理过程（可折叠）
- [ ] T12c-10 引用来源 sources：2 列网格（移动端 1 列），序号 + 名称 + 域名
- [ ] T12c-11 产物卡片 artifact：绿色调卡片 + 文件图标 + 打开按钮
- [ ] T12c-12 消息工具栏 `#footer` 插槽：复制 / 点赞 / 点踩 / 重新生成 / 分支 / 编辑
- [ ] T12c-13 分支切换器：branches > 1 时显示，←/→ 按钮 + `activeBranch/branches`
- [ ] T12c-14 BubbleList `@scroll-state-change` → `uiStore.nearBottom` 更新
- [ ] T12c-15 虚拟滚动：`messages.length > 500` 时 `:virtual="true"`
- [ ] T12c-16 回到底部按钮由 BubbleList `showBackButton` 内置（替换原手写按钮）

### 12d — ChatComposer（输入区）

- [ ] T12d-1 网络离线横幅：`v-if="!uiStore.online"` 显示提示
- [ ] T12d-2 回复上下文条：`v-if="chatStore.replyingTo"` 分支图标 + 文本 + × 取消
- [ ] T12d-3 附件区：使用 `<Attachments>` 组件 + `<FilesCard>` 渲染
- [ ] T12d-4 附件 items 格式转换：Attachment → FilesCardProps（uid, name, fileType, description, showDelIcon）
- [ ] T12d-5 `<Attachments>` `@delete-card` → `chatStore.removeAttachment()`
- [ ] T12d-6 输入框：使用 `<XSender>` 组件 — `v-model` / `:loading` / `:max-length` / `submit-type`
- [ ] T12d-7 XSender `@submit` → `chatStore.sendMessage()`
- [ ] T12d-8 XSender `@cancel` → `chatStore.stopGeneration()`
- [ ] T12d-9 XSender `@pasteFile` → `chatStore.addFiles()`
- [ ] T12d-10 XSender `#header` 插槽：附件按钮 / 图片按钮 / ContextChip / 提示文字
- [ ] T12d-11 附件按钮点击触发 `<input type="file" hidden>`
- [ ] T12d-12 ContextChip "上下文 XX%" 点击打开 Inspector
- [ ] T12d-13 提示文字 "Enter 发送 · Shift+Enter 换行"（桌面端可见，移动端隐藏）

### 12e — ChatInspector（信息面板）

- [ ] T12e-1 系统提示词面板：预览（4 行截断）+ 编辑按钮 → `uiStore.modal = 'prompt'`
- [ ] T12e-2 上下文用量：Token 数字 + 百分比 + 进度条（绿/黄/红三色）
- [ ] T12e-3 上下文用量：预估可继续输入字符数
- [ ] T12e-4 上下文文件列表：使用 `<FilesCard>` 渲染 + 添加按钮
- [ ] T12e-5 对话分支：使用 `<ThoughtChain>` 组件展示分支时间线
- [ ] T12e-6 会话消耗统计：2×2 网格（输入 Token / 输出 Token / 预计费用 / 响应时间）

### 12f — CommandPalette（命令面板）

- [ ] T12f-1 居中 dialog（top:14%），移动端全屏底部 sheet
- [ ] T12f-2 搜索输入框：`v-model="uiStore.commandQuery"` autofocus
- [ ] T12f-3 快捷操作区：使用 `<Prompts>` 组件渲染 `filteredCommands`
- [ ] T12f-4 Prompts items 格式转换：Command → `{ key, label, description, icon }`
- [ ] T12f-5 `<Prompts>` `@item-click` → `uiStore.runCommand()`
- [ ] T12f-6 最近对话区：显示 filteredTopics，点击 → `chatStore.selectTopic()`
- [ ] T12f-7 无结果空态

### 12g — ModelSelector（模型选择弹窗）

- [ ] T12g-1 弹窗宽度 520px，移动端底部 sheet
- [ ] T12g-2 模型列表：彩色圆点 + 名称 + 描述 + 标签
- [ ] T12g-3 当前选中模型 check 图标 + 紫色边框
- [ ] T12g-4 点击 → `uiStore.selectModel(model)` + toast

### 12h — PromptEditor（提示词编辑弹窗）

- [ ] T12h-1 弹窗宽度 520px，移动端底部 sheet
- [ ] T12h-2 预设模板区：使用 `<Prompts>` 组件渲染 `promptPresets`
- [ ] T12h-3 点击预设 → 填入 textarea
- [ ] T12h-4 自由编辑 textarea：`v-model="uiStore.promptDraft"`
- [ ] T12h-5 "保存版本" 按钮 → `uiStore.savePrompt()`

### 12i — ToastNotification（Toast 通知）

- [ ] T12i-1 固定底部 20px 居中
- [ ] T12i-2 深色背景 + 白色文字 + 成功图标
- [ ] T12i-3 紫色"撤销"按钮（条件：`undoAction` 存在时显示）
- [ ] T12i-4 Transition 动画（toast-enter / toast-leave）
- [ ] T12i-5 3.2s 自动消失（由 store 控制）

### 验证

- [ ] T12j-1 各组件在桌面端正确渲染
- [ ] T12j-2 各组件在移动端正确渲染（抽屉 / 底部 sheet / 全屏）
- [ ] T12j-3 Element-Plus-X 组件 props 传参正确（对照 Q-3 ~ Q-5 确认）
- [ ] T12j-4 `tsc --noEmit` 类型检查通过
