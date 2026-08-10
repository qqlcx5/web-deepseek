# DeepSeek Chat

基于 Vue 3 + Vite 的 AI 对话 Web 应用，支持 OpenAI 兼容 API 流式对话。

## 技术栈

- **Vue 3** + **TypeScript** — 框架与类型安全
- **Vite 8** — 构建工具
- **Pinia** — 状态管理
- **Element Plus** — UI 组件库
- **UnoCSS** — 原子化 CSS
- **x-markdown-vue** — Markdown 渲染
- **@iconify/vue** + Tabler Icons — 图标

## 功能

- 💬 流式对话（SSE，兼容 OpenAI API 格式）
- 🌓 亮色/暗色主题切换
- 📎 附件上下文管理
- 🔍 命令面板（⌘K）
- 🤖 多模型切换
- 📝 系统提示词编辑
- 🎯 专注模式
- 📱 移动端适配
- 💾 会话管理（新建、切换、删除）

## 项目结构

```
src/
├── api/          # API 请求层（hook-fetch 封装，动态 Provider 切换）
│   └── chat-api.ts
├── config/       # 静态配置常量（纯数据）
│   ├── breakpoints.ts        # 响应式断点
│   └── commands.ts           # 命令面板 + 提示词预设
├── composables/  # Vue Composables（有状态行为）
│   ├── useNetwork.ts         # 在线状态（模块级单例）
│   ├── useKeyboard.ts        # 全局快捷键
│   └── useTheme.ts           # 主题管理
├── components/
│   └── chat/     # 聊天 UI 组件
├── services/     # 业务编排（纯 TS，可单测，无 Vue/Pinia 依赖）
│   ├── chat-service.ts       # 流式对话生命周期（请求/SSE/状态机）
│   ├── search.ts             # 消息全文搜索
│   └── export.ts             # Topic 导出 Markdown
├── stores/       # Pinia store（只装响应式状态 + 薄 action）
│   ├── app.ts                # 归一化数据 + IndexedDB 持久化
│   ├── ui.ts                 # 布局 / 模态 / Toast / 模型选择
│   └── chat.ts               # 会话运行时状态
├── types/        # 类型定义（统一从 @/types 导入）
│   └── index.ts
├── utils/        # 纯函数工具
│   ├── sse.ts                # SSE 解析器（唯一实现，消除重复）
│   ├── storage.ts            # localStorage 访问集中点
│   ├── http.ts / db.ts / token-counter.ts / cherry-*.ts
├── styles/
│   └── chat.css              # CSS 变量 + 暗色模式
└── views/
    └── chat/
        └── ChatPage.vue      # 主页面
```

## 架构分层约定

依赖方向**自上而下**，禁止反向引用：

```
types  →  utils  →  services  →  composables  →  stores  →  components/views
```

- **`stores/`** 只装响应式状态 + 薄 action；业务逻辑进 `services/`，纯函数进 `utils/`。
- **`services/`** 不依赖 Vue / Pinia，副作用（持久化、Toast）通过回调注入，便于单测。
- **`utils/`** 无框架依赖；`sse.ts` 是 SSE 解析的唯一实现。
- **`config/`** 纯静态数据（命令、预设、断点），不持有状态。

## 持久化策略

| 数据 | 存储 | 入口 |
| --- | --- | --- |
| Provider / Assistant / Topic / Settings | IndexedDB（`orbit-chat`） | `utils/db.ts`，经 `stores/app.ts` |
| 输入草稿、系统提示词、主题模式 | localStorage | `utils/storage.ts` |

localStorage 的 key 集中在 `utils/storage.ts`，禁止散落各处直接读写。

## 快速开始

```sh
pnpm install
```

### 配置环境变量

复制 `.env.development` 并填入你的 API Key：

```
VITE_AI_API_BASE = /ai-api
VITE_AI_API_KEY = sk-your-key-here
VITE_AI_DEFAULT_MODEL = deepseek-chat
```

### 开发

```sh
pnpm dev
```

### 构建

```sh
pnpm build
```

### Lint

```sh
pnpm lint
```

## API 兼容性

支持任何 OpenAI Chat Completions 兼容的 API 端点：

- DeepSeek API
- OpenAI API
- 其他兼容服务

只需配置 `VITE_AI_API_BASE` 指向你的代理或直接指向 API 地址。
