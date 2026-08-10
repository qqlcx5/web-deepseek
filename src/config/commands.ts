// ─── Static UI Configuration ──────────────────────────────────────────────────
// Command-palette entries and system-prompt presets. Pure data, no state.

import type { Command, PromptPreset } from '@/types'

export const PROMPT_PRESETS: PromptPreset[] = [
  {
    name: '技术评审',
    value: '你是一名资深软件架构师。检查正确性、安全性、可维护性和迁移风险。先给结论，再给执行步骤。',
  },
  {
    name: '产品评审',
    value: '你是一名资深产品经理。围绕用户价值、业务目标、边界条件和验收标准评审需求。',
  },
  {
    name: '简洁回答',
    value: '使用简洁中文回答。先给结论，最多列出五个关键步骤，不重复用户已经知道的信息。',
  },
]

export const COMMANDS: Command[] = [
  { title: '新建对话', description: '在当前工作区创建空白对话', icon: 'edit', shortcut: '⌘ N', action: 'new' },
  { title: '切换模型', description: '选择当前会话使用的 AI 模型', icon: 'sparkles', action: 'model' },
  { title: '编辑系统提示词', description: '修改当前会话的行为和回答风格', icon: 'bot', action: 'prompt' },
  { title: '切换专注模式', description: '隐藏侧栏和会话信息面板', icon: 'maximize-2', shortcut: '⌘ ⇧ F', action: 'focus' },
  { title: '切换主题', description: '在亮色和暗色之间切换', icon: 'sun-moon', action: 'theme' },
  { title: '打开设置', description: '管理应用偏好设置', icon: 'settings', action: 'settings' },
  { title: 'Provider 管理', description: '管理 API 服务商和模型', icon: 'server', action: 'provider' },
  { title: '助手管理', description: '管理 AI 助手配置', icon: 'robot', action: 'assistant' },
]
