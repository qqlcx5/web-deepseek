# Orbit Chat — 总体进度

> 更新时间：2026-08-12  
> 基线：orbit-chat-requirements_20260811.md

## 模块清单

| # | 模块 | 优先级 | 状态 | 关键文件 |
|---|------|--------|------|----------|
| 01 | 类型系统对齐 | P0 | ✅ 完成 | `types/index.ts` |
| 02 | 本地持久化（IndexedDB） | P0 | ✅ 完成 | `utils/db.ts`, `utils/saveQueue.ts`, `utils/migrations.ts`, `stores/app.ts` |
| 03 | Provider 管理 | P0 | ✅ 完成 | `views/ProviderView.vue`, `components/ProviderForm.vue` |
| 04 | Assistant 管理 | P0 | ✅ 完成 | `views/AssistantView.vue`, `components/AssistantForm.vue` |
| 05 | Topic 管理 | P0 | ✅ 完成 | `components/TopicList.vue` (Conversations), `stores/app.ts` |
| 06 | 对话与流式生成 | P0 | ✅ 完成 | `views/ChatView.vue`, `composables/useChatSend.ts`, `api/chat.ts` |
| 07 | 消息渲染（Bubble + XMarkdown） | P0 | ✅ 完成 | `components/MessageList.vue` (BubbleList+Bubble+MarkdownRenderer) |
| 08 | 思考过程展示 | P0 | ✅ 完成 | `components/MessageList.vue` (Thinking 组件) |
| 09 | 输入与发送（XSender） | P0 | ✅ 完成 | `components/MessageSender.vue`, `components/WelcomePrompts.vue` |
| 10 | 请求层（HookFetch + useSend + useXStream） | P0 | ✅ 完成 | `utils/http.ts`, `api/chat.ts`, `api/types.ts`, `composables/useChatSend.ts` |
| 11 | 导入（Cherry v5） | P0 | ✅ 完成 | `utils/importer.ts`, `components/ImportDialog.vue` |
| 12 | 导出（Cherry v5） | P1 | ✅ 完成 | `utils/exporter.ts`, `components/ExportDialog.vue` |
| 13 | 设置与界面 | P1 | ✅ 完成 | `views/SettingsView.vue` (11 分区全覆盖) |
| 14 | 欢迎页与提示 | P1 | ✅ 完成 | `components/WelcomePrompts.vue` |
| 15 | 附件管理 | P1 | ✅ 完成 | `components/ChatAttachments.vue` (Attachments+FilesCard) |
| 16 | 主题系统（ConfigProvider） | P1 | ✅ 完成 | `App.vue` (ConfigProvider + themeOverrides + customCss) |
| 17 | 响应式布局 | P1 | ✅ 完成 | `layouts/DefaultLayout.vue`, `views/ChatView.vue` |
| 18 | 语音输入 | P2 | ✅ 完成 | `components/VoiceInput.vue` (useRecord), `components/MessageSender.vue` |

## 编译状态

- `vue-tsc --build --noEmit` ✅ 通过（0 错误）
- `vite build` ✅ 通过

## 已完成工作详情

### Module 01 - 类型系统对齐 ✅
- `src/types/index.ts` 完全重写，对齐需求文档 §2 全部类型
- 完整类型：AppData, Provider, ModelInfo, Assistant, AssistantSettings, Topic, ChatMessage, MessageBlock, Settings, ModelRef

### Module 02 - 本地持久化 ✅
- `src/utils/db.ts` — IndexedDB 封装（loadAppData / saveAppData / deleteAppData）
- `src/utils/saveQueue.ts` — 串行 + 200ms 防抖保存队列
- `src/utils/migrations.ts` — 版本迁移框架
- Store 集成：init() 启动恢复 + watch deep 自动保存 + saveStatus
- `main.ts` 在 mount 前调用 store.init()

### Module 03 - Provider 管理 ✅
- `src/components/ProviderForm.vue` — Dialog 表单（name, type, apiHost, apiKey, enabled, apiOptions）
- `src/views/ProviderView.vue` — 表格 + 展开模型列表 + CRUD + 引用保护
- isSystem 禁止删除、允许禁用
- 路由 `/providers`

### Module 04 - Assistant 管理 ✅
- `src/components/AssistantForm.vue` — Dialog + Tabs（基本/模型/设置/功能）
- `src/views/AssistantView.vue` — 表格 + 默认标记 + 删除迁移/级联 + JSON 导入
- isDefault 唯一约束
- 路由 `/assistants`

### Module 05 - Topic 管理 ✅
- Store: createTopic / selectTopic / deleteTopic / togglePin / renameTopic / clearTopicMessages / autoNameTopic
- sortedTopics（pinned 优先 + updatedAt 倒序）
- autoNameTopic（30 字符 + isNameManuallyEdited 保护）
- ChatView 侧边栏完整 Topic 交互

