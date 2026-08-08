import { request } from '@/utils/request'
import type { UserSettings, ShortcutConfig, AppVersion } from '@/types/settings'

/** 获取用户设置 */
export function fetchUserSettings() {
  return request.get<{ data: UserSettings }>('/api/user/settings')
}

/** 更新用户设置（乐观更新） */
export function updateUserSettings(patch: Partial<UserSettings>) {
  return request.put<{ data: UserSettings }>('/api/user/settings', patch)
}

/** 获取快捷键配置 */
export function fetchShortcuts() {
  return request.get<{ data: ShortcutConfig[] }>('/api/user/shortcuts')
}

/** 更新快捷键 */
export function updateShortcut(action: string, keys: string) {
  return request.put<{ data: ShortcutConfig }>('/api/user/shortcuts', { action, keys })
}

/** 重置快捷键为默认 */
export function resetShortcuts() {
  return request.put<{ data: ShortcutConfig[] }>('/api/user/shortcuts', { reset: true })
}

/** 清理缓存 */
export function clearCache() {
  return request.post<{ data: null }>('/api/user/clear-cache')
}

/** 导出全部数据 */
export function exportAllData() {
  return request.get('/api/user/export', { responseType: 'blob' })
}

/** 删除账户 */
export function deleteAccount() {
  return request.delete<{ data: null }>('/api/user/account')
}

/** 获取版本信息 */
export function fetchAppVersion() {
  return request.get<{ data: AppVersion }>('/api/app/version')
}
