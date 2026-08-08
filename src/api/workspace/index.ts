import { request } from '@/utils/request'
import type { CreateWorkspaceParams, UpdateWorkspaceParams } from '@/types/workspace'

const BASE = '/api/workspaces'

/** 获取工作区列表 */
export function fetchWorkspaces() {
  return request.get<{ data: import('@/types/workspace').Workspace[] }>(BASE)
}

/** 获取单个工作区 */
export function fetchWorkspace(id: string) {
  return request.get<{ data: import('@/types/workspace').Workspace }>(`${BASE}/${id}`)
}

/** 创建工作区 */
export function createWorkspace(data: CreateWorkspaceParams) {
  return request.post<{ data: import('@/types/workspace').Workspace }>(BASE, data)
}

/** 更新工作区 */
export function updateWorkspace(id: string, data: UpdateWorkspaceParams) {
  return request.put<{ data: import('@/types/workspace').Workspace }>(`${BASE}/${id}`, data)
}

/** 删除工作区 */
export function deleteWorkspace(id: string) {
  return request.delete(`${BASE}/${id}`)
}

/** 导出工作区 */
export function exportWorkspace(id: string) {
  return request.get(`${BASE}/${id}/export`, {}, { responseType: 'blob' })
}

/** 导入工作区 */
export function importWorkspace(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${BASE}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
