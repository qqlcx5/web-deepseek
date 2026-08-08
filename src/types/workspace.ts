/**
 * 工作区类型定义
 */

/** 工作区 */
export interface Workspace {
  /** 唯一标识 */
  id: string
  /** 工作区名称 */
  name: string
  /** 描述 */
  description?: string
  /** 图标（Emoji） */
  icon?: string
  /** 默认模型 ID */
  defaultModelId?: string
  /** 默认系统提示词 */
  defaultPrompt?: string
  /** 默认 Temperature */
  defaultTemperature?: number
  /** 默认 Top-P */
  defaultTopP?: number
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt?: string
}

/** 创建工作区请求参数 */
export interface CreateWorkspaceParams {
  name: string
  description?: string
  icon?: string
  defaultModelId?: string
}

/** 更新工作区请求参数 */
export interface UpdateWorkspaceParams {
  name?: string
  description?: string
  icon?: string
  defaultModelId?: string
  defaultPrompt?: string
  defaultTemperature?: number
  defaultTopP?: number
}
