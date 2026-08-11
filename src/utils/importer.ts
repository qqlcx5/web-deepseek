import type {
  AppData, Provider, Assistant, Topic, ChatMessage,
  MessageBlock, ModelRef, AssistantSettings, Settings,
  ProviderType, MessageRole, MessageStatus, MessageBlockType, MessageBlockStatus,
} from '@/types'

// ===== Cherry v5 顶层结构 =====

interface CherryV5Data {
  time: number
  version: number
  localStorage: {
    language: string
    modelscope_token?: string
    'persist:cherry-studio': CherryPersistRoot
  }
  indexedDB: {
    files: unknown[]
    topics: CherryDBTopic[]
    settings: unknown[]
    knowledge_notes: unknown[]
    translate_history: unknown[]
    quick_phrases: unknown[]
    message_blocks: CherryMessageBlock[]
    translate_languages: unknown[]
    notes_tree: unknown[]
  }
}

interface CherryPersistRoot {
  assistants: {
    defaultAssistant: CherryAssistant
    assistants: CherryAssistant[]
  }
  llm: {
    defaultModel: ModelRef
    topicNamingModel?: ModelRef
    translateModel?: ModelRef
    quickAssistantModel?: ModelRef
    quickModel?: ModelRef
    providers: CherryProvider[]
    settings: Record<string, unknown>
  }
  settings: Record<string, unknown>
  [key: string]: unknown
}

interface CherryProvider {
  id: string
  name: string
  type: string
  apiKey: string
  apiHost: string
  enabled: boolean
  isSystem: boolean
  models: CherryModelInfo[]
  isNotSupportArrayContent?: boolean
  isNotSupportDeveloperRole?: boolean
  isNotSupportStreamOptions?: boolean
  apiOptions?: {
    isNotSupportArrayContent: boolean
    isNotSupportDeveloperRole: boolean
    isNotSupportStreamOptions: boolean
  }
}

interface CherryModelInfo {
  id: string
  provider: string
  name: string
  group: string
  supported_text_delta?: boolean
  owned_by?: string
  enabled?: boolean
}

interface CherryAssistant {
  id: string
  name: string
  emoji: string
  prompt: string
  type: string
  model?: ModelRef
  defaultModel?: ModelRef
  settings?: CherryAssistantSettings
  topics?: CherryTopicRef[]
  regularPhrases?: unknown[]
  enableWebSearch?: boolean
  knowledgeRecognition?: string
  mcpServers?: unknown[]
  description?: string
  messages?: unknown[]
}

interface CherryAssistantSettings {
  temperature: number
  contextCount: number
  enableMaxTokens: boolean
  maxTokens: number
  streamOutput: boolean
  topP: number
  enableTopP: boolean
  toolUseMode: 'prompt' | 'function'
  customParameters: unknown[]
  reasoning_effort?: string
  qwenThinkMode?: boolean
  enableTemperature?: boolean
}

interface CherryTopicRef {
  id: string
  assistantId: string
  createdAt: string
  updatedAt: string
  name: string
  messages: unknown[]
  isNameManuallyEdited: boolean
}

interface CherryDBTopic {
  id: string
  messages: CherryDBMessage[]
}

