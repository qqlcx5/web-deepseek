// ─── UI Store: Layout, interactions, static data ──────────────────────────────
// All UI state lives here. Components import useUiStore for layout/modal/toast/model.

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useAppStore } from './app'
import type { Model, Workspace, Command, PromptPreset, ModalType } from '@/types'

const TABLET_BP = 1180
const MOBILE_BP = 760

export const useUiStore = defineStore('ui', () => {
  const appStore = useAppStore()

  // ─── Constants ───
  const tabletBreakpoint = TABLET_BP
  const mobileBreakpoint = MOBILE_BP

  // ─── Static Data ───
  const workspaces: Workspace[] = [
    { id: 'personal', name: '个人空间', color: '#5b56d6', count: 0 },
    { id: 'product', name: '产品研发', color: '#16875d', count: 0 },
    { id: 'content', name: '内容创作', color: '#d97706', count: 0 },
  ]

  const promptPresets: PromptPreset[] = [
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

  const commands: Command[] = [
    { title: '新建对话', description: '在当前工作区创建空白对话', icon: 'edit', shortcut: '⌘ N', action: 'new' },
    { title: '切换模型', description: '选择当前会话使用的 AI 模型', icon: 'sparkles', action: 'model' },
    { title: '编辑系统提示词', description: '修改当前会话的行为和回答风格', icon: 'bot', action: 'prompt' },
    { title: '切换专注模式', description: '隐藏侧栏和会话信息面板', icon: 'maximize-2', shortcut: '⌘ ⇧ F', action: 'focus' },
    { title: '切换主题', description: '在亮色和暗色之间切换', icon: 'sun-moon', action: 'theme' },
    { title: '打开设置', description: '管理应用偏好设置', icon: 'settings', action: 'settings' },
    { title: 'Provider 管理', description: '管理 API 服务商和模型', icon: 'server', action: 'provider' },
    { title: '助手管理', description: '管理 AI 助手配置', icon: 'robot', action: 'assistant' },
  ]

  // ─── Layout State ───
  const sidebarOpen = ref(false)
  const inspectorOpen = ref(false)
  const inspectorVisible = ref(true)
  const focusMode = ref(false)
  const online = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const saving = ref(false)

  // ─── Modal ───
  const modal = ref<ModalType>('')

  // ─── Toast ───
  const toast = ref('')
  const undoAction = ref<(() => void) | null>(null)

  // ─── Input State ───
  const commandQuery = ref('')
  const nearBottom = ref(true)
  const promptDraft = ref(
    localStorage.getItem('orbit-prompt') ||
    '你是一名资深AI助手。先给明确结论，再说明关键约束、风险和可执行步骤。',
  )

  // ─── Model Selection (dynamic from providers) ───
  const models = computed<Model[]>(() => {
    return appStore.providers
      .filter(p => p.enabled)
      .flatMap(p =>
        p.models
          .filter(m => m.enabled)
          .map(m => ({
            id: m.id,
            name: m.name,
            providerId: p.id,
            color: '#4d6bfe',
            description: m.description ?? `${p.name} · ${m.name}`,
            tags: [p.name, ...(m.contextLength ? [`${Math.round(m.contextLength / 1000)}K`] : [])],
            contextLength: m.contextLength,
          })),
      )
  })

  const selectedModel = ref<Model | null>(null)

  // Initialize selectedModel from first enabled provider's first model
  function initSelectedModel() {
    if (selectedModel.value) return
    const firstProvider = appStore.providers.find(p => p.enabled && p.models.some(m => m.enabled))
    if (firstProvider) {
      const firstModel = firstProvider.models.find(m => m.enabled)
      if (firstModel) {
        selectedModel.value = {
          id: firstModel.id,
          name: firstModel.name,
          providerId: firstProvider.id,
          color: '#4d6bfe',
          description: firstModel.description ?? `${firstProvider.name} · ${firstModel.name}`,
          tags: [firstProvider.name],
          contextLength: firstModel.contextLength,
        }
      }
    }
    // Fallback to hardcoded if no providers loaded
    if (!selectedModel.value) {
      selectedModel.value = {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        providerId: '',
        color: '#4d6bfe',
        description: '默认模型',
        tags: [],
        contextLength: 64000,
      }
    }
  }

  // ─── Workspace ───
  const activeWorkspaceId = ref<string | null>('personal')

  // ─── Getters ───
  const filteredCommands = computed(() => {
    const q = commandQuery.value.trim().toLowerCase()
    if (!q) return commands
    return commands.filter(c =>
      `${c.title} ${c.description}`.toLowerCase().includes(q),
    )
  })

  const filteredCommandChats = computed(() => {
    // Placeholder: chat store will override via its own getter
    return []
  })

  // ─── Toast Actions ───
  function showToast(message: string, undo?: () => void) {
    toast.value = message
    undoAction.value = undo ?? null
    setTimeout(() => {
      if (toast.value === message) {
        toast.value = ''
        undoAction.value = null
      }
    }, 3200)
  }

  function undo() {
    undoAction.value?.()
    toast.value = ''
    undoAction.value = null
  }

  // ─── Model Actions ───
  function selectModel(model: Model) {
    selectedModel.value = model
    modal.value = ''
    showToast(`已切换到 ${model.name}`)
  }

  function selectModelById(modelId: string, providerId: string) {
    const provider = appStore.providers.find(p => p.id === providerId)
    if (!provider) return
    const modelInfo = provider.models.find(m => m.id === modelId)
    if (!modelInfo) return
    selectedModel.value = {
      id: modelInfo.id,
      name: modelInfo.name,
      providerId: provider.id,
      color: '#4d6bfe',
      description: modelInfo.description ?? `${provider.name} · ${modelInfo.name}`,
      tags: [provider.name],
      contextLength: modelInfo.contextLength,
    }
    modal.value = ''
    showToast(`已切换到 ${modelInfo.name}`)
  }

  // ─── Layout Actions ───
  function toggleFocusMode() {
    focusMode.value = !focusMode.value
    if (focusMode.value) {
      inspectorVisible.value = false
      inspectorOpen.value = false
    } else if (window.innerWidth > TABLET_BP) {
      inspectorVisible.value = true
    }
  }

  function toggleInspector() {
    if (window.innerWidth <= TABLET_BP) {
      inspectorOpen.value = !inspectorOpen.value
    } else {
      inspectorVisible.value = !inspectorVisible.value
    }
  }

  function closeInspector() {
    inspectorOpen.value = false
    inspectorVisible.value = false
  }

  function closeDrawers() {
    sidebarOpen.value = false
    inspectorOpen.value = false
  }

  function handleResize() {
    if (window.innerWidth > TABLET_BP && !focusMode.value) {
      inspectorVisible.value = true
      inspectorOpen.value = false
    } else {
      inspectorVisible.value = false
    }
    if (window.innerWidth > MOBILE_BP) {
      sidebarOpen.value = false
    }
  }

  // ─── Command Actions ───
  function runCommand(command: Command) {
    modal.value = ''
    if (command.action === 'model') modal.value = 'model'
    else if (command.action === 'prompt') modal.value = 'prompt'
    else if (command.action === 'settings') modal.value = 'settings'
    else if (command.action === 'provider') modal.value = 'provider'
    else if (command.action === 'assistant') modal.value = 'assistant'
    else if (command.action === 'focus') toggleFocusMode()
    else if (command.action === 'theme') {
      const { toggleTheme } = useTheme()
      toggleTheme()
    }
    // 'new' is handled by chat store
  }

  function savePrompt() {
    modal.value = ''
    localStorage.setItem('orbit-prompt', promptDraft.value)
    showToast('系统提示词新版本已保存')
  }

  // ─── Network Monitoring ───
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      online.value = true
      showToast('网络已恢复')
    })
    window.addEventListener('offline', () => {
      online.value = false
      showToast('网络已断开，消息将保存在本地')
    })
  }

  return {
    // Constants
    tabletBreakpoint, mobileBreakpoint,
    // Static Data
    workspaces, models, promptPresets, commands,
    // Layout State
    sidebarOpen, inspectorOpen, inspectorVisible, focusMode,
    online, saving, modal, toast, undoAction,
    // Input State
    commandQuery, nearBottom, promptDraft,
    selectedModel, activeWorkspaceId,
    // Getters
    filteredCommands, filteredCommandChats,
    // Actions
    showToast, undo,
    selectModel, selectModelById, initSelectedModel,
    toggleFocusMode, toggleInspector, closeInspector, closeDrawers, handleResize,
    runCommand, savePrompt,
  }
})
