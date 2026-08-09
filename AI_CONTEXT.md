---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_14afc87793dc11f18e22525400f8a581
    ReservedCode1: 8eW4q7qhLwKe2YNHtHxCF5nOYZVAMUGi1qToC2/murs1g8IPSg6ZjwhNM/UQae5Bs9Z53cKDCrc/GLuB6XrRvYqM38wW0AkZ2SjW7meJjQrFHHzfIQ5OTGoenWy8Ch93BJ7g5W/MZMjKKXF8bmv46Ueb7nKSaxfybQV3Iu6sTq+RicU+rJIW3eM9izU=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_14afc87793dc11f18e22525400f8a581
    ReservedCode2: 8eW4q7qhLwKe2YNHtHxCF5nOYZVAMUGi1qToC2/murs1g8IPSg6ZjwhNM/UQae5Bs9Z53cKDCrc/GLuB6XrRvYqM38wW0AkZ2SjW7meJjQrFHHzfIQ5OTGoenWy8Ch93BJ7g5W/MZMjKKXF8bmv46Ueb7nKSaxfybQV3Iu6sTq+RicU+rJIW3eM9izU=
---

# AI_CONTEXT.md — DeepSeek Chat

> 大模型友好型项目上下文文档。本文档为后续 AI 辅助开发提供快速上下文注入。

---

## 1. 项目定位

**DeepSeek Chat** — 基于 Vue 3 + Vite 的 AI 对话 Web 应用，接入 OpenAI 兼容 API，支持流式对话、多助手、多话题、附件上传等完整聊天体验。

| 维度 | 说明 |
|------|------|
| 应用类型 | SPA（单页应用） |
| 核心能力 | AI 流式对话、Markdown 渲染、附件/文件管理、多助手切换、主题切换 |
| API 协议 | OpenAI Chat Completions 兼容（SSE 流式） |

---

## 2. 技术栈速查

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) | 3.x |
| 语言 | TypeScript | 5.x |
| 构建 | Vite | 8.x |
| 状态管理 | Pinia | 4.x |
| UI 组件库 | Element Plus | 2.14 |
| 对话组件库 | Element-Plus-X | 2.x |
| HTTP 客户端 | hook-fetch | 2.x |
| Markdown 渲染 | x-markdown-vue | — |
| CSS 方案 | UnoCSS（原子化类名） | — |
| 工具库 | @vueuse/core | — |
| 持久化 | IndexedDB（原生 API） | — |
| 包管理 | pnpm | — |

---

## 3. 目录结构速查

```
src/
├── main.ts                          # 应用入口，挂载 Pinia/Router/UnoCSS
├── App.vue                          # 根组件
├── api/
│   └── chat-api.ts                  # 对话 API 封装（chatStream / chat）
├── assets/                          # 静态资源（SVG 图标等）
├── components/
│   └── chat/                        # 14 个对话相关组件
│       ├── ChatHeader.vue           # 顶部标题栏 / 侧边栏切换
│       ├── ChatSidebar.vue          # 左侧话题列表 + 操作
│       ├── ChatContent.vue          # 消息列表渲染（核心）
│       ├── ChatInput.vue            # 底部输入区域
│       ├── ChatEmpty.vue            # 空状态 / Welcome 页面
│       ├── ChatMessage.vue          # 单条消息（用户/AI 双重渲染）
│       ├── ChatMessageList.vue      # 消息列表滚动容器
│       ├── ChatModelSelector.vue    # 模型选择下拉
│       ├── ChatAttachmentBar.vue    # 附件预览栏
│       ├── ChatFileCard.vue         # 文件卡片展示
│       ├── ChatThinking.vue         # AI 思考过程展示
│       ├── ChatThoughtChain.vue     # 思考链可视化
│       ├── ChatMarkdown.vue         # Markdown 渲染封装
│       └── ChatToasts.vue           # 全局提示信息
├── composables/
│   ├── useTheme.ts                  # 主题切换（light/dark/auto）
│   └── ...
├── router/
│   └── index.ts                     # 路由配置（仅 /chat）
├── stores/
│   ├── app.ts                       # 数据持久层（IndexedDB CRUD）
│   ├── chat.ts                      # 对话运行时（740 行）
│   └── ui.ts                        # UI 状态（280 行）
├── types/
│   ├── index.ts                     # 全局类型定义
│   └── chat.ts                      # 对话相关类型
├── utils/
│   ├── http.ts                      # hook-fetch 实例 + Auth/Error 插件
│   └── db.ts                        # IndexedDB 封装（openDB / saveAppData / loadAppData）
├── views/
│   └── chat/
│       └── ChatPage.vue             # 聊天主视图（组装所有子组件）
└── styles/                          # 全局样式
```

