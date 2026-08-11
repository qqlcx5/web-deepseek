// ===== Orbit Chat 核心类型（对齐需求文档 §2）=====

// §2.5 基础枚举
export type MessageRole = 'user' | 'assistant'
export type MessageStatus = 'sending' | 'streaming' | 'complete' | 'error' | 'stopped'
export type MessageBlockType = 'main_text' | 'thinking' | 'error' | 'citation' | 'tool' | 'unknown'
export type MessageBlockStatus = 'streaming' | 'success' | 'error'

// §2.2 Provider 相关
export type ProviderType = 'openai' | 'gemini' | 'anthropic' | 'azure-openai' | 'mistral' | 'vertexai'

export interface ModelInfo {
  id: string
  provider: string
  name: string
  group: string
  supported_text_delta?: boolean
  owned_by?: string
  enabled: boolean
}

export interface Provider {
  id: string
  name: string
  type: ProviderType
  apiHost: string
  apiKey?: string
  enabled: boolean
  isSystem: boolean
  models: ModelInfo[]
  isNotSupportArrayContent?: boolean
  isNotSupportDeveloperRole?: boolean
  isNotSupportStreamOptions?: boolean
  apiOptions?: {
    isNotSupportArrayContent: boolean
    isNotSupportDeveloperRole: boolean
    isNotSupportStreamOptions: boolean
  }
}

// §2.3 Assistant 相关
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
  qwenThinkMode?: boolean
  enableTemperature?: boolean
}

export interface Assistant {
  id: string
  name: string
  emoji: string
  prompt: string
  description?: string
  enabled: boolean
  isDefault: boolean
  model?: ModelRef
  defaultModel?: ModelRef
  settings: AssistantSettings
  enableWebSearch?: boolean
  knowledgeRecognition?: 'off'
  mcpServers?: string[]
  regularPhrases?: string[]
  createdAt: string
  updatedAt: string
}

// §2.5 Message 和 Block
export interface MessageBlock {
  id: string
  messageId: string
  type: MessageBlockType
  createdAt: string
  status: MessageBlockStatus
  updatedAt?: string
  // type='main_text'
  content?: string
  knowledgeBaseIds?: string[]
  citationReferences?: unknown[]
  // type='thinking'
  thinking_millsec?: number
  // type='citation'
  response?: {
    results: {
      searchEntryPoint: { renderedContent: string }
      groundingChunks: unknown
      groundingSupports: unknown
      webSearchQueries: unknown
    }
    source: string
  }
  // type='tool'
  toolId?: string
  toolName?: string
  metadata?: {
    rawMcpToolResponse: {
      id: string
      toolUseId: string
      tool: { name: string; description: string; inputSchema: object }
    }
  }
  // type='error'
  error?: {
    name: string
    message: string
    originalMessage: string
    stack: string
  }
}

export interface ChatMessage {
  id: string
  topicId: string
  role: MessageRole
  assistantId: string
  createdAt: string
  updatedAt?: string
  status: MessageStatus
  blocks: MessageBlock[]
  modelId?: string
  model?: ModelRef
  // 用户消息独有
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  mentions?: string[]
  // 助手消息独有
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

// §2.4 Topic
export interface Topic {
  id: string
  assistantId: string
  name: string
  messages: ChatMessage[]
  isNameManuallyEdited: boolean
  pinned: boolean
  createdAt: string
  updatedAt: string
}

// §2.6 Settings
export interface Settings {
  // 基础
  language: 'zh-CN' | 'en-US'
  theme: 'light' | 'dark' | 'auto'
  fontSize: number
  userName: string
  // 话题
  showAssistants: boolean
  showTopics: boolean
  topicPosition: 'left' | 'right'
  showTopicTime: boolean
  pinTopicsToTop: boolean
  assistantIconType: string
  clickAssistantToShowTopic: boolean
  enableTopicNaming: boolean
  topicNamingPrompt: string
  useTopicNamingForMessageTitle: boolean
  // 输入
  sendMessageShortcut: 'Enter' | 'Ctrl+Enter' | 'Shift+Enter'
  showInputEstimatedTokens: boolean
  pasteLongTextAsFile: boolean
  pasteLongTextThreshold: number
  foldDisplayMode: 'expanded' | 'compact'
  gridColumns: number
  messageNavigation: string
  confirmDeleteMessage: boolean
  confirmRegenerateMessage: boolean
  thoughtAutoCollapse: boolean
  // 消息显示
  messageStyle: 'plain' | 'bubble'
  messageFont: 'system' | 'serif' | 'mono'
  showMessageDivider: boolean
  showTokens: boolean
  showModelProviderInMarkdown: boolean
  showModelNameInMarkdown: boolean
  showMessageOutline: boolean
  renderInputMessageAsMarkdown: boolean
  // 代码
  codeShowLineNumbers: boolean
  codeWrappable: boolean
  codeCollapsible: boolean
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
  // 数学
  mathEngine: 'katex' | 'mathjax'
  mathEnableSingleDollar: boolean
  // 翻译
  autoTranslateWithSpace: boolean
  showTranslateConfirm: boolean
  translateModelPrompt: string
  targetLanguage: string
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
  // 多模型
  multiModelMessageStyle: string
  enableBackspaceDeleteModel: boolean
  enableQuickPanelTriggers: boolean
  // 布局
  narrowMode: boolean
  navbarPosition: 'left' | 'right'
  userTheme: { colorPrimary: string }
  // 自定义
  customCss: string
}

// §2.1 顶层结构
export interface AppData {
  version: number
  providers: Provider[]
  assistants: Assistant[]
  topics: Topic[]
  settings: Settings
}
