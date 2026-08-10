# M24 SPA 网页抓取

## 模块目标

参考 ai-reader `services/capture/*`，把"抓取当前浏览器页"（扩展 content-script 方案）改造为 **SPA 版**：用户粘贴 URL → 经 fetch 拉取 HTML → `defuddle` 提取正文 → 生成 `DocumentEntity` 入库。支持手动刷新、内容 hash 去重、fallback。

> 依赖：M23（DocumentEntity）。CORS 是主要工程风险，需代理方案。

## 涉及文件

- 新增：`src/services/capture/capture.service.ts`
- 新增：`src/utils/sanitize.ts`（DOMPurify 清洗）、`src/utils/compress.ts`（lz-string 压缩 rawHtml，可选）
- 改：`vite.config.ts`（开发代理 `/capture-proxy`）、`.env.development`
- 新增：`src/components/reader/CaptureBar.vue`（URL 输入 + 抓取按钮 + 状态）
- 参考：`ai-reader/services/capture/capture.service.ts`、`ai-reader/doc/detail.md` §11

## 子任务

- [ ] 依赖与提取内核。
  - 输入：`defuddle`、`dompurify`、`lz-string`（按 settings 开关）。
  - 输出：安装依赖；`capture.service.ts` 提供 `extractFromHtml(html,url) → ExtractedPage`。
  - 完成判定：给定 HTML 能产出 title/markdown/rawText/metadata/wordCount/tokenCount/contentHash。

- [ ] URL 抓取（含 CORS 代理）。
  - 输入：目标 URL。
  - 输出：开发环境走 vite 代理（`/capture-proxy -> 目标`）；生产提供同源反代配置说明；fetch 失败给出可读错误。
  - 完成判定：主流文章页可抓取；CORS 失败有明确提示而非空白。

- [ ] DocumentEntity 落库与去重。
  - 输入：ExtractedPage、`settings.capture`。
  - 输出：`contentHash` 命中则更新现有 document（覆盖 markdown/updatedAt），否则新建；`saveRawHtml`/`compressRawHtml` 开关生效；`source='current-page'`。
  - 完成判定：同 URL 反复抓取不产生重复；抓取失败保留旧内容并提示。

- [ ] fallback 与抓取状态。
  - 输入：defuddle 失败。
  - 输出：用 `<title>` + `body.innerText` 兜底，`extractionMethod='fallback'`；UI 状态 idle/extracting/ready/failed。
  - 完成判定：抓取失败时仍入库兜底文本并标注。

## 验收

- [ ] 粘贴 URL 可抓取并入库（开发环境经代理）。
- [ ] 重复 URL 去重更新。
- [ ] 失败有 fallback 与状态提示。
- [ ] `npm run type-check` 通过。
