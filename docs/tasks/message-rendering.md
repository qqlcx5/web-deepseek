# 07 - 消息渲染（Bubble + XMarkdown）

> 需求来源：§3 F-04 UI 组件  
> 优先级：P0  
> 目标：BubbleList 虚拟滚动 + Bubble 气泡 + XMarkdown 渲染

## 任务清单

### 7.1 BubbleList 集成

- [ ] 创建 `src/components/MessageList.vue`，使用 BubbleList 组件
- [ ] `list` 绑定消息数组（映射为 BubbleList 数据结构）
- [ ] `autoScroll` 流式追底
- [ ] `showBackButton` 回底按钮
- [ ] `@scroll-state-change` 事件：追踪是否在底部
- [ ] `@unread-count-change` 事件：未读消息计数

### 7.2 Bubble 配置

- [ ] 用户消息：`placement='end'`，头像显示用户头像
- [ ] 助手消息：`placement='start'`，头像显示 Assistant emoji
- [ ] `#header` 插槽：显示模型名、时间戳
- [ ] `#footer` 插槽：显示操作按钮（复制、重生成、删除）
- [ ] 错误消息：`variant='error'` 或自定义 `#content` 插槽

### 7.3 XMarkdown 渲染

- [ ] 使用 XMarkdown 的 `MarkdownRenderer` 组件渲染 `main_text` block 的 content
- [ ] `enable-animate` 流式动画
- [ ] `is-dark` 绑定暗色模式状态
- [ ] 代码高亮、表格、任务列表正确渲染
- [ ] 代码块行号（受 `codeShowLineNumbers` 设置控制）
- [ ] 代码块可折叠（受 `codeCollapsible` 设置控制）

### 7.4 消息样式

- [ ] `messageStyle='plain'`：无气泡背景
- [ ] `messageStyle='bubble'`：气泡背景
- [ ] `messageFont`：system / serif / mono
- [ ] `showMessageDivider`：消息间分隔线
- [ ] `showMessageOutline`：消息边框

### 7.5 操作按钮

- [ ] 复制：复制 message content 到剪贴板
- [ ] 重生成：以相同 askId 重新发起请求
- [ ] 删除：受 `confirmDeleteMessage` 设置控制确认弹窗
- [ ] 重生成受 `confirmRegenerateMessage` 设置控制

### 7.6 Token 显示

- [ ] `showTokens=true` 时在消息 footer 显示 usage tokens
- [ ] `showModelNameInMarkdown` 控制是否显示模型名
- [ ] `showModelProviderInMarkdown` 控制是否显示 Provider 名

## 验收

- BubbleList 虚拟滚动正常，5000 条消息不卡顿
- 自动追底 + 回底按钮 + 未读计数正常
- XMarkdown 代码高亮/表格/任务列表渲染正确
- 流式动画平滑
- 消息操作按钮功能正常
