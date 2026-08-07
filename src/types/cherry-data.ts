/**
 * Cherry Studio 真实 data.json 类型定义
 *
 * 与 Cherry Studio 桌面端导出格式完全匹配的 TypeScript 接口。
 * localStorage["persist:cherry-studio"] 内部部分字段是 JSON 字符串，
 * 需在解析阶段逐层 JSON.parse，此处定义为已解析后的结构。
 */

// ============================================================================
// 顶层结构
// ============================================================================

/** data.json 根结构 */
export interface CherryData {
  /** 导出时间戳（毫秒） */
  time: number;
  /** Cherry Studio 版本号 */
  version: number;
  /** localStorage 导出数据 */
  localStorage: CherryLocalStorage;
  /** IndexedDB 导出数据 */
  indexedDB: CherryIndexedDB;
}

/** localStorage 导出容器 */
export interface CherryLocalStorage {
  /** Cherry Studio 持久化键值 */
  'persist:cherry-studio': CherryPersist;
}

// ============================================================================
// persist:cherry-studio 解析后结构
// ============================================================================

/** persist:cherry-studio 解析后的完整结构 */
export interface CherryPersist {
  /** 助手列表（JSON 字符串，需二次解析） */
  assistants: CherryAssistantsData;
  /** 模型供应商配置（JSON 字符串，需二次解析） */
  llm: CherryLLMData;
  /** 设置 */
  settings: CherrySettings;
  /** 默认助手（内嵌在 assistants 中） */
  defaultAssistant?: CherryAssistant;
  /** 助手排序 */
  unifiedListOrder?: string[];
  /** 标签排序 */
  tagsOrder?: string[];
  /** 折叠的标签 */
  collapsedTags?: string[];
}

/** assistants 字段解析后的结构 */
export interface CherryAssistantsData {
  /** 默认助手 */
  defaultAssistant: CherryAssistant;
  /** 普通助手数组 */
  assistants: CherryAssistant[];
}

// ============================================================================
// IndexedDB
// ============================================================================

/** IndexedDB 导出数据 */
export interface CherryIndexedDB {
  /** 会话列表 */
  topics: CherryTopicRecord[];
  /** 消息块列表 */
  message_blocks: CherryMessageBlock[];
}

/** IndexedDB 中的 Topic 记录（与 localStorage 中的 Topic 结构不同） */
export interface CherryTopicRecord {
  /** 会话 ID */
  id: string;
  /** 所属助手 ID */
  assistantId: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 会话名称 */
  name: string;
  /** 是否手动编辑过名称 */
  isNameManuallyEdited: boolean;
  /** 是否置顶 */
  pinned?: boolean;
  /** 消息 ID 列表（message_blocks 索引） */
  messages: string[];
}

// ============================================================================
// 助手 (Assistant) — 原始 Cherry Studio 结构
// ============================================================================

/** Cherry Studio 助手 */
export interface CherryAssistant {
  /** 唯一标识 */
  id: string;
  /** 名称 */
  name: string;
  /** Emoji 图标 */
  emoji?: string;
  /** 系统提示词 */
  prompt: string;
  /** 内部会话列表（与 indexedDB.topics 有重叠） */
  topics?: CherryTopic[];
  /** 内部消息列表 */
  messages?: CherryMessage[];
  /** 类型：assistant */
  type: string;
  /** 常用短语 */
  regularPhrases?: string[];
  /** 模型设置 */
  settings: CherryAssistantSettings;
}

/** Cherry Studio 助手设置 */
export interface CherryAssistantSettings {
  temperature: number;
  enableTemperature: boolean;
  contextCount: number;
  enableMaxTokens: boolean;
  maxTokens: number;
  streamOutput: boolean;
  topP: number;
  enableTopP: boolean;
  toolUseMode?: string;
  customParameters?: unknown[];
}

// ============================================================================
// 会话 (Topic)
// ============================================================================

/** Cherry Studio 会话（位于 assistant.topics 内） */
export interface CherryTopic {
  /** 唯一标识 */
  id: string;
  /** 所属助手 ID */
  assistantId: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 会话名称 */
  name: string;
  /** 消息列表 */
  messages: CherryMessage[];
  /** 是否手动编辑过名称 */
  isNameManuallyEdited: boolean;
  /** 是否置顶 */
  pinned?: boolean;
}

