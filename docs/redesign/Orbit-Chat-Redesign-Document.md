# Orbit Chat 重设计文档

## 01 产品定位与范围

**Orbit Chat** 是一个本地优先的多 Provider AI 对话 Web 应用：用户自配 API Key，与 OpenAI 兼容 / Anthropic / Ollama 多家大模型流式对话；用 S3 / WebDAV 备份全部数据。数据存在浏览器 IndexedDB，与 Cherry Studio 数据格式互通。

### 目标用户
- 个人用户，愿意自己配置 OpenAI / Anthropic / Ollama 等 API Key。
- 重视数据自主：不想要强制云端账户，想能导入导出、自己备份。
- 主要诉求是“和多模型聊天 + 管理历史对话 + 数据可备份迁移”。

### 核心目标
1. 多 Provider 对话（流式正文 + 思考 + 错误 + 引用 + 工具块；可停止/重生成/分支）。
2. 助手与话题管理（多 Assistant，每个下多 Topic 置顶/重命名/搜索/删除）。
3. 对话历史搜索（跨所有 Assistant/Topic 的消息全文搜索）。
4. 基于内容对话（通过附件/粘贴/URL 插入，把长文本或网页正文作为消息附件喂给 AI）。
5. 云备份（S3/WebDAV 全量上传/下载/版本回滚，备份即 Cherry 导出格式）。
6. 数据可控（Cherry Studio v5 格式导入导出，清空数据二次确认）。

### 范围：做什么（IN）
- 对话：Provider/模型选择、Assistant/Topic CRUD、流式、停止/重生成/分支、内容块（正文/思考/错误/引用/工具）、附件、Token 用量、话题自动命名。
- 多 Provider：OpenAI 兼容、Anthropic、Ollama；连接测试。
- 对话历史搜索：MiniSearch 全文索引。
- 附件：图片/文档上传、粘贴长文本转附件、URL 插入正文（作为附件）。
- 同步：S3/WebDAV 快照上传/下载/版本备份回滚、大批量删除安全闸。
- 设置：外观/输入/上下文/同步/存储/数据管理。
- 通用：响应式（桌面/平板/移动）、明暗主题、中英文、键盘快捷键、可访问性。

### 范围：不做什么（OUT）
- 网页抓取/阅读视图/文档库（浏览器扩展形态）。
- RSS/订阅源/Feed。
- AI 自动化/定时任务/任务队列。
- 服务端账户、多人协作、团队空间。
- entity 级三方合并冲突解决 UI。
- 把网页内容喂给 AI 用“附件/粘贴/URL 插入附件”实现，不建独立文档实体。

### 技术约束
- Vite SPA（非浏览器扩展）。
- 本地优先 IndexedDB（保存中/已保存/同步中状态要在顶栏可见）。
- 组件库 `vue-element-plus-x`（优先用 Bubble/XSender/Conversations 等）。
- Cherry 数据兼容（模型参数归 Assistant）。
- CORS（S3/WebDAV 直连与 URL 抓取可能失败，失败态要设计好）。

### 关键非功能要求
- 响应式：桌面 ≥1180px / 平板 760–1180px / 移动 ≤760px。
- 可恢复：刷新后数据完整恢复。
- 可访问性：所有图标按钮有 tooltip 或 aria-label。
- 性能：100 Topic / 5000 消息下打开会话与搜索不卡顿。

## 02 功能清单（按领域 + 优先级）

