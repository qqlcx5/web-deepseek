/**
 * 消息功能模块类型定义
 * 对应详细设计 §5.2
 */

// === 消息实体 ===
export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  parentId: string | null
  childrenIds: string[]
  modelId?: string
  modelParams?: ModelParameters
  tokensUsed?: number
  feedback?: MessageFeedback
  status: MessageStatus
  error?: string
  attachments?: AttachmentRef[]
  createdAt: number
}

export type MessageStatus =
  | 'sending'
  | 'streaming'
  | 'done'
  | 'error'
  | 'stopped'
  | 'truncated'

export interface MessageFeedback {
  rating: 'like' | 'dislike'
  reason?: string
  createdAt: number
}

export interface ModelParameters {
  temperature?: number
  topP?: number
  maxTokens?: number
  presencePenalty?: number
  frequencyPenalty?: number
}

export interface AttachmentRef {
  id: string
  name: string
  type: string
  size: number
  url: string
}

// === 流式响应 ===
export interface StreamChunk {
  type: 'text' | 'tool_call' | 'error' | 'done'
  content?: string
  toolCall?: ToolCallChunk
  error?: StreamError
  usage?: TokenUsage
}

export interface ToolCallChunk {
  id: string
  name: string
  arguments: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: string
}

export interface StreamError {
  code: string
  message: string
}

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

// === 消息操作请求 ===
export interface SendMessageRequest {
  conversationId: string
  content: string
  modelId: string
  params?: ModelParameters
  attachments?: AttachmentRef[]
  parentMessageId?: string
}

export interface RegenerateRequest {
  messageId: string
  modelId?: string
  params?: ModelParameters
}

export interface EditMessageRequest {
  messageId: string
  content: string
}

// === 历史消息响应 ===
export interface MessageListResponse {
  messages: Message[]
  hasMore: boolean
  cursor?: string
}