### Module 06 - 对话与流式 ✅
- 消息创建流程（user → assistant 占位 → 流式更新）
- blocks 结构（main_text / thinking / error）
- 状态机（sending → streaming → complete / stopped / error）
- **真实 SSE 流接入**：ChatView 调用 `chatApi.chatStream()` + `parseSSEStream()`
- 6 种 Provider 适配器（openai/anthropic/gemini/azure/mistral/vertexai）
- 无 API Key 时自动降级为模拟回复
- 停止生成保留已接收内容
- metrics 记录（completion_tokens / time_completion / time_first_token / time_thinking）
- 重试：删除失败消息后重新发送上一条用户消息

### Module 07 - 消息渲染 ✅
- `src/components/MessageList.vue` — 使用 BubbleList + Bubble 组件
- **XMarkdown 渲染**：MarkdownRenderer 异步加载，支持 GFM/代码高亮/表格/任务列表
- enable-animate 流式动画（streaming 状态时自动启用）
- show-code-block-header + enable-code-line-number（跟随设置）
- 消息操作：复制、重试
- token 显示、模型名显示
- 错误块独立渲染 + 重试按钮

### Module 08 - 思考过程展示 ✅
- 使用 Thinking 组件
- autoCollapse 跟随设置
- thinking_millsec 记录

### Module 09 - 输入与发送 ✅
- `src/components/MessageSender.vue` — 使用 XSender 组件
- @ mention + / 指令触发
- submitType 跟随设置
- Token 估算显示
- `src/components/WelcomePrompts.vue` — Welcome + Prompts + regularPhrases

### Module 10 - 请求层 ✅
- `src/api/types.ts` — ChatRequestParams, SSEEvent, ProviderAdapterFactory
- `src/utils/http.ts` — HookFetch 封装（authPlugin, errorPlugin, logPlugin, fetchStream）
- `src/api/chat.ts` — 3 个适配器（openai/anthropic/gemini）+ chatStream 入口
- `src/composables/useChatSend.ts` — XRequest + useXStream 集成 + SSE 解析

### Module 11 - 导入 Cherry v5 ✅
- `src/utils/importer.ts` — parseCherryV5() 完整映射
- `src/components/ImportDialog.vue` — 文件选择 + 预览 + warnings + 确认导入

### Module 12 - 导出 Cherry v5 ✅
- `src/utils/exporter.ts` — exportToCherryV5() + validateForExport()
- `src/components/ExportDialog.vue` — API Key 选项 + 概览 + 校验 + 下载

### Module 13 - 设置界面 ✅
- 13 个导航项（11 个设置分区 + Provider + 助手）
- 基础：语言、主题(auto/light/dark)、字号、用户名
- 话题：显示控制、位置、自动命名
- 输入：快捷键、Token 估算、粘贴长文本转附件、折叠模式
- 消息显示：样式、字体、分隔线、Token/模型名/大纲
- 代码：行号、换行、折叠、编辑器配置、预览主题
- 数学：引擎选择、单美元符号
- 翻译：空格触发、确认、提示词、目标语言
- 导出：10 种格式开关
- 多模型：消息样式、退格删除、快捷面板
- 布局：窄模式、导航栏位置、主题色（ElColorPicker）
- 自定义：CSS 文本框
- 绑定 `app.settings.*`，更新后自动保存

### Module 14 - 欢迎页 ✅
- 空消息时显示 Welcome + Prompts
- Assistant regularPhrases 展示
- 点击 prompt 直接发送

### Module 16 - 主题系统 ✅
- App.vue ConfigProvider（namespace='elx', applyTo='root'）
- theme 跟随 settings.theme（light/dark/auto）
- auto 模式跟随系统 prefers-color-scheme
- themeOverrides 从 settings.userTheme.colorPrimary 读取
- customCss 动态注入 <style>
- applyTheme() 在 init() 时执行

### Module 17 - 响应式布局 ✅
- 桌面：rail(68px) + sidebar(276px) + main + inspector(304px)
- 平板：隐藏 inspector
- 移动：底部导航 + 抽屉侧栏
- 断点 768px / 1179px

## 未完成模块

### Module 15 - 附件管理 ✅
- `src/components/ChatAttachments.vue` — Attachments 组件 + FilesCard
- 拖拽上传 + 点击上传
- before-upload 校验：10MB 限制 + 文件夹过滤
- httpRequest 本地存储（图片生成 Object URL 预览）
- delete-card 事件处理 + URL.revokeObjectURL 清理
- scrollX 滚动模式

### Module 18 - 语音输入 ✅
- `src/components/VoiceInput.vue` — useRecord hook + Web Speech API
- `src/components/MessageSender.vue` — 集成 VoiceInput 到 XSender #action-list 插槽
- start()/stop() 控制 + loading 状态 + 实时文字填充
- 不支持浏览器自动隐藏 + 麦克风权限错误提示
- 录音中 pulse 动画
