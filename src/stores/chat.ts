import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Chat, Message, Model, Workspace, Attachment, Command, PromptPreset } from '@/types/chat'

export const useChatStore = defineStore('chat', () => {
  // ─── State ───
  const chats = ref<Chat[]>([
    { id: 'migration', title: 'Cloudflare D1 迁移方案', preview: '补充 MinIO 迁移和备份恢复流程', pinned: true },
    { id: 'architecture', title: 'AI 对话网站架构评审', preview: 'Workers、D1 和 Kodo 的边界设计' },
    { id: 'prompt', title: '产品需求评审提示词', preview: '先识别目标，再检查验收标准' },
    { id: 'cost', title: '模型 API 成本估算', preview: '按 1000 用户估算月度 Token 消耗' },
    { id: 'document', title: '用户访谈文档分析', preview: '整理高频问题与功能优先级' },
  ])

  const activeChatId = ref('migration')
  const sidebarOpen = ref(false)
  const inspectorOpen = ref(false)
  const focusMode = ref(false)
  const online = ref(true)
  const saving = ref(false)
  const modal = ref('')
  const toast = ref('')
  const undoAction = ref<(() => void) | null>(null)
  const commandQuery = ref('')
  const draft = ref('')
  const replyingTo = ref('')
  const attachments = ref<Attachment[]>([])
  const generating = ref(false)
  const nearBottom = ref(true)
  const promptDraft = ref('你是一名资深云架构师。先给明确结论，再说明关键约束、风险和可执行步骤。涉及迁移时优先使用开放标准。')
  const tabletBreakpoint = 1180
  const mobileBreakpoint = 760

  const inspectorVisible = ref(true)

  const workspaces: Workspace[] = [
    { id: 'personal', name: '个人空间', color: '#5b56d6', count: 8 },
    { id: 'product', name: '产品研发', color: '#16875d', count: 5 },
    { id: 'content', name: '内容创作', color: '#d97706', count: 3 },
  ]

  const models: Model[] = [
    { id: 'gpt-4o-mini', name: 'GPT-4o mini', color: '#10a37f', description: '速度快、成本低，适合常规对话、视觉和文件任务。', tags: ['视觉', '文件', '128K', '$'] },
    { id: 'claude-haiku', name: 'Claude 3.5 Haiku', color: '#d97757', description: '自然语言质量稳定，适合写作、摘要和长文档。', tags: ['文件', '长上下文', '200K', '$'] },
    { id: 'gemini-flash', name: 'Gemini 2.0 Flash', color: '#4285f4', description: '多模态和长上下文能力突出，响应速度快。', tags: ['视觉', '音频', '1M', '$'] },
    { id: 'deepseek-chat', name: 'DeepSeek Chat', color: '#4d6bfe', description: '中文和代码能力均衡，适合成本敏感的技术任务。', tags: ['中文', '代码', '64K', '$'] },
  ]

  const selectedModel = ref(models[0])

  const messages = ref<Message[]>([
    {
      id: 1, role: 'user',
      content: 'D1 数据迁移到本地 SQLite 时，最容易被忽略的风险有哪些？请给出可直接执行的检查清单。',
      time: '10:24',
    },
    {
      id: 2, role: 'assistant', model: 'GPT-4o mini', time: '10:24', rating: '', branches: 2, activeBranch: 1,
      content: `最容易忽略的不是 SQL 导出本身，而是**应用对 Cloudflare 运行时行为的隐式依赖**。

### 迁移前检查

1. 确认所有表都有稳定主键，不依赖 D1 自动行为。
2. 检查外键约束、触发器和索引是否完整导出。
3. 时间统一保存为 UTC，不依赖 Worker 所在时区。
4. 数据库只保存附件的 Object Key，不保存临时签名 URL。
5. 把 D1 Binding 封装在 Repository 层，业务代码不直接调用。

\`\`\`bash
wrangler d1 export orbit-db --remote --output backup.sql
sqlite3 orbit.db "PRAGMA integrity_check;"
sqlite3 orbit.db "PRAGMA foreign_key_check;"
\`\`\`

建议在正式迁移前做一次完整恢复演练，并对比记录数和附件引用数。`,
      sources: [
        { name: 'Cloudflare D1 Export 文档', domain: 'developers.cloudflare.com', url: 'https://developers.cloudflare.com/d1/' },
        { name: 'SQLite Integrity Check', domain: 'sqlite.org', url: 'https://sqlite.org/pragma.html' },
      ],
      artifact: { name: 'migration-checklist.md', meta: 'Markdown · 2.4 KB · 刚刚生成' },
    },
    {
      id: 3, role: 'user',
      content: '再补充一下七牛云迁移到 MinIO 时的验证步骤。',
      time: '10:27',
    },
    {
      id: 4, role: 'assistant', model: 'GPT-4o mini', time: '10:27', branches: 1, activeBranch: 1,
      content: `迁移附件时应同时验证**对象完整性、元数据和数据库引用关系**。

| 检查项 | 验证方式 |
|---|---|
| 文件数量 | 对比 Kodo 与 MinIO 对象总数 |
| 文件内容 | 抽样或全量校验 ETag / SHA-256 |
| Content-Type | 检查图片、PDF 等响应头 |
| Object Key | 保持数据库中的 Key 不变 |
| 私有访问 | 验证临时签名 URL 和过期时间 |

迁移完成后，使用只读流量验证一段时间，再停止向旧存储写入。`,
    },
  ])

  const promptPresets: PromptPreset[] = [
    { name: '技术评审', value: '你是一名资深软件架构师。检查正确性、安全性、可维护性和迁移风险。先给结论，再给执行步骤。' },
    { name: '产品评审', value: '你是一名资深产品经理。围绕用户价值、业务目标、边界条件和验收标准评审需求。' },
    { name: '简洁回答', value: '使用简洁中文回答。先给结论，最多列出五个关键步骤，不重复用户已经知道的信息。' },
  ]

  const commands: Command[] = [
    { title: '新建对话', description: '在当前工作区创建空白对话', icon: 'square-pen', shortcut: '⌘ N', action: 'new' },
    { title: '切换模型', description: '选择当前会话使用的 AI 模型', icon: 'sparkles', action: 'model' },
    { title: '编辑系统提示词', description: '修改当前会话的行为和回答风格', icon: 'bot', action: 'prompt' },
    { title: '切换专注模式', description: '隐藏侧栏和会话信息面板', icon: 'maximize-2', shortcut: '⌘ ⇧ F', action: 'focus' },
    { title: '模拟离线状态', description: '检查断网时的消息队列体验', icon: 'wifi-off', action: 'offline' },
  ]

  // ─── Getters ───
  const currentChat = computed(() =>
    chats.value.find(c => c.id === activeChatId.value) || chats.value[0],
  )

  const canSend = computed(() =>
    Boolean(draft.value.trim() || attachments.value.length) && !generating.value,
  )

  const filteredCommands = computed(() => {
    const query = commandQuery.value.trim().toLowerCase()
    if (!query) return commands
    return commands.filter(c => `${c.title} ${c.description}`.toLowerCase().includes(query))
  })

  const filteredCommandChats = computed(() => {
    const query = commandQuery.value.trim().toLowerCase()
    if (!query) return chats.value.slice(0, 4)
    return chats.value.filter(c => `${c.title} ${c.preview}`.toLowerCase().includes(query))
  })

  // ─── Actions ───
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

  function newConversation() {
    const id = `chat-${Date.now()}`
    chats.value.unshift({ id, title: '新对话', preview: '暂无消息' })
    activeChatId.value = id
    sidebarOpen.value = false
    showToast('新对话已创建')
  }

  function openConversation(id: string) {
    activeChatId.value = id
    sidebarOpen.value = false
  }

  function selectModel(model: Model) {
    selectedModel.value = model
    modal.value = ''
    showToast(`已切换到 ${model.name}`)
  }

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

  function runCommand(command: Command) {
    modal.value = ''
    if (command.action === 'new') newConversation()
    if (command.action === 'model') modal.value = 'model'
    if (command.action === 'prompt') modal.value = 'prompt'
    if (command.action === 'focus') toggleFocusMode()
    if (command.action === 'offline') {
      online.value = !online.value
      showToast(online.value ? '网络连接已恢复' : '已切换到离线演示状态')
    }
  }

  function savePrompt() {
    modal.value = ''
    showToast('系统提示词新版本已保存')
  }

  function sendMessage() {
    if (!canSend.value) return

    const content = draft.value.trim()
      || `请分析附件：${attachments.value.map(f => f.name).join('、')}`

    messages.value.push({
      id: Date.now(),
      role: 'user',
      content,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    })

    draft.value = ''
    attachments.value = []
    replyingTo.value = ''

    const assistant: Message = {
      id: Date.now() + 1,
      role: 'assistant',
      model: selectedModel.value.name,
      time: '刚刚',
      content: '',
      loading: true,
      branches: 1,
      activeBranch: 1,
    }
    messages.value.push(assistant)
    generating.value = true
  }

  function stopGeneration() {
    generating.value = false
    const last = messages.value[messages.value.length - 1]
    if (last?.role === 'assistant') {
      last.loading = false
      last.content ||= '_生成已停止。_'
    }
    showToast('已停止生成')
  }

  function copyMessage(message: Message) {
    navigator.clipboard.writeText(message.content).then(
      () => showToast('消息已复制'),
      () => showToast('浏览器未授予剪贴板权限'),
    )
  }

  function rateMessage(message: Message, rating: string) {
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

  function addFiles(files: File[]) {
    files.slice(0, 6 - attachments.value.length).forEach(file => {
      attachments.value.push({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size < 1024 * 1024
          ? `${Math.max(1, Math.round(file.size / 1024))} KB`
          : `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      })
    })
    showToast(`${files.length} 个文件已加入上下文`)
  }

  function removeAttachment(file: Attachment) {
    const index = attachments.value.findIndex(a => a.id === file.id)
    if (index === -1) return
    const removed = attachments.value.splice(index, 1)[0]
    showToast('附件已移除', () => {
      attachments.value.splice(index, 0, removed)
    })
  }

  return {
    chats, activeChatId, sidebarOpen, inspectorOpen, inspectorVisible,
    focusMode, online, saving, modal, toast, undoAction, commandQuery,
    draft, replyingTo, attachments, generating, nearBottom, promptDraft,
    tabletBreakpoint, mobileBreakpoint,
    workspaces, models, selectedModel, messages, promptPresets, commands,
    currentChat, canSend, filteredCommands, filteredCommandChats,
    showToast, undo, newConversation, openConversation, selectModel,
    toggleFocusMode, toggleInspector, closeInspector, closeDrawers,
    runCommand, savePrompt, sendMessage, stopGeneration,
    copyMessage, rateMessage, regenerate, branchFrom, editMessage,
    addFiles, removeAttachment,
  }
})
