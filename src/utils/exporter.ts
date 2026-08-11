import type {
  AppData, Provider, Assistant, Topic, ChatMessage,
  MessageBlock, ModelRef, Settings,
} from '@/types'

// ===== Cherry v5 导出类型 =====

interface CherryV5Export {
  time: number
  version: 5
  localStorage: {
    language: string
    'persist:cherry-studio': CherryPersistExport
  }
  indexedDB: {
    files: unknown[]
    topics: CherryDBTopicExport[]
    settings: unknown[]
    knowledge_notes: unknown[]
    translate_history: unknown[]
    quick_phrases: unknown[]
    message_blocks: CherryMessageBlockExport[]
    translate_languages: unknown[]
    notes_tree: unknown[]
  }
}

interface CherryPersistExport {
  assistants: {
    defaultAssistant: CherryAssistantExport
    assistants: CherryAssistantExport[]
  }
  llm: {
    defaultModel: ModelRef
    providers: CherryProviderExport[]
    settings: Record<string, unknown>
  }
  settings: Record<string, unknown>
  [key: string]: unknown
}

interface CherryProviderExport {
  id: string
  name: string
  type: string
  apiKey: string
  apiHost: string
  enabled: boolean
  isSystem: boolean
  models: {
    id: string
    provider: string
    name: string
    group: string
    supported_text_delta?: boolean
    owned_by?: string
    enabled: boolean
  }[]
  isNotSupportArrayContent?: boolean
  isNotSupportDeveloperRole?: boolean
  isNotSupportStreamOptions?: boolean
  apiOptions?: {
    isNotSupportArrayContent: boolean
    isNotSupportDeveloperRole: boolean
    isNotSupportStreamOptions: boolean
  }
}

interface CherryAssistantExport {
  id: string
  name: string
  emoji: string
  prompt: string
  type: 'assistant'
  model?: ModelRef
  defaultModel?: ModelRef
  settings: {
    temperature: number
    contextCount: number
    enableMaxTokens: boolean
    maxTokens: number
    streamOutput: boolean
    topP: number
    enableTopP: boolean
    toolUseMode: 'prompt' | 'function'
    customParameters: never[]
    reasoning_effort?: string
    qwenThinkMode?: boolean
    enableTemperature?: boolean
  }
  topics: {
    id: string
    assistantId: string
    createdAt: string
    updatedAt: string
    name: string
    messages: never[]
    isNameManuallyEdited: boolean
  }[]
  regularPhrases: never[]
  enableWebSearch?: boolean
  knowledgeRecognition?: 'off'
  mcpServers: never[]
  description?: string
  messages: never[]
}

interface CherryDBTopicExport {
  id: string
  messages: CherryDBMessageExport[]
}

interface CherryDBMessageExport {
  id: string
  role: 'user' | 'assistant'
  topicId: string
  assistantId: string
  createdAt: string
  updatedAt?: string
  status: string
  blocks: string[]
  modelId?: string
  model?: ModelRef
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  mentions?: never[]
  askId?: string
  metrics?: {
    completion_tokens: number
    time_completion_millsec: number
    time_first_token_millsec: number
    time_thinking_millsec: number
  }
  foldSelected?: boolean
  multiModelMessageStyle?: 'fold' | 'horizontal'
}

interface CherryMessageBlockExport {
  id: string
  messageId: string
  type: string
  createdAt: string
  status: string
  updatedAt?: string
  content?: string
  knowledgeBaseIds?: string[]
  citationReferences?: unknown[]
  thinking_millsec?: number
  response?: unknown
  toolId?: string
  toolName?: string
  metadata?: unknown
  error?: {
    name: string
    message: string
    originalMessage: string
    stack: string
  }
}

