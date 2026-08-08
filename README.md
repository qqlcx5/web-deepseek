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
├── api/          # API 请求层
│   └── chat.ts   # OpenAI 兼容的流式对话 API
├── composables/  # Vue Composables
│   ├── useChatStreaming.ts  # 流式消息逻辑
│   └── useTheme.ts          # 主题管理
├── components/
│   └── chat/     # 聊天 UI 组件
├── stores/
│   └── chat.ts   # Pinia store
├── types/
│   └── chat.ts   # TypeScript 类型定义
├── styles/
│   └── chat.css  # CSS 变量 + 暗色模式
└── views/
    └── chat/
        └── ChatPage.vue  # 主页面
```

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
