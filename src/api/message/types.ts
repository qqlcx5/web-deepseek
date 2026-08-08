/**
 * 消息模块 API 类型定义
 */

import type {
  SendMessageRequest,
  RegenerateRequest,
  EditMessageRequest,
  MessageFeedback,
  Message,
} from '@/types/message'

/** 发送消息参数 */
export type SendMessageParams = SendMessageRequest

/** 重新生成参数 */
export type RegenerateParams = RegenerateRequest

/** 编辑消息参数 */
export type EditMessageParams = EditMessageRequest

/** 继续生成参数 */
export interface ContinueParams {
  messageId: string
}

/** 删除消息参数 */
export interface DeleteMessageParams {
  messageId: string
}

/** 反馈提交参数 */
export interface FeedbackParams {
  messageId: string
  feedback: MessageFeedback
}

/** 分支对话参数 */
export interface ForkParams {
  messageId: string
}

/** 分支对话响应 */
export interface ForkResponse {
  conversationId: string
  messageId: string
}

/** 停止流式参数 */
export interface StopStreamParams {
  conversationId: string
}

/** 历史消息查询参数 */
export interface FetchMessagesParams {
  conversationId: string
  cursor?: string
  limit?: number
}

/** 历史消息响应 */
export interface FetchMessagesResponse {
  messages: Message[]
  hasMore: boolean
  cursor?: string
}
