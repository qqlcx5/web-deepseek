// ─── Data Import: Cherry Studio → Orbit Chat ──────────────────────────────────
// Maps Cherry Studio raw data structures into Orbit Chat's `AppData` format.

import type {
  AppData,
  Assistant,
  Message,
  MessageBlock,
  MessageRole,
  MessageStatus,
  ModelInfo,
  Provider,
  Topic,
} from '@/types'
import type {
  CherryAssistant,
  CherryData,
  CherryMessage,
  CherryMessageBlock,
  CherryProvider,
  CherryTopicRecord,
} from '@/types/cherry-data'
import { parseDataJSON } from './cherry-parser'

// ─── SCHEMA_VERSION ───────────────────────────────────────────────────────────

/** Current AppData schema version. */
const SCHEMA_VERSION = 1

// ─── Provider mapping ─────────────────────────────────────────────────────────

/**
 * Map Cherry Studio providers to Orbit Chat providers.
 *
 * @param cherryProviders Raw Cherry Studio provider map.
 * @returns Array of Orbit Chat `Provider` objects.
 */
export function mapProviders(
  cherryProviders: Record<string, CherryProvider> | undefined,
): Provider[] {
  if (!cherryProviders) return []

  return Object.values(cherryProviders).map((cp): Provider => {
    const apiHost = cp.apiHost ?? cp.apiURL ?? ''
    const models: ModelInfo[] = (cp.models ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      providerId: cp.id,
      description: typeof m.description === 'string' ? m.description : undefined,
      maxTokens: typeof m.maxTokens === 'number' ? m.maxTokens : undefined,
      contextLength: typeof m.contextLength === 'number' ? m.contextLength : undefined,
      enabled: true,
    }))

    return {
      id: cp.id,
      name: cp.name,
      apiHost,
      apiKey: cp.apiKey,
      apiPath: undefined,
      models,
      enabled: cp.enabled ?? true,
    }
  })
}

// ─── Assistant mapping ────────────────────────────────────────────────────────

/**
 * Map Cherry Studio assistants to Orbit Chat assistants.
 *
 * @param cherryAssistants Raw Cherry Studio assistant map.
 * @returns Array of Orbit Chat `Assistant` objects.
 */
export function mapAssistants(
  cherryAssistants: Record<string, CherryAssistant> | undefined,
): Assistant[] {
  if (!cherryAssistants) return []

  return Object.values(cherryAssistants).map((ca): Assistant => ({
    id: ca.id,
    name: ca.name,
    description: ca.description,
    prompt: ca.prompt ?? '',
    temperature: ca.temperature,
    topP: ca.topP,
    maxTokens: ca.maxTokens,
    model: ca.model,
    avatar: ca.avatar,
    enabled: ca.enabled ?? true,
    isDefault: ca.isDefault,
    tags: ca.tags,
    emoji: ca.emoji,
    group: ca.groupId,
    stream: true,
    createdAt: ca.createdAt,
    updatedAt: ca.updatedAt,
  }))
}

// ─── Topic mapping ────────────────────────────────────────────────────────────

/**
 * Map Cherry Studio topic records to Orbit Chat topics.
 *
 * @param cherryTopics Raw Cherry Studio topic map.
 * @param defaultAssistantId Fallback assistant id if a topic has none.
 * @returns Array of Orbit Chat `Topic` objects.
 */
export function mapTopics(
  cherryTopics: Record<string, CherryTopicRecord> | undefined,
  defaultAssistantId: string,
): Topic[] {
  if (!cherryTopics) return []

  return Object.values(cherryTopics).map((ct): Topic => ({
    id: ct.id,
    assistantId: ct.assistantId ?? defaultAssistantId,
    name: ct.name ?? 'Untitled',
    messages: (ct.messages ?? []).map((m, idx) => mapMessage(m, ct.id, idx)),
    prompt: ct.prompt,
    temperature: ct.temperature,
    topP: ct.topP,
    maxTokens: ct.maxTokens,
    model: ct.model,
    isNameManuallyEdited: ct.isNameManuallyEdited,
    pinned: ct.pinned,
    favorite: ct.favorite,
    archived: ct.archived,
    tags: ct.tags,
    createdAt: ct.createdAt,
    updatedAt: ct.updatedAt,
  }))
}

// ─── Message mapping ──────────────────────────────────────────────────────────

/**
 * Map a Cherry Studio message to an Orbit Chat message.
 *
 * @param cm Raw Cherry Studio message.
 * @param topicId The owning topic id.
 * @param index Positional index (used as fallback for id/createdAt).
 * @returns An Orbit Chat `Message` object.
 */