### F1 对话（Chat）
| ID | 功能 | 优先级 | 关键状态/说明 |
|---|---|---|---|
| F1.1 | 选择 Provider/模型 | P0 | 仅显示启用项 |
| F1.2 | 创建/切换/删除 Assistant | P0 | 必有且仅有一个默认 Assistant |
| F1.3 | Topic 新建/切换/重命名/置顶/删除/清空 | P0 | 置顶优先 + 更新时间倒序 |
| F1.4 | 流式正文输出 | P0 | 逐字增量（必须修复） |
| F1.5 | 思考内容（thinking）折叠展示 | P0 | 流式中"思考中"，结束可折叠 |
| F1.6 | 停止生成 | P0 | 保留已收内容，状态=已停止 |
| F1.7 | 重新生成 / 分支 | P1 | 不重复占位消息；分支切换 |
| F1.8 | 错误块 + 可重试 | P0 | 网络/认证/服务端错误红色块 |
| F1.9 | 引用 / 工具块渲染 | P1 | block 顺序按数据 |
| F1.10 | 消息复制 / 点赞踩 / 编辑重发 | P1 | hover 工具栏 |
| F1.11 | Token 用量展示 | P1 | prompt/completion/total |
| F1.12 | 话题自动命名 | P2 | 首条用户消息生成，≤30 字 |
| F1.13 | 草稿持久 | P2 | 未发送内容刷新不丢 |

### F2 多 Provider 与模型
| ID | 功能 | 优先级 | 说明 |
|---|---|---|---|
| F2.1 | Provider CRUD | P0 | providerType ∈ openai-compatible/anthropic/ollama |
| F2.2 | 模型 CRUD + 启用 | P0 | 仅含身份字段 |
| F2.3 | 三类 Provider 适配 | P0 | 统一适配器接口 |
| F2.4 | Assistant 级 systemPrompt | P0 | `Assistant.prompt` |
| F2.5 | Assistant 级模型参数 | P1 | temperature/topP/maxTokens/contextCount |
| F2.6 | 连接测试 | P1 | 状态灯：灰/testing/绿/红 |
| F2.7 | 删除引用保护 | P1 | 被 Assistant 使用的模型不可静默删 |

### F3 对话历史搜索
| ID | 功能 | 优先级 | 说明 |
|---|---|---|---|
| F3.1 | 全文搜索（MiniSearch） | P0 | 索引 topic 名 + 消息正文 |
| F3.2 | 结果分组/高亮 | P1 | 按 Topic 分组，命中关键词高亮 |
| F3.3 | 跳转原话题 | P0 | 点击结果定位到对应 Topic 与消息 |
| F3.4 | 跨 Assistant 搜索 | P1 | 可选范围：当前助手 / 全部 |
| F3.5 | 索引随数据更新 | P0 | 增删改消息后索引同步 |
| F3.6 | 重建索引 | P2 | 导入/清空后 |

### F4 附件与内容注入
| ID | 功能 | 优先级 | 说明 |
|---|---|---|---|
| F4.1 | 文件上传（图片/文档） | P1 | 输入区预览 + 消息内文件卡 |
| F4.2 | 粘贴长文本转附件 | P1 | settings.pasteLongTextAsFile + 阈值 |
| F4.3 | URL 插入正文（可选） | P2 | 输入框"插入网页"→抓取→作为本条消息附件 |
| F4.4 | 附件预览/移除 | P1 | Attachments + FilesCard |
| F4.5 | 失败提示 | P1 | 类型不支持/超限 |

### F5 同步与存储
| ID | 功能 | 优先级 | 说明 |
|---|---|---|---|
| F5.1 | S3 配置 + 测试 | P0 | aws4fetch；path-style/virtual-hosted |
| F5.2 | WebDAV 配置 + 测试 | P0 | webdav 库 |
| F5.3 | 全量上传 / 全量下载 | P0 | 快照模式；备份即 Cherry JSON |
| F5.4 | 版本备份 + 回滚 | P1 | data.backup-*.json，保留数可配 |
| F5.5 | 大删除安全闸 | P0 | 疑似空库时阻止并提示 |
| F5.6 | 自动同步开关 | P2 | 顶栏状态：saving/synced/error |
| F5.7 | 存储统计 | P1 | 话题/消息/模型数 + 占用 |
| F5.8 | 清空本地数据 | P0 | 二次确认 |
| F5.9 | Cherry 导入 / 导出 | P0 | 默认导出无 Key |
| F5.10 | 密钥掩码 + 导出剔除 | P0 | 安全 |

