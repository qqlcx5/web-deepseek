// ============================================================================
// Cherry Studio v5 数据结构（对齐 docs/data-schema.md，从真实 data.json 提取）
// 本项目数据结构 = Cherry schema，不存在独立的「Orbit 数据结构」。
// ============================================================================

// ============================================================================
// 1. 顶层
// ============================================================================

export interface CherryData {
  time: number // Unix 毫秒时间戳
  version: 5
  localStorage: LocalStorageData
  indexedDB: IndexedDBData
}

// ============================================================================
// 2. localStorage
// ============================================================================

export interface LocalStorageData {
  language: string
  modelscope_token: string
  'persist:cherry-studio': PersistRoot
}

/** persist:cherry-studio 根 —— 20 个 redux-persist 模块 */
export interface PersistRoot {
  assistants: AssistantsModule
  agents: AgentsModule
  backup: BackupModule
  codeTools: CodeToolsModule
  nutstore: NutstoreModule
  paintings: PaintingsModule
  llm: LLMModule
  settings: SettingsModule
  shortcuts: ShortcutsModule
  knowledge: KnowledgeModule
  minapps: MinappsModule
  websearch: WebsearchModule
  mcp: MCPModule
  memory: MemoryModule
  copilot: CopilotModule
  selectionStore: SelectionStoreModule
  preprocess: PreprocessModule
  inputTools: InputToolsModule
  translate: TranslateModule
  ocr: OCRModule
  note: NoteModule
  _persist: { version: number; rehydrated: boolean }
}

// ============================================================================
// 3. assistants（助手模块）
// ============================================================================

export interface AssistantsModule {
  defaultAssistant: AssistantObject
  assistants: AssistantObject[]
}

export interface AssistantObject {
  id: string // "default" 或 UUID
  name: string
  emoji: string
  prompt: string
  type: 'assistant'
  // defaultAssistant 专有
  messages?: never[]
  // assistants[] 项可包含
  model?: ModelRef
  defaultModel?: ModelRef
  settings?: AssistantSettings
  topics?: TopicObject[]
  regularPhrases?: never[]
  enableWebSearch?: boolean
  knowledgeRecognition?: 'off'
  mcpServers?: never[]
  description?: string
}

/** 模型引用 —— 贯穿全 schema 的轻量模型标识 */
export interface ModelRef {
  id: string
  provider: string
  name: string
  group: string
  supported_text_delta?: boolean
}

export interface AssistantSettings {
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
  reasoning_effort_cache?: string
  qwenThinkMode?: boolean
  enableTemperature?: boolean
}

/** 话题元数据（助手内嵌，messages 恒空） */
export interface TopicObject {
  id: string
  assistantId: string
  createdAt: string
  updatedAt: string
  name: string
  messages: never[] // 分离存储：真实消息在 indexedDB.topics
  isNameManuallyEdited: boolean
}

// ============================================================================
// 4. agents（智能体模块）
// ============================================================================

export interface AgentsModule {
  agents: AgentObject[]
}

export interface AgentObject {
  id: string
  name: string
  emoji: string
  prompt: string
  type: 'agent'
  model: null
  settings: Record<string, never>
  defaultModel: ModelRef
  topics: TopicObject[]
  messages: never[]
}

// ============================================================================
// 5. llm（模型提供商模块）
// ============================================================================

export interface LLMModule {
  defaultModel: ModelRef
  topicNamingModel: ModelRef
  translateModel: ModelRef
  quickAssistantModel: ModelRef
  quickModel: ModelRef
  quickAssistantId: string
  providers: Provider[]
  settings: LLMSettings
}

export type ProviderType =
  | 'openai'
  | 'openai-response'
  | 'gemini'
  | 'anthropic'
  | 'azure-openai'
  | 'mistral'
  | 'vertexai'

export interface Provider {
  id: string
  name: string
  type: ProviderType
  apiKey: string
  apiHost: string
  enabled: boolean
  isSystem: boolean
  models: ModelInfo[]
  isNotSupportArrayContent?: boolean
  isNotSupportDeveloperRole?: boolean
  isNotSupportStreamOptions?: boolean
  isVertex?: boolean
  apiOptions?: {
    isNotSupportArrayContent: boolean
    isNotSupportDeveloperRole: boolean
    isNotSupportStreamOptions: boolean
  }
  serviceTier?: 'auto'
}

export interface ModelInfo {
  id: string
  provider: string
  name: string
  group: string
  supported_text_delta?: boolean
  owned_by?: string
}

export interface LLMSettings {
  ollama: { keepAliveTime: number }
  lmstudio: { keepAliveTime: number }
  gpustack: { keepAliveTime: number }
  vertexai: {
    serviceAccount: { privateKey: string; clientEmail: string }
    projectId: string
    location: string
  }
}

