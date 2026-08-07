---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d270bcd3df6a2cd27c2792fa9a0b45ef_e5007dbb928e11f1bafa525400287e28
    ReservedCode1: oCghlVLcmR//c3kUp12PVcFeOgg8MUWS6K7ax5K1Xi4TcsovOfHpg+653SzYyM/qR6YEBQUejHBM1bH/tD5faJse42uOBKFhF4VGLKwxQHjUFg13ivBK9ZlnUTKfv+QDvEV0kG3kHSIKryyCIVb7V1F6jHr6KTxkYnYzThlQ2gfiHYwnXxS5G+b+DO4=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d270bcd3df6a2cd27c2792fa9a0b45ef_e5007dbb928e11f1bafa525400287e28
    ReservedCode2: oCghlVLcmR//c3kUp12PVcFeOgg8MUWS6K7ax5K1Xi4TcsovOfHpg+653SzYyM/qR6YEBQUejHBM1bH/tD5faJse42uOBKFhF4VGLKwxQHjUFg13ivBK9ZlnUTKfv+QDvEV0kG3kHSIKryyCIVb7V1F6jHr6KTxkYnYzThlQ2gfiHYwnXxS5G+b+DO4=
---

# Cherry Studio Web 详细设计文档

> 基于 [cherry-studio-web-prd.md](./cherry-studio-web-prd.md) 概要设计  
> 版本：V2.0  
> 日期：2026-08-08

---

## 目录

