/**
 * 消息模块 API 层
 * 常规请求使用 hook-fetch request；SSE 流式使用 useXStream
 */

import { request } from '@/utils/request'
import type {
  SendMessageParams,
  RegenerateParams,
  EditMessageParams,
  ContinueParams,
  ForkResponse,
  FetchMessagesResponse,
  FetchMessagesParams,
  StopStreamParams,
} from './types'
import type { MessageFeedback } from '@/types/message'

/** 获取历史消息（分页） */
export function fetchMessages(params: FetchMessagesParams) {
  return request
    .get<FetchMessagesResponse>(
      `/api/conversations/${params.conversationId}/messages`,
      { params: { cursor: params.cursor, limit: params.limit ?? 50 } },
    )
    .json()
}

/** 停止流式生成 */
export function stopStream(params: StopStreamParams) {
  return request.post<null>('/api/chat/stop', { json: params }).json()
}

/** 重新生成 AI 回复 */
export function regenerateMessage(params: RegenerateParams) {
  return request
    .post<null>(`/api/messages/${params.messageId}/regenerate`, { json: params })
    .json()
}

/** 继续生成截断消息 */
export function continueGeneration(params: ContinueParams) {
  return request
    .post<null>(`/api/messages/${params.messageId}/continue`, { json: params })
    .json()
}

/** 编辑用户消息 */
export function editMessage(params: EditMessageParams) {
  return request
    .put<null>(`/api/messages/${params.messageId}`, { json: params })
    .json()
}

/** 删除消息 */
export function deleteMessage(messageId: string) {
  return request.delete<null>(`/api/messages/${messageId}`).json()
}

/** 提交反馈（点赞/点踩） */
export function submitFeedback(messageId: string, feedback: MessageFeedback) {
  return request
    .post<null>(`/api/messages/${messageId}/feedback`, { json: feedback })
    .json()
}

/** 从消息创建分支对话 */
export function forkConversation(messageId: string) {
  return request
    .post<ForkResponse>(`/api/messages/${messageId}/fork`)
    .json()
}
