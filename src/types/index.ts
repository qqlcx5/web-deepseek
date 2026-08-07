/**
 * Cherry Studio Web - 数据层类型定义
 *
 * 本文件定义 data.json 与 IndexedDB 共用的核心数据结构。
 * 所有数据层模块（db / import / export / store）均从此文件导入类型。
 *
 * 架构说明：
 * - "原始兼容数据"层：cherryData + compatZone（完整保留导入时数据，用于导出兼容）
 * - "网页端业务视图"层：providers / assistants / topics / messages（扁平化、Web 端使用）
 */

// ============================================================================
// 模型供应商 (Provider)
// ============================================================================

/** 模型供应商 */
export interface Provider {
  /** 唯一标识 */
  id: string;
  /** 显示名称 */
  name: string;
  /** API 服务地址 */
  apiHost: string;
  /** API 密钥（导出时可能被移除） */
  apiKey?: string;
  /** API 路径（如 /v1/chat/completions） */
  apiPath?: string;
  /** 供应商下的模型列表 */
  models: ModelInfo[];
  /** 是否启用 */
  enabled: boolean;
}

// ============================================================================
// 模型 (ModelInfo)
// ============================================================================

/** 模型信息 */
export interface ModelInfo {
  /** 唯一标识 */
  id: string;
  /** 显示名称 */
  name: string;
  /** 所属供应商 ID */
  providerId: string;
  /** 模型描述 */
  description?: string;
  /** 最大输出 Token 数 */
  maxTokens?: number;
  /** 上下文窗口长度 */
  contextLength?: number;
  /** 默认温度参数 */
  temperature?: number;
  /** 默认 Top-P 参数 */
  topP?: number;
  /** 是否启用 */
  enabled: boolean;
}

// ============================================================================
// 助手 (Assistant)
// ============================================================================

/** 助手 */
export interface Assistant {
  /** 唯一标识 */
  id: string;
  /** 名称 */
  name: string;
  /** 描述 */
  description?: string;
  /** 系统提示词 */
  prompt: string;
  /** 默认温度 */
  temperature?: number;
  /** 默认 Top-P */
  topP?: number;
  /** 默认最大 Token */
  maxTokens?: number;
  /** 默认模型 ID */
  model?: string;
  /** 头像（URL 或 base64） */
  avatar?: string;
  /** 是否启用 */
  enabled: boolean;
  /** 是否为默认助手（导入自 data.json） */
  isDefault?: boolean;
  /** 标签（用于分组） */
  tags?: string[];
  /** Emoji 图标 */
  emoji?: string;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}

// ============================================================================
// 会话 (Topic)
// ============================================================================

/** 会话 */
export interface Topic {
  /** 唯一标识 */
  id: string;
  /** 所属助手 ID */
  assistantId: string;
  /** 会话名称 */
  name: string;
  /** 消息列表 */
  messages: Message[];
  /** 覆盖提示词 */
  prompt?: string;
  /** 覆盖温度 */
  temperature?: number;
  /** 覆盖 Top-P */
  topP?: number;
  /** 覆盖最大 Token */
  maxTokens?: number;
  /** 覆盖模型 */
  model?: string;
  /** 是否手动编辑过名称 */
  isNameManuallyEdited?: boolean;
  /** 是否置顶 */
  pinned?: boolean;
  /** 是否收藏 */
  favorite?: boolean;
  /** 是否归档 */
  archived?: boolean;
  /** 标签 */
  tags?: string[];
  /** 图标（Emoji 或 icon 名称） */
  icon?: string;
  /** 颜色（CSS 颜色值） */
  color?: string;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}

// ============================================================================
// 消息 (Message)
// ============================================================================

/** 消息 */
export interface Message {
  /** 唯一标识 */
  id: string;
  /** 所属会话 ID */
  topicId: string;
  /** 角色：用户 / 助手 / 系统 / 工具 */
  role: 'user' | 'assistant' | 'system' | 'tool';
  /** 消息正文 */
  content: string;
  /** 推理内容（思维链） */
  reasoningContent?: string;
  /** 使用的模型名称 */
  model?: string;
  /** Token 用量 */
  tokens?: number;
  /** 关联的 message_block ID 列表 */
  blocks?: string[];
  /** Cherry Studio 请求 ID */
  askId?: string;
  /** 分支索引（用于分支对话） */
  branchIndex?: number;
  /** 父分支索引 */
  parentBranchIndex?: number;
  /** 创建时间 */
  createdAt: string;
  /** 消息状态 */
  status: 'pending' | 'streaming' | 'done' | 'error';
}

// ============================================================================
// 设置 (Settings)
// ============================================================================

/** 应用设置 */
export interface Settings {
  /** 界面语言 */
  language: string;
  /** 主题（light / dark / auto） */
  theme: string;
  /** 字号 */
  fontSize: number;
  /** 发送快捷键 */
  sendShortcut: string;
  /** 最大上下文消息数 */
  maxContext: number;
  /** 是否自动滚动 */
  autoScroll: boolean;
  /** 紧凑模式（更小间距、更小字号） */
  compactMode?: boolean;
  /** 默认模型 ID（应用启动时优先选中） */
  defaultModelId?: string;
}

// ============================================================================
// 应用数据根结构 (AppData) — data.json 顶层
// ============================================================================

/** data.json 根结构，同时也是 IndexedDB 存储单元 */
export interface AppData {
  /** 数据格式版本号 */
  version: string;
  /** 供应商列表 */
  providers: Provider[];
  /** 助手列表 */
  assistants: Assistant[];
  /** 会话列表 */
  topics: Topic[];
  /** 应用设置（可选） */
  settings?: Settings;
  /** 原始 Cherry Studio 数据（导入后保留，用于导出兼容） */
  cherryData?: unknown;
  /** 兼容保留区（Web 端未映射的原始字段，导出时原样写回） */
  compatZone?: Record<string, unknown>;
}

// ============================================================================
// 流式对话 (Stream Chat)
// ============================================================================

/** SSE 流式响应增量 */
export interface ChatStreamDelta {
  content?: string;
  reasoning_content?: string;
}