1. [V2 页面结构](#1-v2-页面结构)
2. [对话管理模块](#2-对话管理模块)
3. [工作区模块](#3-工作区模块)
4. [模型控制模块](#4-模型控制模块)
5. [消息功能模块](#5-消息功能模块)
6. [附件系统模块](#6-附件系统模块)
7. [导出与迁移模块](#7-导出与迁移模块)
8. [搜索模块](#8-搜索模块)
9. [设置模块](#9-设置模块)
10. [响应式体验模块](#10-响应式体验模块)
11. [系统状态模块](#11-系统状态模块)
12. [管理端原型](#12-管理端原型)
13. [模块间依赖接口](#13-模块间依赖接口)
14. [技术难点与待确认项](#14-技术难点与待确认项)

---

## 1. V2 页面结构

### 1.1 路由表

| 路由路径 | 页面组件 | 布局 | 权限 | 说明 |
|---------|---------|------|------|------|
| `/` | `HomePage` | `DefaultLayout` | 公开 | 首页/Landing |
| `/chat` | `ChatPage` | `AppLayout` | 需登录 | 对话主界面（默认工作区） |
| `/chat/:conversationId` | `ChatPage` | `AppLayout` | 需登录 | 指定对话 |
| `/workspace/:workspaceId` | `WorkspacePage` | `AppLayout` | 需登录 | 工作区详情 |
| `/settings` | `SettingsPage` | `AppLayout` | 需登录 | 设置页 |
| `/settings/:section` | `SettingsPage` | `AppLayout` | 需登录 | 设置子项 |
| `/search` | `SearchPage` | `AppLayout` | 需登录 | 全局搜索 |
| `/share/:shareId` | `ShareViewPage` | `MinimalLayout` | 公开 | 分享页 |
| `/admin` | `AdminPage` | `AdminLayout` | 管理员 | 管理端首页 |
| `/admin/:section` | `AdminPage` | `AdminLayout` | 管理员 | 管理端子项 |
| `/login` | `LoginPage` | `AuthLayout` | 公开 | 登录 |
| `*` | `NotFoundPage` | `MinimalLayout` | 公开 | 404 |

### 1.2 布局方案

```
AppLayout
├── Sidebar (左侧导航，可折叠)
│   ├── Logo + 新建对话按钮
│   ├── ConversationList (对话列表)
│   ├── WorkspaceSwitcher (工作区切换)
│   └── UserMenu (用户菜单/设置入口)
├── MainContent
│   ├── TopBar (面包屑 + 操作按钮)
│   └── <RouterOutlet />
└── [可选] RightPanel (右侧面板：上下文/附件预览)

DefaultLayout
├── Header (导航栏)
├── <RouterOutlet />
└── Footer

AuthLayout (居中卡片)
├── <RouterOutlet />

AdminLayout
├── AdminSidebar (管理导航)
└── <RouterOutlet />

MinimalLayout (无导航，纯内容)
└── <RouterOutlet />
```

### 1.3 路由守卫设计

```typescript
// 路由守卫层级
const routerGuards = {
  // 全局前置守卫
  beforeEach: [
    authGuard,        // 登录状态检查，未登录跳 /login
    workspaceGuard,   // 工作区存在性校验
  ],
  // 路由独享守卫
  routeGuards: {
    '/admin': [adminGuard],  // 管理员权限
  }
};
```

---

## 2. 对话管理模块

### 2.1 功能点详述

| 功能点 | 优先级 | 描述 |
|--------|--------|------|
| 创建对话 | P0 | 点击"新建对话"按钮，自动命名"新对话"，立即出现在列表顶部并切换到该对话 |
| 对话列表 | P0 | 左侧边栏展示，支持无限滚动分页加载，显示标题 + 最后活跃时间 |
| 重命名对话 | P0 | 双击标题或右键菜单 → 内联编辑，Enter 确认 / Esc 取消 |
| 删除对话 | P0 | 右键菜单或列表项悬停显示删除按钮，软删除（标记已删除，可恢复） |
| 置顶/取消置顶 | P1 | 右键菜单操作，置顶对话排在列表最上方，带视觉标识 |
| 拖拽排序 | P1 | 按自定义顺序排列，拖拽手柄仅在置顶区域或排序模式下显示 |
| 批量操作 | P1 | 多选模式：批量删除、批量归档、批量导出 |
| 对话归档 | P2 | 将不常用对话移入归档区，可从归档区恢复 |
| 对话恢复 | P2 | 回收站页面，展示已删除对话，支持恢复或永久删除 |

### 2.2 交互流程

```
创建对话:
  用户点击"新建对话" 
  → 前端调用 POST /api/conversations
  → 返回 conversationId + 默认标题
  → 路由跳转 /chat/:conversationId
  → 侧边栏列表刷新，新对话插入顶部

删除对话:
  用户点击删除 
  → 弹出确认对话框
  → 确认后调用 DELETE /api/conversations/:id
  → 软删除，对话从列表消失
  → Toast 提示"已移至回收站"，含撤销按钮

置顶操作:
  右键 → 选择"置顶"
  → PUT /api/conversations/:id { pinned: true }
  → 乐观更新列表顺序
  → 失败则回滚
```

### 2.3 数据结构定义（TypeScript）

```typescript
// === 对话实体 ===
interface Conversation {
  id: string;                      // UUID
  workspaceId: string;             // 所属工作区ID
  title: string;                   // 对话标题
  modelId: string;                 // 当前使用的模型ID
  systemPrompt?: string;           // 自定义系统提示词
  pinned: boolean;                 // 是否置顶
  archived: boolean;               // 是否归档
  deleted: boolean;                // 软删除标记
  deletedAt?: number;              // 删除时间戳
  sortOrder: number;               // 用户自定义排序序号
  messageCount: number;            // 消息总数（冗余字段，列表展示用）
  lastMessagePreview?: string;     // 最后一条消息摘要
  contextTokensUsed: number;       // 上下文已消耗 token 数
  createdAt: number;               // Unix 时间戳（毫秒）
  updatedAt: number;
}

// === 对话列表项（精简视图） ===
interface ConversationListItem {
  id: string;
  title: string;
  pinned: boolean;
  archived: boolean;
  messageCount: number;
  lastMessagePreview?: string;
  updatedAt: number;
  modelName: string;               // 模型显示名称
}

// === API 请求/响应 ===
interface CreateConversationRequest {
  workspaceId?: string;            // 不传则使用默认工作区
  title?: string;                  // 不传则自动生成
  modelId?: string;                // 不传则使用工作区默认模型
}

interface UpdateConversationRequest {
  title?: string;
  pinned?: boolean;
  archived?: boolean;
  modelId?: string;
  systemPrompt?: string;
  sortOrder?: number;
}

interface ConversationListResponse {
  items: ConversationListItem[];
  total: number;
  hasMore: boolean;
  cursor?: string;                 // 分页游标
}
```

### 2.4 组件树

```
ConversationList (容器)
├── ConversationListHeader
│   ├── NewChatButton
│   └── SearchToggleButton
├── PinnedSection
│   └── ConversationItem[] (可拖拽)
├── RecentSection
│   └── ConversationItem[] (不可拖拽)
├── ArchivedSection (折叠)
│   └── ConversationItem[]
└── BatchActionBar (多选模式下显示)
    ├── DeleteSelectedButton
    └── ArchiveSelectedButton

ConversationItem
├── ConversationIcon
├── TitleText (双击可编辑 → InlineEditInput)
├── LastMessagePreview
├── Timestamp
├── HoverActions
│   ├── PinButton
│   └── DeleteButton
└── ContextMenu (右键)
    ├── PinMenuItem
    ├── RenameMenuItem
    ├── ArchiveMenuItem
    ├── ExportMenuItem
    └── DeleteMenuItem

TrashPage
├── TrashListHeader
│   ├── EmptyTrashButton
│   └── RestoreAllButton
└── TrashItem[]
    ├── RestoreButton
    └── PermanentDeleteButton
```

### 2.5 状态管理设计

```typescript
// Zustand Store: useConversationStore
interface ConversationState {
  // 数据
  conversations: Map<string, ConversationListItem>;
  pinnedIds: string[];
  recentIds: string[];
  archivedIds: string[];
  totalCount: number;
  isLoading: boolean;
  cursor: string | null;

  // 选择模式
  isBatchMode: boolean;
  selectedIds: Set<string>;

  // 操作
  fetchConversations: (workspaceId: string) => Promise<void>;
  loadMore: () => Promise<void>;
  createConversation: (params?: CreateConversationRequest) => Promise<string>;
  updateConversation: (id: string, data: UpdateConversationRequest) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  restoreConversation: (id: string) => Promise<void>;
  permanentDelete: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  reorder: (fromIndex: number, toIndex: number) => Promise<void>;
  
  // 批量操作
  enterBatchMode: () => void;
  exitBatchMode: () => void;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  batchDelete: () => Promise<void>;
  batchArchive: () => Promise<void>;

  // 乐观更新辅助
  optimisticUpdate: (id: string, patch: Partial<ConversationListItem>) => void;
  rollback: (snapshot: ConversationState) => void;
}
```

### 2.6 API 端点设计

| 方法 | 路径 | 描述 | 请求体 | 响应 |
|------|------|------|--------|------|
| `GET` | `/api/conversations` | 获取对话列表 | Query: `workspaceId`, `cursor`, `limit`, `filter`(active/archived/trash) | `ConversationListResponse` |
| `POST` | `/api/conversations` | 创建对话 | `CreateConversationRequest` | `Conversation` |
| `GET` | `/api/conversations/:id` | 获取对话详情 | — | `Conversation` |
| `PUT` | `/api/conversations/:id` | 更新对话 | `UpdateConversationRequest` | `Conversation` |
| `DELETE` | `/api/conversations/:id` | 软删除对话 | — | `{ success: true }` |
| `POST` | `/api/conversations/:id/restore` | 恢复对话 | — | `Conversation` |
| `DELETE` | `/api/conversations/:id/permanent` | 永久删除 | — | `{ success: true }` |
| `POST` | `/api/conversations/batch` | 批量操作 | `{ ids: string[], action: 'delete'\|'archive' }` | `{ success: true, affected: number }` |
| `PUT` | `/api/conversations/reorder` | 调整排序 | `{ workspaceId, orderedIds: string[] }` | `{ success: true }` |

---

## 3. 工作区模块

### 3.1 功能点详述

| 功能点 | 优先级 | 描述 |
|--------|--------|------|
| 创建工作区 | P0 | 可创建多个独立工作区，每个工作区有独立对话列表、模型配置、提示词模板 |
| 切换工作区 | P0 | 侧边栏顶部下拉切换器，切换后加载对应工作区的对话列表 |
| 工作区设置 | P0 | 默认模型、系统提示词模板、对话命名规则 |
| 删除工作区 | P1 | 删除工作区及其下所有对话，需二次确认 + 输入工作区名称确认 |
| 工作区导出/导入 | P1 | 导出工作区配置及对话为 JSON 压缩包，支持导入恢复 |
| 默认工作区 | P0 | 系统内置"默认工作区"，不可删除 |

### 3.2 数据结构定义

```typescript
interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon?: string;                   // emoji 或图标名称
  isDefault: boolean;              // 是否系统默认工作区
  settings: WorkspaceSettings;
  conversationCount: number;
  createdAt: number;
  updatedAt: number;
}

interface WorkspaceSettings {
  defaultModelId: string;          // 默认模型
  defaultSystemPrompt?: string;    // 默认系统提示词
  conversationNamingRule: 'auto' | 'manual';  // auto = 首条消息截取
  maxContextTokens: number;        // 上下文 token 上限，默认 128K
  temperature: number;             // 默认温度，0-2
  topP: number;                    // 默认 topP，0-1
}

interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  settings?: Partial<WorkspaceSettings>;
}

interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
  icon?: string;
  settings?: Partial<WorkspaceSettings>;
}
```

### 3.3 组件树

```
WorkspaceSwitcher
├── CurrentWorkspaceDisplay (名称 + 图标)
├── WorkspaceDropdown
│   ├── WorkspaceItem[] (可切换)
│   ├── Divider
│   └── ManageWorkspacesLink
└── CreateWorkspaceModal
    ├── NameInput
    ├── DescriptionInput
    ├── DefaultModelSelect
    └── SubmitButton

WorkspaceSettingsPanel
├── GeneralSection
│   ├── NameInput
│   ├── IconPicker (Emoji 选择器)
│   └── DescriptionTextarea
├── DefaultsSection
│   ├── DefaultModelSelect
│   ├── DefaultSystemPromptEditor
│   ├── TemperatureSlider
│   └── TopPSlider
├── DangerZone
│   ├── ExportWorkspaceButton
│   └── DeleteWorkspaceButton (二次确认)
```

### 3.4 状态管理

```typescript
interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  isLoading: boolean;

  setCurrentWorkspace: (id: string) => void;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (data: CreateWorkspaceRequest) => Promise<Workspace>;
  updateWorkspace: (id: string, data: UpdateWorkspaceRequest) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  exportWorkspace: (id: string) => Promise<Blob>;
  importWorkspace: (file: File) => Promise<Workspace>;
}

// 依赖：切换工作区时需通知 ConversationStore 重新加载对话列表
```

### 3.5 API 端点设计

| 方法 | 路径 | 描述 |
|------|------|------|
| `GET` | `/api/workspaces` | 获取所有工作区 |
| `POST` | `/api/workspaces` | 创建工作区 |
| `GET` | `/api/workspaces/:id` | 获取工作区详情 |
| `PUT` | `/api/workspaces/:id` | 更新工作区 |
| `DELETE` | `/api/workspaces/:id` | 删除工作区 |
| `GET` | `/api/workspaces/:id/export` | 导出工作区（返回压缩包） |
| `POST` | `/api/workspaces/import` | 导入工作区（multipart/form-data） |

---

## 4. 模型控制模块

### 4.1 功能点详述

| 功能点 | 优先级 | 描述 |
|--------|--------|------|
| 模型选择 | P0 | 对话顶部或输入区上方切换模型，按提供商分组 |
| 模型参数调节 | P0 | Temperature、Top-P、Max Tokens、Presence Penalty、Frequency Penalty 滑块或输入 |
| 多模型提供商 | P0 | 支持 OpenAI / Anthropic / Google / DeepSeek / 通义千问 等，可扩展 |
| 自定义 Provider | P1 | 用户可添加与 OpenAI API 兼容的第三方端点 |
| API Key 管理 | P0 | 设置页中管理各提供商 API Key，加密存储，支持连接测试 |
| 模型能力标签 | P1 | 显示模型支持的特性：视觉、工具调用、推理、长上下文等 |
| 上下文窗口可视化 | P1 | 展示当前对话已用 / 总 token 进度条 |

### 4.2 交互流程

```
切换模型:
  用户点击模型选择器
  → 下拉面板展开，按提供商分组
  → 每组：显示 API 连接状态（绿点=已配置密钥/红点=未配置）
  → 选择模型 → 更新当前对话的 modelId
  → 输入框提示更新（如 "DeepSeek-V3 →"）
  → PUT /api/conversations/:id { modelId: "xxx" }

调节参数:
  用户拖拽 Temperature 滑块
  → 本地即时更新 UI 数值
  → 防抖 300ms 后 PUT /api/conversations/:id
  → 参数实时作用于下次请求
```

### 4.3 数据结构定义

```typescript
// === 模型提供商 ===
interface ModelProvider {
  id: string;                      // 'openai' | 'anthropic' | 'google' | 'deepseek' | 'custom'
  name: string;                    // 显示名称
  icon?: string;                   // Logo URL 或图标名
  apiKeyConfigured: boolean;       // 用户是否已配置 API Key
  baseUrl: string;                 // API 基础地址
  models: ModelInfo[];
}

interface ModelInfo {
  id: string;                      // 'gpt-4o' | 'claude-3.5-sonnet' | 'deepseek-v3'
  providerId: string;
  displayName: string;
  capabilities: ModelCapability[]; // 能力标签
  maxInputTokens: number;          // 最大输入 token
  maxOutputTokens: number;         // 最大输出 token
  supportsVision: boolean;
  supportsToolCall: boolean;
  supportsStreaming: boolean;
  pricing?: {
    inputPer1k: number;            // 美元
    outputPer1k: number;
  };
}

type ModelCapability = 
  | 'vision'         // 视觉理解
  | 'tool-call'      // 函数调用
  | 'reasoning'      // 深度推理
  | 'long-context'   // 长上下文 (>128K)
  | 'code'           // 代码生成优化
  | 'multilingual';  // 多语言优化

// === 模型参数 ===
interface ModelParameters {
  temperature: number;             // 0-2，默认 0.7
  topP: number;                    // 0-1，默认 1
  maxTokens: number;               // 最大生成长度
  presencePenalty: number;         // -2 到 2，默认 0
  frequencyPenalty: number;        // -2 到 2，默认 0
}

// === 用户 API Key 配置 ===
interface UserApiKey {
  providerId: string;
  apiKey: string;                  // 前端不存储明文，仅输入时使用
  baseUrl?: string;                // 自定义端点（自定义 Provider 时必填）
  isCustom: boolean;
  label?: string;                  // 用户自定义标签
  lastTested?: number;             // 上次连接测试时间
  testResult?: 'success' | 'failed';
}

// === Token 用量 ===
interface TokenUsage {
  conversationId: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  maxContextTokens: number;        // 模型最大上下文
  usagePercent: number;            // 0-100
}
```

### 4.4 组件树

```
ModelSelector
├── TriggerButton (显示当前模型名称 + Provider Logo)
└── DropdownPanel
    ├── SearchInput (搜索模型)
    ├── ProviderGroup[]
    │   ├── ProviderHeader (名称 + 连接状态点)
    │   └── ModelOption[]
    │       ├── ModelName
    │       └── CapabilityTags
    └── AddCustomProviderButton

ModelParametersPanel
├── TemperatureControl (Slider + Input)
├── TopPControl
├── MaxTokensControl
└── AdvancedToggle
    ├── PresencePenaltyControl
    └── FrequencyPenaltyControl

TokenUsageBar
├── ProgressBar (颜色分级：绿/黄/红)
└── TokenCountLabel ("12,345 / 128,000 tokens")

ProviderSettingsPage (设置子页)
├── ProviderCard[]
│   ├── ProviderLogo + Name
│   ├── ApiKeyInput (masked)
│   ├── TestConnectionButton
│   ├── BaseUrlInput (仅自定义 Provider)
│   └── EnabledToggle
└── AddCustomProviderCard
```

### 4.5 状态管理

```typescript
interface ModelState {
  providers: ModelProvider[];
  currentConversationParams: ModelParameters;
  
  // 当前模型上下文
  currentModelId: string | null;
  currentProviderId: string | null;
  tokenUsage: TokenUsage | null;

  fetchProviders: () => Promise<void>;
  setModel: (modelId: string, providerId: string) => Promise<void>;
  updateParams: (params: Partial<ModelParameters>) => Promise<void>;
  saveApiKey: (providerId: string, key: string, baseUrl?: string) => Promise<void>;
  testConnection: (providerId: string) => Promise<boolean>;
  removeApiKey: (providerId: string) => Promise<void>;
  addCustomProvider: (config: { name: string, baseUrl: string, apiKey: string }) => Promise<void>;
}
```

### 4.6 API 端点设计

| 方法 | 路径 | 描述 |
|------|------|------|
| `GET` | `/api/models/providers` | 获取所有模型提供商及模型列表 |
| `GET` | `/api/models/providers/:id/models` | 获取指定提供商的模型列表 |
| `POST` | `/api/user/api-keys` | 保存 API Key（加密存储） |
| `DELETE` | `/api/user/api-keys/:providerId` | 删除 API Key |
| `POST` | `/api/user/api-keys/:providerId/test` | 测试 API 连接 |
| `POST` | `/api/providers/custom` | 添加自定义 Provider |
| `DELETE` | `/api/providers/custom/:id` | 删除自定义 Provider |
| `GET` | `/api/conversations/:id/token-usage` | 获取对话 token 用量 |

---

## 5. 消息功能模块

### 5.1 功能点详述

| 功能点 | 优先级 | 描述 |
|--------|--------|------|
| 文本消息收发 | P0 | Markdown 渲染 + 代码高亮 + 数学公式（KaTeX）+ 流式输出 |
| 流式响应 | P0 | SSE (Server-Sent Events) 逐 token 渲染，打字机效果 |
| 消息操作 | P0 | 复制、重新生成、编辑已发送消息、删除消息 |
| 继续生成 | P1 | AI 输出被截断时，点击"继续"按钮续写 |
| 多轮对话 | P0 | 自动携带历史消息作为上下文，支持上下文窗口管理 |
| 分支对话 | P2 | 从某条消息 fork，创建对话分支 |
| 消息反馈 | P1 | 点赞/点踩，可选填写反馈原因 |
| 系统消息 | P1 | 显示模型切换、上下文截断等系统通知 |
| 角色扮演 | P2 | 支持预设 System Prompt 模板切换 |

### 5.2 数据结构定义

```typescript
// === 消息实体 ===
interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;                 // Markdown 格式文本
  parentId: string | null;         // 父消息ID（用于分支）
  childrenIds: string[];           // 分支子消息
  modelId?: string;                // 生成此消息的模型
  modelParams?: ModelParameters;   // 生成时的参数快照
  tokensUsed?: number;             // 本次生成消耗 token
  feedback?: MessageFeedback;
  status: MessageStatus;
  error?: string;                  // 错误信息
  attachments?: Attachment[];      // 关联附件
  createdAt: number;
}

type MessageStatus = 
  | 'sending'       // 发送中
  | 'streaming'     // AI 流式响应中
  | 'done'          // 完成
  | 'error'         // 错误
  | 'stopped'       // 用户手动停止
  | 'truncated';    // 输出被截断，可继续

interface MessageFeedback {
  rating: 'like' | 'dislike';
  reason?: string;
  createdAt: number;
}

// === 流式响应 ===
interface StreamChunk {
  type: 'text' | 'tool_call' | 'error' | 'done';
  content?: string;                // 增量文本
  toolCall?: ToolCallChunk;        // 工具调用数据
  error?: StreamError;
  usage?: TokenUsage;              // 最终 token 统计
}

interface ToolCallChunk {
  id: string;
  name: string;
  arguments: string;               // JSON 字符串，增量拼接
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
}

// === 消息操作 ===
interface SendMessageRequest {
  conversationId: string;
  content: string;
  modelId: string;
  params?: ModelParameters;
  attachments?: AttachmentRef[];
  parentMessageId?: string;        // 分支对话时指定父消息
}

interface RegenerateRequest {
  messageId: string;               // 要重新生成的消息
  modelId?: string;                // 可切换模型
  params?: ModelParameters;
}

interface EditMessageRequest {
  messageId: string;
  content: string;
}
```

### 5.3 组件树

```
ChatView
├── MessageList (虚拟滚动)
│   ├── SystemMessage
│   │   └── SystemNotificationContent
│   ├── UserMessage[]
│   │   ├── MessageBubble (右对齐)
│   │   │   └── MarkdownRenderer
│   │   └── MessageActions (悬停显示)
│   │       ├── CopyButton
│   │       ├── EditButton → InlineEditor
│   │       └── DeleteButton
│   └── AssistantMessage[]
│       ├── Avatar + ModelBadge
│       ├── MessageBubble (左对齐)
│       │   ├── ThinkingBlock (可折叠推理过程)
│       │   ├── MarkdownRenderer
│       │   ├── ToolCallCard[] (工具调用展示)
│       │   └── TokenUsageInfo
│       ├── StreamingCursor (闪烁光标，流式输出中)
│       └── MessageActions
│           ├── CopyButton
│           ├── RegenerateButton
│           ├── ContinueButton (截断时显示)
│           ├── BranchButton → BranchDialog
│           ├── LikeButton / DislikeButton
│           └── FeedbackReasonDialog
├── ScrollToBottomButton
└── ChatInput (固定在底部)
    ├── AttachmentPreview
    ├── TextArea (自适应高度)
    ├── ModelSelectorTrigger
    ├── SendButton / StopButton
    └── CharCount / TokenEstimate
```

### 5.4 状态管理

```typescript
interface MessageState {
  messages: Map<string, Message>;   // conversationId → messages
  streamingMessageId: string | null;
  streamingContent: string;
  isLoading: boolean;
  error: string | null;

  sendMessage: (req: SendMessageRequest) => Promise<void>;
  stopStreaming: () => void;
  regenerate: (req: RegenerateRequest) => Promise<void>;
  continueGeneration: (messageId: string) => Promise<void>;
  editMessage: (req: EditMessageRequest) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  submitFeedback: (messageId: string, feedback: MessageFeedback) => Promise<void>;
  forkConversation: (messageId: string) => Promise<string>;  // 返回新 conversationId
  
  // SSE 流处理
  handleStreamChunk: (conversationId: string, chunk: StreamChunk) => void;
  appendStreamContent: (delta: string) => void;
  finalizeStream: (usage: TokenUsage) => void;
}
```

**流式响应实现方案**：

```typescript
// SSE 连接管理
class SSEClient {
  private controller: AbortController;
  
  async streamChat(req: SendMessageRequest, onChunk: (chunk: StreamChunk) => void) {
    this.controller = new AbortController();
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: this.controller.signal,
    });
    
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const chunk: StreamChunk = JSON.parse(line.slice(6));
          onChunk(chunk);
        }
      }
    }
  }
  
  abort() {
    this.controller?.abort();
  }
}
```

### 5.5 API 端点设计

| 方法 | 路径 | 描述 |
|------|------|------|
| `POST` | `/api/chat/send` | 发送消息（非流式） |
| `POST` | `/api/chat/stream` | 发送消息（SSE 流式） |
| `POST` | `/api/chat/stop` | 停止生成 |
| `POST` | `/api/messages/:id/regenerate` | 重新生成 |
| `POST` | `/api/messages/:id/continue` | 继续生成 |
| `PUT` | `/api/messages/:id` | 编辑消息 |
| `DELETE` | `/api/messages/:id` | 删除消息 |
| `POST` | `/api/messages/:id/fork` | 从消息创建分支对话 |
| `POST` | `/api/messages/:id/feedback` | 提交消息反馈 |
| `GET` | `/api/conversations/:id/messages` | 获取对话消息列表（分页） |

---

## 6. 附件系统模块

### 6.1 功能点详述

| 功能点 | 优先级 | 描述 |
|--------|--------|------|
| 文件上传 | P0 | 拖拽/粘贴/按钮上传，支持图片、PDF、TXT、代码文件 |
| 图片预览 | P0 | 点击放大、灯箱模式、旋转 |
| 文件解析 | P0 | PDF/Word/TXT 文本提取，注入上下文 |
| 图片理解 | P1 | 视觉模型读取图片内容（需模型支持 Vision） |
| 附件管理 | P1 | 对话级附件列表，可查看、下载、删除 |
| 文件大小限制 | P0 | 前端校验 + 后端校验，默认 20MB，可配置 |
| 粘贴图片 | P0 | 剪贴板粘贴自动上传 |
| 代码文件 | P2 | 代码文件直接以代码块注入提示词 |

### 6.2 数据结构定义

```typescript
interface Attachment {
  id: string;
  conversationId: string;
  messageId?: string;              // 关联消息（可选）
  fileName: string;
  fileType: 'image' | 'pdf' | 'document' | 'text' | 'code' | 'other';
  mimeType: string;
  size: number;                    // 字节
  url: string;                     // 访问 URL
  thumbnailUrl?: string;           // 缩略图（图片）
  extractedText?: string;          // 解析后的文本
  status: 'uploading' | 'processing' | 'ready' | 'error';
  error?: string;
  createdAt: number;
}

interface AttachmentRef {
  id: string;
  fileName: string;
  fileType: string;
}

// 上传预签名
interface UploadPresignedUrl {
  uploadUrl: string;               // PUT 上传地址
  attachmentId: string;
  expiresAt: number;
}
```

### 6.3 组件树

```
AttachmentUploader
├── DropZone (拖拽区域)
├── PasteHandler (全局粘贴监听)
├── FileInput (隐藏)
└── UploadProgressList
    └── UploadProgressItem[]
        ├── FileIcon + FileName
        ├── ProgressBar
        └── CancelButton

AttachmentPreview
├── ImagePreview (灯箱)
│   ├── ZoomControls
│   └── RotateButton
├── PDFPreview (内嵌 iframe)
└── FileCard (通用文件)
    ├── FileIcon
    ├── FileName + Size
    └── DownloadButton

AttachmentList (对话附件面板)
├── FilterTabs (全部/图片/文档/其他)
├── AttachmentGrid
│   └── AttachmentCard[]
└── EmptyState
```

### 6.4 状态管理

```typescript
interface AttachmentState {
  uploading: Map<string, { progress: number; status: string }>;
  conversationAttachments: Map<string, Attachment[]>;  // conversationId → attachments

  uploadFile: (conversationId: string, file: File) => Promise<Attachment>;
  uploadFiles: (conversationId: string, files: File[]) => Promise<Attachment[]>;
  cancelUpload: (attachmentId: string) => void;
  deleteAttachment: (attachmentId: string) => Promise<void>;
  getAttachments: (conversationId: string) => Promise<Attachment[]>;
  extractText: (attachmentId: string) => Promise<string>;
}
```

### 6.5 API 端点设计

| 方法 | 路径 | 描述 |
|------|------|------|
| `POST` | `/api/attachments/upload-url` | 获取预签名上传 URL |
| `PUT` | `{presignedUrl}` | 直接上传到对象存储 |
| `POST` | `/api/attachments/:id/confirm` | 确认上传完成，触发解析 |
| `GET` | `/api/attachments/:id` | 获取附件元数据 |
| `GET` | `/api/attachments/:id/download` | 下载附件 |
| `DELETE` | `/api/attachments/:id` | 删除附件 |
| `GET` | `/api/conversations/:id/attachments` | 获取对话所有附件 |
| `POST` | `/api/attachments/:id/extract` | 提取文本内容 |

---

## 7. 导出与迁移模块

### 7.1 功能点详述

| 功能点 | 优先级 | 描述 |
|--------|--------|------|
| 对话导出 | P0 | Markdown / PDF / JSON 格式导出单条对话 |
| 批量导出 | P1 | 按工作区或选中多条对话批量导出，打包为 ZIP |
| 数据迁移 | P1 | 完整数据导出（含设置、API Key 加密导出），可导入到新实例 |
| 分享链接 | P2 | 生成只读分享链接，可设置有效期和密码 |
| 导入 Cherry Studio 桌面版数据 | P2 | 兼容桌面版数据格式导入 |

### 7.2 数据结构定义

```typescript
interface ExportOptions {
  format: 'markdown' | 'pdf' | 'json';
  conversationIds: string[];
  includeAttachments: boolean;
  includeSystemMessages: boolean;
}

interface ExportManifest {
  version: string;
  exportDate: number;
  appVersion: string;
  workspaceCount: number;
  conversationCount: number;
  totalMessages: number;
  includesAttachments: boolean;
  includesSettings: boolean;
}

interface ShareLink {
  id: string;
  conversationId: string;
  url: string;
  password?: string;
  expiresAt?: number;
  viewCount: number;
  maxViews?: number;
  createdAt: number;
}

interface ImportResult {
  success: boolean;
  workspacesImported: number;
  conversationsImported: number;
  attachmentsImported: number;
  errors: ImportError[];
}

interface ImportError {
  item: string;
  reason: string;
}
```

### 7.3 组件树

```
ExportDialog
├── FormatSelector (Markdown / PDF / JSON)
├── ConversationCheckboxList
├── OptionsSection
│   ├── IncludeAttachmentsCheckbox
│   └── IncludeSystemMessagesCheckbox
├── PreviewButton
└── ExportButton

ShareDialog
├── LinkDisplay + CopyButton
├── PasswordInput (可选)
├── ExpirationSelect (永不过期/1天/7天/30天)
├── MaxViewsInput (可选)
└── CreateLinkButton / RevokeButton

ImportDialog
├── FileDropZone (.zip / .json)
├── ImportProgress
└── ImportResultSummary
```

### 7.4 API 端点设计

| 方法 | 路径 | 描述 |
|------|------|------|
| `POST` | `/api/export/conversations` | 导出对话（返回文件流） |
| `POST` | `/api/export/workspace/:id` | 导出整个工作区 |
| `GET` | `/api/export/all` | 导出全部数据 |
| `POST` | `/api/import` | 导入数据（multipart） |
| `POST` | `/api/share` | 创建分享链接 |
| `GET` | `/api/share/:id` | 获取分享内容（公开接口） |
| `DELETE` | `/api/share/:id` | 撤销分享链接 |

---

## 8. 搜索模块

### 8.1 功能点详述

| 功能点 | 优先级 | 描述 |
|--------|--------|------|
| 全局搜索 | P0 | 跨所有对话搜索消息内容，关键词高亮 |
| 对话内搜索 | P1 | 当前对话内搜索，支持上下导航 |
| 搜索结果预览 | P0 | 显示匹配片段 + 所属对话 + 时间 |
| 搜索历史 | P2 | 记录最近搜索词 |
| 搜索建议 | P2 | 输入时自动补全 |
| 高级筛选 | P1 | 按时间范围、对话、模型筛选 |

### 8.2 数据结构定义

```typescript
interface SearchRequest {
  query: string;
  scope: 'global' | 'conversation';
  conversationId?: string;
  filters?: SearchFilters;
  page?: number;
  pageSize?: number;
}

interface SearchFilters {
  dateRange?: { start: number; end: number };
  modelIds?: string[];
  messageRole?: 'user' | 'assistant';
  hasAttachments?: boolean;
}

interface SearchResult {
  messageId: string;
  conversationId: string;
  conversationTitle: string;
  role: 'user' | 'assistant';
  content: string;                 // 包含高亮标记的片段
  matchPosition: number;           // 匹配在内容中的位置
  createdAt: number;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  took: number;                    // 搜索耗时 ms
}

interface SearchSuggestion {
  text: string;
  type: 'history' | 'suggestion';
}
```

### 8.3 组件树

```
SearchPage
├── SearchHeader
│   ├── SearchInput (自动聚焦)
│   ├── ScopeToggle (全局/当前对话)
│   └── AdvancedFilterButton
├── SearchSuggestions (输入时)
│   ├── HistorySection
│   └── SuggestionSection
├── AdvancedFilterPanel (可折叠)
│   ├── DateRangePicker
│   ├── ModelFilter
│   └── RoleFilter
├── SearchResults
│   ├── ResultCount + TookTime
│   ├── SearchResultCard[]
│   │   ├── ConversationTitleBadge (可点击跳转)
│   │   ├── HighlightedContent
│   │   ├── RoleIcon + Timestamp
│   │   └── JumpToMessageButton
│   └── LoadMoreButton / Pagination
└── EmptyState

InConversationSearch
├── SearchBar (Ctrl+F 唤起)
├── MatchCount ("3/12")
├── NavButtons (上一条/下一条)
└── HighlightOverlay (当前匹配高亮)
```

### 8.4 状态管理

```typescript
interface SearchState {
  query: string;
  scope: 'global' | 'conversation';
  filters: SearchFilters;
  results: SearchResult[];
  total: number;
  isLoading: boolean;
  page: number;

  // 对话内搜索
  inConversationResults: SearchResult[];
  currentMatchIndex: number;

  // 建议
  suggestions: SearchSuggestion[];
  searchHistory: string[];

  search: (req: SearchRequest) => Promise<void>;
  loadMore: () => Promise<void>;
  clearResults: () => void;
  navigateMatch: (direction: 'next' | 'prev') => void;
}
```

### 8.5 API 端点设计

| 方法 | 路径 | 描述 |
|------|------|------|
| `POST` | `/api/search` | 全局/对话搜索 |
| `GET` | `/api/search/suggestions` | 搜索建议 |
| `GET` | `/api/search/history` | 搜索历史 |
| `DELETE` | `/api/search/history` | 清除搜索历史 |

---

## 9. 设置模块

### 9.1 功能点详述

| 功能点 | 优先级 | 描述 |
|--------|--------|------|
| 通用设置 | P0 | 语言、主题（亮色/暗色/跟随系统）、字体大小 |
| API 密钥管理 | P0 | 各模型提供商 API Key 的增删改查、连接测试 |
| 数据管理 | P1 | 缓存清理、数据导出、账户删除 |
| 快捷键 | P1 | 自定义键盘快捷键配置 |
| 关于 | P2 | 版本号、更新日志、反馈入口 |

### 9.2 数据结构定义

```typescript
interface UserSettings {
  // 通用
  language: 'zh-CN' | 'en-US' | 'auto';
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  
  // 对话
  sendOnEnter: boolean;            // Enter 发送（否则 Shift+Enter 换行）
  autoGenerateTitle: boolean;      // 自动生成对话标题
  streamResponse: boolean;         // 默认使用流式响应
  
  // 隐私
  saveHistory: boolean;            // 是否保存对话历史
  shareUsageData: boolean;         // 是否分享使用数据
}

interface ShortcutConfig {
  action: string;                  // 动作标识符
  label: string;                   // 显示名称
  defaultKeys: string;             // 默认快捷键
  currentKeys: string;             // 当前快捷键
}

type ShortcutAction = 
  | 'new-conversation'
  | 'search'
  | 'toggle-sidebar'
  | 'send-message'
  | 'stop-generation'
  | 'copy-last-message'
  | 'toggle-theme';
```

### 9.3 组件树

```
SettingsPage
├── SettingsSidebar (设置导航)
│   ├── GeneralLink
│   ├── ModelsLink (API 密钥管理)
│   ├── ShortcutsLink
│   ├── DataLink
│   └── AboutLink
└── SettingsContent
    ├── GeneralSettings
    │   ├── LanguageSelect
    │   ├── ThemeRadioGroup
    │   ├── FontSizeSelect
    │   ├── SendOnEnterToggle
    │   └── AutoGenerateTitleToggle
    ├── ModelSettings (同 4.4 ProviderSettingsPage)
    ├── ShortcutSettings
    │   └── ShortcutList
    │       └── ShortcutItem[]
    │           ├── ActionLabel
    │           ├── CurrentShortcutDisplay
    │           └── EditShortcutButton → KeyCaptureDialog
    ├── DataSettings
    │   ├── CacheSizeDisplay + ClearCacheButton
    │   ├── ExportAllDataButton
    │   └── DeleteAccountButton (高危操作)
    └── AboutSettings
        ├── AppVersion
        ├── ChangelogLink
        └── FeedbackLink
```

### 9.4 状态管理

```typescript
interface SettingsState {
  settings: UserSettings;
  shortcuts: ShortcutConfig[];
  isDirty: boolean;

  loadSettings: () => Promise<void>;
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
  updateShortcut: (action: string, keys: string) => Promise<void>;
  resetShortcuts: () => Promise<void>;
  clearCache: () => Promise<void>;
  exportAllData: () => Promise<Blob>;
  deleteAccount: () => Promise<void>;
}
```

### 9.5 API 端点设计

| 方法 | 路径 | 描述 |
|------|------|------|
| `GET` | `/api/user/settings` | 获取用户设置 |
| `PUT` | `/api/user/settings` | 更新用户设置 |
| `GET` | `/api/user/shortcuts` | 获取快捷键配置 |
| `PUT` | `/api/user/shortcuts` | 更新快捷键配置 |
| `POST` | `/api/user/clear-cache` | 清理缓存 |
| `DELETE` | `/api/user/account` | 删除账户 |
| `GET` | `/api/app/version` | 获取版本信息 |

---

## 10. 响应式体验模块

### 10.1 断点设计

| 断点名称 | 宽度范围 | 布局策略 |
|---------|---------|---------|
| Mobile | < 768px | 单列布局，侧边栏全屏覆盖，底部 Tab 导航 |
| Tablet | 768px - 1024px | 侧边栏可折叠，主内容区自适应 |
| Desktop | > 1024px | 标准三栏布局（侧边栏 + 主内容 + 可选右侧面板） |

### 10.2 移动端适配策略

| 交互 | 移动端行为 |
|------|-----------|
| 侧边栏 | 从左侧滑入（Drawer），点击遮罩关闭 |
| 底部导航 | TabBar：对话、搜索、设置（可选） |
| 对话列表 | 左滑显示操作按钮（置顶、删除） |
| 消息操作 | 长按弹出操作菜单（替代悬停） |
| 附件上传 | 调用系统相机/相册 |
| 滚动加载 | 触底自动加载更多 |
| 新建对话 | 右下角 FAB（Floating Action Button） |

### 10.3 组件适配

```typescript
// 响应式 Hook
function useBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
  // 基于 window.matchMedia 实现
}

function useIsMobile(): boolean {
  const bp = useBreakpoint();
  return bp === 'mobile';
}

// 布局组件
const AppLayout: React.FC = () => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MobileLayout />;  // Drawer + TabBar
  }
  return <DesktopLayout />;   // 固定侧边栏
};
```

### 10.4 关键 CSS 策略

```css
/* CSS 变量统一管理 */
:root {
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 0px;
  --right-panel-width: 320px;
  --topbar-height: 48px;
  --input-area-height: auto;
  
  /* 响应式 */
  --sidebar-display: block;
  --mobile-drawer-width: 85vw;
}

@media (max-width: 767px) {
  :root {
    --sidebar-display: none;
  }
}
```

### 10.5 状态管理

```typescript
interface LayoutState {
  sidebarOpen: boolean;              // 移动端 Drawer 状态
  sidebarCollapsed: boolean;         // 桌面端折叠状态
  rightPanelOpen: boolean;
  rightPanelContent: 'context' | 'attachments' | null;
  breakpoint: 'mobile' | 'tablet' | 'desktop';

  toggleSidebar: () => void;
  toggleRightPanel: (content?: string) => void;
  setBreakpoint: (bp: string) => void;
}
```

---

## 11. 系统状态模块

### 11.1 功能点详述

| 功能点 | 优先级 | 描述 |
|--------|--------|------|
| 加载状态 | P0 | 页面级 Skeleton 占位、列表加载 Spinner、流式输出动画 |
| 错误处理 | P0 | 全局错误边界、API 错误分类展示、网络断开检测 |
| 空状态 | P0 | 各模块空状态插图 + 引导文案 |
| Toast 通知 | P0 | 操作结果反馈，成功/错误/警告/信息四种类型 |
| 确认对话框 | P0 | 危险操作二次确认 |
| 网络状态 | P1 | 在线/离线检测，断线重连提示 |
| 更新提示 | P2 | Service Worker 检测到新版本时提示刷新 |

### 11.2 数据结构定义

```typescript
// === 通知 ===
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;               // 毫秒，0 表示不自动关闭
  action?: ToastAction;            // 操作按钮（如撤销）
}

interface ToastAction {
  label: string;
  onClick: () => void;
}

// === 确认对话框 ===
interface ConfirmDialog {
  id: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

// === 全局错误 ===
interface AppError {
  id: string;
  code: string;
  message: string;
  details?: string;
  retry?: () => void;
}

// === 网络状态 ===
type NetworkStatus = 'online' | 'offline' | 'slow';
```

### 11.3 组件树

```
AppProviders
├── ToastContainer (固定定位，右上角)
│   └── Toast[]
│       ├── Icon (success/error/warning/info)
│       ├── Title + Description
│       ├── ActionButton (可选)
│       └── CloseButton
├── ConfirmDialogOverlay
│   └── ConfirmDialog
│       ├── Icon (danger ⚠️)
│       ├── Title + Message
│       └── ButtonGroup
│           ├── CancelButton
│           └── ConfirmButton
├── NetworkStatusBar (离线时顶部显示)
├── ErrorBoundary (全局错误边界)
│   └── ErrorFallback
│       ├── ErrorIcon
│       ├── ErrorMessage + Details
│       ├── RetryButton
│       └── ReloadPageButton
├── LoadingSkeleton (各模块定制)
│   ├── ConversationListSkeleton
│   ├── MessageListSkeleton
│   └── SettingsSkeleton
└── EmptyState[]
    ├── NoConversationsEmpty
    ├── NoSearchResultsEmpty
    └── NoAttachmentsEmpty
```

### 11.4 状态管理

```typescript
interface SystemState {
  toasts: Toast[];
  confirmDialog: ConfirmDialog | null;
  globalError: AppError | null;
  networkStatus: NetworkStatus;
  updateAvailable: boolean;

  showToast: (toast: Omit<Toast, 'id'>) => string;  // 返回 toast id
  dismissToast: (id: string) => void;
  showConfirm: (dialog: Omit<ConfirmDialog, 'id'>) => void;
  closeConfirm: () => void;
  setGlobalError: (error: AppError | null) => void;
  clearGlobalError: () => void;
}
```

---

## 12. 管理端原型

### 12.1 功能点详述

| 功能点 | 优先级 | 描述 |
|--------|--------|------|
| 用户管理 | P1 | 用户列表、禁用/启用、角色分配 |
| 用量统计 | P1 | API 调用次数、Token 消耗统计、图表展示 |
| 模型管理 | P1 | 全局模型开关、模型参数默认值设定 |
| 系统配置 | P1 | 全局设置项：注册开关、文件大小上限、速率限制 |
| 审计日志 | P2 | 管理员操作记录、敏感操作追溯 |

### 12.2 数据结构定义

```typescript
// === 管理端用户 ===
interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  status: 'active' | 'disabled';
  createdAt: number;
  lastLoginAt?: number;
  stats: AdminUserStats;
}

interface AdminUserStats {
  totalConversations: number;
  totalMessages: number;
  totalTokensUsed: number;
  apiCallsThisMonth: number;
}

// === 用量统计 ===
interface UsageStats {
  period: 'day' | 'week' | 'month';
  totalApiCalls: number;
  totalTokens: number;
  totalCost: number;
  byProvider: ProviderUsage[];
  byUser: UserUsage[];
  timeline: UsageTimelinePoint[];
}

interface ProviderUsage {
  providerId: string;
  providerName: string;
  apiCalls: number;
  tokens: number;
  cost: number;
}

interface UserUsage {
  userId: string;
  userName: string;
  apiCalls: number;
  tokens: number;
}

interface UsageTimelinePoint {
  date: string;                    // '2026-08-08'
  apiCalls: number;
  tokens: number;
}

// === 系统配置 ===
interface SystemConfig {
  registrationOpen: boolean;
  maxFileSizeMB: number;
  rateLimitPerMinute: number;
  rateLimitPerDay: number;
  defaultMaxContextTokens: number;
  allowedModels: string[];         // 全局启用的模型 ID 列表
  maintenanceMode: boolean;
}
```

### 12.3 组件树

```
AdminPage
├── AdminSidebar
│   ├── DashboardLink
│   ├── UsersLink
│   ├── UsageLink
│   ├── ModelsLink
│   ├── SettingsLink
│   └── AuditLogLink
└── AdminContent
    ├── DashboardOverview
    │   ├── StatCards (用户总数/今日调用/Token消耗/活跃用户)
    │   └── QuickChart (最近7天用量趋势)
    ├── UserManagement
    │   ├── UserSearchBar + FilterControls
    │   ├── UserTable
    │   │   └── UserRow[]
    │   │       ├── UserInfo (头像/名称/邮箱)
    │   │       ├── RoleBadge
    │   │       ├── StatusBadge
    │   │       ├── StatsPopover
    │   │       └── ActionsMenu (禁用/启用/改角色)
    │   └── Pagination
    ├── UsageAnalytics
    │   ├── DateRangePicker
    │   ├── SummaryCards
    │   ├── UsageChart (折线图 — 按时间)
    │   ├── ProviderBreakdownChart (饼图 — 按提供商)
    │   └── UserUsageTable (按用户消耗排行)
    ├── ModelManagement
    │   ├── ModelToggleList
    │   │   └── ModelToggle[]
    │   │       ├── ModelName + ProviderName
    │   │       ├── EnabledSwitch
    │   │       └── DefaultParamsForm
    │   └── DefaultSettingsForm
    └── AuditLogPage
        ├── LogFilterBar (时间/操作类型/用户)
        └── LogTable
            └── LogEntry[]
                ├── Timestamp
                ├── AdminUser
                ├── Action
                ├── Target
                └── Details (可展开)
```

### 12.4 状态管理

```typescript
interface AdminState {
  users: AdminUser[];
  usageStats: UsageStats | null;
  systemConfig: SystemConfig;
  auditLogs: AuditLogEntry[];
  isLoading: boolean;

  // 用户管理
  fetchUsers: (page: number, filters?: UserFilters) => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;

  // 用量统计
  fetchUsageStats: (period: string, dateRange?: DateRange) => Promise<void>;

  // 模型管理
  toggleModel: (modelId: string, enabled: boolean) => Promise<void>;
  updateDefaultParams: (modelId: string, params: ModelParameters) => Promise<void>;

  // 系统配置
  fetchSystemConfig: () => Promise<void>;
  updateSystemConfig: (patch: Partial<SystemConfig>) => Promise<void>;

  // 审计日志
  fetchAuditLogs: (filters?: AuditLogFilters) => Promise<void>;
}
```

### 12.5 API 端点设计

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| `GET` | `/api/admin/users` | 用户列表（分页） | 管理员 |
| `PUT` | `/api/admin/users/:id/role` | 修改用户角色 | 管理员 |
| `PUT` | `/api/admin/users/:id/status` | 禁用/启用用户 | 管理员 |
| `GET` | `/api/admin/usage` | 用量统计 | 管理员 |
| `GET` | `/api/admin/usage/export` | 导出用量报表 | 管理员 |
| `GET` | `/api/admin/models` | 全局模型配置 | 管理员 |
| `PUT` | `/api/admin/models/:id` | 更新模型配置 | 管理员 |
| `GET` | `/api/admin/config` | 获取系统配置 | 管理员 |
| `PUT` | `/api/admin/config` | 更新系统配置 | 管理员 |
| `GET` | `/api/admin/audit-logs` | 审计日志 | 管理员 |

---

## 13. 模块间依赖接口

### 13.1 依赖关系图

```
                    ┌──────────────┐
                    │   工作区模块   │
                    └──────┬───────┘
                           │ workspaceId
                           ▼
┌──────────┐     ┌─────────────────┐     ┌──────────────┐
│ 模型控制  │────▶│   对话管理模块    │◀────│  搜索模块     │
│   模块    │     │                 │     │              │
└──────────┘     └────────┬────────┘     └──────────────┘
                          │ conversationId
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │  消息功能模块  │ │  附件系统模块  │ │ 导出与迁移模块 │
  └──────────────┘ └──────────────┘ └──────────────┘
         │
         ▼
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │  设置模块     │     │ 响应式体验模块 │     │  系统状态模块  │
  └──────────────┘     └──────────────┘     └──────────────┘

  ┌──────────────┐
  │ 管理端原型    │  (独立模块，依赖用户系统 + 用量数据)
  └──────────────┘
```

### 13.2 模块间接口定义

```typescript
// === 对话管理 ↔ 工作区 ===
interface ConversationWorkspaceBridge {
  // 对话管理依赖工作区提供当前 workspaceId
  getCurrentWorkspaceId(): string;
  // 切换工作区时触发对话列表重载
  onWorkspaceChange: (workspaceId: string) => void;
}

// === 对话管理 ↔ 消息功能 ===
interface ConversationMessageBridge {
  // 消息模块依赖对话管理提供当前 conversationId
  getCurrentConversationId(): string;
  // 消息发送成功后更新对话 lastMessagePreview + updatedAt
  onMessageSent: (conversationId: string, preview: string) => void;
  // 从消息 fork 创建新对话
  createConversationFromMessage: (params: { workspaceId: string; title: string }) => Promise<string>;
}

// === 对话管理 ↔ 模型控制 ===
interface ConversationModelBridge {
  // 对话管理向模型控制提供当前对话的 modelId
  getCurrentModelId(): string;
  // 切换模型时更新对话的 modelId
  onModelChange: (conversationId: string, modelId: string) => void;
}

// === 消息功能 ↔ 附件系统 ===
interface MessageAttachmentBridge {
  // 消息发送时携带附件引用
  getAttachmentsForMessage(messageId: string): AttachmentRef[];
  // 上传完成后通知消息模块
  onAttachmentReady: (attachmentId: string) => void;
}

// === 消息功能 ↔ 导出 ===
interface MessageExportBridge {
  // 导出模块获取对话的完整消息列表
  getMessagesForExport(conversationId: string): Promise<Message[]>;
}

// === 全局事件总线 ===
type AppEvent = 
  | { type: 'workspace:changed'; workspaceId: string }
  | { type: 'conversation:created'; conversationId: string }
  | { type: 'conversation:deleted'; conversationId: string }
  | { type: 'model:changed'; conversationId: string; modelId: string }
  | { type: 'message:sent'; conversationId: string }
  | { type: 'stream:started'; conversationId: string }
  | { type: 'stream:stopped'; conversationId: string }
  | { type: 'network:changed'; status: NetworkStatus }
  | { type: 'settings:updated'; patch: Partial<UserSettings> };
```

---

## 14. 技术难点与待确认项

### 14.1 技术难点

| # | 难点 | 影响模块 | 描述 | 建议方案 |
|---|------|---------|------|---------|
| 1 | **流式响应稳定性** | 消息功能 | SSE 连接在网络不稳定时频繁断开，需健壮的断线重连机制 | 实现指数退避重连 + Last-Event-ID 断点续传 |
| 2 | **虚拟滚动性能** | 消息功能 | 超长对话（>1000条）时 DOM 节点过多导致卡顿 | 使用 react-virtuoso 实现虚拟滚动，配合消息分页懒加载 |
| 3 | **Markdown 渲染安全** | 消息功能 | 用户/AI 消息中可能包含 XSS 攻击代码 | 使用 DOMPurify + rehype-sanitize 双重过滤 |
| 4 | **大文件上传** | 附件系统 | >20MB 文件上传需分片，且需断点续传 | 分片上传 + 预签名 URL 每片独立，前端维护上传状态 |
| 5 | **全文搜索性能** | 搜索 | 海量消息的实时全文搜索，纯数据库 LIKE 不可行 | 接入 Elasticsearch / Meilisearch，异步索引 |
| 6 | **Token 实时计算** | 模型控制 | 前端需实时估算消息 token，tiktoken WASM 较大（~3MB） | 按需加载 tiktoken WASM，或改用近似估算公式 |
| 7 | **API Key 安全存储** | 设置/模型控制 | 前端不应存储明文 API Key，后端需加密 | 后端 AES-256-GCM 加密存储，仅通过 session token 解密使用 |
| 8 | **SSR/SSG 策略** | 全局 | Next.js SSR 与客户端状态（localStorage/Zustand persist）冲突 | 明确客户端组件边界，使用 dynamic import + ssr: false |
| 9 | **离线体验** | 系统状态 | 离线时需缓存最近对话，恢复在线后同步 | Service Worker + IndexedDB 缓存最近 50 条对话 |

### 14.2 ⚠️ 待确认项

> 以下为设计过程中发现的边界条件和技术决策，需要产品/技术负责人确认：

| # | 待确认项 | 类别 | 优先级 |
|---|---------|------|--------|
| **Q1** | 对话软删除的保留期限是多少天？（建议 30 天，超期自动永久删除） | 对话管理 | 🔴 高 |
| **Q2** | 单用户工作区上限？工作区内对话上限？（建议不限，但需做性能测试） | 工作区 | 🔴 高 |
| **Q3** | API Key 是否需要支持"仅使用一次后销毁"的安全模式？（类似 OpenAI 的 ephemeral key） | 模型控制 | 🟡 中 |
| **Q4** | 消息的"分支对话"（fork）是否 V2 就做？还是延后？（PRD 标注 P2） | 消息功能 | 🟡 中 |
| **Q5** | 附件存储方案：对象存储（S3/MinIO） vs 本地文件系统？是否要支持 CDN？ | 附件系统 | 🔴 高 |
| **Q6** | 搜索是否需要支持正则表达式？（会显著影响后端实现复杂度） | 搜索 | 🟢 低 |
| **Q7** | 分享链接的密码保护是否必需？如是，加密方式偏好？ | 导出与迁移 | 🟡 中 |
| **Q8** | 管理端是否需要独立的认证系统？还是复用主应用的用户体系 + 角色字段？ | 管理端 | 🔴 高 |
| **Q9** | 模型参数的 Presence Penalty / Frequency Penalty 所有模型都支持吗？不支持的模型如何处理参数？ | 模型控制 | 🟡 中 |
| **Q10** | 工作区删除时，其下对话是级联删除还是迁移到默认工作区？ | 工作区 | 🟡 中 |
| **Q11** | 移动端是否需要 PWA 支持（安装到桌面）？还是纯响应式 Web？ | 响应式 | 🟡 中 |
| **Q12** | 多语言支持的翻译方案：i18n 文件手动管理 vs 接入翻译平台（如 Lokalise）？ | 设置 | 🟢 低 |

---

## 附录 A：技术栈推荐

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 框架 | Next.js 14+ (App Router) | SSR/SSG/ISR 全支持，React Server Components |
| 语言 | TypeScript 5.x (strict mode) | 全栈类型安全 |
| 状态管理 | Zustand + React Context | Zustand 管理全局状态，Context 管理主题/鉴权 |
| UI 组件库 | Radix UI + Tailwind CSS + shadcn/ui | 无头组件 + 原子化 CSS + 可定制组件 |
| 数据请求 | TanStack Query v5 | 服务端状态缓存、乐观更新、无限滚动 |
| 虚拟滚动 | react-virtuoso | 消息列表高性能渲染 |
| Markdown | react-markdown + remark-gfm + rehype-katex + rehype-highlight | GFM + 数学公式 + 代码高亮 |
| 代码高亮 | Shiki | VS Code 级别语法高亮 |
| 表单 | react-hook-form + zod | 高性能表单 + schema 校验 |
| 拖拽 | @dnd-kit/core | 对话排序、附件拖拽 |
| 图表 | Recharts | 管理端用量统计图表 |
| 数据库 | PostgreSQL + Drizzle ORM | 关系型数据 + TypeScript 类型安全 ORM |
| 搜索 | Meilisearch / Elasticsearch | 全文搜索 |
| 缓存 | Redis | Session + 限流 + 缓存 |
| 文件存储 | MinIO / AWS S3 | 附件对象存储 |
| 测试 | Vitest + Playwright + Testing Library | 单元/集成/E2E |

---

*文档结束*
*（内容由AI生成，仅供参考）*
