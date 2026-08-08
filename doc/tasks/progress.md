# Orbit Chat 开发进度总览

> 基于 `doc/detailed-design.md` 模块划分
> 更新日期: 2026-08-08

---

## 模块进度

| # | 模块 | 路径 | 任务文件 | 任务数 | 完成 | 状态 |
|---|------|------|---------|--------|------|------|
| 01 | **types** | `src/types/` | [01-types.md](./01-types.md) | 28 | 0 | ⬜ 未开始 |
| 02 | **db** | `src/utils/db.ts` | [02-db.md](./02-db.md) | 10 | 0 | ⬜ 未开始 |
| 03 | **cherry-parser** | `src/utils/cherry-parser.ts` | [03-cherry-parser.md](./03-cherry-parser.md) | 14 | 0 | ⬜ 未开始 |
| 04 | **data-import** | `src/utils/data-import.ts` | [04-data-import.md](./04-data-import.md) | 22 | 0 | ⬜ 未开始 |
| 05 | **cherry-export** | `src/utils/cherry-export.ts` | [05-cherry-export.md](./05-cherry-export.md) | 13 | 0 | ⬜ 未开始 |
| 06 | **http** | `src/utils/http.ts` | [06-http.md](./06-http.md) | 13 | 0 | ⬜ 未开始 |
| 07 | **chat-api** | `src/api/chat-api.ts` | [07-chat-api.md](./07-chat-api.md) | 10 | 0 | ⬜ 未开始 |
| 08 | **store-app** | `src/stores/app.ts` | [08-store-app.md](./08-store-app.md) | 18 | 0 | ⬜ 未开始 |
| 09 | **store-chat** | `src/stores/chat.ts` | [09-store-chat.md](./09-store-chat.md) | 30 | 0 | ⬜ 未开始 |
| 10 | **store-ui** | `src/stores/ui.ts` | [10-store-ui.md](./10-store-ui.md) | 28 | 0 | ⬜ 未开始 |
| 11 | **layout** | `src/views/chat/ChatPage.vue` | [11-layout.md](./11-layout.md) | 27 | 0 | ⬜ 未开始 |
| 12 | **components** | `src/components/chat/` | [12-components.md](./12-components.md) | 58 | 0 | ⬜ 未开始 |
| 13 | **utils** | `src/utils/` | [13-utils.md](./13-utils.md) | 9 | 0 | ⬜ 未开始 |

**合计: 280 个任务**

---

## Checklist

- [ ] 01-types — 类型系统
- [ ] 02-db — IndexedDB 存储模块
- [ ] 03-cherry-parser — Cherry Studio 数据解析模块
- [ ] 04-data-import — 数据导入与合并模块
- [ ] 05-cherry-export — 数据导出模块
- [ ] 06-http — 网络请求模块
- [ ] 07-chat-api — 对话 API 模块
- [ ] 08-store-app — 应用数据 Store
- [ ] 09-store-chat — 对话运行态 Store
- [ ] 10-store-ui — UI 交互态 Store
- [ ] 11-layout — 布局系统
- [ ] 12-components — UI 组件层
- [ ] 13-utils — 工具与辅助模块

---

## 推荐开发顺序

按依赖拓扑从底向上：

```
Phase 1 — 基础层（无依赖）
  01-types ──→ 02-db ──→ 03-cherry-parser

Phase 2 — 数据层（依赖 Phase 1）
  04-data-import ──→ 05-cherry-export

Phase 3 — 网络层（独立于数据层）
  06-http ──→ 07-chat-api

Phase 4 — 状态层（依赖 Phase 2+3）
  10-store-ui（独立）
  08-store-app（依赖 db + data-import）
  09-store-chat（依赖 chat-api + store-app + store-ui）

Phase 5 — UI 层（依赖 Phase 4）
  11-layout ──→ 12-components ──→ 13-utils（穿插）
```

---

## 阻塞项

以下待确认问题可能影响具体实现（但不阻塞任务拆分）：

- [ ] Q-1 hook-fetch 流式响应 API 形态 → 影响 06-http / 07-chat-api
- [ ] Q-2 hook-fetch `post()` 返回值类型 → 影响 07-chat-api
- [ ] Q-3 BubbleList 自定义渲染插槽 → 影响 12-components/ChatMessages
- [ ] Q-4 XSender v-model 绑定类型 → 影响 12-components/ChatComposer
- [ ] Q-5 Conversations item 数据格式 → 影响 12-components/ChatSidebar
