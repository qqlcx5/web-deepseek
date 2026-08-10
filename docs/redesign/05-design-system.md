# 05 设计系统

> 现有令牌（已实现，light/dark 双套，勿推翻）。组件库为 `vue-element-plus-x` + Element Plus。

## 5.1 颜色令牌（CSS 变量）

### Light（`:root`）

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

### Dark（`:root.dark`）

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

## 5.2 布局令牌

| 令牌 | 值 | 说明 |
|---|---|---|
| `--sidebar` | `276px` | 对话侧栏宽 |
| `--inspector` | `304px` | 检查器宽 |
| `--header` | `60px` | 顶栏高 |
| `--mobile-nav` | `58px` | 移动底栏高 |
| `--composer-max` | `820px` | 输入区最大宽 |
| `--message-max` | `820px` | 消息列表最大宽 |

## 5.3 圆角 / 阴影 / 过渡 / 字体

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

## 5.4 组件库清单（优先使用）

### `vue-element-plus-x`（对话场景专用）

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
| `ThoughtChain` | 思维链可视化（可选） | ❌ 可选增强 |
| `Attachments` | 附件预览栏 | ✅ 已用（输入区） |
| `FilesCard` | 文件卡片 | ❌ 待用（消息内附件） |
| `useSend` | 发送/停止加载态 hook | ❌ 待用 |
| `useXStream` / `XRequest` | 流式请求控制 | ❌ 待用 |

### Element Plus（通用 UI）

按钮 `ElButton`、对话框 `ElDialog`、抽屉 `ElDrawer`、输入 `ElInput`、下拉 `ElSelect`、开关 `ElSwitch`、单选 `ElRadio`、滑块 `ElSlider`、表单 `ElForm`、消息 `ElMessage`、标签 `ElTag`、头像 `ElAvatar`、工具提示 `ElTooltip`、下拉菜单 `ElDropdown` 等。

## 5.5 必须设计的"状态枚举"

### 消息状态机（`MessageStatus`）

`sending → streaming → complete` ｜异常 `error` ｜用户取消 `stopped`

| 状态 | UI |
|---|---|
| sending | 占位 + 三点 loading |
| streaming | 逐字增量 + "生成中" + 思考可折叠 |
| complete | 正常 + usage + 工具栏 |
| error | 红色 error block + 重试 |
| stopped | 保留内容 + "已停止" |

### 内容块类型（`MessageBlockType`）

`main_text`（正文）/ `thinking`（思考）/ `error` / `citation`（引用）/ `tool`（工具）/ `unknown`

### 抓取状态机

`idle` 灰点 / `extracting` loading / `ready` 绿点 / `cached` 蓝点 / `failed` 红点

### 连接测试状态

`untested` 灰 / `testing` loading / `success` 绿 + 延时 / `failed` 红 + 错误

### 同步状态

`saving` / `saved` / `syncing` / `synced` / `error`（顶栏徽标）

### Provider 就绪状态（顶栏 banner）

`已就绪`（绿勾）/ `缺少 API Key`（黄）/ `未配置模型`（黄）/ `离线`（红）

## 5.6 通用模式

- **空态**：图标 + 标题 + 一句引导 + 主操作按钮（用 `Welcome` 或自定义）。
- **加载态**：骨架屏（列表）/ 三点（消息）/ 环形（按钮内）。
- **错误态**：红块 + 原因 + 重试；不静默失败。
- **确认态**：破坏性操作（删除/清空/回滚）二次确认。
- **hover 工具栏**：消息项/文档项操作按钮默认隐藏，hover 显现；移动端常显。
- **可访问名**：所有图标按钮必有 `title`/`aria-label`/tooltip。