---

## 4. 架构分层

```
┌─────────────────────────────────────────────────────┐
│  视图层 (Views + Components)                         │
│  ChatPage.vue → components/chat/* (14 组件)         │
├─────────────────────────────────────────────────────┤
│  状态层 (Pinia Stores)                               │
│  useChatStore ──── 对话运行时                        │
│  useAppStore  ──── 数据持久层                        │
│  useUiStore   ──── UI 状态                           │
├─────────────────────────────────────────────────────┤
│  API 层                                              │
│  api/chat-api.ts ── hook-fetch 封装                  │
│  utils/http.ts   ── Auth/Error 拦截插件              │
├─────────────────────────────────────────────────────┤
│  路由层                                              │
│  router/index.ts ── 单路由 /chat                     │
└─────────────────────────────────────────────────────┘
```

---

## 5. 数据流

```
用户输入
  │
  ▼
ChatPage.vue (视图层)
  │ 调用 store 方法
  ▼
useChatStore.streamChat()         ← 运行时状态
  │ 委托 API 层
  ▼
chat-api.ts → chatStream()        ← hook-fetch 封装
  │ 经过拦截器
  ▼
utils/http.ts → request()         ← Auth + Error 插件
  │ 发送 HTTP POST (SSE)
  ▼
OpenAI 兼容 API 后端
  │ SSE 事件流返回
  ▼
useChatStore 收到 delta 更新
  │
  ├─→ 更新 messages 列表 → ChatContent 重渲染
  └─→ 委托 useAppStore → saveAppData() → IndexedDB 持久化
```

---

## 6. Store 协作关系

### 6.1 useChatStore（运行时核心 — `stores/chat.ts`，740 行）

| 职责 | 说明 |
|------|------|
| 消息管理 | 消息列表、流式生成、分支对话 |
| 附件管理 | 附件上传、预览、移除 |
| 草稿管理 | 未发送输入内容持久化 |
| 话题管理 | 创建/切换/删除/重命名对话话题 |
| 模型选择 | 切换 AI 模型 |
| UI 代理 | 代理 sidebarOpen/modal/toast 等 UI 状态（读写 useUiStore） |
| 持久化委托 | 数据变更后调用 useAppStore 写 IndexedDB |

### 6.2 useAppStore（数据持久层 — `stores/app.ts`）

| 职责 | 说明 |
|------|------|
| Provider CRUD | API 提供商配置增删改查 |
| Assistant CRUD | 助手（System Prompt）管理 |
| Topic CRUD | 话题（对话历史）管理 |
| Settings CRUD | 全局设置读写 |
| 导入/导出 | 全量数据 JSON 导入导出 |
| 持久化 | 单 store 扁平化存储到 IndexedDB（`idb-keyval` 风格） |

### 6.3 useUiStore（UI 状态 — `stores/ui.ts`，280 行）

| 职责 | 说明 |
|------|------|
| 布局状态 | 侧边栏开合、焦点模式、消息面板 |
| 模态框管理 | 全局模态框类型/开关 |
| 主题 | 主题模式联动 |
| 命令面板 | 命令搜索查询和过滤 |
| 模型状态 | 当前选中模型 |
| 网络/保存状态 | online/saving 标识 |

---

## 7. 关键文件速查表

