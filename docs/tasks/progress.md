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
| 05 | Topic 管理 | P0 | ✅ 完成 | `stores/app.ts`, `views/ChatView.vue` |
| 06 | 对话与流式生成 | P0 | ✅ 基础完成 | `views/ChatView.vue`, `components/MessageList.vue` |
| 07 | 消息渲染（Bubble + XMarkdown） | P0 | ✅ 基础完成 | `components/MessageList.vue` |
| 08 | 思考过程展示 | P0 | ✅ 完成 | `components/MessageList.vue` (Thinking 组件) |
| 09 | 输入与发送（XSender） | P0 | ✅ 完成 | `components/MessageSender.vue`, `components/WelcomePrompts.vue` |
| 10 | 请求层（HookFetch + useSend + useXStream） | P0 | ✅ 完成 | `utils/http.ts`, `api/chat.ts`, `api/types.ts`, `composables/useChatSend.ts` |
| 11 | 导入（Cherry v5） | P0 | ✅ 完成 | `utils/importer.ts`, `components/ImportDialog.vue` |
| 12 | 导出（Cherry v5） | P1 | ✅ 完成 | `utils/exporter.ts`, `components/ExportDialog.vue` |
| 13 | 设置与界面 | P1 | ✅ 基础完成 | `views/SettingsView.vue` |
| 14 | 欢迎页与提示 | P1 | ✅ 完成 | `components/WelcomePrompts.vue` |
| 15 | 附件管理 | P1 | ⬜ 未开始 | — |
| 16 | 主题系统（ConfigProvider） | P1 | ✅ 基础完成 | `App.vue` |
| 17 | 响应式布局 | P1 | ✅ 完成 | `layouts/DefaultLayout.vue`, `views/ChatView.vue` |
| 18 | 语音输入 | P2 | ⬜ 未开始 | — |

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

### Module 06 - 对话与流式 ✅ 基础
- 消息创建流程（user → assistant 占位 → 流式更新）
- blocks 结构（main_text / thinking / error）
- 状态机（sending → streaming → complete / stopped）
- 停止生成保留已接收内容
- metrics 记录
- 待完成：真实 SSE 流接入（useChatSend 已就绪，待调用）

### Module 07 - 消息渲染 ✅ 基础
- `src/components/MessageList.vue` — 使用 BubbleList + Bubble 组件
- 消息操作：复制、重试
- token 显示、模型名显示
- 待完成：XMarkdown 渲染（当前用 v-html）、代码高亮、Mermaid

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

### Module 13 - 设置界面 ✅ 基础
- 6 个分区：外观、输入、Provider、助手、同步、数据管理
- 绑定新 Settings 类型

### Module 14 - 欢迎页 ✅
- 空消息时显示 Welcome + Prompts
- Assistant regularPhrases 展示
- 点击 prompt 直接发送

### Module 16 - 主题系统 ✅ 基础
- App.vue ConfigProvider（namespace='elx'）
- isDark 切换
- 待完成：themeOverrides 完整配置、customCss、fontSize 动态

### Module 17 - 响应式布局 ✅
- 桌面：rail(68px) + sidebar(276px) + main + inspector(304px)
- 平板：隐藏 inspector
- 移动：底部导航 + 抽屉侧栏
- 断点 768px / 1179px

## 未完成模块

### Module 15 - 附件管理 (P1)
- Attachments + FilesCard 组件
- 10MB 限制
- 粘贴长文本转附件

### Module 18 - 语音输入 (P2)
- useRecord hook
- Web Speech API → useVoiceInput.ts
