import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchUserSettings,
  updateUserSettings,
  fetchShortcuts,
  updateShortcut as apiUpdateShortcut,
  resetShortcuts as apiResetShortcuts,
  clearCache as apiClearCache,
  exportAllData as apiExportAllData,
  deleteAccount as apiDeleteAccount,
} from '@/api/settings'
import type { UserSettings, ShortcutConfig } from '@/types/settings'
import { DEFAULT_SHORTCUTS } from '@/types/settings'
import { ElMessage, ElMessageBox } from 'element-plus'

export const useSettingsStore = defineStore('settings', () => {
  // ---- 状态 ----
  const settings = ref<UserSettings>({
    language: 'auto',
    theme: 'system',
    fontSize: 'medium',
    sendOnEnter: true,
    autoGenerateTitle: true,
    streamResponse: true,
    saveHistory: true,
    shareUsageData: false,
  })

  const shortcuts = ref<ShortcutConfig[]>(
    DEFAULT_SHORTCUTS.map((s) => ({ ...s, currentKeys: s.defaultKeys }))
  )

  const isDirty = ref(false)
  const loading = ref(false)
  const settingsLoaded = ref(false)

  // ---- 计算属性 ----
  const theme = computed(() => settings.value.theme)
  const fontSize = computed(() => settings.value.fontSize)

  // ---- 操作 ----

  /** 加载用户设置 */
  async function loadSettings() {
    loading.value = true
    try {
      const [settingsRes, shortcutsRes] = await Promise.all([
        fetchUserSettings(),
        fetchShortcuts(),
      ])
      if (settingsRes?.data) {
        settings.value = { ...settings.value, ...settingsRes.data }
      }
      if (shortcutsRes?.data?.length) {
        shortcuts.value = shortcutsRes.data
      }
      settingsLoaded.value = true
    } catch {
      // 使用默认值
      settingsLoaded.value = true
    } finally {
      loading.value = false
    }
  }

  /** 乐观更新设置 */
  async function updateSettings(patch: Partial<UserSettings>) {
    // 乐观更新
    Object.assign(settings.value, patch)
    isDirty.value = true
    try {
      await updateUserSettings(patch)
      isDirty.value = false
      ElMessage.success('设置已保存')
    } catch {
      ElMessage.error('保存设置失败')
    }
  }

  /** 更新单个快捷键 */
  async function updateShortcut(action: string, keys: string) {
    const item = shortcuts.value.find((s) => s.action === action)
    if (!item) return
    const previousKeys = item.currentKeys
    // 乐观更新
    item.currentKeys = keys
    try {
      await apiUpdateShortcut(action, keys)
      ElMessage.success('快捷键已更新')
    } catch {
      item.currentKeys = previousKeys
      ElMessage.error('更新快捷键失败')
    }
  }

  /** 重置快捷键为默认 */
  async function resetShortcuts() {
    try {
      await apiResetShortcuts()
      shortcuts.value = DEFAULT_SHORTCUTS.map((s) => ({ ...s, currentKeys: s.defaultKeys }))
      ElMessage.success('快捷键已重置为默认')
    } catch {
      ElMessage.error('重置快捷键失败')
    }
  }

  /** 清理缓存 */
  async function clearCache() {
    try {
      await apiClearCache()
      ElMessage.success('缓存已清理')
    } catch {
      ElMessage.error('清理缓存失败')
    }
  }

  /** 导出全部数据 */
  async function exportAllData() {
    try {
      const blob = await apiExportAllData()
      const url = URL.createObjectURL(blob as unknown as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cherry-studio-data-${Date.now()}.zip`
      a.click()
      URL.revokeObjectURL(url)
      ElMessage.success('数据导出成功')
    } catch {
      ElMessage.error('导出数据失败')
    }
  }

  /** 删除账户 */
  async function deleteAccount() {
    try {
      await ElMessageBox.confirm('确定要永久删除账户吗？此操作不可撤销，所有数据将被清除。', '删除账户', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
      })
      await apiDeleteAccount()
      ElMessage.success('账户已删除')
    } catch (e: unknown) {
      if (e !== 'cancel') {
        ElMessage.error('删除账户失败')
      }
    }
  }

  return {
    settings,
    shortcuts,
    isDirty,
    loading,
    settingsLoaded,
    theme,
    fontSize,
    loadSettings,
    updateSettings,
    updateShortcut,
    resetShortcuts,
    clearCache,
    exportAllData,
    deleteAccount,
  }
})
