# Orbit Chat — 总体进度

> 更新时间：2026-08-11  
> 基线：orbit-chat-requirements_20260811.md

## 模块清单

| # | 模块 | 优先级 | 文件 | 状态 |
|---|------|--------|------|------|
| 01 | 类型系统对齐 | P0 | `types-schema.md` | ⬜ 未开始 |
| 02 | 本地持久化（IndexedDB） | P0 | `local-persistence.md` | ⬜ 未开始 |
| 03 | Provider 管理 | P0 | `provider-management.md` | ⬜ 未开始 |
| 04 | Assistant 管理 | P0 | `assistant-management.md` | ⬜ 未开始 |
| 05 | Topic 管理 | P0 | `topic-management.md` | ⬜ 未开始 |
| 06 | 对话与流式生成 | P0 | `chat-streaming.md` | ⬜ 未开始 |
| 07 | 消息渲染（Bubble + XMarkdown） | P0 | `message-rendering.md` | ⬜ 未开始 |
| 08 | 思考过程展示 | P0 | `thinking-display.md` | ⬜ 未开始 |
| 09 | 输入与发送（XSender） | P0 | `input-sender.md` | ⬜ 未开始 |
| 10 | 请求层（HookFetch + useSend + useXStream） | P0 | `request-layer.md` | ⬜ 未开始 |
| 11 | 导入（Cherry v5） | P0 | `import-cherry.md` | ⬜ 未开始 |
| 12 | 导出（Cherry v5） | P1 | `export-cherry.md` | ⬜ 未开始 |
| 13 | 设置与界面 | P1 | `settings-ui.md` | ⬜ 未开始 |
| 14 | 欢迎页与提示 | P1 | `welcome-prompts.md` | ⬜ 未开始 |
| 15 | 附件管理 | P1 | `attachments.md` | ⬜ 未开始 |
| 16 | 主题系统（ConfigProvider） | P1 | `theme-system.md` | ⬜ 未开始 |
| 17 | 响应式布局 | P1 | `responsive-layout.md` | ⬜ 未开始 |
| 18 | 语音输入 | P2 | `voice-input.md` | ⬜ 未开始 |

## 图例

- ⬜ 未开始
- 🔄 进行中
- ✅ 完成

## 实施顺序（遵循需求文档 §9）

1. 类型系统对齐 → 2. 本地持久化 → 3. Provider 管理 → 4. Assistant 管理 → 5. Topic 管理
6. 请求层 → 7. 对话与流式生成 → 8. 消息渲染 → 9. 思考过程展示 → 10. 输入与发送
11. 导入 → 12. 导出 → 13. 设置与界面 → 14. 欢迎页与提示 → 15. 附件管理
16. 主题系统 → 17. 响应式布局 → 18. 语音输入
