// ─── Cherry Studio v5 Exchange Parser ────────────────────────────────────────
// Normalizes JSON-stringified localStorage values before the import mapper sees them.

import type { CherryAssistantsData, CherryData, CherryIndexedDB, CherryLLMData, CherryPersist, ParsedCherryData } from '@/types/cherry-data'

function failed(error: string): ParsedCherryData {
  return {
    ok: false,
    error,
    providerCount: 0,
    assistantCount: 0,
    topicCount: 0,
    messageCount: 0,
    blockCount: 0,
  }
}

export function safeParse<T>(text: string): { ok: true; data: T } | { ok: false; error: string } {
  try {
    return { ok: true, data: JSON.parse(text) as T }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

function decodeJson(value: unknown): unknown {
  if (typeof value !== 'string') return value
  const parsed = safeParse<unknown>(value)
  return parsed.ok ? parsed.data : value
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  const decoded = decodeJson(value)
  return decoded && typeof decoded === 'object' && !Array.isArray(decoded)
    ? decoded as Record<string, unknown>
    : undefined
}

function asArray(value: unknown): unknown[] | undefined {
  const decoded = decodeJson(value)
  return Array.isArray(decoded) ? decoded : undefined
}

/**
 * Parse a Cherry v5 export and normalize both object and JSON-string localStorage values.
 * The returned `data` always has object-valued persist/llm/assistants/indexedDB containers.
 */
export function parseDataJSON(text: string): ParsedCherryData {
  const root = safeParse<unknown>(text)
  if (!root.ok) return failed(root.error)

  const exportData = asRecord(root.data)
  if (!exportData) return failed('导入文件顶层必须是 JSON 对象。')

  const localStorage = asRecord(exportData.localStorage)
  if (!localStorage) return failed('缺少或无法解析 localStorage。')

  const persistRaw = asRecord(localStorage['persist:cherry-studio'])
  if (!persistRaw) return failed("缺少或无法解析 localStorage['persist:cherry-studio']。")

  const llm = asRecord(persistRaw.llm)
  if (!llm) return failed("缺少或无法解析 persist:cherry-studio.llm。")
  const providers = asArray(llm.providers)
  if (!providers) return failed('persist:cherry-studio.llm.providers 必须是数组。')

  const assistants = asRecord(persistRaw.assistants)
  if (!assistants) return failed("缺少或无法解析 persist:cherry-studio.assistants。")
  const assistantList = asArray(assistants.assistants)
  if (!assistantList) return failed('persist:cherry-studio.assistants.assistants 必须是数组。')
  const defaultAssistant = asRecord(assistants.defaultAssistant)
  if (!defaultAssistant) return failed('persist:cherry-studio.assistants.defaultAssistant 必须是对象。')

  const indexedDBRaw = asRecord(exportData.indexedDB) ?? {}
  const topics = asArray(indexedDBRaw.topics) ?? []
  const messageBlocks = asArray(indexedDBRaw.message_blocks) ?? []
  const settings = asRecord(persistRaw.settings) ?? {}

  const data: CherryData = {
    time: typeof exportData.time === 'number' ? exportData.time : undefined,
    version: typeof exportData.version === 'number' ? exportData.version : undefined,
    localStorage: {
      ...localStorage,
      'persist:cherry-studio': {
        ...persistRaw,
        llm: { ...llm, providers } as CherryLLMData,
        assistants: {
          ...assistants,
          defaultAssistant,
          assistants: assistantList,
        } as unknown as CherryAssistantsData,
        settings,
      } as CherryPersist,
    },
    indexedDB: {
      ...indexedDBRaw,
      topics,
      message_blocks: messageBlocks,
    } as CherryIndexedDB,
  }

  const topicCount = data.indexedDB.topics.length
  const messageCount = data.indexedDB.topics.reduce((count, topic) =>
    count + (Array.isArray(topic?.messages) ? topic.messages.length : 0), 0)

  return {
    ok: true,
    data,
    providerCount: data.localStorage['persist:cherry-studio'].llm.providers.length,
    assistantCount: data.localStorage['persist:cherry-studio'].assistants.assistants.length,
    topicCount,
    messageCount,
    blockCount: data.indexedDB.message_blocks.length,
  }
}