### F6 设置
| ID | 功能 | 优先级 | 说明 |
|---|---|---|---|
| F6.1 | 外观（主题/字号/消息样式/字体/分隔线/数学引擎/代码三件套） | P1 | 即时生效 |
| F6.2 | 输入（发送快捷键/Token 预估/Markdown 渲染输入/删除确认/自动滚动/粘贴阈值） | P1 | 即时生效 |
| F6.3 | 上下文设置（maxTokens/注入开关/历史条数） | P1 | 驱动 Prompt 组装 |
| F6.4 | 同步配置（S3/WebDAV/自动同步） | P0 | 承接 F5 |
| F6.5 | 数据管理（导入/导出/清空/重建索引） | P0 | 承接 F5 |

### F7 通用（App Shell）
| ID | 功能 | 优先级 | 说明 |
|---|---|---|---|
| F7.1 | 一级导航（对话/搜索/设置） | P0 | 跨视图不丢状态 |
| F7.2 | 命令面板（搜索/跳转） | P1 | Cmd/Ctrl+K |
| F7.3 | 响应式三态 | P0 | 桌面/平板/移动 |
| F7.4 | 明暗主题 + auto | P0 | 跟随系统 |
| F7.5 | 中英文 | P1 | — |
| F7.6 | 全局 Toast / Dialog | P0 | 成功/失败/警告/确认 |
| F7.7 | 键盘快捷键 | P1 | 新对话/搜索/发送/停止 |
| F7.8 | 顶栏全局状态（在线/保存/同步） | P1 | — |

## 03 信息架构

### 现状与问题
当前只有单一"对话页"（侧栏 + 消息 + 输入）。需要明确一级导航，并把"对话历史搜索"和"同步/数据管理"提升为可见入口，同时不让对话体验变重。

### 推荐信息架构：左侧导轨 + 主区

```
┌──────┬─────────────────────────────────────────────┐
│ 导轨  │            主区（随视图切换）                  │
│ Rail │                                              │
│ 💬   │  对话视图 / 搜索视图 / 设置视图                │
│ 🔍   │                                              │
│ ⚙️   │                                              │
│ ───  │                                              │
│ 🌗👤 │  主题切换 · 数据/同步状态                       │
└──────┴─────────────────────────────────────────────┘
```

### 一级视图
| 视图 | 图标 | 核心 |
|---|---|---|
| 对话 Chat | 💬 | Assistant/Topic 侧栏 + 消息流 + 输入框 |
| 搜索 Search | 🔍 | 跨助手/话题的消息全文搜索 + 结果定位 |
| 设置 Settings | ⚙️ | 分组设置（外观/输入/Provider/Assistant/上下文/同步/数据） |

**导轨底部：** 主题切换、数据/同步状态指示、用户名（可选）。

### 备选 IA
- **B. 对话为中心 + 命令面板**：搜索不独立成视图，只用 Cmd+K 命令面板做全局搜索/跳转。优点是对话沉浸；缺点是搜索发现性弱。
- **C. 搜索并入对话侧栏**：侧栏顶部一个搜索框，过滤当前助手的话题/消息。优点是轻；缺点是不能跨助手、不能全文。

**推荐 A（导轨 3 视图）**：搜索独立视图支持跨助手全文检索与结果列表。

### 视图间跳转规则
| 触发 | 行为 |
|---|---|
| 搜索点结果 | → 对话视图，定位到对应 Topic 与消息 |
| 对话侧栏搜索按钮 | → 搜索视图（带当前助手过滤） |
| 命令面板（任意视图 Cmd+K） | 跳任意 Topic / 视图 / 设置项 |
| 设置改外观/输入 | 当前视图即时生效，不跳转 |
| 顶栏同步状态点击 | → 设置·同步分组 |

**不丢状态原则：** 切换视图不清空对话草稿、不中断流式、不重置当前 Topic/模型。

