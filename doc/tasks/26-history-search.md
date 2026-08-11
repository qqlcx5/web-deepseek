# M26 对话历史搜索

## 模块目标

用 **MiniSearch** 对 Cherry 原生的 `topics[]` + `messages[]` 建全文索引，提供跨 Assistant/Topic 的消息搜索视图，点击结果定位到原话题。**不引入任何新持久化实体**（无 documents），完全 Cherry 兼容。

> 取代已砍的"记忆库/文档库"。依赖：无（基于现有 topics/messages）。

## 涉及文件

- 新增：`src/services/search/index.ts`（MiniSearch 实例 + 增删改 + rebuild）
- 新增：`src/views/search/SearchView.vue`、`src/components/search/SearchBar.vue`、`ResultList.vue`、`ResultItem.vue`、`PreviewDrawer.vue`
- 新增：`src/stores/search.ts`（query/结果/范围/预览）
- 改：`src/router/index.ts`（增 `/search` 路由）、`src/views/chat/ChatPage.vue` 或 App shell（导轨入口）
- 参考：`ai-reader/services/search/index.ts`（仅参考 MiniSearch 配置）

## 子任务

- [x] MiniSearch 索引。
  - 输入：`topics[]`（name）+ `topic.messages[]`（content）。
  - 输出：`fields:['topicName','content','assistantName']`、`storeFields:['topicId','messageId','role','createdAt','assistantId']`、`searchOptions:{boost,fuzzy:0.2,prefix:true}`；提供 `rebuild/upsertTopic/removeTopic/search(q)`。
  - 完成判定：中文基础可搜；增删改 Topic/Message 后索引同步。

- [x] 搜索视图与结果列表。
  - 输入：query、范围（当前助手/全部）。
  - 输出：实时搜索；空 query 展示最近话题；结果按 Topic 分组，命中关键词高亮；每条显示 Topic 名/Assistant/片段/时间。
  - 完成判定：输入即时刷新；空态有引导。

- [x] 跳转与预览。
  - 输入：选中结果。
  - 输出：点击 → 跳对话视图并定位 Topic + 滚动到消息；hover/次级操作 → 右侧抽屉预览前后上下文。
  - 完成判定：跳转后对话视图正确加载该 Topic。

- [x] 索引生命周期。
  - 输入：导入数据/清空数据/启动。
  - 输出：启动时按需 rebuild（懒加载或后台）；导入后 rebuild；清空后 clear；设置内"重建索引"入口。
  - 完成判定：索引与数据一致；不阻塞首屏。

- [x] 性能。
  - 输入：100 Topic / 5000 消息。
  - 输出：索引构建后台进行 + 进度提示；搜索 <100ms。
  - 完成判定：大数据量下不卡顿。

## 数据契约

- 索引是本地派生物，**不持久化进 AppData / 不进 Cherry 导出**；仅由 topics/messages 重建。
- 搜索 store 只持有 query/结果/范围/预览等 UI 态。

## 验收

- [x] 可搜索话题名与消息正文（跨助手）。
- [x] 点击结果定位原话题。
- [x] 增删消息索引同步；导入/清空后可重建。
- [x] Cherry 导入导出格式不受影响。
- [x] `npm run type-check` 通过。
