import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  CherryData, PersistRoot, AssistantObject, TopicObject, DBTopic, DBMessage,
  MessageBlock, Provider, ModelInfo, ModelRef, AssistantSettings, SettingsModule,
  DBSetting, MessageStatus,
} from '@/types'
import { loadCherryData, saveCherryData } from '@/utils/db'
import { createSaveQueue } from '@/utils/saveQueue'

// ============================================================================
// Join 视图类型（供 views 消费，模拟扁平对象图；数据本身仍是分离存储）
// ============================================================================

export interface MessageView {
  id: string
  role: 'user' | 'assistant'
  topicId: string
  assistantId: string
  createdAt: string
  updatedAt?: string
  status: MessageStatus
  blocks: MessageBlock[] // join 后的块实体
  modelId?: string
  model?: ModelRef
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
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

export interface TopicView {
  id: string
  assistantId: string
  name: string
  createdAt: string
  updatedAt: string
  isNameManuallyEdited: boolean
  pinned: boolean // 来自 DBSetting('pinned:topics')
  messages: MessageView[]
}

// ============================================================================
// 默认值
// ============================================================================

const DEFAULT_MODEL_REF: ModelRef = {
  id: 'gpt-4o', provider: 'openai', name: 'GPT-4o', group: 'OpenAI',
}

const DEFAULT_ASSISTANT_SETTINGS: AssistantSettings = {
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

const DEFAULT_SETTINGS: SettingsModule = {
  language: 'zh-CN', targetLanguage: 'zh-cn', proxyMode: 'system', userName: '',
  launchOnBoot: false, launchToTray: false, trayOnClose: false, tray: false,
  autoCheckUpdate: true, upgradeChannel: 'latest', testChannel: 'beta', testPlan: false,
  userId: crypto.randomUUID(), disableHardwareAcceleration: false, enableDataCollection: false,
  enableSpellCheck: false, spellCheckLanguages: [], earlyAccess: false,
  theme: 'light', windowStyle: 'opaque', fontSize: 14, messageFont: 'system',
  messageStyle: 'bubble', showMessageDivider: false, showTokens: false,
  showModelProviderInMarkdown: false, showModelNameInMarkdown: false,
  showMessageOutline: false, renderInputMessageAsMarkdown: false,
  sidebarIcons: { visible: [], disabled: [] }, narrowMode: false, navbarPosition: 'left',
  userTheme: { colorPrimary: '#5b56d6' },
  showAssistants: true, showTopics: true, topicPosition: 'left', showTopicTime: false,
  pinTopicsToTop: true, assistantIconType: 'emoji', clickAssistantToShowTopic: false,
  enableTopicNaming: true, topicNamingPrompt: '', useTopicNamingForMessageTitle: false,
  sendMessageShortcut: 'Enter', showInputEstimatedTokens: false, pasteLongTextAsFile: false,
  pasteLongTextThreshold: 1500, foldDisplayMode: 'expanded', gridColumns: 2,
  gridPopoverTrigger: 'click', messageNavigation: 'anchor', confirmDeleteMessage: false,
  confirmRegenerateMessage: false, thoughtAutoCollapse: true,
  codeExecution: { enabled: false, timeoutMinutes: 1 },
  codeEditor: { enabled: false, themeLight: 'auto', themeDark: 'auto', highlightActiveLine: true, foldGutter: false, autocompletion: true, keymap: false },
  codePreview: { themeLight: 'auto', themeDark: 'auto' },
  codeViewer: { themeLight: 'auto', themeDark: 'auto' },
  codeShowLineNumbers: true, codeCollapsible: false, codeWrappable: false,
  mathEngine: 'KaTeX', mathEnableSingleDollar: true,
  exportMenuOptions: { image: true, markdown: true, markdown_reason: false, notion: false, yuque: false, joplin: false, obsidian: false, siyuan: false, docx: false, plain_text: true },
  markdownExportPath: null, forceDollarMathInMarkdown: false,
  notionDatabaseID: '', notionApiKey: '', notionPageNameKey: 'Name', notionAutoSplit: false, notionSplitSize: 90, notionExportReasoning: false,
  yuqueToken: '', yuqueUrl: '', yuqueRepoId: '', joplinToken: '', joplinUrl: '',
  defaultObsidianVault: '', defaultAgent: null, siyuanApiUrl: null, siyuanToken: null, siyuanBoxId: null, siyuanRootPath: null, agentssubscribeUrl: '',
  autoTranslateWithSpace: false, showTranslateConfirm: true, translateModelPrompt: '', showPrompt: false,
  enableQuickAssistant: false, clickTrayToShowQuickAssistant: false, readClipboardAtStartup: false,
  multiModelMessageStyle: 'grid', enableBackspaceDeleteModel: true, enableQuickPanelTriggers: true,
  skipBackupFile: false, webdavHost: '', webdavUser: '', webdavPass: '', webdavPath: '', webdavAutoSync: false, webdavSyncInterval: '1440', webdavMaxBackups: 5, webdavSkipBackupFile: false, webdavDisableStream: false,
  s3: { endpoint: '', region: '', bucket: '', accessKeyId: '', secretAccessKey: '', root: '', autoSync: false, syncInterval: 1440, maxBackups: 5, skipBackupFile: false },
  localBackupMaxBackups: 5, localBackupSkipBackupFile: false, localBackupDir: '', localBackupAutoSync: false, localBackupSyncInterval: 1440,
  maxKeepAliveMinapps: 5, showOpenedMinappsInSidebar: false, minappsOpenLinkExternal: false,
  apiServer: { enabled: false, host: 'localhost', port: 23333, apiKey: '' },
  proxyBypassRules: 'localhost,127.0.0.1,::1', defaultPaintingProvider: 'zhipu',
  notification: { assistant: true, backup: true, knowledgeEmbed: true },
  openAI: { summaryText: 'off', serviceTier: 'auto', verbosity: 'medium' },
  customCss: '',
}

const EMPTY_SYNC = { lastSyncTime: null, syncing: false, lastSyncError: null }

function createDefaultPersist(): PersistRoot {
  const seedTopic: TopicObject = {
    id: '1', assistantId: 'default', name: 'Orbit Chat 产品规划',
    createdAt: '2026-08-10T10:00:00Z', updatedAt: '2026-08-10T10:30:00Z',
    messages: [], isNameManuallyEdited: false,
  }
  const defaultAssistant: AssistantObject = {
    id: 'default', name: 'Orbit Assistant', emoji: '✨',
    prompt: '你是一个有帮助的 AI 助手。', type: 'assistant',
    description: '通用对话助手',
    model: DEFAULT_MODEL_REF, defaultModel: DEFAULT_MODEL_REF,
    settings: { ...DEFAULT_ASSISTANT_SETTINGS },
    topics: [seedTopic], regularPhrases: [], mcpServers: [],
    enableWebSearch: false, knowledgeRecognition: 'off',
  }
  const defaultProvider: Provider = {
    id: 'openai', name: 'OpenAI', type: 'openai',
    apiHost: 'https://api.openai.com/v1', apiKey: '',
    enabled: true, isSystem: true,
    models: [
      { id: 'gpt-4o', provider: 'openai', name: 'GPT-4o', group: 'OpenAI' },
      { id: 'gpt-4o-mini', provider: 'openai', name: 'GPT-4o-mini', group: 'OpenAI' },
    ],
  }
  return {
    assistants: { defaultAssistant, assistants: [] },
    agents: { agents: [] },
    backup: { webdavSync: { ...EMPTY_SYNC }, s3Sync: { ...EMPTY_SYNC } },
    codeTools: { selectedCliTool: 'qwen-code', selectedModels: { 'qwen-code': DEFAULT_MODEL_REF, 'claude-code': DEFAULT_MODEL_REF, 'gemini-cli': DEFAULT_MODEL_REF }, directories: [], currentDirectory: '', environmentVariables: { 'qwen-code': {}, 'claude-code': {}, 'gemini-cli': {} } },
    nutstore: { nutstoreToken: '', nutstorePath: '', nutstoreAutoSync: false, nutstoreSyncInterval: 1440, nutstoreSyncState: { ...EMPTY_SYNC }, nutstoreSkipBackupFile: false, nutstoreMaxBackups: 5 },
    paintings: { siliconflow_paintings: [], dmxapi_paintings: [], tokenflux_paintings: [], zhipu_paintings: [], aihubmix_image_generate: [], aihubmix_image_remix: [], aihubmix_image_edit: [], aihubmix_image_upscale: [], openai_image_generate: [], openai_image_edit: [] },
    llm: { defaultModel: DEFAULT_MODEL_REF, topicNamingModel: DEFAULT_MODEL_REF, translateModel: DEFAULT_MODEL_REF, quickAssistantModel: DEFAULT_MODEL_REF, quickModel: DEFAULT_MODEL_REF, quickAssistantId: '', providers: [defaultProvider], settings: { ollama: { keepAliveTime: 0 }, lmstudio: { keepAliveTime: 0 }, gpustack: { keepAliveTime: 0 }, vertexai: { serviceAccount: { privateKey: '', clientEmail: '' }, projectId: '', location: '' } } },
    settings: { ...DEFAULT_SETTINGS },
    shortcuts: { shortcuts: [] },
    knowledge: { bases: [] },
    minapps: { enabled: [], disabled: [], pinned: [] },
    websearch: { defaultProvider: 'tavily', providers: [], searchWithTime: false, maxResults: 5, excludeDomains: [], subscribeSources: [], overwrite: false, providerConfig: {}, compressionConfig: { method: 'none', cutoffUnit: 'char' } },
    mcp: { servers: [], isUvInstalled: false, isBunInstalled: false },
    memory: { memoryConfig: { embedderDimensions: 0, isAutoDimensions: true, customFactExtractionPrompt: '', customUpdateMemoryPrompt: '' }, currentUserId: '', globalMemoryEnabled: false },
    copilot: { username: '', avatar: '' },
    selectionStore: { selectionEnabled: false, triggerMode: 'selected', isCompact: false, isAutoClose: false, isAutoPin: false, isFollowToolbar: false, isRemeberWinSize: false, filterMode: 'default', filterList: [], actionWindowOpacity: 100, actionItems: [] },
    preprocess: { providers: [], defaultProvider: 'mineru' },
    inputTools: { toolOrder: { visible: [], hidden: [] }, isCollapsed: false },
    translate: { translatedContent: '', translateInput: '' },
    ocr: { providers: [], imageProviderId: 'system' },
    note: { settings: { isFullWidth: false, fontFamily: 'default', defaultViewMode: 'edit', defaultEditMode: 'preview', showTabStatus: false, showWorkspace: false }, notesPath: '', sortType: 'sort_a2z' },
    _persist: { version: 5, rehydrated: true },
  }
}

function createDefaultCherryData(): CherryData {
  return {
    time: Date.now(), version: 5,
    localStorage: { language: 'zh-CN', modelscope_token: '', 'persist:cherry-studio': createDefaultPersist() },
    indexedDB: {
      files: [],
      topics: [{ id: '1', messages: [] }],
      settings: [{ id: 'pinned:topics', value: ['1'] }],
      knowledge_notes: [], translate_history: [], quick_phrases: [],
      message_blocks: [], translate_languages: [], notes_tree: [],
    },
  }
}

// ============================================================================
// Store
// ============================================================================

export const useAppStore = defineStore('app', () => {
  const data = ref<CherryData>(createDefaultCherryData())
  const activeTopicId = ref<string>('1')
  const isDark = ref(false)

  const saveQueue = createSaveQueue<CherryData>(saveCherryData)
  const saveStatus = saveQueue.status

  // ===== 原始分离访问 =====
  const persist = computed(() => data.value.localStorage['persist:cherry-studio'])
  const llm = computed(() => persist.value.llm)
  const settings = computed<SettingsModule>(() => persist.value.settings)

  // ===== Providers / Assistants（原生） =====
  const providers = computed<Provider[]>(() => llm.value.providers)
  const assistants = computed<AssistantObject[]>(() => [
    persist.value.assistants.defaultAssistant,
    ...persist.value.assistants.assistants,
  ])

  // ===== Join 索引 =====
  const dbTopicMap = computed(() => new Map(data.value.indexedDB.topics.map(t => [t.id, t])))
  const blockMap = computed(() => new Map(data.value.indexedDB.message_blocks.map(b => [b.id, b])))
  const pinnedTopicIds = computed(() => {
    const s = data.value.indexedDB.settings.find(x => x.id === 'pinned:topics')
    return new Set<string>(((s?.value as string[]) ?? []))
  })

  function joinMessage(msg: DBMessage): MessageView {
    const blocks = msg.blocks
      .map(id => blockMap.value.get(id))
      .filter((b): b is MessageBlock => !!b)
    return {
      id: msg.id, role: msg.role, topicId: msg.topicId, assistantId: msg.assistantId,
      createdAt: msg.createdAt, updatedAt: msg.updatedAt, status: msg.status, blocks,
      modelId: msg.modelId, model: msg.model, usage: msg.usage, askId: msg.askId,
      metrics: msg.metrics, foldSelected: msg.foldSelected, multiModelMessageStyle: msg.multiModelMessageStyle,
    }
  }

  function joinTopic(t: TopicObject): TopicView {
    const dbt = dbTopicMap.value.get(t.id)
    return {
      id: t.id, assistantId: t.assistantId, name: t.name,
      createdAt: t.createdAt, updatedAt: t.updatedAt,
      isNameManuallyEdited: t.isNameManuallyEdited,
      pinned: pinnedTopicIds.value.has(t.id),
      messages: (dbt?.messages ?? []).map(joinMessage),
    }
  }

  // 所有 TopicObject（遍历 assistants.topics）
  const allTopicObjects = computed<TopicObject[]>(() => {
    const list: TopicObject[] = []
    for (const a of assistants.value) for (const t of a.topics ?? []) list.push(t)
    return list
  })

  const topics = computed<TopicView[]>(() => allTopicObjects.value.map(joinTopic))

  const sortedTopics = computed<TopicView[]>(() => {
    return [...topics.value].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  })

  const activeTopic = computed<TopicView | undefined>(() =>
    topics.value.find(t => t.id === activeTopicId.value) ?? topics.value[0],
  )
  const activeAssistant = computed<AssistantObject>(() =>
    assistants.value.find(a => a.id === activeTopic.value?.assistantId)
    ?? persist.value.assistants.defaultAssistant,
  )

  const defaultAssistantId = computed(() => persist.value.assistants.defaultAssistant.id)

  // ===== 内部 helper =====
  function findAssistant(id: string): AssistantObject | undefined {
    if (id === persist.value.assistants.defaultAssistant.id) return persist.value.assistants.defaultAssistant
    return persist.value.assistants.assistants.find(a => a.id === id)
  }
  function findTopicOwner(topicId: string): AssistantObject | undefined {
    return assistants.value.find(a => a.topics?.some(t => t.id === topicId))
  }
  function findTopicObject(topicId: string): TopicObject | undefined {
    return allTopicObjects.value.find(t => t.id === topicId)
  }
  function genId() {
    return Date.now().toString() + Math.random().toString(36).slice(2, 8)
  }

  // ===== Topic actions =====
  function createTopic(assistantId?: string): TopicView | undefined {
    const aid = assistantId ?? activeAssistant.value.id
    const owner = findAssistant(aid)
    if (!owner) return
    const id = genId()
    const now = new Date().toISOString()
    const topicObj: TopicObject = {
      id, assistantId: aid, name: '新对话', messages: [],
      isNameManuallyEdited: false, createdAt: now, updatedAt: now,
    }
    owner.topics = [...(owner.topics ?? []), topicObj]
    data.value.indexedDB.topics.push({ id, messages: [] })
    activeTopicId.value = id
    return joinTopic(topicObj)
  }

  function selectTopic(id: string) {
    activeTopicId.value = id
  }

  function deleteTopic(id: string) {
    // 移除 TopicObject
    const owner = findTopicOwner(id)
    if (owner) owner.topics = (owner.topics ?? []).filter(t => t.id !== id)
    // 移除 DBTopic + 关联 message_blocks
    const dbt = data.value.indexedDB.topics.find(t => t.id === id)
    const blockIds = new Set<string>()
    for (const m of dbt?.messages ?? []) for (const b of m.blocks) blockIds.add(b)
    data.value.indexedDB.topics = data.value.indexedDB.topics.filter(t => t.id !== id)
    data.value.indexedDB.message_blocks = data.value.indexedDB.message_blocks.filter(b => !blockIds.has(b.id))
    // 移除 pinned
    setPinned(id, false)
    if (activeTopicId.value === id && topics.value.length > 0) {
      activeTopicId.value = topics.value[0]?.id ?? ''
    }
  }

  function setPinned(id: string, pinned: boolean) {
    const existing = data.value.indexedDB.settings.find(s => s.id === 'pinned:topics')
    let arr: string[] = (existing?.value as string[]) ?? []
    arr = pinned ? (arr.includes(id) ? arr : [...arr, id]) : arr.filter(x => x !== id)
    if (existing) existing.value = arr
    else data.value.indexedDB.settings.push({ id: 'pinned:topics', value: arr })
  }

  function togglePin(id: string) {
    const t = findTopicObject(id)
    if (t) {
      setPinned(id, !pinnedTopicIds.value.has(id))
      t.updatedAt = new Date().toISOString()
    }
  }

  function renameTopic(id: string, name: string) {
    const t = findTopicObject(id)
    if (t) {
      t.name = name
      t.isNameManuallyEdited = true
      t.updatedAt = new Date().toISOString()
    }
  }

  function clearTopicMessages(id: string) {
    const dbt = data.value.indexedDB.topics.find(t => t.id === id)
    if (!dbt) return
    const blockIds = new Set<string>()
    for (const m of dbt.messages) for (const b of m.blocks) blockIds.add(b)
    dbt.messages = []
    data.value.indexedDB.message_blocks = data.value.indexedDB.message_blocks.filter(b => !blockIds.has(b.id))
    const t = findTopicObject(id)
    if (t) t.updatedAt = new Date().toISOString()
  }

  function autoNameTopic(topicId: string, firstMessage: string) {
    const t = findTopicObject(topicId)
    if (!t || t.isNameManuallyEdited) return
    if (!settings.value.enableTopicNaming) return
    t.name = firstMessage.slice(0, 30)
    t.updatedAt = new Date().toISOString()
  }

  // ===== Message actions =====
  function addMessage(topicId: string, msg: {
    id?: string
    role?: 'user' | 'assistant'
    assistantId?: string
    createdAt?: string
    updatedAt?: string
    status?: MessageStatus
    blocks?: MessageBlock[]
    modelId?: string
    model?: ModelRef
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
    askId?: string
    metrics?: { completion_tokens: number; time_completion_millsec: number; time_first_token_millsec: number; time_thinking_millsec: number }
    foldSelected?: boolean
    multiModelMessageStyle?: 'fold' | 'horizontal'
  }): MessageView | undefined {
    const dbt = data.value.indexedDB.topics.find(t => t.id === topicId)
    if (!dbt) return
    const now = new Date().toISOString()
    const id = msg.id ?? genId()
    const blockEntities = msg.blocks ?? []
    const blockIds: string[] = []
    for (const b of blockEntities) {
      b.messageId = id
      data.value.indexedDB.message_blocks.push(b)
      blockIds.push(b.id)
    }
    const dbm: DBMessage = {
      id, role: msg.role ?? 'user', topicId, assistantId: msg.assistantId ?? activeAssistant.value.id,
      createdAt: msg.createdAt ?? now, updatedAt: msg.updatedAt, status: msg.status ?? 'success',
      blocks: blockIds,
      modelId: msg.modelId, model: msg.model, usage: msg.usage, askId: msg.askId, metrics: msg.metrics,
      foldSelected: msg.foldSelected, multiModelMessageStyle: msg.multiModelMessageStyle,
    }
    dbt.messages.push(dbm)
    const t = findTopicObject(topicId)
    if (t) t.updatedAt = now
    return joinMessage(dbm)
  }

  function updateMessage(topicId: string, messageId: string, patch: Partial<DBMessage>) {
    const dbt = data.value.indexedDB.topics.find(t => t.id === topicId)
    const m = dbt?.messages.find(x => x.id === messageId)
    if (m) Object.assign(m, patch)
  }

  function updateBlock(_topicId: string, _messageId: string, blockId: string, patch: Partial<MessageBlock>) {
    const b = data.value.indexedDB.message_blocks.find(x => x.id === blockId)
    if (b) Object.assign(b, patch)
  }

  function addBlock(topicId: string, msgId: string, block: MessageBlock) {
    const dbt = data.value.indexedDB.topics.find(t => t.id === topicId)
    const m = dbt?.messages.find(x => x.id === msgId)
    if (!m) return
    block.messageId = msgId
    data.value.indexedDB.message_blocks.push(block)
    m.blocks.push(block.id)
  }

  function deleteMessage(topicId: string, msgId: string) {
    const dbt = data.value.indexedDB.topics.find(t => t.id === topicId)
    const m = dbt?.messages.find(x => x.id === msgId)
    if (!m || !dbt) return
    const blockIds = new Set(m.blocks)
    dbt.messages = dbt.messages.filter(x => x.id !== msgId)
    data.value.indexedDB.message_blocks = data.value.indexedDB.message_blocks.filter(b => !blockIds.has(b.id))
  }

  // ===== Provider actions =====
  function createProvider(p: Partial<Provider>): Provider {
    const provider: Provider = {
      id: p.id ?? crypto.randomUUID(), name: p.name ?? '', type: p.type ?? 'openai',
      apiHost: p.apiHost ?? '', apiKey: p.apiKey ?? '', enabled: p.enabled ?? true,
      isSystem: false, models: p.models ?? [],
    }
    llm.value.providers.push(provider)
    return provider
  }
  function updateProvider(id: string, patch: Partial<Provider>) {
    const p = llm.value.providers.find(x => x.id === id)
    if (p) Object.assign(p, patch)
  }
  function deleteProvider(id: string): { ok: boolean; refs: string[] } {
    const refs = assistants.value.filter(a => a.model?.provider === id).map(a => a.name)
    if (refs.length) return { ok: false, refs }
    llm.value.providers = llm.value.providers.filter(p => p.id !== id)
    return { ok: true, refs: [] }
  }
  function createModel(providerId: string, m: Partial<ModelInfo>) {
    const p = llm.value.providers.find(x => x.id === providerId)
    if (!p) return
    p.models.push({ id: m.id ?? '', provider: providerId, name: m.name ?? '', group: m.group ?? p.name })
  }
  function updateModel(providerId: string, modelId: string, patch: Partial<ModelInfo>) {
    const p = llm.value.providers.find(x => x.id === providerId)
    const m = p?.models.find(x => x.id === modelId)
    if (m) Object.assign(m, patch)
  }
  function deleteModel(providerId: string, modelId: string): { ok: boolean; refs: string[] } {
    const refs = assistants.value.filter(a => a.model?.id === modelId && a.model?.provider === providerId).map(a => a.name)
    if (refs.length) return { ok: false, refs }
    const p = llm.value.providers.find(x => x.id === providerId)
    if (!p) return { ok: false, refs: [] }
    p.models = p.models.filter(m => m.id !== modelId)
    return { ok: true, refs: [] }
  }

  // ===== Assistant actions =====
  function createAssistant(a: Partial<AssistantObject>): AssistantObject {
    const assistant: AssistantObject = {
      id: a.id ?? crypto.randomUUID(), name: a.name ?? 'New Assistant', emoji: a.emoji ?? '🤖',
      prompt: a.prompt ?? '', type: 'assistant', description: a.description,
      model: a.model, defaultModel: a.defaultModel, settings: a.settings ?? { ...DEFAULT_ASSISTANT_SETTINGS },
      topics: a.topics ?? [], regularPhrases: [], mcpServers: [],
      enableWebSearch: a.enableWebSearch, knowledgeRecognition: a.knowledgeRecognition,
    }
    persist.value.assistants.assistants.push(assistant)
    return assistant
  }
  function updateAssistant(id: string, patch: Partial<AssistantObject>) {
    const a = findAssistant(id)
    if (a) Object.assign(a, patch)
  }
  function deleteAssistant(id: string, options?: { migrateTo?: string; cascade?: boolean }): boolean {
    if (id === persist.value.assistants.defaultAssistant.id) return false
    const victim = persist.value.assistants.assistants.find(a => a.id === id)
    if (!victim) return false
    const relatedTopicIds = (victim.topics ?? []).map(t => t.id)
    if (relatedTopicIds.length) {
      if (options?.cascade) {
        relatedTopicIds.forEach(deleteTopic)
      } else if (options?.migrateTo) {
        const dest = findAssistant(options.migrateTo)
        if (dest) {
          const moved = victim.topics ?? []
          dest.topics = [...(dest.topics ?? []), ...moved].map(t => ({ ...t, assistantId: options.migrateTo!, updatedAt: new Date().toISOString() }))
        }
      } else {
        return false
      }
    }
    persist.value.assistants.assistants = persist.value.assistants.assistants.filter(a => a.id !== id)
    return true
  }
  function setDefaultAssistant(id: string) {
    const a = persist.value.assistants.assistants.find(x => x.id === id)
    if (!a) return
    const oldDefault = persist.value.assistants.defaultAssistant
    persist.value.assistants.assistants = persist.value.assistants.assistants.filter(x => x.id !== id)
    persist.value.assistants.assistants.push(oldDefault)
    persist.value.assistants.defaultAssistant = a
  }
  function importAssistants(list: AssistantObject[]) {
    let imported = 0, skipped = 0
    for (const a of list) {
      if (assistants.value.some(x => x.id === a.id)) { skipped++; continue }
      persist.value.assistants.assistants.push(a)
      imported++
    }
    return { imported, skipped }
  }

  // ===== Settings =====
  function updateSettings(patch: Partial<SettingsModule>) {
    Object.assign(persist.value.settings, patch)
  }
  function toggleTheme() {
    isDark.value = !isDark.value
    persist.value.settings.theme = isDark.value ? 'dark' : 'light'
  }
  function applyTheme() {
    const t = persist.value.settings.theme
    isDark.value = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  }

  // ===== CherryData =====
  function getCherryData(): CherryData {
    return data.value
  }
  function setCherryData(d: CherryData) {
    data.value = d
    activeTopicId.value = sortedTopics.value[0]?.id ?? ''
  }

  // ===== Persistence =====
  async function init() {
    try {
      const loaded = await loadCherryData()
      if (loaded) setCherryData(loaded)
      else activeTopicId.value = sortedTopics.value[0]?.id ?? ''
      applyTheme()
      saveStatus.value = 'idle'
    } catch (e) {
      console.error('[appStore] init failed', e)
      saveStatus.value = 'error'
    }
    watch(data, () => saveQueue.enqueue(getCherryData()), { deep: true })
  }
  async function flushSave() {
    await saveQueue.flushNow()
  }

  return {
    // state
    activeTopicId, isDark, saveStatus,
    // computed
    providers, assistants, topics, sortedTopics, activeTopic, activeAssistant, defaultAssistantId, settings,
    // Topic
    createTopic, selectTopic, deleteTopic, togglePin, renameTopic, clearTopicMessages, autoNameTopic,
    // Message
    addMessage, updateMessage, updateBlock, addBlock, deleteMessage,
    // Provider
    createProvider, updateProvider, deleteProvider, createModel, updateModel, deleteModel,
    // Assistant
    createAssistant, updateAssistant, deleteAssistant, setDefaultAssistant, importAssistants,
    // Settings
    updateSettings, toggleTheme, applyTheme,
    // CherryData
    getCherryData, setCherryData,
    // Persistence
    init, flushSave,
  }
})