// ============================================================================
// 6. settings（全局设置模块）
// ============================================================================

export interface SettingsModule {
  // 基础
  language: string
  targetLanguage: string
  proxyMode: string
  userName: string
  launchOnBoot: boolean
  launchToTray: boolean
  trayOnClose: boolean
  tray: boolean
  autoCheckUpdate: boolean
  upgradeChannel: string
  testChannel: string
  testPlan: boolean
  userId: string
  disableHardwareAcceleration: boolean
  enableDataCollection: boolean
  enableSpellCheck: boolean
  spellCheckLanguages: never[]
  earlyAccess: boolean
  // 外观
  theme: string
  windowStyle: string
  fontSize: number
  messageFont: string
  messageStyle: string
  showMessageDivider: boolean
  showTokens: boolean
  showModelProviderInMarkdown: boolean
  showModelNameInMarkdown: boolean
  showMessageOutline: boolean
  renderInputMessageAsMarkdown: boolean
  sidebarIcons: { visible: string[]; disabled: string[] }
  narrowMode: boolean
  navbarPosition: string
  userTheme: { colorPrimary: string }
  // 话题
  showAssistants: boolean
  showTopics: boolean
  topicPosition: string
  showTopicTime: boolean
  pinTopicsToTop: boolean
  assistantIconType: string
  clickAssistantToShowTopic: boolean
  enableTopicNaming: boolean
  topicNamingPrompt: string
  useTopicNamingForMessageTitle: boolean
  // 输入
  sendMessageShortcut: string
  showInputEstimatedTokens: boolean
  pasteLongTextAsFile: boolean
  pasteLongTextThreshold: number
  foldDisplayMode: string
  gridColumns: number
  gridPopoverTrigger: string
  messageNavigation: string
  confirmDeleteMessage: boolean
  confirmRegenerateMessage: boolean
  thoughtAutoCollapse: boolean
  // 代码
  codeExecution: { enabled: boolean; timeoutMinutes: number }
  codeEditor: {
    enabled: boolean
    themeLight: string
    themeDark: string
    highlightActiveLine: boolean
    foldGutter: boolean
    autocompletion: boolean
    keymap: boolean
  }
  codePreview: { themeLight: string; themeDark: string }
  codeViewer: { themeLight: string; themeDark: string }
  codeShowLineNumbers: boolean
  codeCollapsible: boolean
  codeWrappable: boolean
  // 数学
  mathEngine: string
  mathEnableSingleDollar: boolean
  // 导出
  exportMenuOptions: {
    image: boolean
    markdown: boolean
    markdown_reason: boolean
    notion: boolean
    yuque: boolean
    joplin: boolean
    obsidian: boolean
    siyuan: boolean
    docx: boolean
    plain_text: boolean
  }
  markdownExportPath: null | string
  forceDollarMathInMarkdown: boolean
  // 知识库集成
  notionDatabaseID: string
  notionApiKey: string
  notionPageNameKey: string
  notionAutoSplit: boolean
  notionSplitSize: number
  notionExportReasoning: boolean
  yuqueToken: string
  yuqueUrl: string
  yuqueRepoId: string
  joplinToken: string
  joplinUrl: string
  defaultObsidianVault: string
  defaultAgent: null | string
  siyuanApiUrl: null | string
  siyuanToken: null | string
  siyuanBoxId: null | string
  siyuanRootPath: null | string
  agentssubscribeUrl: string
  // 翻译
  autoTranslateWithSpace: boolean
  showTranslateConfirm: boolean
  translateModelPrompt: string
  showPrompt: boolean
  // 快速助手
  enableQuickAssistant: boolean
  clickTrayToShowQuickAssistant: boolean
  readClipboardAtStartup: boolean
  // 多模型
  multiModelMessageStyle: string
  enableBackspaceDeleteModel: boolean
  enableQuickPanelTriggers: boolean
  // 备份与同步
  skipBackupFile: boolean
  webdavHost: string
  webdavUser: string
  webdavPass: string
  webdavPath: string
  webdavAutoSync: boolean
  webdavSyncInterval: string
  webdavMaxBackups: number
  webdavSkipBackupFile: boolean
  webdavDisableStream: boolean
  s3: {
    endpoint: string
    region: string
    bucket: string
    accessKeyId: string
    secretAccessKey: string
    root: string
    autoSync: boolean
    syncInterval: number
    maxBackups: number
    skipBackupFile: boolean
  }
  localBackupMaxBackups: number
  localBackupSkipBackupFile: boolean
  localBackupDir: string
  localBackupAutoSync: boolean
  localBackupSyncInterval: number
  // 迷你应用
  maxKeepAliveMinapps: number
  showOpenedMinappsInSidebar: boolean
  minappsOpenLinkExternal: boolean
  // 其他
  apiServer: { enabled: boolean; host: string; port: number; apiKey: string }
  proxyBypassRules: string
  defaultPaintingProvider: string
  notification: { assistant: boolean; backup: boolean; knowledgeEmbed: boolean }
  openAI: { summaryText: string; serviceTier: string; verbosity: string }
  customCss: string
}

