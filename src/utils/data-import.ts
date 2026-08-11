// ─── Cherry Studio v5 Import ─────────────────────────────────────────────────
// The exchange format is normalized at this boundary. No Cherry fields enter AppData.

import type {
  AppData,
  Assistant,
  ChatMessage,
  MessageBlock,
  MessageBlockStatus,
  MessageBlockType,
  MessageRole,
  MessageStatus,
  ModelInfo,
  Provider,
  Settings,
  Topic,
} from '@/types'
import type {
  CherryAssistant,
  CherryData,
  CherryMessage,
  CherryMessageBlock,
  CherryModelRef,
  CherryProvider,
  CherryTopicRef,
} from '@/types/cherry-data'
import { parseDataJSON } from './cherry-parser'
import { DEFAULT_S3_CONFIG, DEFAULT_WEBDAV_CONFIG } from '@/services/remote/types'

export const APP_DATA_VERSION = 2

export interface ImportReport {
  providerCount: number
  assistantCount: number
  topicCount: number
  messageCount: number
  blockCount: number
  warnings: string[]
}

export const DEFAULT_SETTINGS: Settings = {
  language: 'zh-CN',
  theme: 'light',
  fontSize: 14,
  sendShortcut: 'Enter',
  autoScroll: true,
  autoCheckUpdate: true,
  messageStyle: 'bubble',
  messageFont: 'system',
  codeShowLineNumbers: false,
  codeWrappable: true,
  codeCollapsible: true,
  foldDisplayMode: 'full',
  confirmDeleteMessage: true,
  confirmRegenerateMessage: true,
  showTokens: true,
  showMessageDivider: false,
  showMessageOutline: false,
  messageNavigation: true,
  enableTopicNaming: true,
  pinTopicsToTop: true,
  showTopics: true,
  showTopicTime: true,
  showInputEstimatedTokens: false,
  pasteLongTextAsFile: false,
  pasteLongTextThreshold: 1500,
  context: {
    maxContextTokens: 8000,
    maxHistoryMessages: 20,
    includeUrl: true,
    includeTitle: true,
    includeCapturedAt: false,
  },
  remote: {
    s3: { ...DEFAULT_S3_CONFIG },
    webdav: { ...DEFAULT_WEBDAV_CONFIG },
  },
  remoteType: 'none' as const,
  webdavAutoSync: false,
  webdavAutoSyncInterval: 30,
  renderInputMessageAsMarkdown: false,
  mathEngine: 'katex',
  targetLanguage: 'zh-CN',
}

function toIso(value: string | number | undefined, fallback: string): string {
  if (typeof value === 'string') {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date.toISOString()
  }
  if (typeof value === 'number') {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date.toISOString()
  }
  return fallback
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  return Array.from(new Map(items.map(item => [item.id, item])).values())
}

function modelId(model: CherryModelRef | string | undefined): string | undefined {
  return typeof model === 'string' ? model : model?.id
}

function modelName(model: CherryModelRef | string | undefined): string | undefined {
  return typeof model === 'string' ? model : model?.name
}

export function mapProviders(source: CherryProvider[] | undefined): Provider[] {
  if (!Array.isArray(source)) return []

  return uniqueById(source.filter(provider => provider.id && provider.name).map((provider): Provider => ({
    id: provider.id,
    name: provider.name,
    apiHost: provider.apiHost ?? provider.apiURL ?? '',
    apiKey: provider.apiKey,
    enabled: provider.enabled ?? true,
    isSystem: provider.isSystem,
    models: uniqueById((provider.models ?? []).filter(model => model.id && model.name).map((model): ModelInfo => ({
      id: model.id,
      name: model.name,
      group: model.group,
      supportedTextDelta: model.supported_text_delta,
      enabled: true,
    }))),
  })))
}

function mapAssistant(source: CherryAssistant, isDefault: boolean, now: string): Assistant {
  const settings = source.settings ?? {}
  return {
    id: source.id,
    name: source.name || '未命名助手',
    prompt: source.prompt ?? '',
    enabled: true,
    isDefault,
    emoji: source.emoji,
    description: source.description,
    model: modelId(source.model) ?? source.defaultModel?.id,
    temperature: typeof settings.temperature === 'number' ? settings.temperature : undefined,
    topP: typeof settings.topP === 'number' ? settings.topP : undefined,
    maxTokens: typeof settings.maxTokens === 'number' ? settings.maxTokens : undefined,
    enableWebSearch: source.enableWebSearch ?? false,
    createdAt: now,
    updatedAt: now,
  }
}