### 响应式布局
#### 桌面 ≥1180px
- 导轨（固定窄列，~60px 图标）+ 主区。
- 对话视图：主区内再分 [Assistant/Topic 侧栏 276px] + [消息区] + [检查器 304px，可关]。
- 搜索视图：[搜索栏 顶] + [结果列表 主区]；点结果可右侧抽屉预览消息上下文。
- 设置视图：[分组左栏] + [表单右栏]。

#### 平板 760–1180px
- 导轨保留。
- 对话视图：隐藏固定检查器，改抽屉入口；侧栏可折叠。
- 搜索视图：结果全宽；预览改为覆盖式。

#### 移动 ≤760px
- 导轨降级为**底部导航**（对话/搜索/设置 3 项 + 安全区）。
- 对话视图：侧栏/检查器均为覆盖式抽屉 + 遮罩。
- 输入区上浮，不被底部导航遮挡（padding-bottom = 底栏高）。
- 所有文字/控件窄屏可用，无横向溢出。

### 全局层级（z-index 约定）
| 层 | z | 内容 |
|---|---|---|
| 内容 | 0–10 | 视图、侧栏、检查器 |
| 浮层 | 20–40 | 抽屉、下拉、回底按钮 |
| 遮罩 | 55–70 | 抽屉/模态背景 |
| 模态 | 80 | 设置/编辑弹窗 |
| Toast | 100 | 全局提示 |

### 导航状态持久
- 当前视图、当前 Assistant/Topic、当前模型、各视图滚动位置，刷新后恢复。
- 草稿、未发送附件跨视图保留。

## 04 逐屏规格

### S1 对话视图 — 主屏
**用途：** 与 AI 流式对话的核心场景。

**布局（桌面）：** `[Assistant/Topic 侧栏]` `[消息区]` `[检查器·可关]`；顶有 Topbar，底有 Composer。

#### S1.1 侧栏（Assistant + Topic）
- 顶部：Assistant 横向 tab / 列表（切换）；"新建助手"入口。
- 中部：Conversations（EP-X）渲染 Topic 列表，分组「置顶 / 最近」。
- 顶部搜索按钮 → 搜索视图（带当前助手过滤）。
- Topic 右键菜单：重命名（内联）/ 置顶 / 清空消息 / 删除（确认）。
- 空态：该 Assistant 无 Topic → 引导"开始新对话"。
- 数据：assistants[]、topics[]（按 pinned + updatedAt 排序）。

#### S1.2 Topbar
- 左：侧栏开关、当前 Topic 名（可内联重命名）、聚焦模式。
- 中：上下文 banner（当前 Assistant · 模型 · Provider 就绪状态：已就绪/缺 Key/未配置模型）。
- 右：模型选择按钮（显示当前模型名）、检查器开关、设置入口。
- 断网 banner：顶部黄色"网络已断开"。

#### S1.3 消息区（核心，必须用组件）
- 用 BubbleList（EP-X）+ Bubble（EP-X）渲染。
- 用户消息 placement=end，AI 消息 placement=start + 头像。
- 正文用 XMarkdown（EP-X）。
- thinking 用 Thinking（EP-X）；error 红块；citation/tool 自定义块；usage tokens。
- 附件消息内用 FilesCard（EP-X）展示。
- 消息工具栏（hover 显示）：复制 / 点赞踩 / 重生成 / 支 持 / 编辑。
- 自动追底 + 上滑不强制拉回 + "回到底部"按钮 + 未读角标。
- 状态：
  - 空对话 → Welcome（EP-X）+ Prompts（EP-X）预设提示词。
  - AI 占位 → 打字三点 loading。
  - 流式中 → 逐字增量 + "生成中" + 思考折叠。
  - 停止 → 保留内容 + "已停止"。
  - 失败 → 红色 error block + "重试"。
- 数据：topic.messages[]，每条含 blocks[]、status、usage、model、attachments?。

