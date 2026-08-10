# 01 产品定位与范围

## 1.1 产品一句话

**Orbit Chat** 是一个本地优先（local-first）的 Web 应用：自配 API Key 与多家大模型对话，抓取网页存入本地知识库并全文搜索，用 S3 / WebDAV 备份全部数据。数据存在浏览器 IndexedDB，用户完全可控。

## 1.2 目标用户

- 个人用户，愿意自己配置 OpenAI / Anthropic / Ollama 等 API Key。
- 重视数据自主：不想要强制云端账户，想能导入导出、自己备份。
- 同时有"和 AI 聊"与"读网页 + 沉淀知识"两类需求。

## 1.3 核心目标（UI 必须支撑）

1. **多 Provider 对话**：OpenAI 兼容 / Anthropic / Ollama 三类 Provider，流式正文 + 思考 + 错误 + 引用 + 工具块；可停止 / 重生成 / 分支。
2. **助手与话题管理**：多 Assistant（独立提示词 + 模型 + 参数），每个 Assistant 下多 Topic（置顶 / 重命名 / 搜索 / 删除）。
3. **网页阅读**：粘贴 URL 抓取正文（defuddle），Markdown / Raw / Metadata 三视图预览，存为 Document。
4. **本地知识库**：对 Document 全文搜索（MiniSearch），打开 / 删除 / 回到原网页。
5. **基于网页对话**：把当前 Document 作为上下文注入对话。
6. **云备份**：S3 / WebDAV 全量上传 / 下载 / 版本回滚，带安全闸。
7. **数据可控**：Cherry Studio v5 格式导入导出（兼容生态），清空数据二次确认。

## 1.4 范围：做什么（IN）

| 领域 | 包含 |
|---|---|
| 对话 | Provider/模型选择、Assistant/Topic CRUD、流式、停止/重生成/分支、内容块（正文/思考/错误/引用/工具）、附件、Token 用量、话题自动命名 |
| 多 Provider | OpenAI 兼容、Anthropic、Ollama；每模型独立 systemPrompt / contextWindow / 温度；连接测试 |
| 阅读 | URL 抓取、defuddle 提取、fallback、Document 实体、Markdown/Raw/Metadata 预览、手动刷新 |
| 记忆库 | MiniSearch 全文搜索、文档列表、打开/删除/回原网页、重建索引 |
| 同步 | S3、WebDAV、快照上传/下载、版本备份回滚、大批量删除安全闸、自动同步开关 |
| 设置 | 外观（主题/字号/消息样式/代码/数学）、上下文设置、抓取设置、同步配置、存储统计、数据管理（导入/导出/清空） |
| 通用 | 响应式（桌面三栏/平板双栏/移动抽屉）、明暗主题、中英文、键盘快捷键、可访问性 |

## 1.5 范围：不做什么（OUT）

- RSS / 订阅源 / Feed 相关功能与界面。
- AI 自动化 / 定时任务 / 任务队列 / 规则引擎相关功能与界面。
- 服务端账户、云端多人协作、团队 / 组织空间。
- 多端 entity 级自动冲突合并（同步 v1 为快照模式，仅上下传 + 回滚 + 安全闸）。
- 服务端密钥托管（Key 只存本地 IndexedDB，默认导出剔除）。
- 绘图 / 知识库（RAG）/ MCP / 笔记 / 翻译历史等 Cherry Studio 高级模块（不在本期）。

## 1.6 技术约束（影响 UI 设计）

| 约束 | 对设计的影响 |
|---|---|
| **Vite SPA**（非浏览器扩展） | 不能"抓取当前浏览器 Tab"，阅读入口是"粘贴 URL"；CORS 限制需提示 |
| **本地优先 IndexedDB** | 所有数据在本地，"保存中 / 已保存 / 同步中"状态要在顶栏可见 |
| **组件库 `vue-element-plus-x`** | 对话/输入/列表等优先用其组件（Bubble / BubbleList / XSender / Conversations / Welcome / Prompts / Attachments / FilesCard / Thinking / ThoughtChain / XMarkdown / ConfigProvider），通用 UI 用 Element Plus |
| **CORS** | S3/WebDAV 直连可能失败，连接测试与抓取的失败态要设计好 |
| **单记录数据模型** | 同步是"整库快照"，不是单条合并——UI 不需要细粒度冲突解决 |

## 1.7 关键非功能要求

- **响应式**：桌面 ≥1180px / 平板 760–1180px / 移动 ≤760px 三态可用。
- **可恢复**：刷新后数据完整恢复；流式中断保留已收内容。
- **可访问性**：所有图标按钮有 tooltip 或 aria-label；键盘可触发主要操作。
- **性能**：100 Topic / 5000 消息下打开会话不卡顿；长文档预览流畅。
- **安全**：默认导出不含 API Key；本地密钥存储有风险提示。
