import type { ModelInfo, ModelParams, TokenUsage, SaveApiKeyParams, AddCustomProviderParams, ModelProvider } from '@/types/model'

export type {
  ModelInfo,
  ModelParams,
  TokenUsage,
  SaveApiKeyParams,
  AddCustomProviderParams,
  ModelProvider,
}

// 查询用户模型列表返回的数据结构（保留兼容）
export interface GetSessionListVO {
  id?: number
  category?: string
  modelName?: string
  modelDescribe?: string
  modelPrice?: number
  modelType?: string
  modelShow?: string
  systemPrompt?: string
  apiHost?: string
  apiKey?: string
  remark?: string
}
