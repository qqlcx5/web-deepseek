# 04 逐屏规格

> 每屏：用途 / 布局 / 关键元素 / 状态 / 数据 / 主要操作。数据字段见 `07-data-reference.md`。
> 组件名带 `EP-X` 前缀 = `vue-element-plus-x`；带 `EP` = Element Plus。

---

## S1 对话视图 — 主屏

**用途：** 与 AI 流式对话的核心场景。

**布局（桌面）：** `[Assistant/Topic 侧栏]` `[消息区]` `[检查器·可关]`；顶有 Topbar，底有 Composer。

### S1.1 侧栏（Assistant + Topic）

- 顶部：Assistant 横向 tab / 列表（切换）；"新建助手"入口。
- 中部：`Conversations`（EP-X）渲染 Topic 列表，分组「置顶 / 最近」。
- 顶部搜索按钮 → 命令面板。
- Topic 右键菜单：重命名（内联）/ 置顶 / 清空消息 / 删除（确认）。
- **空态**：该 Assistant 无 Topic → 引导"开始新对话"。
- **数据**：`assistants[]`、`topics[]`（按 pinned + updatedAt 排序）。

### S1.2 Topbar

- 左：侧栏开关、当前 Topic 名（可内联重命名）、聚焦模式。
- 中：**上下文 banner**（当前 Assistant · 模型 · Provider 就绪状态：已就绪/缺 Key/未配置模型）。
- 右：模型选择按钮（显示当前模型名）、检查器开关、设置入口。
- **断网 banner**：顶部黄色"网络已断开"。

### S1.3 消息区（核心，必须用组件）

- 用 `BubbleList`（EP-X）+ `Bubble`（EP-X）渲染。
- 用户消息 `placement=end`，AI 消息 `placement=start` + 头像。
- 正文用 `XMarkdown`（EP-X）。
- thinking 用 `Thinking`（EP-X）；error 红块；citation/tool 自定义块；usage tokens。
- 消息工具栏（hover 显示）：复制 / 点赞踩 / 重生成 / 分支 / 编辑。
- **自动追底** + 上滑不强制拉回 + "回到底部"按钮 + 未读角标。
- **状态：**
  - 空对话 → `Welcome`（EP-X）+ `Prompts`（EP-X）预设提示词。
  - AI 占位 → 打字三点 loading。
  - 流式中 → 逐字增量 + "生成中" + 思考折叠。
  - 停止 → 保留内容 + "已停止"。
  - 失败 → 红色 error block + "重试"。
- **数据**：`topic.messages[]`，每条含 `blocks[]`、`status`、`usage`、`model`。

### S1.4 输入区（必须用 XSender）

- 用 `XSender`（EP-X）+ `useSend`。
- `submitType` 由设置映射；`loading` = 生成中（显示停止按钮）。
- `#prefix`：附件上传按钮、Token 预估。
- `#header`：附件预览栏 `Attachments`（EP-X）/`FilesCard`（EP-X）；分支回复提示（可关）。
- 离线 banner 在外层。
- **禁用态**：无可用模型 / 缺 Key → 提示去设置。

### S1.5 检查器（右侧，可关）

- Tab：消息大纲 / 当前文档预览 / 元信息。
- 桌面常驻，平板/移动抽屉。

---

## S2 阅读视图

**用途：** 抓取网页 → 预览 → 基于此文档对话。

**布局：** `[抓取栏 顶]` `[预览主区]` `[对话抽屉 右·可开]`。

### S2.1 抓取栏

- URL 输入框 + "抓取"按钮 + "重新抓取"（已有文档时）。
- 状态指示：`idle / extracting / ready / cached / failed`（灰/loading/绿/蓝/红 点）。
- token 估算、来源（当前抓取 / 历史文档）。
- **失败态**：可读错误（CORS / 网络超时）+ "重试"；fallback 时标注"已用备用文本提取"。

### S2.2 预览主区（三级 Tab）

