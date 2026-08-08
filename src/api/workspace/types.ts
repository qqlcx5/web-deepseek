import type { Workspace, CreateWorkspaceParams, UpdateWorkspaceParams } from '@/types/workspace'

/** 获取工作区列表响应 */
export interface WorkspaceListResponse {
  data: Workspace[]
}

/** 获取单个工作区响应 */
export interface WorkspaceDetailResponse {
  data: Workspace
}

/** 创建工作区响应 */
export interface CreateWorkspaceResponse {
  data: Workspace
}

/** 更新工作区响应 */
export interface UpdateWorkspaceResponse {
  data: Workspace
}

export type { Workspace, CreateWorkspaceParams, UpdateWorkspaceParams }