export function mapAssistants(
  source: CherryAssistant[] | undefined,
  defaultAssistant: CherryAssistant | undefined,
): Assistant[] {
  const now = new Date().toISOString()
  const defaultId = defaultAssistant?.id
  const all = [defaultAssistant, ...(source ?? [])]
    .filter((assistant): assistant is CherryAssistant => Boolean(assistant?.id))
    .map(assistant => mapAssistant(assistant, assistant.id === defaultId, now))

  const uniqueAssistants = uniqueById(all)
  if (uniqueAssistants.length > 0 && !uniqueAssistants.some(assistant => assistant.isDefault)) {
    uniqueAssistants[0]!.isDefault = true
  }
  return uniqueAssistants
}

function buildTopicRefIndex(
  source: CherryAssistant[] | undefined,
  defaultAssistant: CherryAssistant | undefined,
): Map<string, CherryTopicRef> {
  const refs = new Map<string, CherryTopicRef>()
  for (const assistant of [defaultAssistant, ...(source ?? [])]) {
    if (!assistant) continue
    for (const topic of assistant.topics ?? []) {
      if (topic.id && !refs.has(topic.id)) {
        refs.set(topic.id, {
          ...topic,
          assistantId: topic.assistantId || assistant.id,
        })
      }
    }
  }
  return refs
}

function blockType(type: string): MessageBlockType {
  return ['main_text', 'thinking', 'error', 'citation', 'tool', 'unknown'].includes(type)
    ? type as MessageBlockType
    : 'unknown'
}

function blockStatus(status: string | undefined): MessageBlockStatus {
  if (status === 'error') return 'error'
  if (status === 'streaming' || status === 'processing') return 'streaming'
  return 'success'
}

function messageRole(role: string): MessageRole {
  return role === 'user' || role === 'assistant' || role === 'system' ? role : 'assistant'
}

function messageStatus(status: string | undefined): MessageStatus {
  switch (status) {
    case 'pending':
    case 'sending':
      return 'sending'
    case 'streaming':
    case 'processing':
      return 'streaming'
    case 'error':
      return 'error'
    case 'stopped':
      return 'stopped'
    default:
      return 'complete'
  }
}

function mapBlock(source: CherryMessageBlock, fallback: string): MessageBlock {
  return {
    id: source.id,
    type: blockType(source.type),
    content: source.content ?? '',
    status: blockStatus(source.status),
    createdAt: toIso(source.createdAt, fallback),
    citationReferences: source.citationReferences,
  }
}

function mapMessage(
  source: CherryMessage,
  topicId: string,
  blockById: Map<string, CherryMessageBlock>,
  fallback: string,
): ChatMessage {
  // Cherry's message.blocks is the canonical rendering order.
  const blocks = (source.blocks ?? [])
    .map(id => blockById.get(id))
    .filter((block): block is CherryMessageBlock => Boolean(block))
    .map(block => mapBlock(block, fallback))

  const content = source.content || blocks
    .filter(block => block.type === 'main_text')
    .map(block => block.content)
    .join('')
  const reasoningContent = blocks
    .filter(block => block.type === 'thinking')
    .map(block => block.content)
    .join('')

  return {
    id: String(source.id),
    topicId,
    role: messageRole(source.role),
    content,
    createdAt: toIso(source.createdAt, fallback),
    status: messageStatus(source.status),
    model: modelName(source.model) ?? source.modelId,
    reasoningContent: reasoningContent || undefined,
    blocks,
    usage: source.usage,
  }
}

