/**
 * 模型控制模块类型定义
 */

/** 模型参数 */
export interface ModelParams {
  /** 温度 (0-2) */
  temperature?: number
  /** Top-P (0-1) */
  topP?: number
  /** 最大输出 Token */
  maxTokens?: number
  /** 存在惩罚 (-2 到 2) */
  presencePenalty?: number
  /** 频率惩罚 (-2 到 2) */
  frequencyPenalty?: number
}

/** 模型提供商 */
export interface ModelProvider {
  /** 唯一标识 */
  id: string
  /** 显示名称 */
  name: string
  /** API 服务地址 */
  apiHost: string
  /** API 密钥（已脱敏） */
  apiKey?: string
  /** API 路径 */
  apiPath?: string
  /** 提供商下的模型列表 */
  models: ModelInfo[]
  /** 是否启用 */
  enabled: boolean
  /** 是否自定义 */
  isCustom?: boolean
  /** Logo URL */
  logo?: string
  /** 连接状态：connected / disconnected / unknown */
  connectionStatus?: 'connected' | 'disconnected' | 'unknown'
}

/** 模型信息（运行时，对应后端模型） */
export interface ModelInfo {
  /** 唯一标识 */
  id: string
  /** 显示名称 */
  name: string
  /** 所属供应商 ID */
  providerId: string
  /** 模型描述 */
  description?: string
  /** 最大输出 Token 数 */
  maxTokens?: number
  /** 上下文窗口长度 */
  contextLength?: number
  /** 默认温度参数 */
  temperature?: number
  /** 默认 Top-P 参数 */
  topP?: number
  /** 是否启用 */
  enabled: boolean
  /** 能力标签 */
  capabilities?: ModelCapability[]
}

/** 模型能力标签 */
export type ModelCapability = 'vision' | 'tool-call' | 'reasoning' | 'embedding'

/** Token 用量 */
export interface TokenUsage {
  /** 已用 Token */
  used: number
  /** 总数上限 */
  total: number
  /** 剩余 Token */
  remaining: number
  /** 百分比 */
  percentage: number
}

/** 保存 API Key 参数 */
export interface SaveApiKeyParams {
  providerId: string
  apiKey: string
  baseUrl?: string
}

/** 添加自定义 Provider 参数 */
export interface AddCustomProviderParams {
  name: string
  baseUrl: string
  apiKey: string
}

/** Provider 列表响应 */
export interface ProviderListResponse {
  data: ModelProvider[]
}