#### S1.4 输入区（必须用 XSender）
- 用 XSender（EP-X）+ useSend。
- submitType 由设置映射；loading = 生成中（显示停止按钮）。
- #prefix：附件上传按钮、Token 预估、（可选）"插入网页"URL 按钮。
- #header：附件预览栏 Attachments（EP-X）；分支回复提示（可关）。
- 离线 banner 在外层。
- 禁用态：无可用模型 / 缺 Key → 提示去设置。

#### S1.5 检查器（右侧，可关）
- Tab：消息大纲 / 元信息。
- 桌面常驻，平板/移动抽屉。

### S2 搜索视图
**用途：** 跨助手/话题的消息全文搜索，快速定位历史对话。

**布局：** `[搜索栏 顶]` `[结果列表 主区]` `[预览抽屉 右·可开]`。

#### S2.1 搜索栏
- 实时搜索框（MiniSearch 索引 topic 名 + 消息正文）。
- 范围切换：当前助手 / 全部助手。
- 空 query → 展示最近话题（按 updatedAt 倒序）。

#### S2.2 结果列表
- 按 Topic 分组；每条结果：Topic 名 / 所属 Assistant / 命中片段（关键词高亮）/ 时间。
- 操作：点击 → 跳对话视图并定位消息；hover → 右侧抽屉预览上下文。
- 空态：无结果 / 无任何话题 → 引导"开始新对话"。
- 数据：topics[]、messages[]（MiniSearch 派生索引）。

#### S2.3 预览抽屉
- 展示命中消息前后若干条上下文；"打开完整话题"按钮跳 S1。

### S3 设置视图
**用途：** 配置 Provider/模型/助手/外观/上下文/同步/数据。

**布局（桌面）：** `[分组左栏]` `[表单右栏]`；移动端折叠为分组列表 → 详情。

#### S3.1 分组
1. **外观**：主题（light/dark/auto）、字号、消息样式（气泡/简洁）、字体、分隔线、数学引擎、代码（行号/可折叠/可换行）、折叠模式。
2. **输入**：发送快捷键、Token 预估、Markdown 渲染输入、删除/重生成确认、自动滚动、粘贴长文本转文件阈值。
3. **Provider 与模型**：Provider CRUD（含类型 openai-compatible/anthropic/ollama）；模型 CRUD + 启用 + 连接测试（UI 态状态灯）。
4. **助手**：Assistant CRUD + 设默认 + systemPrompt + 模型参数（temperature/topP/maxTokens/contextCount）+ 删除引用保护。
5. **上下文**：maxContextTokens、注入开关（元数据/URL/标题）、历史条数。
6. **同步与存储**：远端类型（S3/WebDAV/无）、S3 配置、WebDAV 配置（Cherry 原生字段）、测试连接、自动同步、全量上传/下载、备份列表与回滚。
7. **数据管理**：存储统计、Cherry 导入/导出（默认无 Key）、重建搜索索引、清空数据（二次确认）。

#### S3.2 关键交互态
- **连接测试**：按钮 + 状态灯（灰/testing/绿/红）+ 延时/错误。
- **删除引用保护**：被使用的 Provider/模型/Assistant 不可删，提示引用位置。
- **同步状态**：saving/synced/error 顶栏全局可见；安全闸触发 → 明确文案阻止。
- **清空/回滚**：二次确认，文案"不可撤销"。
- **备份 = Cherry JSON 提示**：文案说明"备份文件即 Cherry Studio 可导入的格式"。

### S4 全局浮层
#### S4.1 命令面板（Cmd/Ctrl+K）
- 搜索 Topic / 设置项 / 操作（新对话、切换模型、切视图）。
- ↑↓ 选择、Enter 确认、Esc 关闭。

#### S4.2 Toast / Dialog
- Toast：成功（绿）/失败（红）/警告（黄）/信息，3–4s 自动消失。
- Dialog：确认/编辑表单，遮罩可点关闭（除破坏性操作）。

#### S4.3 顶栏全局状态条（可选常驻）
- 在线/离线、保存中/已保存、同步中/已同步/同步失败、当前模型。

