/** 用户设置 */
export interface UserSettings {
  // 通用
  language: 'zh-CN' | 'en-US' | 'auto'
  theme: 'light' | 'dark' | 'system'
  fontSize: 'small' | 'medium' | 'large'
  // 对话
  sendOnEnter: boolean
  autoGenerateTitle: boolean
  streamResponse: boolean
  // 隐私
  saveHistory: boolean
  shareUsageData: boolean
}

/** 快捷键配置 */
export interface ShortcutConfig {
  action: ShortcutAction
  label: string
  defaultKeys: string
  currentKeys: string
}

/** 快捷键动作标识符 */
export type ShortcutAction =
  | 'new-conversation'
  | 'search'
  | 'toggle-sidebar'
  | 'send-message'
  | 'stop-generation'
  | 'copy-last-message'
  | 'toggle-theme'

/** 默认快捷键映射 */
export const DEFAULT_SHORTCUTS: Omit<ShortcutConfig, 'currentKeys'>[] = [
  { action: 'new-conversation', label: '新建对话', defaultKeys: 'Ctrl+N' },
  { action: 'search', label: '搜索', defaultKeys: 'Ctrl+K' },
  { action: 'toggle-sidebar', label: '切换侧边栏', defaultKeys: 'Ctrl+B' },
  { action: 'send-message', label: '发送消息', defaultKeys: 'Enter' },
  { action: 'stop-generation', label: '停止生成', defaultKeys: 'Escape' },
  { action: 'copy-last-message', label: '复制最后消息', defaultKeys: 'Ctrl+Shift+C' },
  { action: 'toggle-theme', label: '切换主题', defaultKeys: 'Ctrl+Shift+T' },
]

/** 版本信息 */
export interface AppVersion {
  version: string
  buildDate: string
  changelogUrl: string
}