// ============================================================================
// 7. indexedDB
// ============================================================================

export interface IndexedDBData {
  files: never[]
  topics: DBTopic[]
  settings: DBSetting[]
  knowledge_notes: never[]
  translate_history: TranslateHistoryItem[]
  quick_phrases: never[]
  message_blocks: MessageBlock[]
  translate_languages: never[]
  notes_tree: never[]
}

/** 话题消息容器（真实消息存储） */
export interface DBTopic {
  id: string // 外键 → TopicObject.id
  messages: DBMessage[]
}

export type MessageRole = 'user' | 'assistant'
export type MessageStatus = 'success' | 'pending' | 'error'

export interface DBMessage {
  id: string
  role: MessageRole
  topicId: string // 外键 → DBTopic.id
  assistantId: string // 外键 → AssistantObject.id
  createdAt: string
  updatedAt?: string
  status: MessageStatus
  blocks: string[] // 外键 → MessageBlock.id
  modelId?: string
  model?: ModelRef
  // 用户消息独有
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  mentions?: never[]
  // 助手消息独有
  askId?: string // 外键 → DBMessage.id（问答链）
  metrics?: {
    completion_tokens: number
    time_completion_millsec: number
    time_first_token_millsec: number
    time_thinking_millsec: number
  }
  foldSelected?: boolean
  multiModelMessageStyle?: 'fold' | 'horizontal'
}

// ============================================================================
// 7.3 MessageBlock（消息内容块联合，type 区分）
// ============================================================================

export type MessageBlockType =
  | 'main_text'
  | 'thinking'
  | 'citation'
  | 'tool'
  | 'error'
  | 'unknown'

export interface BlockBase {
  id: string
  messageId: string // 外键 → DBMessage.id
  type: MessageBlockType
  createdAt: string
  status: 'success' | 'error' | 'pending'
  updatedAt?: string
}

export interface TextBlock extends BlockBase {
  type: 'main_text'
  content: string
  knowledgeBaseIds?: string[]
  citationReferences?: unknown[]
}

export interface ThinkingBlock extends BlockBase {
  type: 'thinking'
  content: string
  thinking_millsec: number
}

export interface CitationBlock extends BlockBase {
  type: 'citation'
  response: {
    results: {
      searchEntryPoint: { renderedContent: string }
      groundingChunks: unknown
      groundingSupports: unknown
      webSearchQueries: unknown
    }
    source: string
  }
}

export interface ToolBlock extends BlockBase {
  type: 'tool'
  toolId?: string
  toolName?: string
  metadata?: {
    rawMcpToolResponse: {
      id: string
      toolUseId: string
      tool: { name: string; description: string; inputSchema: object }
    }
  }
}

export interface ErrorBlock extends BlockBase {
  type: 'error'
  error: {
    name: string
    message: string
    originalMessage: string
    stack: string
  }
}

export interface UnknownBlock extends BlockBase {
  type: 'unknown'
  status: 'error'
}

export type MessageBlock =
  | TextBlock
  | ThinkingBlock
  | CitationBlock
  | ToolBlock
  | ErrorBlock
  | UnknownBlock

// ============================================================================
// 7.4 DBSetting / 7.5 TranslateHistoryItem
// ============================================================================

export interface DBSetting {
  id: string // "image://provider-<UUID>" | "pinned:models" | "translate:*"
  value: string | string[]
}

export interface TranslateHistoryItem {
  id: string
  sourceText: string
  targetText: string
  sourceLanguage: string
  targetLanguage: string
  createdAt: string
}

// ============================================================================
// 8-24. 其余 localStorage 模块
// ============================================================================

export interface BackupModule {
  webdavSync: SyncState
  s3Sync: SyncState
}

export interface SyncState {
  lastSyncTime: null | string
  syncing: boolean
  lastSyncError: null | string
}

export interface CodeToolsModule {
  selectedCliTool: string
  selectedModels: {
    'qwen-code': ModelRef
    'claude-code': ModelRef
    'gemini-cli': ModelRef
  }
  directories: never[]
  currentDirectory: string
  environmentVariables: {
    'qwen-code': Record<string, string>
    'claude-code': Record<string, string>
    'gemini-cli': Record<string, string>
  }
}

export interface NutstoreModule {
  nutstoreToken: string
  nutstorePath: string
  nutstoreAutoSync: boolean
  nutstoreSyncInterval: number
  nutstoreSyncState: SyncState
  nutstoreSkipBackupFile: boolean
  nutstoreMaxBackups: number
}

