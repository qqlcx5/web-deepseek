# Orbit Chat 实施进度

> 基线：[`docs/prd.md`](../../docs/prd.md) v2.0（F-01 ~ F-08）
> 参考功能：`/Users/another/Documents/OpenSource/ai-reader`（对话流式、上下文 banner、模型选择、停止/重生成、持久化）
> 组件库：`vue-element-plus-x`（XSender / Bubble / BubbleList / Conversations / Prompts / Welcome / XMarkdown / FilesCard / useSend / useXStream / XRequest）
> 规则：模块内所有 checklist 完成并通过验收命令，才能将本文件对应模块标记为 `[x]`。

## 当前状态（基线审计）

- `npm run type-check` 通过（0 错误）。
- 数据层（M01–M07）已实现并通过类型检查。
- **UI/对话体验层未达基线**：输入区、消息列表、侧边栏、空状态均为手写 DOM，未使用 `vue-element-plus-x` 组件；流式更新因响应式缺陷在 UI 不增量。
- 待重建工作集中在 M10–M19。

## 总体进度

### 数据层（已完成，基线）

- [x] M01 [核心数据契约](./01-core-data-contract.md)（已验证：`npm run type-check`）
- [x] M02 [本地持久化与迁移](./02-local-persistence.md)
- [x] M03 [Cherry 数据导入](./03-cherry-import.md)
- [x] M04 [Cherry 兼容导出](./04-cherry-export.md)
- [x] M05 [Provider 与模型管理](./05-provider-management.md)
- [x] M06 [Assistant 与 Topic 管理](./06-assistant-topic-management.md)
- [x] M07 [流式对话运行时（服务层）](./07-chat-streaming.md)

### UI 与对话体验重建（进行中）

- [ ] M10 [XSender 输入区](./10-xsender-composer.md)
- [ ] M11 [Bubble 消息列表](./11-bubble-message-list.md)
- [ ] M12 [流式响应式修复与状态机](./12-streaming-reactivity.md)
- [ ] M13 [Conversations 侧边栏](./13-conversations-sidebar.md)
- [ ] M14 [Welcome + Prompts 空状态](./14-welcome-prompts.md)
- [ ] M15 [模型选择与上下文 Banner](./15-model-context-header.md)
- [ ] M16 [附件 FilesCard](./16-attachments-filescard.md)
- [ ] M17 [设置面板即时生效](./17-settings-instant.md)
- [ ] M18 [响应式布局回归](./18-responsive-layout.md)
- [ ] M19 [质量验证与发布检查](./19-quality-release.md)

### ai-reader 功能移植（进行中）

> 参考 `/Users/another/Documents/OpenSource/ai-reader`，排除 RSS（feed）与 AI 自动化（ai-job/schedule）。
> 约束：Cherry v5 导入导出格式（`docs/data-json-schema.md`）不变；新增 reader 数据走 `AppData.documents[]` 扩展，不进 Cherry 导出。
> 库选型：S3 = `aws4fetch`，WebDAV = `webdav`（`webdav/web`）。

- [ ] M20 [多 Provider AI 适配](./20-multi-provider-ai.md)（Anthropic + Ollama + 工厂 + 测试连接）
- [ ] M21 [Prompt 组装与上下文截断](./21-prompt-context-builder.md)
- [ ] M22 [模型配置增强](./22-model-config-enhance.md)（per-model systemPrompt / contextWindow / 测试状态）
- [ ] M23 [Documents 数据层扩展](./23-documents-store.md)（AppData.documents[] + 仓库化）
- [ ] M24 [SPA 网页抓取](./24-web-capture-spa.md)（URL → fetch → defuddle → Document）
- [ ] M25 [上下文预览](./25-context-preview.md)（Markdown / Raw / Metadata）
- [ ] M26 [记忆库与全文搜索](./26-library-search.md)（MiniSearch）
- [ ] M27 [S3 + WebDAV 远端传输](./27-remote-transports.md)
- [ ] M28 [同步与备份引擎](./28-sync-backup.md)（快照上下传 + 版本回滚）
- [ ] M29 [阅读与存储设置 UI](./29-settings-reader-storage.md)

## 推荐执行顺序

1. **M12 → M11**：先修流式响应式，再用 Bubble/BubbleList 重绘消息列表（流式能看到增量）。
2. **M10**：XSender 替换手写 textarea，接入 useSend。
3. **M13 → M14**：侧边栏 Conversations 与空状态 Welcome+Prompts。
4. **M15 → M16**：模型选择/上下文 banner、附件 FilesCard。
5. **M17 → M18 → M19**：设置即时生效、响应式回归、发布门禁。
6. **M20 → M21 → M22**：多 Provider 适配 + Prompt Builder + 模型配置增强（AI 能力，不依赖 documents）。
7. **M23 → M24 → M25 → M26**：documents 数据层 → 抓取 → 预览 → 搜索。
8. **M27 → M28 → M29**：远端传输 → 同步引擎 → 设置 UI。

> M10–M16 之间存在 props/事件约定（见各模块的"数据契约"小节），实现时按序，避免接口回退。

## 完成定义

- 每个模块的所有子任务均为 `[x]`。
- 模块验收命令通过（`npm run type-check`、`npm run build`、`npm run lint`），且无新增 TypeScript 错误。
- 更新本文件对应模块为 `[x]`，并写明验证日期和命令。
