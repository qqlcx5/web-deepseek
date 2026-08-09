// ─── Data Import: Cherry Studio → Orbit Chat ──────────────────────────────────
// Maps Cherry Studio raw data structures (real data.json) into Orbit Chat's AppData.
//
// Real structure:
// - localStorage['persist:cherry-studio'].llm.providers = ARRAY of Provider
// - localStorage['persist:cherry-studio'].assistants.assistants = ARRAY of Assistant
// - localStorage['persist:cherry-studio'].assistants.defaultAssistant = Assistant
// - localStorage['persist:cherry-studio'].settings = Record<string, unknown>
// - indexedDB.topics = ARRAY of { id, messages: [...] }
// - indexedDB.message_blocks = ARRAY of { id, messageId, type, content, ... }

import type {
  AppData,
  Assistant,
  ChatMessage,
  MessageBlock,
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
  CherryProvider,
} from '@/types/cherry-data'
import { parseDataJSON } from './cherry-parser'

// ─── SCHEMA_VERSION ───────────────────────────────────────────────────────────

const SCHEMA_VERSION = 1

// ─── Provider mapping ─────────────────────────────────────────────────────────

/**
 * Map Cherry Studio providers (array) to Orbit Chat providers.
 */
export function mapProviders(
  cherryProviders: CherryProvider[] | undefined,
): Provider[] {
  if (!Array.isArray(cherryProviders)) return []

  return cherryProviders.map((cp): Provider => {
    const apiHost = cp.apiHost ?? cp.apiURL ?? ''
    const models: ModelInfo[] = (cp.models ?? []).map((m): ModelInfo => ({
      id: m.id,
      name: m.name,
      providerId: cp.id,
      provider: m.provider,
      group: m.group,
      supportedTextDelta: m.supported_text_delta,
      enabled: true,
    }))

    return {
      id: cp.id,
      name: cp.name,
      apiHost,
      apiKey: cp.apiKey,
      apiPath: undefined,
      apiVersion: cp.apiVersion,
      models,
      enabled: cp.enabled ?? true,
      isSystem: cp.isSystem,
    }
  })
}

// ─── Assistant mapping ────────────────────────────────────────────────────────

/**
 * Map Cherry Studio assistants (array + defaultAssistant) to Orbit Chat assistants.
 */
export function mapAssistants(
  cherryAssistants: CherryAssistant[] | undefined,
  defaultAssistant: CherryAssistant | undefined,
): Assistant[] {
  const result: Assistant[] = []

  // Add default assistant first (if not already in array)
  if (defaultAssistant) {
    result.push(mapAssistant(defaultAssistant, true))
  }

  if (Array.isArray(cherryAssistants)) {
    for (const ca of cherryAssistants) {
      // Skip if already added as default
      if (defaultAssistant && ca.id === defaultAssistant.id) continue
      result.push(mapAssistant(ca, false))
    }
  }

  return result
}

function mapAssistant(ca: CherryAssistant, isDefault: boolean): Assistant {
  return {
    id: ca.id,
    name: ca.name,
    description: ca.description,
    prompt: ca.prompt ?? '',
    avatar: undefined,
    enabled: true,
    isDefault,
    emoji: ca.emoji,
    stream: true,
    regularPhrases: ca.regularPhrases,
    settings: ca.settings,
    defaultModel: ca.defaultModel as Assistant['defaultModel'],
    enableWebSearch: ca.enableWebSearch,
    mcpServers: ca.mcpServers,
    knowledgeRecognition: ca.knowledgeRecognition,
    model: ca.model?.id,
  }
}

// ─── Topic & Message mapping ──────────────────────────────────────────────────

/**
 * Build a map of messageId → blocks[] from indexedDB.message_blocks.
 */
function buildBlockMap(
  messageBlocks: CherryMessageBlock[] | undefined,
): Map<string, CherryMessageBlock[]> {
  const map = new Map<string, CherryMessageBlock[]>()
  if (!Array.isArray(messageBlocks)) return map

  for (const block of messageBlocks) {
    if (!block.messageId) continue
    const existing = map.get(block.messageId)
    if (existing) {
      existing.push(block)
    } else {
      map.set(block.messageId, [block])
    }
  }
  return map
}

/**
 * Map Cherry Studio topics from indexedDB to Orbit Chat topics.
 *
 * @param cherryTopics Array of { id, messages: [...] }
 * @param blockMap Map of messageId → blocks[]
 * @param defaultAssistantId Fallback assistant id
 */
