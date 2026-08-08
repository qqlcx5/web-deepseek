/**
 * 对话管理类型定义
 * 对应详细设计 §2
 */

// ============================================================================
// 对话实体
// ============================================================================

/** 对话 */
export interface Conversation {
  /** 唯一标识 (UUID) */
  id: string
  /** 所属工作区 ID */
  workspaceId: string
  /** 对话标题 */
  title: string
  /** 当前使用的模型 ID */
  modelId: string
  /** 自定义系统提示词 */
  systemPrompt?: string
  /** 是否置顶 */
  pinned: boolean
  /** 是否归档 */
  archived: boolean
  /** 软删除标记 */
  deleted: boolean
  /** 删除时间戳 */
  deletedAt?: number
  /** 用户自定义排序序号 */
  sortOrder: number
  /** 消息总数（冗余字段） */
  messageCount: number
  /** 最后一条消息摘要 */
  lastMessagePreview?: string
  /** 上下文已消耗 token 数 */
  contextTokensUsed: number
  /** 创建时间 Unix 时间戳（毫秒） */
  createdAt: number
  /** 更新时间 Unix 时间戳（毫秒） */
  updatedAt: number
}

// ============================================================================
// 对话列表项（精简视图）
// ============================================================================

export interface ConversationListItem {
  id: string
  title: string
  pinned: boolean
  archived: boolean
  messageCount: number
  lastMessagePreview?: string
  updatedAt: number
  modelName: string
}

// ============================================================================
// API 请求/响应
// ============================================================================

/** 创建对话请求 */
export interface CreateConversationParams {
  workspaceId?: string
  title?: string
  modelId?: string
}

/** 更新对话请求 */
export interface UpdateConversationParams {
  title?: string
  pinned?: boolean
  archived?: boolean
  modelId?: string
  systemPrompt?: string
  sortOrder?: number
}

/** 对话列表响应 */
export interface ConversationListResponse {
  items: ConversationListItem[]
  total: number
  hasMore: boolean
  cursor?: string
}

/** 批量操作请求 */
export interface BatchConversationParams {
  ids: string[]
  action: 'delete' | 'archive' | 'restore'
}

/** 排序请求 */
export interface ReorderConversationsParams {
  orderedIds: string[]
}
