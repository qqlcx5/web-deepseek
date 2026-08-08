import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useChatStreaming } from '@/composables/useChatStreaming'
import { useTheme } from '@/composables/useTheme'
import type {
  Chat,
  Message,
  Model,
  Workspace,
  Attachment,
  Command,
  PromptPreset,
  ModalType,
  ThemeMode,
} from '@/types/chat'

export const useChatStore = defineStore('chat', () => {
  // ─── Theme ───
  const themeMode = ref<ThemeMode>('light')

  // ─── Layout State ───
  const sidebarOpen = ref(false)
  const inspectorOpen = ref(false)
  const inspectorVisible = ref(true)
  const focusMode = ref(false)
  const online = ref(true)
  const saving = ref(false)
  const modal = ref<ModalType>('')
  const toast = ref('')
  const undoAction = ref<(() => void) | null>(null)

  // ─── Chat State ───
  const chats = ref<Chat[]>([])
  const activeChatId = ref<string>('')
  const messages = ref<Message[]>([])
  const draft = ref('')
  const replyingTo = ref('')
  const attachments = ref<Attachment[]>([])
  const nearBottom = ref(true)
  const commandQuery = ref('')
  const promptDraft = ref(
    '你是一名资深AI助手。先给明确结论，再说明关键约束、风险和可执行步骤。',
  )

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

  const selectedModel = ref<Model>(models[0]!)

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

  // ─── Streaming ───
  const {
    generating,
    streamAssistantMessage,
    stopGeneration,
  } = useChatStreaming({
    model: selectedModel,
    systemPrompt: promptDraft,
    messages,
    onMessageUpdated: () => {
      if (nearBottom.value) {
        // Trigger scroll via watcher in ChatMessages
      }
    },
    onComplete: () => {
      saving.value = true
      setTimeout(() => { saving.value = false }, 700)
      updateChatPreview()
    },
    onError: (err) => {
      showToast(`请求失败：${err.message}`)
    },
  })

  // ─── Getters ───
  const currentChat = computed(() =>
    chats.value.find(c => c.id === activeChatId.value) || null,
  )

  const canSend = computed(() =>
    Boolean(draft.value.trim() || attachments.value.length) && !generating.value,
  )

  const filteredCommands = computed(() => {
    const query = commandQuery.value.trim().toLowerCase()
    if (!query) return commands
    return commands.filter(c =>
      `${c.title} ${c.description}`.toLowerCase().includes(query),
    )
  })

  const filteredCommandChats = computed(() => {
    const query = commandQuery.value.trim().toLowerCase()
    if (!query) return chats.value.slice(0, 4)
    return chats.value
      .filter(c => `${c.title} ${c.preview}`.toLowerCase().includes(query))
      .slice(0, 4)
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

  // ─── Actions: Chat ───
  function newConversation() {
    const id = `chat-${Date.now()}`
    const chat: Chat = {
      id,
      title: '新对话',
      preview: '暂无消息',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageCount: 0,
    }
    chats.value.unshift(chat)
    activeChatId.value = id
    messages.value = []
    sidebarOpen.value = false
    showToast('新对话已创建')
  }

  function openConversation(id: string) {
    activeChatId.value = id
    sidebarOpen.value = false
    // In a real app, load messages from API/localStorage here
    const chat = chats.value.find(c => c.id === id)
    if (chat && chat.messageCount === 0) {
      messages.value = []
    }
  }

  function deleteConversation(id: string) {
    const index = chats.value.findIndex(c => c.id === id)
    if (index === -1) return
    const removed = chats.value.splice(index, 1)[0]!
    if (activeChatId.value === id) {
      activeChatId.value = chats.value[0]?.id || ''
      messages.value = []
    }
    showToast('对话已删除', () => {
      chats.value.splice(index, 0, removed)
    })
  }

  function updateChatPreview() {
    const chat = chats.value.find(c => c.id === activeChatId.value)
    if (!chat) return
    const lastUserMsg = [...messages.value].reverse().find(m => m.role === 'user')
    if (lastUserMsg) {
      chat.preview = lastUserMsg.content.slice(0, 50)
      chat.title = chat.title === '新对话' ? lastUserMsg.content.slice(0, 30) : chat.title
    }
    chat.messageCount = messages.value.length
    chat.updatedAt = Date.now()
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

  // ─── Actions: Commands ───
  function runCommand(command: Command) {
    modal.value = ''
    if (command.action === 'new') newConversation()
    else if (command.action === 'model') modal.value = 'model'
    else if (command.action === 'prompt') modal.value = 'prompt'
    else if (command.action === 'focus') toggleFocusMode()
    else if (command.action === 'theme') {
      const { toggleTheme } = useTheme()
      toggleTheme()
    }
  }

  // ─── Actions: Prompt ───
  function savePrompt() {
    modal.value = ''
    showToast('系统提示词新版本已保存')
  }

  // ─── Actions: Messages ───
  function sendMessage() {
    if (!canSend.value) return

    // Ensure there's an active chat
    if (!activeChatId.value) {
      newConversation()
    }

    const content = draft.value.trim()
      || `请分析附件：${attachments.value.map(f => f.name).join('、')}`

    draft.value = ''
    attachments.value = []
    replyingTo.value = ''

    streamAssistantMessage(content)
  }

  function copyMessage(message: Message) {
    navigator.clipboard.writeText(message.content).then(
      () => showToast('消息已复制'),
      () => showToast('浏览器未授予剪贴板权限'),
    )
  }

  function rateMessage(message: Message, rating: 'up' | 'down') {
    message.rating = message.rating === rating ? '' : rating
    showToast(message.rating ? '反馈已记录' : '反馈已取消')
  }

  function regenerate(message: Message) {
    message.branches = (message.branches || 1) + 1
    message.activeBranch = message.branches
    showToast('已创建新的回复分支')
  }

  function branchFrom(message: Message) {
    replyingTo.value = message.content.slice(0, 42)
    showToast('下一条消息将在新分支中发送')
  }

  function editMessage(message: Message) {
    draft.value = message.content
    replyingTo.value = '编辑历史消息后重新发送'
  }

  // ─── Actions: Attachments ───
  function addFiles(files: File[]) {
    const maxSlots = 6 - attachments.value.length
    files.slice(0, maxSlots).forEach(file => {
      attachments.value.push({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size:
          file.size < 1024 * 1024
            ? `${Math.max(1, Math.round(file.size / 1024))} KB`
            : `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: file.type,
      })
    })
    showToast(`${Math.min(files.length, maxSlots)} 个文件已加入上下文`)
  }

  function removeAttachment(file: Attachment) {
    const index = attachments.value.findIndex(a => a.id === file.id)
    if (index === -1) return
    const removed = attachments.value.splice(index, 1)[0]!
    showToast('附件已移除', () => {
      attachments.value.splice(index, 0, removed)
    })
  }

  return {
    // Theme
    themeMode,
    // Layout
    sidebarOpen, inspectorOpen, inspectorVisible, focusMode,
    online, saving, modal, toast, undoAction, commandQuery,
    draft, replyingTo, attachments, generating, nearBottom, promptDraft,
    tabletBreakpoint, mobileBreakpoint,
    // Data
    workspaces, models, selectedModel, messages, promptPresets, commands,
    chats, activeChatId,
    // Getters
    currentChat, canSend, filteredCommands, filteredCommandChats,
    // Actions
    showToast, undo, newConversation, openConversation, deleteConversation,
    selectModel, toggleFocusMode, toggleInspector, closeInspector, closeDrawers,
    runCommand, savePrompt, sendMessage, stopGeneration,
    copyMessage, rateMessage, regenerate, branchFrom, editMessage,
    addFiles, removeAttachment,
  }
})