export function mapMessage(cm: CherryMessage, topicId: string, index: number): Message {
  const role = normalizeRole(cm.role)
  const status = normalizeStatus(cm.status)

  return {
    id: String(cm.id ?? `${topicId}-${index}`),
    topicId,
    role,
    content: cm.content ?? '',
    reasoningContent: cm.reasoningContent,
    model: cm.model,
    tokens: cm.tokens,
    blocks: cm.blocks ? cm.blocks.map(mapBlock) : undefined,
    askId: cm.askId,
    branchIndex: cm.branchIndex,
    parentBranchIndex: cm.parentBranchIndex,
    createdAt: cm.createdAt ?? new Date().toISOString(),
    status,
  }
}

/**
 * Map a Cherry Studio message block to an Orbit Chat message block.
 */
function mapBlock(cb: CherryMessageBlock): MessageBlock {
  return {
    type: normalizeBlockType(cb.type),
    content: cb.content ?? '',
    mimeType: cb.mimeType,
    toolName: cb.toolName,
    toolArgs: cb.toolArgs,
    toolResult: cb.toolResult,
  }
}

/**
 * Normalize a Cherry Studio role string to an Orbit Chat `MessageRole`.
 */
function normalizeRole(role: string): MessageRole {
  switch (role) {
    case 'user':
    case 'assistant':
    case 'system':
    case 'tool':
      return role
    default:
      return 'assistant'
  }
}

/**
 * Normalize a Cherry Studio status string to an Orbit Chat `MessageStatus`.
 */
function normalizeStatus(status: string | undefined): MessageStatus {
  switch (status) {
    case 'sending':
    case 'sent':
    case 'streaming':
    case 'complete':
    case 'error':
    case 'stopped':
      return status
    default:
      return 'complete'
  }
}

/**
 * Normalize a Cherry Studio block type string to an Orbit Chat block type.
 */
function normalizeBlockType(type: string): MessageBlock['type'] {
  switch (type) {
    case 'text':
    case 'image':
    case 'tool_call':
    case 'tool_result':
    case 'file':
      return type
    default:
      return 'text'
  }
}

// ─── Build full AppData ───────────────────────────────────────────────────────

/**
 * Build a complete `AppData` object from parsed Cherry Studio data.
 *
 * @param cherry The parsed Cherry Studio data.
 * @returns A fully populated `AppData` object.
 */
export function buildAppData(cherry: CherryData): AppData {
  const persist = cherry.persist

  const providers = mapProviders(persist?.llm?.providers)
  const assistants = mapAssistants(persist?.assistants?.assistants)

  // Determine a default assistant id for topics that lack one.
  const defaultAssistantId =
    assistants.find((a) => a.isDefault)?.id ?? assistants[0]?.id ?? 'default'

  const topics = mapTopics(persist?.assistants?.topics, defaultAssistantId)

  return {
    version: SCHEMA_VERSION,
    providers,
    assistants,
    topics,
    settings: {
      language: 'zh-CN',
      theme: 'light',
      fontSize: 14,
      sendShortcut: 'Enter',
      autoScroll: true,
    },
    cherryData: cherry,
  }
}

// ─── Merge logic ──────────────────────────────────────────────────────────────

/**
 * Merge two `AppData` objects.
 *
 * - **Providers & Assistants**: merged by id; incoming overwrites existing.
 * - **Topics**: merged by id; messages within a topic are deduplicated by message id
 *   (incoming messages take precedence).
 * - **Settings & compatZone**: incoming overwrites existing.
 * - **cherryData**: incoming overwrites existing (if provided).
 *
 * @param existing The currently stored data.
 * @param incoming The newly imported data.
 * @returns The merged `AppData`.
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

    // Merge messages: deduplicate by id, incoming takes precedence
    const messageMap = new Map<string, Message>()
    for (const m of existingTopic.messages) messageMap.set(m.id, m)
    for (const m of incomingTopic.messages) messageMap.set(m.id, m)

    topicMap.set(incomingTopic.id, {
      ...existingTopic,
      ...incomingTopic,
      messages: Array.from(messageMap.values()),
    })
  }

  return {
    version: Math.max(existing.version, incoming.version),
    providers: Array.from(providerMap.values()),
    assistants: Array.from(assistantMap.values()),
    topics: Array.from(topicMap.values()),
    settings: { ...existing.settings, ...incoming.settings },
    cherryData: incoming.cherryData ?? existing.cherryData,
    compatZone: { ...existing.compatZone, ...incoming.compatZone },
  }
}

// ─── Import from file ─────────────────────────────────────────────────────────

/**
 * Import AppData from a Cherry Studio export file.
 *
 * Reads the file, parses it as Cherry Studio data, maps it to `AppData`,
 * and returns the result.
 *
 * @param file The `.json` file from a Cherry Studio export.
 * @returns The mapped `AppData`, or an error if parsing failed.
 */
export async function importFromFile(file: File): Promise<{ ok: true; data: AppData } | { ok: false; error: string }> {
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