function mapSettings(source: Record<string, unknown> | undefined): Settings {
  const raw = source ?? {}
  const pickBoolean = (key: keyof Settings, fallback: boolean) =>
    typeof raw[key] === 'boolean' ? raw[key] : fallback
  const pickNumber = (key: keyof Settings, fallback: number) =>
    typeof raw[key] === 'number' ? raw[key] : fallback
  const pickString = (key: keyof Settings, fallback: string) =>
    typeof raw[key] === 'string' ? raw[key] : fallback

  const language = raw.language === 'en-US' ? 'en-US' : 'zh-CN'
  const theme = raw.theme === 'dark' || raw.theme === 'auto' || raw.theme === 'system' ? (raw.theme === 'system' ? 'auto' : raw.theme) : 'light'
  const sendShortcut = raw.sendMessageShortcut === 'Ctrl+Enter' || raw.sendMessageShortcut === 'Shift+Enter'
    ? raw.sendMessageShortcut
    : 'Enter'

  return {
    ...DEFAULT_SETTINGS,
    language,
    theme,
    sendShortcut,
    fontSize: pickNumber('fontSize', DEFAULT_SETTINGS.fontSize),
    autoCheckUpdate: pickBoolean('autoCheckUpdate', DEFAULT_SETTINGS.autoCheckUpdate),
    messageStyle: raw.messageStyle === 'plain' ? 'plain' : 'bubble',
    messageFont: raw.messageFont === 'serif' || raw.messageFont === 'mono' ? raw.messageFont : 'system',
    codeShowLineNumbers: pickBoolean('codeShowLineNumbers', DEFAULT_SETTINGS.codeShowLineNumbers),
    codeWrappable: pickBoolean('codeWrappable', DEFAULT_SETTINGS.codeWrappable),
    codeCollapsible: pickBoolean('codeCollapsible', DEFAULT_SETTINGS.codeCollapsible),
    foldDisplayMode: raw.foldDisplayMode === 'compact' ? 'compact' : 'full',
    confirmDeleteMessage: pickBoolean('confirmDeleteMessage', DEFAULT_SETTINGS.confirmDeleteMessage),
    confirmRegenerateMessage: pickBoolean('confirmRegenerateMessage', DEFAULT_SETTINGS.confirmRegenerateMessage),
    showTokens: pickBoolean('showTokens', DEFAULT_SETTINGS.showTokens),
    showMessageDivider: pickBoolean('showMessageDivider', DEFAULT_SETTINGS.showMessageDivider),
    showMessageOutline: pickBoolean('showMessageOutline', DEFAULT_SETTINGS.showMessageOutline),
    messageNavigation: pickBoolean('messageNavigation', DEFAULT_SETTINGS.messageNavigation),
    enableTopicNaming: pickBoolean('enableTopicNaming', DEFAULT_SETTINGS.enableTopicNaming),
    pinTopicsToTop: pickBoolean('pinTopicsToTop', DEFAULT_SETTINGS.pinTopicsToTop),
    showTopics: pickBoolean('showTopics', DEFAULT_SETTINGS.showTopics),
    showTopicTime: pickBoolean('showTopicTime', DEFAULT_SETTINGS.showTopicTime),
    showInputEstimatedTokens: pickBoolean('showInputEstimatedTokens', DEFAULT_SETTINGS.showInputEstimatedTokens),
    pasteLongTextAsFile: pickBoolean('pasteLongTextAsFile', DEFAULT_SETTINGS.pasteLongTextAsFile),
    pasteLongTextThreshold: pickNumber('pasteLongTextThreshold', DEFAULT_SETTINGS.pasteLongTextThreshold),
    renderInputMessageAsMarkdown: pickBoolean('renderInputMessageAsMarkdown', DEFAULT_SETTINGS.renderInputMessageAsMarkdown),
    mathEngine: raw.mathEngine === 'mathjax' ? 'mathjax' : 'katex',
    targetLanguage: pickString('targetLanguage', DEFAULT_SETTINGS.targetLanguage),
    remoteType: 'none',
    webdavAutoSync: false,
    webdavAutoSyncInterval: 30,
  }
}

