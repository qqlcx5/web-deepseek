import { defineStore } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  fetchWorkspaces as apiFetchWorkspaces,
  createWorkspace as apiCreateWorkspace,
  updateWorkspace as apiUpdateWorkspace,
  deleteWorkspace as apiDeleteWorkspace,
  exportWorkspace as apiExportWorkspace,
  importWorkspace as apiImportWorkspace,
} from '@/api/workspace'
import type { Workspace, CreateWorkspaceParams, UpdateWorkspaceParams } from '@/types/workspace'

interface WorkspaceState {
  /** 所有工作区列表 */
  workspaces: Workspace[]
  /** 当前工作区 ID */
  currentWorkspaceId: string | null
  /** 加载状态 */
  loading: boolean
}

export const useWorkspaceStore = defineStore('workspace', {
  state: (): WorkspaceState => ({
    workspaces: [],
    currentWorkspaceId: null,
    loading: false,
  }),

  getters: {
    /** 当前工作区对象 */
    currentWorkspace(state): Workspace | null {
      return state.workspaces.find((w) => w.id === state.currentWorkspaceId) ?? null
    },

    /** 工作区数量 */
    workspaceCount(state): number {
      return state.workspaces.length
    },
  },

  actions: {
    /** 加载所有工作区列表 */
    async fetchWorkspaces() {
      this.loading = true
      try {
        const res = await apiFetchWorkspaces()
        this.workspaces = res.result?.data ?? []
        // 如果当前没有选中工作区且列表不为空，自动选中第一个
        if (!this.currentWorkspaceId && this.workspaces.length > 0) {
          this.currentWorkspaceId = this.workspaces[0].id
        }
      } catch {
        ElMessage.error('加载工作区列表失败')
      } finally {
        this.loading = false
      }
    },

    /** 切换当前工作区 */
    setCurrentWorkspace(id: string) {
      this.currentWorkspaceId = id
      window.dispatchEvent(new CustomEvent('workspace:changed', { detail: { id } }))
    },

    /** 创建工作区 */
    async createWorkspace(data: CreateWorkspaceParams): Promise<Workspace | null> {
      try {
        const res = await apiCreateWorkspace(data)
        const workspace = res.result?.data
        if (workspace) {
          this.workspaces.push(workspace)
          this.setCurrentWorkspace(workspace.id)
          ElMessage.success('工作区创建成功')
        }
        return workspace ?? null
      } catch {
        ElMessage.error('创建工作区失败')
        return null
      }
    },

    /** 更新工作区 */
    async updateWorkspace(id: string, data: UpdateWorkspaceParams): Promise<boolean> {
      try {
        const res = await apiUpdateWorkspace(id, data)
        const updated = res.result?.data
        if (updated) {
          const idx = this.workspaces.findIndex((w) => w.id === id)
          if (idx !== -1) {
            this.workspaces[idx] = updated
          }
          ElMessage.success('工作区更新成功')
        }
        return true
      } catch {
        ElMessage.error('更新工作区失败')
        return false
      }
    },

    /** 删除工作区 */
    async deleteWorkspace(id: string): Promise<boolean> {
      const workspace = this.workspaces.find((w) => w.id === id)
      if (!workspace) return false

      try {
        // ElMessageBox 二次确认 + 输入名称确认
        await ElMessageBox.prompt(
          `请输入工作区名称「${workspace.name}」以确认删除：`,
          '删除工作区',
          {
            confirmButtonText: '确认删除',
            cancelButtonText: '取消',
            type: 'warning',
            inputPattern: new RegExp(`^${workspace.name}$`),
            inputErrorMessage: '输入的名称不匹配',
          },
        )

        await apiDeleteWorkspace(id)
        this.workspaces = this.workspaces.filter((w) => w.id !== id)

        // 如果删除的是当前工作区，切换到第一个
        if (this.currentWorkspaceId === id) {
          this.currentWorkspaceId = this.workspaces.length > 0 ? this.workspaces[0].id : null
        }

        ElMessage.success('工作区已删除')
        return true
      } catch {
        // 用户取消或输入错误不会抛出 Error，ElMessageBox 会内部处理
        return false
      }
    },

    /** 导出工作区 */
    async exportWorkspace(id: string) {
      try {
        const workspace = this.workspaces.find((w) => w.id === id)
        const res = await apiExportWorkspace(id)
        const blob = res.result as unknown as Blob
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${workspace?.name ?? 'workspace'}-export.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        ElMessage.success('工作区导出成功')
      } catch {
        ElMessage.error('导出工作区失败')
      }
    },

    /** 导入工作区 */
    async importWorkspace(file: File): Promise<boolean> {
      try {
        const res = await apiImportWorkspace(file)
        const workspace = res.result?.data
        if (workspace) {
          this.workspaces.push(workspace)
          ElMessage.success('工作区导入成功')
        }
        return true
      } catch {
        ElMessage.error('导入工作区失败')
        return false
      }
    },
  },
})