interface CherryDBMessage {
  id: string
  role: string
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
  mentions?: unknown[]
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

interface CherryMessageBlock {
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
  response?: {
    results: {
      searchEntryPoint: { renderedContent: string }
      groundingChunks: unknown
      groundingSupports: unknown
      webSearchQueries: unknown
    }
    source: string
  }
  toolId?: string
  toolName?: string
  metadata?: {
    rawMcpToolResponse: {
      id: string
      toolUseId: string
      tool: { name: string; description: string; inputSchema: object }
    }
  }
  error?: {
    name: string
    message: string
    originalMessage: string
    stack: string
  }
}

// ===== Settings 白名单 =====
const SETTINGS_WHITELIST: (keyof Settings)[] = [
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

// ===== 辅助函数 =====

function coerceProviderType(type: string): ProviderType {
  const valid: ProviderType[] = ['openai', 'gemini', 'anthropic', 'azure-openai', 'mistral', 'vertexai']
  if (type === 'openai-response') return 'openai'
  return valid.includes(type as ProviderType) ? (type as ProviderType) : 'openai'
}

function coerceMessageRole(role: string): MessageRole {
  return role === 'assistant' ? 'assistant' : 'user'
}

function coerceMessageStatus(status: string): MessageStatus {
  const map: Record<string, MessageStatus> = {
    success: 'complete',
    pending: 'sending',
    error: 'error',
  }
  return map[status] ?? 'complete'
}

function coerceBlockType(type: string): MessageBlockType {
  const valid: MessageBlockType[] = ['main_text', 'thinking', 'error', 'citation', 'tool', 'unknown']
  return valid.includes(type as MessageBlockType) ? (type as MessageBlockType) : 'unknown'
}

function coerceBlockStatus(status: string): MessageBlockStatus {
  const map: Record<string, MessageBlockStatus> = {
    success: 'success',
    error: 'error',
    pending: 'streaming',
  }
  return map[status] ?? 'success'
}

function mapModelRef(ref: ModelRef | undefined): ModelRef | undefined {
  if (!ref) return undefined
  return {
    id: ref.id,
    provider: ref.provider,
    name: ref.name,
    group: ref.group,
    ...(ref.supported_text_delta !== undefined ? { supported_text_delta: ref.supported_text_delta } : {}),
  }
}

function mapAssistantSettings(s: CherryAssistantSettings | undefined): AssistantSettings {
  if (!s) {
    return {
      temperature: 0.7,
      contextCount: 20,
      enableMaxTokens: false,
      maxTokens: 4096,
      streamOutput: true,
      topP: 1,
      enableTopP: false,
      toolUseMode: 'prompt',
      customParameters: [],
    }
  }
  return {
    temperature: s.temperature ?? 0.7,
    contextCount: s.contextCount ?? 20,
    enableMaxTokens: s.enableMaxTokens ?? false,
    maxTokens: s.maxTokens ?? 4096,
    streamOutput: s.streamOutput ?? true,
    topP: s.topP ?? 1,
    enableTopP: s.enableTopP ?? false,
    toolUseMode: s.toolUseMode ?? 'prompt',
    customParameters: [],
    ...(s.reasoning_effort ? { reasoning_effort: s.reasoning_effort } : {}),
    ...(s.qwenThinkMode !== undefined ? { qwenThinkMode: s.qwenThinkMode } : {}),
    ...(s.enableTemperature !== undefined ? { enableTemperature: s.enableTemperature } : {}),
  }
}

// ===== 主解析函数 =====

export interface ParseResult {
  data?: AppData
  warnings: string[]
  errors: string[]
}

export function parseCherryV5(json: string): ParseResult {
  const warnings: string[] = []
  const errors: string[] = []

  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch (e) {
    errors.push(`JSON 解析失败: ${(e as Error).message}`)
    return { warnings, errors }
  }

  const cherry = raw as CherryV5Data

  // 顶层结构校验
  if (typeof cherry.version !== 'number') {
    errors.push('缺少 version 字段或类型不正确')
  }
  if (cherry.version !== 5) {
    warnings.push(`版本号为 ${cherry.version}，预期版本 5，将尝试兼容解析`)
  }
  if (!cherry.localStorage?.['persist:cherry-studio']) {
    errors.push('缺少 localStorage["persist:cherry-studio"]')
  }
  if (!cherry.indexedDB) {
    errors.push('缺少 indexedDB')
  }
  if (errors.length > 0) {
    return { warnings, errors }
  }

  const persist = cherry.localStorage['persist:cherry-studio']

  // ===== Provider 映射 =====
  const providers: Provider[] = []
  const providerIds = new Set<string>()

  for (const cp of persist.llm?.providers ?? []) {
    if (providerIds.has(cp.id)) {
      warnings.push(`Provider ID 重复: ${cp.id}，已跳过`)
      continue
    }
    providerIds.add(cp.id)

    const provider: Provider = {
      id: cp.id,
      name: cp.name,
      type: coerceProviderType(cp.type),
      apiHost: cp.apiHost,
      apiKey: cp.apiKey || '',
      enabled: cp.enabled,
      isSystem: cp.isSystem,
      models: (cp.models ?? []).map((m): import('@/types').ModelInfo => ({
        id: m.id,
        provider: m.provider || cp.id,
        name: m.name,
        group: m.group,
        ...(m.supported_text_delta !== undefined ? { supported_text_delta: m.supported_text_delta } : {}),
        ...(m.owned_by ? { owned_by: m.owned_by } : {}),
        enabled: m.enabled ?? true,
      })),
      ...(cp.isNotSupportArrayContent !== undefined ? { isNotSupportArrayContent: cp.isNotSupportArrayContent } : {}),
      ...(cp.isNotSupportDeveloperRole !== undefined ? { isNotSupportDeveloperRole: cp.isNotSupportDeveloperRole } : {}),
      ...(cp.isNotSupportStreamOptions !== undefined ? { isNotSupportStreamOptions: cp.isNotSupportStreamOptions } : {}),
      ...(cp.apiOptions ? { apiOptions: cp.apiOptions } : {}),
    }
    providers.push(provider)
  }

  // ===== Assistant 映射 =====
  const assistants: Assistant[] = []
  const assistantIds = new Set<string>()

  const allCherryAssistants: CherryAssistant[] = []
  if (persist.assistants?.defaultAssistant) {
    allCherryAssistants.push(persist.assistants.defaultAssistant)
  }
  if (persist.assistants?.assistants) {
    allCherryAssistants.push(...persist.assistants.assistants)
  }

  // 建立 topicId -> assistantId 映射
  const topicToAssistant = new Map<string, string>()
  for (const ca of allCherryAssistants) {
    for (const t of ca.topics ?? []) {
      topicToAssistant.set(t.id, ca.id)
    }
  }

  for (const ca of allCherryAssistants) {
    if (assistantIds.has(ca.id)) {
      warnings.push(`Assistant ID 重复: ${ca.id}，已跳过`)
      continue
    }
    assistantIds.add(ca.id)

    const now = new Date().toISOString()
    const assistant: Assistant = {
      id: ca.id,
      name: ca.name,
      emoji: ca.emoji || '🤖',
      prompt: ca.prompt || '',
      ...(ca.description ? { description: ca.description } : {}),
      enabled: true,
      isDefault: ca.id === 'default',
      ...(mapModelRef(ca.model) ? { model: mapModelRef(ca.model)! } : {}),
      ...(mapModelRef(ca.defaultModel) ? { defaultModel: mapModelRef(ca.defaultModel)! } : {}),
      settings: mapAssistantSettings(ca.settings),
      ...(ca.enableWebSearch !== undefined ? { enableWebSearch: ca.enableWebSearch } : {}),
      ...(ca.knowledgeRecognition ? { knowledgeRecognition: 'off' as const } : {}),
      mcpServers: [],
      regularPhrases: [],
      createdAt: ca.topics?.[0]?.createdAt ?? now,
      updatedAt: ca.topics?.[0]?.updatedAt ?? now,
    }
    assistants.push(assistant)
  }

  // ===== Block 查找表 =====
  const blockMap = new Map<string, CherryMessageBlock>()
  for (const mb of cherry.indexedDB.message_blocks ?? []) {
    if (blockMap.has(mb.id)) {
      warnings.push(`MessageBlock ID 重复: ${mb.id}，已跳过`)
      continue
    }
    blockMap.set(mb.id, mb)
  }

  // ===== Topic 映射 =====
  const topics: Topic[] = []
  const topicIds = new Set<string>()
  const messageIds = new Set<string>()

  for (const dbTopic of cherry.indexedDB.topics ?? []) {
    if (topicIds.has(dbTopic.id)) {
      warnings.push(`Topic ID 重复: ${dbTopic.id}，已跳过`)
      continue
    }
    topicIds.add(dbTopic.id)

    // 查找 assistantId
    let assistantId = topicToAssistant.get(dbTopic.id)
    if (!assistantId) {
      // 尝试从消息中获取
      assistantId = dbTopic.messages?.[0]?.assistantId ?? 'default'
      warnings.push(`Topic ${dbTopic.id} 无法关联到 Assistant，使用默认值 "default"`)
    }

    // 查找 topic 元数据
    let topicName = '未命名对话'
    let isNameManuallyEdited = false
    let createdAt = new Date().toISOString()
    let updatedAt = new Date().toISOString()
    for (const ca of allCherryAssistants) {
      const tref = ca.topics?.find(t => t.id === dbTopic.id)
      if (tref) {
        topicName = tref.name
        isNameManuallyEdited = tref.isNameManuallyEdited
        createdAt = tref.createdAt
        updatedAt = tref.updatedAt
        break
      }
    }

    // 映射 messages
    const messages: ChatMessage[] = []
    for (const dbMsg of dbTopic.messages ?? []) {
      if (messageIds.has(dbMsg.id)) {
        warnings.push(`Message ID 重复: ${dbMsg.id}，已跳过`)
        continue
      }
      messageIds.add(dbMsg.id)

      // 内联 blocks
      const blocks: MessageBlock[] = []
      for (const blockId of dbMsg.blocks ?? []) {
        const cb = blockMap.get(blockId)
        if (!cb) {
          warnings.push(`Block ${blockId} (属于 Message ${dbMsg.id}) 未在 message_blocks 中找到，已跳过`)
          continue
        }
        const block: MessageBlock = {
          id: cb.id,
          messageId: cb.messageId,
          type: coerceBlockType(cb.type),
          createdAt: cb.createdAt,
          status: coerceBlockStatus(cb.status),
          ...(cb.updatedAt ? { updatedAt: cb.updatedAt } : {}),
          ...(cb.content !== undefined ? { content: cb.content } : {}),
          ...(cb.knowledgeBaseIds ? { knowledgeBaseIds: cb.knowledgeBaseIds } : {}),
          ...(cb.citationReferences ? { citationReferences: cb.citationReferences } : {}),
          ...(cb.thinking_millsec !== undefined ? { thinking_millsec: cb.thinking_millsec } : {}),
          ...(cb.response ? { response: cb.response } : {}),
          ...(cb.toolId ? { toolId: cb.toolId } : {}),
          ...(cb.toolName ? { toolName: cb.toolName } : {}),
          ...(cb.metadata ? { metadata: cb.metadata } : {}),
          ...(cb.error ? { error: cb.error } : {}),
        }
        blocks.push(block)
      }

      const msg: ChatMessage = {
        id: dbMsg.id,
        topicId: dbMsg.topicId,
        role: coerceMessageRole(dbMsg.role),
        assistantId: dbMsg.assistantId,
        createdAt: dbMsg.createdAt,
        ...(dbMsg.updatedAt ? { updatedAt: dbMsg.updatedAt } : {}),
        status: coerceMessageStatus(dbMsg.status),
        blocks,
        ...(dbMsg.modelId ? { modelId: dbMsg.modelId } : {}),
        ...(mapModelRef(dbMsg.model) ? { model: mapModelRef(dbMsg.model)! } : {}),
        ...(dbMsg.usage ? { usage: dbMsg.usage } : {}),
        ...(dbMsg.mentions ? { mentions: dbMsg.mentions as string[] } : {}),
        ...(dbMsg.askId ? { askId: dbMsg.askId } : {}),
        ...(dbMsg.metrics ? { metrics: dbMsg.metrics } : {}),
        ...(dbMsg.foldSelected !== undefined ? { foldSelected: dbMsg.foldSelected } : {}),
        ...(dbMsg.multiModelMessageStyle ? { multiModelMessageStyle: dbMsg.multiModelMessageStyle } : {}),
      }
      messages.push(msg)
    }

    topics.push({
      id: dbTopic.id,
      assistantId,
      name: topicName,
      messages,
      isNameManuallyEdited,
      pinned: false,
      createdAt,
      updatedAt,
    })
  }

  // ===== Settings 映射 =====
  const cherrySettings = persist.settings ?? {}
  const settings: Partial<Settings> = {}
  for (const key of SETTINGS_WHITELIST) {
    if (key in cherrySettings) {
      const val = cherrySettings[key as string]
      if (val !== undefined && val !== null) {
        ;(settings as Record<string, unknown>)[key] = val
      }
    }
  }

  // 确保必填字段有值
  const finalSettings: Settings = {
    language: (settings.language as Settings['language']) ?? 'zh-CN',
    theme: (settings.theme as Settings['theme']) ?? 'light',
    fontSize: settings.fontSize ?? 14,
    userName: settings.userName ?? '',
    showAssistants: settings.showAssistants ?? true,
    showTopics: settings.showTopics ?? true,
    topicPosition: (settings.topicPosition as Settings['topicPosition']) ?? 'left',
    showTopicTime: settings.showTopicTime ?? false,
    pinTopicsToTop: settings.pinTopicsToTop ?? true,
    assistantIconType: settings.assistantIconType ?? 'emoji',
    clickAssistantToShowTopic: settings.clickAssistantToShowTopic ?? false,
    enableTopicNaming: settings.enableTopicNaming ?? true,
    topicNamingPrompt: settings.topicNamingPrompt ?? '',
    useTopicNamingForMessageTitle: settings.useTopicNamingForMessageTitle ?? false,
    sendMessageShortcut: (settings.sendMessageShortcut as Settings['sendMessageShortcut']) ?? 'Enter',
    showInputEstimatedTokens: settings.showInputEstimatedTokens ?? false,
    pasteLongTextAsFile: settings.pasteLongTextAsFile ?? false,
    pasteLongTextThreshold: settings.pasteLongTextThreshold ?? 1500,
    foldDisplayMode: (settings.foldDisplayMode as Settings['foldDisplayMode']) ?? 'expanded',
    gridColumns: settings.gridColumns ?? 2,
    messageNavigation: settings.messageNavigation ?? 'anchor',
    confirmDeleteMessage: settings.confirmDeleteMessage ?? false,
    confirmRegenerateMessage: settings.confirmRegenerateMessage ?? false,
    thoughtAutoCollapse: settings.thoughtAutoCollapse ?? true,
    messageStyle: (settings.messageStyle as Settings['messageStyle']) ?? 'plain',
    messageFont: (settings.messageFont as Settings['messageFont']) ?? 'system',
    showMessageDivider: settings.showMessageDivider ?? false,
    showTokens: settings.showTokens ?? false,
    showModelProviderInMarkdown: settings.showModelProviderInMarkdown ?? false,
    showModelNameInMarkdown: settings.showModelNameInMarkdown ?? false,
    showMessageOutline: settings.showMessageOutline ?? false,
    renderInputMessageAsMarkdown: settings.renderInputMessageAsMarkdown ?? false,
    codeShowLineNumbers: settings.codeShowLineNumbers ?? true,
    codeWrappable: settings.codeWrappable ?? false,
    codeCollapsible: settings.codeCollapsible ?? false,
    codeEditor: settings.codeEditor ?? {
      enabled: false,
      themeLight: 'github-light',
      themeDark: 'github-dark',
      highlightActiveLine: true,
      foldGutter: false,
      autocompletion: true,
      keymap: true,
    },
    codePreview: settings.codePreview ?? { themeLight: 'github-light', themeDark: 'github-dark' },
    mathEngine: (settings.mathEngine as Settings['mathEngine']) ?? 'katex',
    mathEnableSingleDollar: settings.mathEnableSingleDollar ?? true,
    autoTranslateWithSpace: settings.autoTranslateWithSpace ?? false,
    showTranslateConfirm: settings.showTranslateConfirm ?? true,
    translateModelPrompt: settings.translateModelPrompt ?? '',
    targetLanguage: settings.targetLanguage ?? 'zh-CN',
    exportMenuOptions: settings.exportMenuOptions ?? {
      image: true, markdown: true, markdown_reason: false,
      notion: false, yuque: false, joplin: false,
      obsidian: false, siyuan: false, docx: false, plain_text: true,
    },
    multiModelMessageStyle: settings.multiModelMessageStyle ?? 'grid',
    enableBackspaceDeleteModel: settings.enableBackspaceDeleteModel ?? true,
    enableQuickPanelTriggers: settings.enableQuickPanelTriggers ?? true,
    narrowMode: settings.narrowMode ?? false,
    navbarPosition: (settings.navbarPosition as Settings['navbarPosition']) ?? 'left',
    userTheme: settings.userTheme ?? { colorPrimary: '#5b56d6' },
    customCss: settings.customCss ?? '',
  }

  // ===== ID 唯一性校验总结 =====
  if (providers.length === 0) {
    warnings.push('未导入任何 Provider')
  }
  if (assistants.length === 0) {
    warnings.push('未导入任何 Assistant')
  }
  if (topics.length === 0) {
    warnings.push('未导入任何 Topic')
  }

  const data: AppData = {
    version: 1,
    providers,
    assistants,
    topics,
    settings: finalSettings,
  }

  return { data, warnings, errors }
}