export function mapTopics(
  cherryTopics: { id: string; messages: CherryMessage[] }[] | undefined,
  blockMap: Map<string, CherryMessageBlock[]>,
  defaultAssistantId: string,
): Topic[] {
  if (!Array.isArray(cherryTopics)) return []

  return cherryTopics.map((ct): Topic => ({
    id: ct.id,
    assistantId: defaultAssistantId,
    name: 'Untitled',
    messages: (ct.messages ?? []).map((m, idx) => mapMessage(m, ct.id, idx, blockMap)),
    createdAt: undefined,
    updatedAt: undefined,
  }))
}

// ─── Message mapping ──────────────────────────────────────────────────────────

/**
 * Map a Cherry Studio message to an Orbit Chat message.
 * Content is assembled from message_blocks (keyed by messageId).
 */
export function mapMessage(
  cm: CherryMessage,
  topicId: string,
  index: number,
  blockMap: Map<string, CherryMessageBlock[]>,
): ChatMessage {
  const role = normalizeRole(cm.role)
  const status = normalizeStatus(cm.status)

  // Get blocks for this message
  const rawBlocks = cm.id ? blockMap.get(String(cm.id)) ?? [] : []
  const blocks: MessageBlock[] = rawBlocks.map(mapBlock)

  // Assemble content from main_text blocks (Cherry Studio stores content in blocks, not message.content)
  let content = cm.content ?? ''
  if (!content && blocks.length > 0) {
    content = blocks
      .filter(b => b.type === 'main_text')
      .map(b => b.content)
      .join('')
  }

  // Assemble reasoningContent from thinking blocks
  let reasoningContent: string | undefined
  const thinkingBlocks = blocks.filter(b => b.type === 'thinking')
  if (thinkingBlocks.length > 0) {
    reasoningContent = thinkingBlocks.map(b => b.content).join('')
  }

  return {
    id: String(cm.id ?? `${topicId}-${index}`),
    topicId,
    role,
    content,
    reasoningContent,
    model: cm.model?.name ?? cm.modelId,
    modelId: cm.modelId,
    usage: cm.usage,
    mentions: cm.mentions,
    blocks: blocks.length > 0 ? blocks : undefined,
    askId: cm.askId as string | undefined,
    branchIndex: cm.branchIndex as number | undefined,
    parentBranchIndex: cm.parentBranchIndex as number | undefined,
    createdAt: cm.createdAt != null ? new Date(cm.createdAt).toISOString() : new Date().toISOString(),
    status,
    time: cm.createdAt != null ? new Date(cm.createdAt).toISOString() : new Date().toISOString(),
    tokens: cm.usage
      ? {
          input: cm.usage.prompt_tokens,
          output: cm.usage.completion_tokens,
        }
      : undefined,
  }
}

/**
 * Map a Cherry Studio message block to an Orbit Chat message block.
 */
function mapBlock(cb: CherryMessageBlock): MessageBlock {
  return {
    id: cb.id,
    type: normalizeBlockType(cb.type),
    content: cb.content ?? '',
    status: cb.status,
    createdAt: cb.createdAt,
    citationReferences: cb.citationReferences,
  }
}

function normalizeRole(role: string): MessageRole {
  switch (role) {
    case 'user':
    case 'assistant':
    case 'system':
      return role
    default:
      return 'assistant'
  }
}

function normalizeStatus(status: string | undefined): MessageStatus {
  switch (status) {
    case 'sending':
    case 'streaming':
    case 'complete':
    case 'error':
    case 'stopped':
      return status
    default:
      return 'complete'
  }
}

function normalizeBlockType(type: string): MessageBlock['type'] {
  switch (type) {
    case 'main_text':
    case 'thinking':
    case 'error':
    case 'citation':
    case 'tool':
    case 'unknown':
      return type
    default:
      return 'unknown'
  }
}

// ─── Settings mapping ─────────────────────────────────────────────────────────

/**
 * Map Cherry Studio settings (119 keys) to Orbit Chat Settings.
 */
function mapSettings(
  cherrySettings: Record<string, unknown> | undefined,
): Settings {
  const s = cherrySettings ?? {}
  return {
    language: typeof s.language === 'string' ? s.language : 'zh-CN',
    theme: s.theme === 'dark' ? 'dark' : s.theme === 'auto' ? 'auto' : 'light',
    fontSize: typeof s.fontSize === 'number' ? s.fontSize : 14,
    sendShortcut: (s.sendMessageShortcut as Settings['sendShortcut']) ?? 'Enter',
    autoScroll: true,
    sendMessageShortcut: typeof s.sendMessageShortcut === 'string' ? s.sendMessageShortcut : undefined,
    messageStyle: typeof s.messageStyle === 'string' ? s.messageStyle : undefined,
    codeShowLineNumbers: typeof s.codeShowLineNumbers === 'boolean' ? s.codeShowLineNumbers : undefined,
    showTokens: typeof s.showTokens === 'boolean' ? s.showTokens : undefined,
    pinTopicsToTop: typeof s.pinTopicsToTop === 'boolean' ? s.pinTopicsToTop : undefined,
    confirmDeleteMessage: typeof s.confirmDeleteMessage === 'boolean' ? s.confirmDeleteMessage : undefined,
    // Preserve all other keys
    ...s,
  }
}