- **Markdown**：`XMarkdown` 渲染；复制 Markdown；代码块可复制/查看。
- **Raw**：深色等宽，保留换行；可切 rawText/rawMarkdown/rawHtml；复制。
- **Metadata**：表格列出 title/url/canonicalUrl/siteName/author/description/publishedAt/capturedAt/updatedAt/wordCount/tokenCount/extractionMethod/contentHash/source/syncStatus。
- **空态**：未抓取 → 引导粘贴 URL。
- **数据**：当前 `DocumentEntity`。

### S2.3 对话抽屉

- "基于此文档对话"按钮 → 打开抽屉，内嵌精简对话（同 S1.3/S1.4）。
- 顶栏 banner："已挂载上下文：{title}"。
- 文档作为事实材料注入（不写死 AI 身份）。

---

## S3 记忆库视图

**用途：** 浏览 / 搜索 / 管理本地文档。

**布局：** `[搜索栏 顶]` `[文档列表 主区]`。

### S3.1 搜索栏

- 实时搜索框（MiniSearch）。
- 空 query → 展示"最近捕获"（按 capturedAt/lastOpenedAt 倒序）。
- 排序/筛选（可选）：时间、站点、同步状态。

### S3.2 文档列表

- 文档项：标题 / 域名 / 摘要 / 抓取时间 / 更新时间 / token 数 / 同步状态徽标。
- 操作（hover 或菜单）：打开、回到原网页（新 Tab）、删除（确认）。
- **空态**：无文档 → 引导去阅读视图抓取。
- **数据**：`documents[]`。

### S3.3 删除确认

- 二次确认 Dialog；删除当前文档后切空态。

---

## S4 设置视图

**用途：** 配置 Provider/模型/助手/外观/上下文/抓取/同步/数据。

**布局（桌面）：** `[分组左栏]` `[表单右栏]`；移动端折叠为分组列表 → 详情。

### S4.1 分组

1. **外观**：主题（light/dark/auto）、字号、消息样式（气泡/简洁）、字体、分隔线、数学引擎、代码（行号/可折叠/可换行）、折叠模式。
2. **输入**：发送快捷键、Token 预估、Markdown 渲染输入、删除/重生成确认、自动滚动、粘贴长文本转文件阈值。
3. **Provider 与模型**：Provider CRUD；模型 CRUD + 启用 + 测试连接 + 每模型 systemPrompt/contextWindow/temperature。
4. **助手**：Assistant CRUD + 设默认 + 删除引用保护。
5. **上下文**：maxContextTokens、注入开关（元数据/URL/标题/抓取时间）、历史条数。
6. **抓取**：自动抓取开关（SPA 下标注部分不生效）、preferCache、saveRawHtml、compressRawHtml。
7. **同步与存储**：远端类型（S3/WebDAV/无）、S3 配置、WebDAV 配置、测试连接、自动同步、全量上传/下载、备份列表与回滚。
8. **数据管理**：存储统计、Cherry 导入/导出（默认无 Key）、重建索引、清空数据（二次确认）。

### S4.2 关键交互态

- **连接测试**：按钮 + 状态灯（灰/testing/绿/红）+ 延时/错误。
- **删除引用保护**：被使用的 Provider/模型/Assistant 不可删，提示引用位置。
- **同步状态**：saving/synced/error 顶栏全局可见；安全闸触发 → 明确文案阻止。
- **清空/回滚**：二次确认，文案"不可撤销"。

---

## S5 全局浮层

### S5.1 命令面板（Cmd/Ctrl+K）

- 搜索 Topic / 文档 / 设置项 / 操作（新对话、切换模型、抓取）。
- ↑↓ 选择、Enter 确认、Esc 关闭。

### S5.2 Toast / Dialog

- Toast：成功（绿）/失败（红）/警告（黄）/信息，3–4s 自动消失。
- Dialog：确认/编辑表单，遮罩可点关闭（除破坏性操作）。

### S5.3 顶栏全局状态条（可选常驻）

- 在线/离线、保存中/已保存、同步中/已同步/同步失败、当前模型。