## 05 设计系统

### 颜色令牌（CSS 变量）

#### Light（`:root`）
| 令牌 | 值 | 用途 |
|---|---|---|
| `--brand` | `#5b56d6` | 主品牌色（按钮/链接/聚焦） |
| `--brand-hover` | `#4a45bd` | 品牌 hover |
| `--brand-soft` | `#efefff` | 品牌浅底（气泡/选中） |
| `--text` | `#172033` | 主文本 |
| `--text-secondary` | `#475467` | 次文本 |
| `--muted` | `#667085` | 弱文本 |
| `--faint` | `#98a2b3` | 占位/极弱 |
| `--line` | `#e5e7eb` | 分隔线 |
| `--line-strong` | `#d0d5dd` | 强分隔/输入边 |
| `--surface` | `#ffffff` | 主面板 |
| `--surface-2` | `#f8fafc` | 次面板/背景 |
| `--surface-3` | `#f2f4f7` | 三级/hover 底 |
| `--surface-hover` | `#f0f1f3` | hover |
| `--success` | `#16875d` | 成功 |
| `--danger` | `#d92d20` | 危险/错误 |
| `--warning` | `#b54708` | 警告 |
| `--code-bg` | `#18212f` | 代码块底 |
| `--code-text` | `#dbe5f1` | 代码块字 |

#### Dark（`:root.dark`）
| 令牌 | 值 |
|---|---|
| `--brand` | `#7c7aff` |
| `--brand-hover` | `#6a64f0` |
| `--brand-soft` | `#1e1d3a` |
| `--text` | `#e4e7ec` |
| `--text-secondary` | `#b8c0d0` |
| `--muted` | `#8a94a6` |
| `--faint` | `#5e6878` |
| `--line` | `#2a2e3a` |
| `--line-strong` | `#3a3f4d` |
| `--surface` | `#15171c` |
| `--surface-2` | `#1a1d24` |
| `--surface-3` | `#22252e` |
| `--surface-hover` | `#2a2e38` |
| `--success` | `#2eb886` |
| `--danger` | `#ff6b6b` |
| `--warning` | `#e8a040` |
| `--code-bg` | `#0f1117` |
| `--code-text` | `#c8d3e8` |

### 布局令牌
| 令牌 | 值 | 说明 |
|---|---|---|
| `--sidebar` | `276px` | 对话侧栏宽 |
| `--inspector` | `304px` | 检查器宽 |
| `--header` | `60px` | 顶栏高 |
| `--mobile-nav` | `58px` | 移动底栏高 |
| `--composer-max` | `820px` | 输入区最大宽 |
| `--message-max` | `820px` | 消息列表最大宽 |

### 圆角 / 阴影 / 过渡 / 字体
| 令牌 | 值 |
|---|---|
| `--radius-sm/md/lg/xl` | `4 / 6 / 8 / 12px` |
| `--shadow-sm` | `0 1px 3px rgba(16,24,40,.06)` |
| `--shadow-md` | `0 6px 20px rgba(16,24,40,.07)` |
| `--shadow-lg` | `0 24px 70px rgba(16,24,40,.24)` |
| `--transition-fast` | `140ms ease` |
| `--transition-base` | `200ms ease` |
| 字体 | Inter（sans）/ DM Mono（mono）/ 中文 PingFang SC、Microsoft YaHei |
| z-index | 内容 0–10 / 浮层 20–40 / 遮罩 55–70 / 模态 80 / Toast 100 |

