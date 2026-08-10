# M26 记忆库与全文搜索

## 模块目标

参考 ai-reader `services/search/*` 与 Library 视图，用 **MiniSearch** 对 `AppData.documents[]` 建全文索引，提供搜索框、文档列表、打开/删除/回到原网页。索引随 documents 变更增删更新。

> 依赖：M23（documents）。

## 涉及文件

- 新增：`src/services/search/index.ts`（MiniSearch 实例 + 增删改 + rebuild）
- 新增：`src/components/reader/LibraryView.vue`、`SearchBar.vue`、`DocumentList.vue`、`DocumentItem.vue`
- 新增：`src/stores/library.ts`（或扩展 appStore：搜索 query/结果/当前 document）
- 参考：`ai-reader/services/search/index.ts`、`ai-reader/doc/detail.md` §4.5/§12

## 子任务

- [ ] MiniSearch 索引。
  - 输入：documents。
  - 输出：`fields:[title,url,siteName,markdown,excerpt]`、`storeFields:[id,title,url,siteName,excerpt,capturedAt,updatedAt]`、`searchOptions:{boost,fuzzy:0.2,prefix:true}`；提供 `rebuild/addOne/updateOne/removeOne/search(q)`。
  - 完成判定：新增/更新/删除 document 后索引同步；中文基础可搜。

- [ ] 搜索 UI。
  - 输入：搜索 query。
  - 输出：`SearchBar` 实时搜索；空 query 展示最近捕获（按 capturedAt/lastOpenedAt 倒序）；结果按相关性排序。
  - 完成判定：输入即时刷新；空态有引导。

- [ ] 文档列表项。
  - 输入：document。
  - 输出：标题/域名/摘要/抓取时间/更新时间/token 数/同步状态；操作：打开、回到原网页（新 Tab）、删除（确认）。
  - 完成判定：操作齐全；删除前二次确认（`settings.confirmDeleteMessage`）。

- [ ] 打开 document。
  - 输入：选中的 document。
  - 输出：设为当前 document、`lastOpenedAt` 更新、跳转 ContextPanel/ReaderView；不自动覆盖为抓取目标。
  - 完成判定：打开后预览正确；删除当前 document 后切到空态。

- [ ] 索引生命周期。
  - 输入：导入数据/清空数据。
  - 输出：导入后 `rebuild`；清空后 `clear`；提供"重建索引"入口。
  - 完成判定：索引与数据一致。

## 验收

- [ ] 可搜索标题/URL/正文。
- [ ] 增删 document 索引同步。
- [ ] 删除/清空有二次确认。
- [ ] `npm run type-check` 通过。
