# Orbit Chat 开发进度总览

> 基于 `doc/detailed-design.md` 模块划分
> 更新日期: 2026-08-09

---

## 模块进度

| # | 模块 | 路径 | 任务文件 | 任务数 | 完成 | 状态 |
|---|------|------|---------|--------|------|------|
| 01 | **types** | `src/types/` | [01-types.md](./01-types.md) | 28 | 28 | ✅ 完成 |
| 02 | **db** | `src/utils/db.ts` | [02-db.md](./02-db.md) | 10 | 10 | ✅ 完成 |
| 03 | **cherry-parser** | `src/utils/cherry-parser.ts` | [03-cherry-parser.md](./03-cherry-parser.md) | 14 | 14 | ✅ 完成 |
| 04 | **data-import** | `src/utils/data-import.ts` | [04-data-import.md](./04-data-import.md) | 22 | 22 | ✅ 完成 |
| 05 | **cherry-export** | `src/utils/cherry-export.ts` | [05-cherry-export.md](./05-cherry-export.md) | 13 | 13 | ✅ 完成 |
| 06 | **http** | `src/utils/http.ts` | [06-http.md](./06-http.md) | 13 | 13 | ✅ 完成 |
| 07 | **chat-api** | `src/api/chat-api.ts` | [07-chat-api.md](./07-chat-api.md) | 10 | 10 | ✅ 完成 |
| 08 | **store-app** | `src/stores/app.ts` | [08-store-app.md](./08-store-app.md) | 18 | 18 | ✅ 完成 |
| 09 | **store-chat** | `src/stores/chat.ts` | [09-store-chat.md](./09-store-chat.md) | 30 | 30 | ✅ 完成 |
| 10 | **store-ui** | `src/stores/ui.ts` | [10-store-ui.md](./10-store-ui.md) | 28 | 28 | ✅ 完成 |
| 11 | **layout** | `src/views/chat/ChatPage.vue` | [11-layout.md](./11-layout.md) | 27 | 27 | ✅ 完成 |
| 12 | **components** | `src/components/chat/` | [12-components.md](./12-components.md) | 58 | 58 | ✅ 完成 |
| 13 | **utils** | `src/utils/` | [13-utils.md](./13-utils.md) | 9 | 9 | ✅ 完成 |

**合计: 280 个任务 — 全部完成**

---

## Checklist

- [x] 01-types — 类型系统
- [x] 02-db — IndexedDB 存储模块
- [x] 03-cherry-parser — Cherry Studio 数据解析模块
- [x] 04-data-import — 数据导入与合并模块
- [x] 05-cherry-export — 数据导出模块
- [x] 06-http — 网络请求模块
- [x] 07-chat-api — 对话 API 模块
- [x] 08-store-app — 应用数据 Store
- [x] 09-store-chat — 对话运行态 Store
- [x] 10-store-ui — UI 交互态 Store
- [x] 11-layout — 布局系统
- [x] 12-components — UI 组件层
- [x] 13-utils — 工具与辅助模块

---

## 实现说明

### 渐进式集成策略
- 保留现有静态页面 UI 风格与结构，不推翻重写
- Element-Plus-X 组件仅在合理处引入：Welcome（空态）、Attachments（附件区）、ConfigProvider（主题包裹）
- 现有 CSS 变量体系、响应式断点、快捷键、移动端导航全部保留
- store 层升级为 chatApi.chatStream() 流式请求，替换原 useChatStreaming composable
- 新增 appStore 持久化层（IndexedDB），在 ChatPage onMounted 时初始化
- 新增导入/导出按钮，在侧栏操作区可直接导入 Cherry Studio 数据或导出 JSON

### 新建文件（17 个）
- `src/types/index.ts` — 业务类型（Provider/Assistant/Topic/Message/AppData 等）
- `src/types/cherry-data.ts` — Cherry Studio 原始类型
- `src/utils/db.ts` — IndexedDB 持久化
- `src/utils/cherry-parser.ts` — 数据解析
- `src/utils/data-import.ts` — 导入与合并
- `src/utils/cherry-export.ts` — 导出与校验
- `src/utils/token-counter.ts` — Token 估算
- `src/utils/format.ts` — 时间/文件大小格式化
- `src/utils/cn.ts` — 类名工具
- `src/utils/http.ts` — hook-fetch 网络层
- `src/api/chat-api.ts` — 对话 API（chatStream/chat）
- `src/stores/app.ts` — 数据持久化 Store
- `src/stores/ui.ts` — UI 交互态 Store
- `src/components/chat/WelcomeScreen.vue` — 欢迎页组件
- `src/components/chat/ThinkingChain.vue` — 推理过程组件
- `src/components/chat/ChatAttachments.vue` — 附件展示组件

### 升级文件（5 个）
- `src/stores/chat.ts` — 升级流式请求为 chatApi.chatStream()，新增 appStore 集成、网络监听、草稿持久化
- `src/views/chat/ChatPage.vue` — 添加 ConfigProvider 包裹、onMounted 初始化 appStore、onUnmounted 清理
- `src/components/chat/ChatMessages.vue` — 空态替换为 Element-Plus-X Welcome 组件
- `src/components/chat/ChatComposer.vue` — 附件区替换为 Element-Plus-X Attachments 组件
- `src/components/chat/ChatSidebar.vue` — 新增导入/导出按钮
- `src/components/chat/ChatInspector.vue` — 上下文用量显示实际 Token 数和进度条
- `src/main.ts` — 注册 Element-Plus-X 全局组件
- `src/styles/chat.css` — 追加 CSS 变量和 EPX 主题覆盖

### 验证结果
- `vue-tsc --noEmit` — 零错误 ✅
- `vite build` — 构建成功 ✅
- `vite preview` — 页面正常渲染 ✅