export interface PaintingsModule {
  siliconflow_paintings: PaintingRecord[]
  dmxapi_paintings: PaintingRecord[]
  tokenflux_paintings: PaintingRecord[]
  zhipu_paintings: PaintingRecord[]
  aihubmix_image_generate: PaintingRecord[]
  aihubmix_image_remix: PaintingRecord[]
  aihubmix_image_edit: PaintingRecord[]
  aihubmix_image_upscale: PaintingRecord[]
  openai_image_generate: PaintingRecord[]
  openai_image_edit: PaintingRecord[]
}

export interface PaintingRecord {
  id: string
  model: string
  aspectRatio: string
  numImages: number
  styleType: string
  prompt: string
  negativePrompt: string
  magicPromptOption: boolean
  seed: string
  imageWeight: number
  resemblance: number
  detail: number
  files: string[]
  urls: string[]
  renderingSpeed: string
}

export type ShortcutKey =
  | 'zoom_in'
  | 'zoom_out'
  | 'zoom_reset'
  | 'show_app'
  | 'show_settings'
  | 'mini_window'
  | 'exit_fullscreen'
  | 'new_topic'
  | 'toggle_new_context'
  | 'toggle_show_assistants'
  | 'toggle_show_topics'
  | 'clear_topic'
  | 'search_message'
  | 'search_message_in_chat'
  | 'copy_last_message'
  | 'selection_assistant_toggle'
  | 'selection_assistant_select_text'

export interface ShortcutsModule {
  shortcuts: ShortcutItem[]
}

export interface ShortcutItem {
  key: ShortcutKey
  shortcut: string[]
  editable: boolean
  enabled: boolean
  system: boolean
}

export interface KnowledgeModule {
  bases: never[]
}

export interface MinappsModule {
  enabled: Minapp[]
  disabled: Minapp[]
  pinned: Minapp[]
}

export interface Minapp {
  id: string
  name: string
  url: string
  logo: string
  bodered?: boolean
}

export interface WebsearchModule {
  defaultProvider: string
  providers: WebsearchProvider[]
  searchWithTime: boolean
  maxResults: number
  excludeDomains: never[]
  subscribeSources: never[]
  overwrite: boolean
  providerConfig: Record<string, never>
  compressionConfig: { method: string; cutoffUnit: string }
}

export interface WebsearchProvider {
  id: string
  name: string
  apiHost?: string
  apiKey?: string
  url?: string
  basicAuthUsername?: string
  basicAuthPassword?: string
}

export interface MCPModule {
  servers: MCPServer[]
  isUvInstalled: boolean
  isBunInstalled: boolean
}

export interface MCPServer {
  id: string
  name: string
  type: 'inMemory' | 'stdio'
  description: string
  isActive: boolean
  provider: string
  env?: Record<string, string>
  args?: string[]
  command?: string
}

export interface MemoryModule {
  memoryConfig: {
    embedderDimensions: number
    isAutoDimensions: boolean
    customFactExtractionPrompt: string
    customUpdateMemoryPrompt: string
  }
  currentUserId: string
  globalMemoryEnabled: boolean
}

export interface CopilotModule {
  username: string
  avatar: string
}

export interface SelectionStoreModule {
  selectionEnabled: boolean
  triggerMode: string
  isCompact: boolean
  isAutoClose: boolean
  isAutoPin: boolean
  isFollowToolbar: boolean
  isRemeberWinSize: boolean
  filterMode: string
  filterList: never[]
  actionWindowOpacity: number
  actionItems: SelectionAction[]
}

export interface SelectionAction {
  id: string
  name: string
  enabled: boolean
  isBuiltIn: boolean
  icon: string
  searchEngine?: string
}

export interface PreprocessModule {
  providers: PreprocessProvider[]
  defaultProvider: string
}

export interface PreprocessProvider {
  id: string
  name: string
  apiHost?: string
  apiKey?: string
  model?: string
}

export interface InputToolsModule {
  toolOrder: { visible: string[]; hidden: string[] }
  isCollapsed: boolean
}

export interface TranslateModule {
  translatedContent: string
  translateInput: string
}

export interface OCRModule {
  providers: OCRProvider[]
  imageProviderId: string
}

export interface OCRProvider {
  id: string
  name: string
  capabilities: { image: boolean }
  config: {
    langs?: Record<string, boolean>
    apiUrl?: string
  }
}

export interface NoteModule {
  settings: {
    isFullWidth: boolean
    fontFamily: string
    defaultViewMode: string
    defaultEditMode: string
    showTabStatus: boolean
    showWorkspace: boolean
  }
  notesPath: string
  sortType: string
}