// ===== Settings 白名单（同 importer）=====
const SETTINGS_WHITELIST: string[] = [
  'language', 'theme', 'fontSize', 'userName',
  'showAssistants', 'showTopics', 'topicPosition', 'showTopicTime',
  'pinTopicsToTop', 'assistantIconType', 'clickAssistantToShowTopic',
  'enableTopicNaming', 'topicNamingPrompt', 'useTopicNamingForMessageTitle',
  'sendMessageShortcut', 'showInputEstimatedTokens', 'pasteLongTextAsFile',
  'pasteLongTextThreshold', 'foldDisplayMode', 'gridColumns', 'messageNavigation',
  'confirmDeleteMessage', 'confirmRegenerateMessage', 'thoughtAutoCollapse',
  'messageStyle', 'messageFont', 'showMessageDivider', 'showTokens',
  'showModelProviderInMarkdown', 'showModelNameInMarkdown', 'showMessageOutline',
  'renderInputMessageAsMarkdown', 'codeShowLineNumbers', 'codeWrappable',
  'codeCollapsible', 'mathEngine', 'mathEnableSingleDollar',
  'autoTranslateWithSpace', 'showTranslateConfirm', 'translateModelPrompt',
  'targetLanguage', 'multiModelMessageStyle', 'enableBackspaceDeleteModel',
  'enableQuickPanelTriggers', 'narrowMode', 'navbarPosition',
  'userTheme', 'customCss',
]

// ===== 引用校验 =====

export interface ValidationResult {
  valid: boolean
  issues: string[]
}

export function validateForExport(appData: AppData): ValidationResult {
  const issues: string[] = []

  const providerIds = new Set(appData.providers.map(p => p.id))
  const assistantIds = new Set(appData.assistants.map(a => a.id))
  const topicIds = new Set(appData.topics.map(t => t.id))

  // 检查 Assistant 引用的 Provider 是否存在
  for (const a of appData.assistants) {
    if (a.model && !providerIds.has(a.model.provider)) {
      issues.push(`Assistant "${a.name}" (${a.id}) 引用了不存在的 Provider: ${a.model.provider}`)
    }
  }

  // 检查 Topic 引用的 Assistant 是否存在
  for (const t of appData.topics) {
    if (!assistantIds.has(t.assistantId)) {
      issues.push(`Topic "${t.name}" (${t.id}) 引用了不存在的 Assistant: ${t.assistantId}`)
    }
  }

  // 检查 Message 引用的 Topic 是否存在
  for (const t of appData.topics) {
    for (const m of t.messages) {
      if (m.topicId !== t.id) {
        issues.push(`Message ${m.id} 的 topicId (${m.topicId}) 与所属 Topic (${t.id}) 不匹配`)
      }
      if (!assistantIds.has(m.assistantId)) {
        issues.push(`Message ${m.id} 引用了不存在的 Assistant: ${m.assistantId}`)
      }
    }
  }

  // 检查 Block 引用的 Message 是否存在
  for (const t of appData.topics) {
    const messageIds = new Set(t.messages.map(m => m.id))
    for (const m of t.messages) {
      for (const b of m.blocks) {
        if (b.messageId !== m.id) {
          issues.push(`Block ${b.id} 的 messageId (${b.messageId}) 与所属 Message (${m.id}) 不匹配`)
        }
      }
    }
  }

  return { valid: issues.length === 0, issues }
}

// ===== 导出函数 =====

export interface ExportOptions {
  includeApiKey: boolean
}