// ─── Build full AppData ───────────────────────────────────────────────────────

/**
 * Build a complete AppData object from parsed Cherry Studio data.
 */
export function buildAppData(cherry: CherryData): AppData {
  const persist = cherry.localStorage?.['persist:cherry-studio']
  const indexedDB = cherry.indexedDB

  const providers = mapProviders(persist?.llm?.providers)
  const assistants = mapAssistants(
    persist?.assistants?.assistants,
    persist?.assistants?.defaultAssistant,
  )

  const defaultAssistantId =
    assistants.find(a => a.isDefault)?.id ?? assistants[0]?.id ?? 'default'

  // Build block map from indexedDB.message_blocks
  const blockMap = buildBlockMap(indexedDB?.message_blocks)

  const topics = mapTopics(indexedDB?.topics, blockMap, defaultAssistantId)

  const settings = mapSettings(persist?.settings)

  // Build messageBlocks storage (keyed by block id)
  const messageBlocks: Record<string, MessageBlock> = {}
  if (Array.isArray(indexedDB?.message_blocks)) {
    for (const cb of indexedDB.message_blocks) {
      messageBlocks[cb.id] = mapBlock(cb)
    }
  }

  return {
    version: SCHEMA_VERSION,
    providers,
    assistants,
    topics,
    settings,
    cherryData: cherry,
    messageBlocks,
  }
}

// ─── Merge logic ──────────────────────────────────────────────────────────────

/**
 * Merge two AppData objects.
 *
 * - Providers & Assistants: merged by id; incoming overwrites existing.
 * - Topics: merged by id; messages deduplicated by id (incoming takes precedence).
 * - Settings & compatZone: incoming overwrites existing.
 * - cherryData & messageBlocks: incoming overwrites existing (if provided).
 */
export function mergeAppData(existing: AppData, incoming: AppData): AppData {
  // ── Providers ──
  const providerMap = new Map<string, Provider>()
  for (const p of existing.providers) providerMap.set(p.id, p)
  for (const p of incoming.providers) providerMap.set(p.id, p)

  // ── Assistants ──
  const assistantMap = new Map<string, Assistant>()
  for (const a of existing.assistants) assistantMap.set(a.id, a)
  for (const a of incoming.assistants) assistantMap.set(a.id, a)

  // ── Topics (merge messages by id, dedup) ──
  const topicMap = new Map<string, Topic>()
  for (const t of existing.topics) topicMap.set(t.id, t)

  for (const incomingTopic of incoming.topics) {
    const existingTopic = topicMap.get(incomingTopic.id)
    if (!existingTopic) {
      topicMap.set(incomingTopic.id, incomingTopic)
      continue
    }

    const messageMap = new Map<string, ChatMessage>()
    for (const m of existingTopic.messages) messageMap.set(String(m.id), m)
    for (const m of incomingTopic.messages) messageMap.set(String(m.id), m)

    topicMap.set(incomingTopic.id, {
      ...existingTopic,
      ...incomingTopic,
      messages: Array.from(messageMap.values()),
    })
  }

  // ── messageBlocks ──
  const mergedMessageBlocks: Record<string, MessageBlock> = {
    ...(existing.messageBlocks ?? {}),
    ...(incoming.messageBlocks ?? {}),
  }

  return {
    version: Math.max(existing.version, incoming.version),
    providers: Array.from(providerMap.values()),
    assistants: Array.from(assistantMap.values()),
    topics: Array.from(topicMap.values()),
    settings: { ...existing.settings, ...incoming.settings },
    cherryData: incoming.cherryData ?? existing.cherryData,
    compatZone: { ...existing.compatZone, ...incoming.compatZone },
    messageBlocks: mergedMessageBlocks,
  }
}

// ─── Import from file ─────────────────────────────────────────────────────────

/**
 * Import AppData from a Cherry Studio export file.
 */
export async function importFromFile(
  file: File,
): Promise<{ ok: true; data: AppData } | { ok: false; error: string }> {
  try {
    const text = await file.text()
    const parsed = parseDataJSON(text)

    if (!parsed.ok || !parsed.data) {
      return { ok: false, error: parsed.error ?? 'Unknown parse error' }
    }

    const appData = buildAppData(parsed.data)
    return { ok: true, data: appData }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, error: message }
  }
}