### 组件库清单（优先使用）
#### `vue-element-plus-x`（对话场景专用）
| 组件 | 用途 | 本期是否用 |
|---|---|---|
| `ConfigProvider` | 全局语言/主题注入 | ✅ 已用 |
| `Welcome` | 空状态欢迎页 | ✅ 已用，需接入消息空态 |
| `Prompts` | 预设提示词面板 | ❌ 待用（空状态） |
| `Conversations` | 会话/话题列表（分组/菜单） | ❌ 待用（侧栏） |
| `XSender` | 输入发送框（快捷键/状态/插槽） | ❌ 待用（输入区，**最高优先**） |
| `BubbleList` | 消息列表（虚拟滚动/追底/未读） | ❌ 待用（消息区，**最高优先**） |
| `Bubble` | 单条消息气泡 | ❌ 待用 |
| `XMarkdown` | Markdown 渲染（代码/公式/mermaid） | ❌ 待用（替换裸 MarkdownRenderer） |
| `Thinking` | 思考过程折叠 | ✅ 已用 |
| `Attachments` | 附件预览栏 | ✅ 已用（输入区） |
| `FilesCard` | 文件卡片 | ❌ 待用（消息内附件） |
| `useSend` | 发送/停止加载态 hook | ❌ 待用 |
| `useXStream` / `XRequest` | 流式请求控制 | ❌ 待用 |

#### Element Plus（通用 UI）
按钮 `ElButton`、对话框 `ElDialog`、抽屉 `ElDrawer`、输入 `ElInput`、下拉 `ElSelect`、开关 `ElSwitch`、单选 `ElRadio`、滑块 `ElSlider`、表单 `ElForm`、消息 `ElMessage`、标签 `ElTag`、头像 `ElAvatar`、工具提示 `ElTooltip`、下拉菜单 `ElDropdown` 等。

### 必须设计的"状态枚举"
#### 消息状态机（`MessageStatus`）
`sending → streaming → complete` ｜异常 `error` ｜用户取消 `stopped`

| 状态 | UI |
|---|---|
| sending | 占位 + 三点 loading |
| streaming | 逐字增量 + "生成中" + 思考可折叠 |
| complete | 正常 + usage + 工具栏 |
| error | 红色 error block + 重试 |
| stopped | 保留内容 + "已停止" |

#### 内容块类型（`MessageBlockType`）
`main_text`（正文）/ `thinking`（思考）/ `error` / `citation`（引用）/ `tool`（工具）/ `unknown`

#### 连接测试状态
`untested` 灰 / `testing` loading / `success` 绿 + 延时 / `failed` 红 + 错误

#### 同步状态
`saving` / `saved` / `syncing` / `synced` / `error`（顶栏徽标）

#### Provider 就绪状态（顶栏 banner）
`已就绪`（绿勾）/ `缺少 API Key`（黄）/ `未配置模型`（黄）/ `离线`（红）

#### 搜索状态
`idle` / `searching`（loading）/ `有结果` / `无结果` / `空库`（无任何话题）

### 通用模式
- **空态**：图标 + 标题 + 一句引导 + 主操作按钮（用 `Welcome` 或自定义）。
- **加载态**：骨架屏（列表）/ 三点（消息）/ 环形（按钮内）。
- **错误态**：红块 + 原因 + 重试；不静默失败。
- **确认态**：破坏性操作（删除/清空/回滚）二次确认。
- **hover 工具栏**：消息项操作按钮默认隐藏，hover 显现；移动端常显。
- **可访问名**：所有图标按钮必有 `title`/`aria-label`/tooltip。

## 交付物建议
- 信息架构图 + 导航方案（桌面/平板/移动三态）。
- 关键屏线框 / 高保真：对话（空 + 流式 + 错误 + 停止）、对话历史搜索、设置（Provider/模型、同步/存储）。
- 组件态枚举：消息状态机、连接测试状态、同步状态。
- 响应式断点行为说明（≥1180 / 760–1180 / ≤760）。
- 暗色模式配色（令牌已提供 light/dark 两套）。

## 明确不做（避免过度设计）
- 网页抓取 / 阅读视图 / 文档库。
- RSS / 订阅源 / Feed。
- AI 自动化 / 定时任务 / 任务队列。
- 服务端账户、多人协作、团队空间。
- entity 级三方合并冲突解决 UI。
- 把网页内容喂给 AI 用"附件/粘贴/URL 插入附件"实现，不建独立文档实体。
