import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import type {
  Model,
  Workspace,
  Command,
  PromptPreset,
  ModalType,
} from '@/types/chat'

export const useUiStore = defineStore('ui', () => {
  // ─── Constants ───
  const tabletBreakpoint = 1180
  const mobileBreakpoint = 760

  // ─── Static Data ───
  const workspaces: Workspace[] = [
    { id: 'personal', name: '个人空间', color: '#5b56d6', count: 0 },
    { id: 'product', name: '产品研发', color: '#16875d', count: 0 },
    { id: 'content', name: '内容创作', color: '#d97706', count: 0 },
  ]

  const models: Model[] = [
    {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat',
      color: '#4d6bfe',
      description: '中文和代码能力均衡，适合成本敏感的技术任务。',
      tags: ['中文', '代码', '64K', '$'],
      contextLength: 64000,
    },
    {
      id: 'deepseek-reasoner',
      name: 'DeepSeek Reasoner',
      color: '#4d6bfe',
      description: '深度推理模型，适合复杂数学、逻辑和编程问题。',
      tags: ['推理', '数学', '代码', '$$'],
      contextLength: 64000,
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o mini',
      color: '#10a37f',
      description: '速度快、成本低，适合常规对话、视觉和文件任务。',
      tags: ['视觉', '文件', '128K', '$'],
      contextLength: 128000,
    },
    {
      id: 'claude-haiku',
      name: 'Claude 3.5 Haiku',
      color: '#d97757',
      description: '自然语言质量稳定，适合写作、摘要和长文档。',
      tags: ['文件', '长上下文', '200K', '$'],
      contextLength: 200000,
    },
    {
      id: 'gemini-flash',
      name: 'Gemini 2.0 Flash',
      color: '#4285f4',
      description: '多模态和长上下文能力突出，响应速度快。',
      tags: ['视觉', '音频', '1M', '$'],
      contextLength: 1000000,
    },
  ]

  const promptPresets: PromptPreset[] = [
    {
      name: '技术评审',
      value:
        '你是一名资深软件架构师。检查正确性、安全性、可维护性和迁移风险。先给结论，再给执行步骤。',
    },
    {
      name: '产品评审',
      value:
        '你是一名资深产品经理。围绕用户价值、业务目标、边界条件和验收标准评审需求。',
    },
    {
      name: '简洁回答',
      value:
        '使用简洁中文回答。先给结论，最多列出五个关键步骤，不重复用户已经知道的信息。',
    },
  ]

  const commands: Command[] = [
    { title: '新建对话', description: '在当前工作区创建空白对话', icon: 'edit', shortcut: '⌘ N', action: 'new' },
    { title: '切换模型', description: '选择当前会话使用的 AI 模型', icon: 'sparkles', action: 'model' },
    { title: '编辑系统提示词', description: '修改当前会话的行为和回答风格', icon: 'bot', action: 'prompt' },
    { title: '切换专注模式', description: '隐藏侧栏和会话信息面板', icon: 'maximize-2', shortcut: '⌘ ⇧ F', action: 'focus' },
    { title: '切换主题', description: '在亮色和暗色之间切换', icon: 'sun-moon', action: 'theme' },
  ]

  // ─── Layout State ───
  const sidebarOpen = ref(false)
  const inspectorOpen = ref(false)
  const inspectorVisible = ref(true)
  const focusMode = ref(false)
  const online = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const saving = ref(false)
  const modal = ref<ModalType>('')
  const toast = ref('')
  const undoAction = ref<(() => void) | null>(null)

  // ─── UI State ───
  const commandQuery = ref('')
  const nearBottom = ref(true)
  const promptDraft = ref(
    '你是一名资深AI助手。先给明确结论，再说明关键约束、风险和可执行步骤。',
  )
  const selectedModel = ref<Model>(models[0]!)
  const activeWorkspaceId = ref<string | null>(null)

  // ─── Getters ───
  const filteredCommands = computed(() => {
    const query = commandQuery.value.trim().toLowerCase()
    if (!query) return commands
    return commands.filter(c =>
      `${c.title} ${c.description}`.toLowerCase().includes(query),
    )
  })

  // ─── Actions: Toast ───
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

  // ─── Actions: Model ───
  function selectModel(model: Model) {
    selectedModel.value = model
    modal.value = ''
    showToast(`已切换到 ${model.name}`)
  }

  // ─── Actions: Layout ───
  function toggleFocusMode() {
    focusMode.value = !focusMode.value
    if (focusMode.value) {
      inspectorVisible.value = false
      inspectorOpen.value = false
    } else if (window.innerWidth > tabletBreakpoint) {
      inspectorVisible.value = true
    }
  }

  function toggleInspector() {
    if (window.innerWidth <= tabletBreakpoint) {
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

  // ─── Actions: Resize ───
  function handleResize() {
    if (window.innerWidth > tabletBreakpoint && !focusMode.value) {
      inspectorVisible.value = true
      inspectorOpen.value = false
    } else {
      inspectorVisible.value = false
    }
    if (window.innerWidth > mobileBreakpoint) {
      sidebarOpen.value = false
    }
  }

  // ─── Actions: Commands ───
  function runCommand(command: Command) {
    modal.value = ''
    if (command.action === 'new') {
      // Actual new chat creation is handled by the chat store / component layer.
      // We just close the modal here.
    } else if (command.action === 'model') {
      modal.value = 'model'
    } else if (command.action === 'prompt') {
      modal.value = 'prompt'
    } else if (command.action === 'focus') {
      toggleFocusMode()
    } else if (command.action === 'theme') {
      const { toggleTheme } = useTheme()
      toggleTheme()
    }
  }

  // ─── Actions: Prompt ───
  function savePrompt() {
    modal.value = ''
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
      showToast('网络已断开')
    })
  }

  return {
    // Constants
    tabletBreakpoint,
    mobileBreakpoint,
    // Static Data
    workspaces,
    models,
    promptPresets,
    commands,
    // Layout State
    sidebarOpen,
    inspectorOpen,
    inspectorVisible,
    focusMode,
    online,
    saving,
    modal,
    toast,
    undoAction,
    commandQuery,
    nearBottom,
    promptDraft,
    selectedModel,
    activeWorkspaceId,
    // Getters
    filteredCommands,
    // Actions
    showToast,
    undo,
    selectModel,
    toggleFocusMode,
    toggleInspector,
    closeInspector,
    closeDrawers,
    handleResize,
    runCommand,
    savePrompt,
  }
})