export function buildAppData(cherry: CherryData): AppData {
  const persist = cherry?.localStorage?.['persist:cherry-studio']
  if (!persist?.llm || !Array.isArray(persist.llm.providers)) {
    throw new Error('导入文件缺少有效的 persist:cherry-studio.llm.providers 数组。')
  }
  if (!persist.assistants || !Array.isArray(persist.assistants.assistants) || !persist.assistants.defaultAssistant) {
    throw new Error('导入文件缺少有效的 persist:cherry-studio.assistants 配置。')
  }
  const indexedDB = cherry.indexedDB ?? { topics: [], message_blocks: [] }
  const now = new Date().toISOString()
  const providers = mapProviders(persist.llm.providers)
  const assistants = mapAssistants(persist.assistants.assistants, persist.assistants.defaultAssistant)
  const defaultAssistantId = assistants.find(assistant => assistant.isDefault)?.id ?? assistants[0]?.id
  const topicRefs = buildTopicRefIndex(persist.assistants.assistants, persist.assistants.defaultAssistant)
  const blockById = new Map((indexedDB.message_blocks ?? []).map(block => [block.id, block]))

  // Sanitize assistant model references: clear model field if the model ID
  // doesn't exist in any provider's model list. This prevents dangling refs.
  const allModelIds = new Set(providers.flatMap(provider => provider.models.map(model => model.id)))
  for (const assistant of assistants) {
    if (assistant.model && !allModelIds.has(assistant.model)) {
      assistant.model = undefined
    }
  }

  const topics: Topic[] = (indexedDB.topics ?? []).map(source => {
    const ref = topicRefs.get(source.id)
    return {
      id: source.id,
      assistantId: ref?.assistantId ?? defaultAssistantId ?? 'default',
      name: ref?.name || '未命名对话',
      messages: (source.messages ?? []).map(message => mapMessage(message, source.id, blockById, now)),
      isNameManuallyEdited: ref?.isNameManuallyEdited ?? false,
      pinned: false,
      createdAt: toIso(ref?.createdAt, now),
      updatedAt: toIso(ref?.updatedAt, now),
    }
  })

  return {
    version: APP_DATA_VERSION,
    providers,
    assistants,
    topics,
    settings: mapSettings(persist.settings),
  }
}

function createImportReport(cherry: CherryData, data: AppData): ImportReport {
  const persist = cherry.localStorage['persist:cherry-studio']
  const topicRefs = buildTopicRefIndex(persist.assistants.assistants, persist.assistants.defaultAssistant)
  const sourceMessages = cherry.indexedDB.topics.flatMap(topic => topic.messages ?? [])
  const sourceMessageIds = new Set(sourceMessages.map(message => message.id))
  const blockIds = new Set(cherry.indexedDB.message_blocks.map(block => block.id))
  const warnings: string[] = []

  const fallbackTopics = cherry.indexedDB.topics.filter(topic => !topicRefs.has(topic.id)).length
  if (fallbackTopics > 0) warnings.push(`${fallbackTopics} 个 Topic 缺少 Assistant 引用，已归入默认 Assistant。`)

  const missingBlockRefs = sourceMessages
    .flatMap(message => message.blocks ?? [])
    .filter(blockId => !blockIds.has(blockId)).length
  if (missingBlockRefs > 0) warnings.push(`${missingBlockRefs} 个 MessageBlock 引用缺失，已跳过。`)

  const orphanBlocks = cherry.indexedDB.message_blocks.filter(block => !sourceMessageIds.has(block.messageId)).length
  if (orphanBlocks > 0) warnings.push(`${orphanBlocks} 个孤立 MessageBlock 未导入。`)

  return {
    providerCount: data.providers.length,
    assistantCount: data.assistants.length,
    topicCount: data.topics.length,
    messageCount: data.topics.reduce((count, topic) => count + topic.messages.length, 0),
    blockCount: data.topics.reduce((count, topic) => count + topic.messages.reduce((total, message) => total + message.blocks.length, 0), 0),
    warnings,
  }
}

export function mergeAppData(existing: AppData, incoming: AppData): AppData {
  const mergeEntities = <T extends { id: string }>(current: T[], next: T[]) =>
    Array.from(new Map([...current, ...next].map(item => [item.id, item])).values())

  const existingTopics = new Map(existing.topics.map(topic => [topic.id, topic]))
  const topics = incoming.topics.map(topic => {
    const current = existingTopics.get(topic.id)
    if (!current) return topic
    const messages = mergeEntities(current.messages, topic.messages)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    return { ...current, ...topic, messages }
  })

  for (const topic of existing.topics) {
    if (!topics.some(candidate => candidate.id === topic.id)) topics.push(topic)
  }

  return {
    version: APP_DATA_VERSION,
    providers: mergeEntities(existing.providers, incoming.providers),
    assistants: mergeEntities(existing.assistants, incoming.assistants),
    topics,
    settings: { ...existing.settings, ...incoming.settings },
  }
}

export async function importFromFile(file: File): Promise<{ ok: true; data: AppData; report: ImportReport } | { ok: false; error: string }> {
  try {
    const parsed = parseDataJSON(await file.text())
    if (!parsed.ok || !parsed.data) return { ok: false, error: parsed.error ?? '无法解析导入文件' }
    const data = buildAppData(parsed.data)
    return { ok: true, data, report: createImportReport(parsed.data, data) }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}
