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
- 顶部搜索按钮 → 搜索视图（带当前助手过滤）。
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
- 附件消息内用 `FilesCard`（EP-X）展示。
- 消息工具栏（hover 显示）：复制 / 点赞踩 / 重生成 / 分支 / 编辑。
- **自动追底** + 上滑不强制拉回 + "回到底部"按钮 + 未读角标。
- **状态：**
  - 空对话 → `Welcome`（EP-X）+ `Prompts`（EP-X）预设提示词。
  - AI 占位 → 打字三点 loading。
  - 流式中 → 逐字增量 + "生成中" + 思考折叠。
  - 停止 → 保留内容 + "已停止"。
  - 失败 → 红色 error block + "重试"。
- **数据**：`topic.messages[]`，每条含 `blocks[]`、`status`、`usage`、`model`、`attachments?`。

### S1.4 输入区（必须用 XSender）

- 用 `XSender`（EP-X）+ `useSend`。
- `submitType` 由设置映射；`loading` = 生成中（显示停止按钮）。
- `#prefix`：附件上传按钮、Token 预估、（可选）"插入网页"URL 按钮。
- `#header`：附件预览栏 `Attachments`（EP-X）；分支回复提示（可关）。
- 离线 banner 在外层。
- **禁用态**：无可用模型 / 缺 Key → 提示去设置。

### S1.5 检查器（右侧，可关）

- Tab：消息大纲 / 元信息。
- 桌面常驻，平板/移动抽屉。

---

## S2 搜索视图

**用途：** 跨助手/话题的消息全文搜索，快速定位历史对话。

**布局：** `[搜索栏 顶]` `[结果列表 主区]` `[预览抽屉 右·可开]`。

### S2.1 搜索栏

- 实时搜索框（MiniSearch 索引 topic 名 + 消息正文）。
- 范围切换：当前助手 / 全部助手。
- 空 query → 展示最近话题（按 updatedAt 倒序）。

### S2.2 结果列表

- 按 Topic 分组；每条结果：Topic 名 / 所属 Assistant / 命中片段（关键词高亮）/ 时间。
- 操作：点击 → 跳对话视图并定位消息；hover → 右侧抽屉预览上下文。
- **空态**：无结果 / 无任何话题 → 引导"开始新对话"。
- **数据**：`topics[]`、`messages[]`（MiniSearch 派生索引）。

### S2.3 预览抽屉

- 展示命中消息前后若干条上下文；"打开完整话题"按钮跳 S1。

---

## S3 设置视图

**用途：** 配置 Provider/模型/助手/外观/上下文/同步/数据。

**布局（桌面）：** `[分组左栏]` `[表单右栏]`；移动端折叠为分组列表 → 详情。

### S3.1 分组

1. **外观**：主题（light/dark/auto）、字号、消息样式（气泡/简洁）、字体、分隔线、数学引擎、代码（行号/可折叠/可换行）、折叠模式。
2. **输入**：发送快捷键、Token 预估、Markdown 渲染输入、删除/重生成确认、自动滚动、粘贴长文本转文件阈值。
3. **Provider 与模型**：Provider CRUD（含类型 openai-compatible/anthropic/ollama）；模型 CRUD + 启用 + 连接测试（UI 态状态灯）。
4. **助手**：Assistant CRUD + 设默认 + systemPrompt + 模型参数（temperature/topP/maxTokens/contextCount）+ 删除引用保护。
5. **上下文**：maxContextTokens、注入开关（元数据/URL/标题）、历史条数。
6. **同步与存储**：远端类型（S3/WebDAV/无）、S3 配置、WebDAV 配置（Cherry 原生字段）、测试连接、自动同步、全量上传/下载、备份列表与回滚。
7. **数据管理**：存储统计、Cherry 导入/导出（默认无 Key）、重建搜索索引、清空数据（二次确认）。

### S3.2 关键交互态

- **连接测试**：按钮 + 状态灯（灰/testing/绿/红）+ 延时/错误。
- **删除引用保护**：被使用的 Provider/模型/Assistant 不可删，提示引用位置。
- **同步状态**：saving/synced/error 顶栏全局可见；安全闸触发 → 明确文案阻止。
- **清空/回滚**：二次确认，文案"不可撤销"。
- **备份 = Cherry JSON 提示**：文案说明"备份文件即 Cherry Studio 可导入的格式"。

---

## S4 全局浮层

### S4.1 命令面板（Cmd/Ctrl+K）

- 搜索 Topic / 设置项 / 操作（新对话、切换模型、切视图）。
- ↑↓ 选择、Enter 确认、Esc 关闭。

### S4.2 Toast / Dialog

- Toast：成功（绿）/失败（红）/警告（黄）/信息，3–4s 自动消失。
- Dialog：确认/编辑表单，遮罩可点关闭（除破坏性操作）。

### S4.3 顶栏全局状态条（可选常驻）

- 在线/离线、保存中/已保存、同步中/已同步/同步失败、当前模型。
