// ─── Cherry Studio Export Utilities (Real data.json Structure) ────────────────
// Build and download export JSON files from Orbit Chat's AppData.
// Reverse-maps to the real Cherry Studio data.json structure:
// { time, version, localStorage: { 'persist:cherry-studio': {...} }, indexedDB: {...} }

import type { AppData, ChatMessage, MessageBlock, Provider, Topic } from '@/types'
import type {
  CherryAssistant,
  CherryData,
  CherryIndexedDB,
  CherryLLMData,
  CherryLocalStorage,
  CherryMessage,
  CherryMessageBlock,
  CherryPersist,
  CherryProvider,
  CherryTopic,
} from '@/types/cherry-data'

// ─── Export options ───────────────────────────────────────────────────────────

export interface ExportOptions {
  /** Whether to include API keys in the exported file. @default false */
  includeApiKeys?: boolean
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationResult {
  ok: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate internal references within an AppData object.
 */
export function validateReferences(data: AppData): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const assistantIds = new Set(data.assistants.map(a => a.id))
  const modelIds = new Set<string>()
  for (const provider of data.providers) {
    for (const model of provider.models) {
      modelIds.add(model.id)
    }
  }

  for (const assistant of data.assistants) {
    if (assistant.model && !modelIds.has(assistant.model)) {
      warnings.push(
        `Assistant "${assistant.name}" (id=${assistant.id}) references unknown model "${assistant.model}".`,
      )
    }
  }

  for (const topic of data.topics) {
    if (!assistantIds.has(topic.assistantId)) {
      errors.push(
        `Topic "${topic.name}" (id=${topic.id}) references unknown assistant "${topic.assistantId}".`,
      )
    }

    for (const message of topic.messages) {
      if (message.topicId && message.topicId !== topic.id) {
        errors.push(
          `Message (id=${message.id}) has topicId="${message.topicId}" but is inside topic "${topic.id}".`,
        )
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings }
}

// ─── Build export JSON ────────────────────────────────────────────────────────

/**
 * Build a Cherry Studio–compatible export JSON object from Orbit Chat's AppData.
 *
 * Reverses the real data.json structure:
 * - localStorage['persist:cherry-studio'].llm.providers = array
 * - localStorage['persist:cherry-studio'].assistants.assistants = array
 * - indexedDB.topics = array with messages
 * - indexedDB.message_blocks = flat array of all blocks (split from messages)
 */
export function buildExportJSON(data: AppData, options: ExportOptions = {}): CherryData {
  const includeApiKeys = options.includeApiKeys ?? false

  // ── Build providers array ──
  const providers: CherryProvider[] = data.providers.map(p => ({
    id: p.id,
    name: p.name,
    apiKey: includeApiKeys ? p.apiKey : undefined,
    apiHost: p.apiHost,
    apiVersion: p.apiVersion,
    models: p.models.map(m => ({
      id: m.id,
      name: m.name,
      provider: m.provider ?? p.id,
      group: m.group,
      supported_text_delta: m.supportedTextDelta,
    })),
    isSystem: p.isSystem,
    enabled: p.enabled,
  }))

  // ── Build LLM data ──
  const llm: CherryLLMData = {
    providers,
  }

  // ── Build assistants array ──
  const assistants: CherryAssistant[] = data.assistants.map(a => ({
    id: a.id,
    name: a.name,
    emoji: a.emoji,
    prompt: a.prompt,
    description: a.description,
    type: 'assistant',
    settings: a.settings,
    defaultModel: a.defaultModel as CherryAssistant['defaultModel'],
    enableWebSearch: a.enableWebSearch,
    mcpServers: a.mcpServers,
    knowledgeRecognition: a.knowledgeRecognition,
    regularPhrases: a.regularPhrases,
    model: a.defaultModel
      ? {
          id: a.defaultModel.id,
          provider: a.defaultModel.provider,
          name: a.defaultModel.name,
          group: a.defaultModel.group,
        }
      : undefined,
  }))

  const defaultAssistant = assistants[0] ?? undefined

  // ── Build settings ──
  const settings: Record<string, unknown> = { ...(data.settings ?? {}) }

  // ── Build persist ──
  const persist: CherryPersist = {
    llm,
    assistants: {
      defaultAssistant: defaultAssistant ?? ({} as CherryAssistant),
      assistants,
    },
    settings,
  }

  // ── Build indexedDB: topics + message_blocks ──
  const allBlocks: CherryMessageBlock[] = []
  let blockCounter = 0

  const topics: CherryTopic[] = data.topics.map((t: Topic): CherryTopic => {
    const messages: CherryMessage[] = t.messages.map((m: ChatMessage): CherryMessage => {
      // Split blocks out of the message
      const blockIds: string[] = []
      const msgBlocks = m.blocks ?? []

      for (const block of msgBlocks) {
        const blockId = block.id ?? `block-${blockCounter++}`
        blockIds.push(blockId)
        allBlocks.push({
          id: blockId,
          messageId: String(m.id),
          type: block.type,
          createdAt: block.createdAt ?? Date.now(),
          status: block.status ?? 'complete',
          content: block.content,
          citationReferences: block.citationReferences,
        })
      }

      // If no blocks but has content, create a main_text block
      if (blockIds.length === 0 && m.content) {
        const blockId = `block-${blockCounter++}`
        blockIds.push(blockId)
        allBlocks.push({
          id: blockId,
          messageId: String(m.id),
          type: 'main_text',
          createdAt: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
          status: 'complete',
          content: m.content,
        })
      }

      return {
        id: String(m.id),
        role: m.role,
        topicId: t.id,
        assistantId: t.assistantId,
        createdAt: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
        status: m.status ?? 'complete',
        blocks: blockIds,
        modelId: m.modelId,
        model: undefined,
        mentions: m.mentions,
        usage: m.usage,
        content: '', // Cherry Studio stores content in message_blocks
      }
    })

    return {
      id: t.id,
      messages,
    }
  })

  const indexedDB: CherryIndexedDB = {
    topics,
    message_blocks: allBlocks,
  }

  // ── Assemble top-level ──
  const localStorage: CherryLocalStorage = {
    'persist:cherry-studio': persist,
  }

  return {
    time: Date.now(),
    version: 5,
    localStorage,
    indexedDB,
  }
}

// ─── Download helper ──────────────────────────────────────────────────────────

/**
 * Trigger a browser download of a JSON file.
 */
export function downloadJson(data: unknown, filename = 'orbit-chat-export.json'): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
