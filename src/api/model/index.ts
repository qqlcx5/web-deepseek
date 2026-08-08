import type { GetSessionListVO } from './types'
import { get, request } from '@/utils/request'

// ---- 现有 ----
export function getModelList() {
  return get<GetSessionListVO[]>('/system/model/modelList').json()
}

// ---- 新增 ----
export function fetchProviders() {
  return request.get<{ data: import('@/types/model').ModelProvider[] }>('/api/models/providers')
}

export function fetchProviderModels(providerId: string) {
  return request.get<{ data: import('@/types/model').ModelInfo[] }>(`/api/models/providers/${providerId}/models`)
}

export function saveApiKey(params: import('@/types/model').SaveApiKeyParams) {
  return request.post('/api/user/api-keys', params)
}

export function removeApiKey(providerId: string) {
  return request.delete(`/api/user/api-keys/${providerId}`)
}

export function testConnection(providerId: string) {
  return request.post(`/api/user/api-keys/${providerId}/test`)
}

export function addCustomProvider(params: import('@/types/model').AddCustomProviderParams) {
  return request.post('/api/providers/custom', params)
}

export function deleteCustomProvider(id: string) {
  return request.delete(`/api/providers/custom/${id}`)
}

export function fetchTokenUsage(conversationId: string) {
  return request.get<{ data: import('@/types/model').TokenUsage }>(`/api/conversations/${conversationId}/token-usage`)
}
