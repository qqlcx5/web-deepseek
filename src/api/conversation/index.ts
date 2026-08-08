import { request } from '@/utils/request'
import type {
  Conversation,
  ConversationListResponse,
  CreateConversationParams,
  UpdateConversationParams,
  BatchConversationParams,
  ReorderConversationsParams,
} from '@/types/conversation'

const BASE = '/api/conversations'

/** 获取对话列表（分页） */
export function fetchConversations(workspaceId: string, cursor?: string, limit = 20) {
  return request.get<ConversationListResponse>(BASE, {
    workspaceId,
    cursor,
    limit,
  })
}

/** 创建对话 */
export function createConversation(data: CreateConversationParams) {
  return request.post<Conversation>(BASE, data)
}

/** 更新对话 */
export function updateConversation(id: string, data: UpdateConversationParams) {
  return request.put<Conversation>(`${BASE}/${id}`, data)
}

/** 删除对话（软删除） */
export function deleteConversation(id: string) {
  return request.delete(`${BASE}/${id}`)
}

/** 恢复对话 */
export function restoreConversation(id: string) {
  return request.post<Conversation>(`${BASE}/${id}/restore`)
}

/** 永久删除 */
export function permanentDeleteConversation(id: string) {
  return request.delete(`${BASE}/${id}/permanent`)
}

/** 批量操作 */
export function batchConversations(data: BatchConversationParams) {
  return request.post(`${BASE}/batch`, data)
}

/** 更新排序 */
export function reorderConversations(data: ReorderConversationsParams) {
  return request.put(`${BASE}/reorder`, data)
}