// ============================================================================
// 消息 (Message)
// ============================================================================

/** Cherry Studio 消息 */
export interface CherryMessage {
  /** 唯一标识 */
  id: string;
  /** 角色 */
  role: 'user' | 'assistant' | 'system' | 'tool';
  /** 消息内容 */
  content: string;
  /** 所属会话 ID */
  topicId: string;
  /** 所属助手 ID */
  assistantId: string;
  /** 创建时间 */
  createdAt: string;
  /** 状态 */
  status: string;
  /** 使用的模型 ID */
  modelId?: string;
  /** 使用的模型名称 */
  model?: string;
  /** 关联的 message_blocks ID 列表 */
  blocks?: string[];
  /** 请求 ID */
  askId?: string;
  /** 是否含推理内容 */
  reasoning_content?: string;
  /** 错误信息 */
  error?: string;
}

// ============================================================================
// 消息块 (MessageBlock)
// ============================================================================

/** Cherry Studio 消息块（流式输出的片段存储单元） */
export interface CherryMessageBlock {
  /** 唯一标识 */
  id: string;
  /** 所属消息 ID */
  messageId: string;
  /** 块类型：text / tool / reasoning */
  type: string;
  /** 创建时间 */
  createdAt: string;
  /** 块状态 */
  status: string;
  /** 块内容 */
  content: string;
  /** 引用标注 */
  citationReferences?: unknown[];
}

// ============================================================================
// LLM / 模型供应商
// ============================================================================

/** LLM 配置（persist:cherry-studio.llm 解析后） */
export interface CherryLLMData {
  /** 默认模型 */
  defaultModel?: string;
  /** 供应商列表 */
  providers: CherryProvider[];
}

/** Cherry Studio 供应商 */
export interface CherryProvider {
  /** 唯一标识 */
  id: string;
  /** 显示名称 */
  name: string;
  /** API 主机地址 */
  apiHost: string;
  /** API 密钥 */
  apiKey?: string;
  /** API 路径 */
  apiPath?: string;
  /** 是否启用 */
  enabled?: boolean;
  /** 模型列表 */
  models: CherryModelItem[];
}

/** Cherry Studio 模型项 */
export interface CherryModelItem {
  /** 唯一标识 */
  id: string;
  /** 显示名称 */
  name: string;
  /** 模型描述 */
  description?: string;
  /** 最大 Token */
  maxTokens?: number;
  /** 上下文长度 */
  contextLength?: number;
  /** 是否支持视觉 */
  vision?: boolean;
  /** 是否启用 */
  enabled?: boolean;
}

// ============================================================================
// 设置 (Settings)
// ============================================================================

/** Cherry Studio 设置（仅保留 Web 端相关字段，其余进兼容保留区） */
export interface CherrySettings {
  /** 语言 */
  language?: string;
  /** 主题 */
  theme?: string;
  /** 字体大小 */
  fontSize?: number;
  /** 发送快捷键 */
  sendShortcut?: string;
  /** 代理设置 */
  proxy?: string;
  /** 其他 Cherry Studio 桌面端专有配置（动态字段，不列举） */
  [key: string]: unknown;
}

// ============================================================================
// 解析结果
// ============================================================================

/** 解析完成后的完整数据 */
export interface ParsedCherryData {
  /** 原始顶层数据（用于兼容导出） */
  raw: CherryData;
  /** 解析后的 persist 数据 */
  persist: CherryPersist;
  /** 助手列表（含 default） */
  assistants: CherryAssistant[];
  /** 默认助手 */
  defaultAssistant: CherryAssistant;
  /** 模型供应商列表 */
  providers: CherryProvider[];
  /** IndexedDB 会话记录 */
  topicRecords: CherryTopicRecord[];
  /** 消息块列表 */
  messageBlocks: CherryMessageBlock[];
  /** 兼容保留区（Web 端未映射的原始字段） */
  compatZone: Record<string, unknown>;
}