export function exportToCherryV5(appData: AppData, options: ExportOptions): string {
  const now = Date.now()

  // ===== Provider 导出 =====
  const cherryProviders: CherryProviderExport[] = appData.providers.map((p): CherryProviderExport => {
    const exportProvider: CherryProviderExport = {
      id: p.id,
      name: p.name,
      type: p.type,
      apiKey: options.includeApiKey ? (p.apiKey ?? '') : '',
      apiHost: p.apiHost,
      enabled: p.enabled,
      isSystem: p.isSystem,
      models: p.models.map(m => ({
        id: m.id,
        provider: m.provider,
        name: m.name,
        group: m.group,
        ...(m.supported_text_delta !== undefined ? { supported_text_delta: m.supported_text_delta } : {}),
        ...(m.owned_by ? { owned_by: m.owned_by } : {}),
        enabled: m.enabled,
      })),
    }
    if (p.isNotSupportArrayContent !== undefined) exportProvider.isNotSupportArrayContent = p.isNotSupportArrayContent
    if (p.isNotSupportDeveloperRole !== undefined) exportProvider.isNotSupportDeveloperRole = p.isNotSupportDeveloperRole
    if (p.isNotSupportStreamOptions !== undefined) exportProvider.isNotSupportStreamOptions = p.isNotSupportStreamOptions
    if (p.apiOptions) exportProvider.apiOptions = p.apiOptions
    return exportProvider
  })

  // ===== Assistant 导出 =====
  const defaultAssistant = appData.assistants.find(a => a.isDefault) ?? appData.assistants[0]
  const otherAssistants = appData.assistants.filter(a => a !== defaultAssistant)

  function mapAssistant(a: Assistant): CherryAssistantExport {
    // 收集该 assistant 的 topics 元数据
    const assistantTopics = appData.topics
      .filter(t => t.assistantId === a.id)
      .map(t => ({
        id: t.id,
        assistantId: a.id,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        name: t.name,
        messages: [] as never[],
        isNameManuallyEdited: t.isNameManuallyEdited,
      }))

    const exportAssist: CherryAssistantExport = {
      id: a.id,
      name: a.name,
      emoji: a.emoji,
      prompt: a.prompt,
      type: 'assistant',
      settings: {
        temperature: a.settings.temperature,
        contextCount: a.settings.contextCount,
        enableMaxTokens: a.settings.enableMaxTokens,
        maxTokens: a.settings.maxTokens,
        streamOutput: a.settings.streamOutput,
        topP: a.settings.topP,
        enableTopP: a.settings.enableTopP,
        toolUseMode: a.settings.toolUseMode,
        customParameters: [],
        ...(a.settings.reasoning_effort ? { reasoning_effort: a.settings.reasoning_effort } : {}),
        ...(a.settings.qwenThinkMode !== undefined ? { qwenThinkMode: a.settings.qwenThinkMode } : {}),
        ...(a.settings.enableTemperature !== undefined ? { enableTemperature: a.settings.enableTemperature } : {}),
      },
      topics: assistantTopics,
      regularPhrases: [],
      mcpServers: [],
      messages: [],
    }
    if (a.model) exportAssist.model = a.model
    if (a.defaultModel) exportAssist.defaultModel = a.defaultModel
    if (a.description !== undefined) exportAssist.description = a.description
    if (a.enableWebSearch !== undefined) exportAssist.enableWebSearch = a.enableWebSearch
    if (a.knowledgeRecognition) exportAssist.knowledgeRecognition = 'off'
    return exportAssist
  }

  const cherryDefaultAssistant = defaultAssistant ? mapAssistant(defaultAssistant) : {
    id: 'default',
    name: 'Default',
    emoji: '✨',
    prompt: '',
    type: 'assistant' as const,
    settings: {
      temperature: 0.7,
      contextCount: 20,
      enableMaxTokens: false,
      maxTokens: 4096,
      streamOutput: true,
      topP: 1,
      enableTopP: false,
      toolUseMode: 'prompt' as const,
      customParameters: [] as never[],
    },
    topics: [],
    regularPhrases: [] as never[],
    mcpServers: [] as never[],
    messages: [] as never[],
  }

  const cherryAssistants = otherAssistants.map(mapAssistant)

  // ===== Settings 导出（白名单）=====
  const cherrySettings: Record<string, unknown> = {}
  const settingsRecord = appData.settings as unknown as Record<string, unknown>
  for (const key of SETTINGS_WHITELIST) {
    if (key in settingsRecord) {
      cherrySettings[key] = settingsRecord[key]
    }
  }

  // ===== 默认模型 =====
  const defaultModel: ModelRef = defaultAssistant?.model ?? defaultAssistant?.defaultModel ?? {
    id: 'gpt-4o',
    provider: 'openai',
    name: 'GPT-4o',
    group: 'OpenAI',
  }

  // ===== Topic 导出 =====
  const cherryDBTopics: CherryDBTopicExport[] = []
  const allMessageBlocks: CherryMessageBlockExport[] = []

  for (const topic of appData.topics) {
    const dbMessages: CherryDBMessageExport[] = []

    for (const msg of topic.messages) {
      // block IDs 引用
      const blockIds = msg.blocks.map(b => b.id)

      // 拆出 block 为独立数组
      for (const b of msg.blocks) {
        const exportBlock: CherryMessageBlockExport = {
          id: b.id,
          messageId: b.messageId,
          type: b.type,
          createdAt: b.createdAt,
          status: b.status === 'success' ? 'success' : b.status === 'streaming' ? 'pending' : b.status === 'error' ? 'error' : 'success',
        }
        if (b.updatedAt) exportBlock.updatedAt = b.updatedAt
        if (b.content !== undefined) exportBlock.content = b.content
        if (b.knowledgeBaseIds) exportBlock.knowledgeBaseIds = b.knowledgeBaseIds
        if (b.citationReferences) exportBlock.citationReferences = b.citationReferences
        if (b.thinking_millsec !== undefined) exportBlock.thinking_millsec = b.thinking_millsec
        if (b.response) exportBlock.response = b.response
        if (b.toolId) exportBlock.toolId = b.toolId
        if (b.toolName) exportBlock.toolName = b.toolName
        if (b.metadata) exportBlock.metadata = b.metadata
        if (b.error) exportBlock.error = b.error
        allMessageBlocks.push(exportBlock)
      }

      const dbMsg: CherryDBMessageExport = {
        id: msg.id,
        role: msg.role,
        topicId: msg.topicId,
        assistantId: msg.assistantId,
        createdAt: msg.createdAt,
        status: msg.status === 'complete' ? 'success' : msg.status === 'sending' ? 'pending' : msg.status === 'streaming' ? 'pending' : msg.status === 'error' ? 'error' : msg.status === 'stopped' ? 'success' : 'success',
        blocks: blockIds,
      }
      if (msg.updatedAt) dbMsg.updatedAt = msg.updatedAt
      if (msg.modelId) dbMsg.modelId = msg.modelId
      if (msg.model) dbMsg.model = msg.model
      if (msg.usage) dbMsg.usage = msg.usage
      if (msg.mentions) dbMsg.mentions = []
      if (msg.askId) dbMsg.askId = msg.askId
      if (msg.metrics) dbMsg.metrics = msg.metrics
      if (msg.foldSelected !== undefined) dbMsg.foldSelected = msg.foldSelected
      if (msg.multiModelMessageStyle) dbMsg.multiModelMessageStyle = msg.multiModelMessageStyle

      dbMessages.push(dbMsg)
    }

    cherryDBTopics.push({
      id: topic.id,
      messages: dbMessages,
    })
  }

  // ===== 组装最终结构 =====
  const exportData: CherryV5Export = {
    time: now,
    version: 5,
    localStorage: {
      language: appData.settings.language ?? 'zh-CN',
      'persist:cherry-studio': {
        assistants: {
          defaultAssistant: cherryDefaultAssistant,
          assistants: cherryAssistants,
        },
        llm: {
          defaultModel,
          providers: cherryProviders,
          settings: {},
        },
        settings: cherrySettings,
      },
    },
    indexedDB: {
      files: [],
      topics: cherryDBTopics,
      settings: [],
      knowledge_notes: [],
      translate_history: [],
      quick_phrases: [],
      message_blocks: allMessageBlocks,
      translate_languages: [],
      notes_tree: [],
    },
  }

  return JSON.stringify(exportData, null, 2)
}
