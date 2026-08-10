# M25 上下文预览

## 模块目标

参考 ai-reader `components/workspace/{ContextPanel,MarkdownPreview,RawPreview,MetadataPanel}.vue`，为已抓取的 Document 提供 Markdown / Raw / Metadata 三视图预览，复用现有 XMarkdown（M11）做正文渲染。预览面板可作为检查器（右侧抽屉）或独立视图。

> 依赖：M23（documents）、M11（XMarkdown 渲染）。

## 涉及文件

- 新增：`src/components/reader/ContextPanel.vue`、`MarkdownPreview.vue`、`RawPreview.vue`、`MetadataPanel.vue`
- 改：`src/components/chat/ChatInspector.vue`（接入预览入口）或新增 `src/views/reader/ReaderView.vue`
- 读：`src/composables/useTheme.ts`（isDark）、`src/utils/token-counter.ts`
- 参考：`ai-reader/doc/detail.md` §4.4

## 子任务

- [ ] ContextPanel 三级 Tab。
  - 输入：当前 document。
  - 输出：Tab = Markdown / Raw / Metadata；切换保留二级状态；空 document 显示空态。
  - 完成判定：三个视图可切换；document 为空时友好提示。

- [ ] MarkdownPreview。
  - 输入：`document.markdown`、`isDark`、代码/数学设置。
  - 输出：用 `XMarkdown`（M11）渲染；复制 Markdown 按钮；手动重新抓取按钮（调 M24）。
  - 完成判定：长文滚动流畅；代码块可读；不执行脚本。

- [ ] RawPreview。
  - 输入：`rawText`/`rawMarkdown`/`rawHtml`。
  - 输出：深色背景 + 等宽 + 保留换行 + 复制；rawHtml 经 DOMPurify 后展示。
  - 完成判定：原始内容可查看与复制。

- [ ] MetadataPanel。
  - 输入：document 全字段。
  - 输出：表格展示 title/url/canonicalUrl/siteName/author/description/publishedAt/capturedAt/updatedAt/wordCount/tokenCount/extractionMethod/contentHash/source/syncStatus。
  - 完成判定：字段齐全；时间本地化。

## 验收

- [ ] 三视图正确渲染且可切换。
- [ ] 复制/重抓取按钮可用。
- [ ] `npm run type-check` 通过。
