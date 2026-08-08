import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  fetchConversations as apiFetchConversations,
  createConversation as apiCreateConversation,
  updateConversation as apiUpdateConversation,
  deleteConversation as apiDeleteConversation,
  restoreConversation as apiRestoreConversation,
  permanentDeleteConversation as apiPermanentDeleteConversation,
  batchConversations as apiBatchConversations,
  reorderConversations as apiReorderConversations,
} from '@/api/conversation'
import type {
  Conversation,
  ConversationListItem,
  CreateConversationParams,
  UpdateConversationParams,
} from '@/types/conversation'
import { useWorkspaceStore } from './workspace'

export const useConversationStore = defineStore('conversation', () => {
  // ---- 状态 ----
  const conversations = ref<ConversationListItem[]>([])
  const loading = ref(false)
  const hasMore = ref(true)
  const cursor = ref<string | undefined>(undefined)
  const deletedConversations = ref<ConversationListItem[]>([])
  const deletedLoading = ref(false)
  // 保存删除前的快照，用于撤销
  let lastDeletedSnapshot: ConversationListItem | null = null

  // ---- 计算属性 ----
  const pinnedConversations = computed(() =>
    conversations.value.filter((c) => c.pinned && !c.archived)
  )

  const recentConversations = computed(() =>
    conversations.value.filter((c) => !c.pinned && !c.archived)
  )

  const archivedConversations = computed(() =>
    conversations.value.filter((c) => c.archived)
  )

  // ---- Actions ----

  /** 加载对话列表 */
  async function fetchConversations(workspaceId?: string) {
    const workspaceStore = useWorkspaceStore()
    const wid = workspaceId ?? workspaceStore.currentWorkspaceId
    if (!wid) return

    loading.value = true
    try {
      const res = await apiFetchConversations(wid, undefined)
      conversations.value = res.result?.items ?? []
      hasMore.value = res.result?.hasMore ?? false
      cursor.value = res.result?.cursor
    } catch {
      ElMessage.error('加载对话列表失败')
    } finally {
      loading.value = false
    }
  }

  /** 加载更多（无限滚动） */
  async function loadMore(workspaceId?: string) {
    if (!hasMore.value || loading.value) return

    const workspaceStore = useWorkspaceStore()
    const wid = workspaceId ?? workspaceStore.currentWorkspaceId
    if (!wid) return

    loading.value = true
    try {
      const res = await apiFetchConversations(wid, cursor.value)
      const items = res.result?.items ?? []
      conversations.value.push(...items)
      hasMore.value = res.result?.hasMore ?? false
      cursor.value = res.result?.cursor
    } catch {
      ElMessage.error('加载更多对话失败')
    } finally {
      loading.value = false
    }
  }

  /** 创建对话 */
  async function createConversation(params?: CreateConversationParams): Promise<Conversation | null> {
    const workspaceStore = useWorkspaceStore()
    try {
      const payload = {
        workspaceId: params?.workspaceId ?? workspaceStore.currentWorkspaceId ?? undefined,
        title: params?.title,
        modelId: params?.modelId,
      }
      const res = await apiCreateConversation(payload)
      const conv = res.result
      if (conv) {
        conversations.value.unshift({
          id: conv.id,
          title: conv.title,
          pinned: false,
          archived: false,
          messageCount: 0,
          updatedAt: conv.updatedAt,
          modelName: '',
        })
      }
      return conv ?? null
    } catch {
      ElMessage.error('创建对话失败')
      return null
    }
  }

  /** 更新对话（乐观更新 + 失败回滚） */
  async function updateConversation(id: string, data: UpdateConversationParams): Promise<boolean> {
    const idx = conversations.value.findIndex((c) => c.id === id)
    if (idx === -1) return false

    const snapshot = { ...conversations.value[idx] }

    // 乐观更新
    if (data.title !== undefined) conversations.value[idx].title = data.title
    if (data.pinned !== undefined) conversations.value[idx].pinned = data.pinned
    if (data.archived !== undefined) conversations.value[idx].archived = data.archived

    try {
      await apiUpdateConversation(id, data)
      return true
    } catch {
      // 失败回滚
      conversations.value[idx] = snapshot as ConversationListItem
      ElMessage.error('更新对话失败')
      return false
    }
  }

  /** 删除对话（软删除，支持撤销） */
  async function deleteConversation(id: string): Promise<boolean> {
    const idx = conversations.value.findIndex((c) => c.id === id)
    if (idx === -1) return false

    lastDeletedSnapshot = { ...conversations.value[idx] }
    conversations.value.splice(idx, 1)

    try {
      await apiDeleteConversation(id)
      ElMessage({
        message: '已移至回收站',
        type: 'success',
        duration: 5000,
        showClose: true,
        onClose: () => {
          lastDeletedSnapshot = null
        },
      })
      return true
    } catch {
      // 失败回滚
      if (lastDeletedSnapshot) {
        conversations.value.splice(idx, 0, lastDeletedSnapshot)
        lastDeletedSnapshot = null
      }
      ElMessage.error('删除对话失败')
      return false
    }
  }

  /** 恢复对话 */
  async function restoreConversation(id: string): Promise<boolean> {
    try {
      const res = await apiRestoreConversation(id)
      const conv = res.result
      if (conv) {
        conversations.value.push({
          id: conv.id,
          title: conv.title,
          pinned: conv.pinned,
          archived: conv.archived,
          messageCount: conv.messageCount,
          lastMessagePreview: conv.lastMessagePreview,
          updatedAt: conv.updatedAt,
          modelName: '',
        })
        deletedConversations.value = deletedConversations.value.filter((d) => d.id !== id)
        ElMessage.success('对话已恢复')
      }
      return true
    } catch {
      ElMessage.error('恢复对话失败')
      return false
    }
  }

  /** 永久删除 */
  async function permanentDelete(id: string): Promise<boolean> {
    try {
      await ElMessageBox.confirm(
        '此操作将永久删除该对话，不可恢复。确定继续？',
        '永久删除',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      await apiPermanentDeleteConversation(id)
      deletedConversations.value = deletedConversations.value.filter((d) => d.id !== id)
      ElMessage.success('对话已永久删除')
      return true
    } catch {
      return false
    }
  }

  /** 置顶/取消置顶 */
  async function togglePin(id: string): Promise<boolean> {
    const conv = conversations.value.find((c) => c.id === id)
    if (!conv) return false
    return updateConversation(id, { pinned: !conv.pinned })
  }

  /** 归档/取消归档 */
  async function toggleArchive(id: string): Promise<boolean> {
    const conv = conversations.value.find((c) => c.id === id)
    if (!conv) return false
    return updateConversation(id, { archived: !conv.archived })
  }

  /** 拖拽排序 */
  async function reorder(fromIndex: number, toIndex: number): Promise<boolean> {
    const items = [...conversations.value]
    const [moved] = items.splice(fromIndex, 1)
    items.splice(toIndex, 0, moved)

    conversations.value = items

    try {
      await apiReorderConversations({
        orderedIds: items.map((c) => c.id),
      })
      return true
    } catch {
      ElMessage.error('排序失败')
      return false
    }
  }

  /** 批量操作 */
  async function batchOperation(ids: string[], action: 'delete' | 'archive'): Promise<boolean> {
    try {
      await apiBatchConversations({ ids, action })
      if (action === 'delete') {
        conversations.value = conversations.value.filter((c) => !ids.includes(c.id))
        ElMessage.success(`已批量删除 ${ids.length} 个对话`)
      } else if (action === 'archive') {
        conversations.value.forEach((c) => {
          if (ids.includes(c.id)) c.archived = true
        })
        ElMessage.success(`已批量归档 ${ids.length} 个对话`)
      }
      return true
    } catch {
      ElMessage.error('批量操作失败')
      return false
    }
  }

  /** 加载回收站列表 */
  async function fetchDeletedConversations(workspaceId?: string) {
    const workspaceStore = useWorkspaceStore()
    const wid = workspaceId ?? workspaceStore.currentWorkspaceId
    if (!wid) return

    deletedLoading.value = true
    try {
      const res = await apiFetchConversations(wid, undefined)
      deletedConversations.value = (res.result?.items ?? []).filter((c) => c.archived)
    } catch {
      ElMessage.error('加载回收站失败')
    } finally {
      deletedLoading.value = false
    }
  }

  /** 清空回收站 */
  async function clearTrash(): Promise<boolean> {
    try {
      await ElMessageBox.confirm(
        '此操作将永久删除回收站中的所有对话，不可恢复。确定继续？',
        '清空回收站',
        {
          confirmButtonText: '确认清空',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      const ids = deletedConversations.value.map((d) => d.id)
      if (ids.length > 0) {
        await apiBatchConversations({ ids, action: 'delete' })
      }
      deletedConversations.value = []
      ElMessage.success('回收站已清空')
      return true
    } catch {
      return false
    }
  }

  return {
    // 状态
    conversations,
    loading,
    hasMore,
    cursor,
    deletedConversations,
    deletedLoading,
    // 计算属性
    pinnedConversations,
    recentConversations,
    archivedConversations,
    // Actions
    fetchConversations,
    loadMore,
    createConversation,
    updateConversation,
    deleteConversation,
    restoreConversation,
    permanentDelete,
    togglePin,
    toggleArchive,
    reorder,
    batchOperation,
    fetchDeletedConversations,
    clearTrash,
  }
})