| 文件路径 | 职责 |
|----------|------|
| `src/main.ts` | 应用入口，初始化 Pinia/Router/UnoCSS |
| `src/App.vue` | 根组件，挂载 `<router-view>` |
| `src/views/chat/ChatPage.vue` | 聊天主视图，组装 Sidebar + Content + Input |
| `src/stores/chat.ts` | 对话运行时核心逻辑（740 行） |
| `src/stores/app.ts` | IndexedDB 持久层，Provider/Assistant/Topic CRUD |
| `src/stores/ui.ts` | UI 状态管理（280 行） |
| `src/api/chat-api.ts` | chatStream() / chat() API 调用 |
| `src/utils/http.ts` | hook-fetch 实例，Auth/Error 插件 |
| `src/utils/db.ts` | IndexedDB 原生封装（openDB/saveAppData/loadAppData） |
| `src/router/index.ts` | 路由 `/chat` 单页配置 |
| `src/composables/useTheme.ts` | 主题切换 composable（light/dark/auto） |
| `src/types/index.ts` | AppData、Provider、Assistant、Topic 等全局类型 |
| `src/types/chat.ts` | ChatMessage、ChatCompletionRequest 等对话类型 |
| `vite.config.ts` | Vite 插件链、代理、别名配置 |
| `package.json` | 依赖/脚本声明 |
| `.env` / `.env.local` | 环境变量（VITE_AI_API_BASE / VITE_AI_API_KEY） |

---

## 8. Element-Plus-X 组件库

项目使用 Element-Plus-X 提供对话场景专用组件，覆盖 15 个模块：

| 组件/模块 | 用途 |
|-----------|------|
| `Attachments` | 附件列表展示与管理 |
| `Bubble` | 对话气泡（用户/AI 消息） |
| `BubbleList` | 气泡列表容器（虚拟滚动） |
| `ConfigProvider` | 全局配置注入（语言/主题） |
| `Conversations` | 对话列表（话题切换） |
| `FilesCard` | 文件卡片展示 |
| `Prompts` | 提示词预设面板 |
| `Thinking` | AI 思考状态指示 |
| `ThoughtChain` | 思维链可视化 |
| `Welcome` | 欢迎页 / 空状态 |
| `XMarkdown` | Markdown 渲染（代码高亮/数学公式） |
| `XSender` | 输入发送区域 |
| `useRecord` | 录音 Composable |
| `useSend` | 发送消息 Composable |
| `useXStream` | SSE 流式解析 Composable |

---

## 9. 编码约定

### 9.1 网络请求

```ts
// ✅ 正确：统一使用 hook-fetch 实例
import { request } from '@/utils/http'
// ❌ 禁止：自行引入 axios 或使用原生 fetch
```

### 9.2 UI 组件

- **对话场景组件**：优先使用 Element-Plus-X（Bubble/BubbleList/Conversations/XSender/Welcome/Prompts/Attachments/Thinking/ThoughtChain/FilesCard/XMarkdown）
- **通用 UI**：使用 Element Plus 基础组件（ElButton/ElDialog/ElInput 等）
- **CSS**：UnoCSS 原子化类名优先，必要时用 `<style scoped>`

### 9.3 路径别名

```ts
import { request } from '@/utils/http'   // @ → src/
```

### 9.4 开发命令

```bash
pnpm dev        # 开发服务器（Vite）
pnpm build      # 生产构建
pnpm lint       # ESLint 检查
```

### 9.5 类型安全

- 所有 API 请求/响应必须声明 TypeScript 类型
- Store 中 state/getter/action 保持完整类型标注
- 全局类型定义在 `src/types/` 下统一管理

---

## 10. 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_AI_API_BASE` | API 代理前缀 | `/ai-api` |
| `VITE_AI_API_KEY` | Bearer Token 认证密钥 | — |
| `VITE_API_URL` | 后端实际地址（开发代理目标） | `http://localhost:3000` |

---

> **文档版本**：由 AI_CONTEXT 任务自动生成，基于 `2026-08-09` 项目状态。
*（内容由AI生成，仅供参考）*
