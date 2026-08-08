// ─── Cherry Studio Export Utilities ───────────────────────────────────────────
// Build and download export JSON files from Orbit Chat's `AppData`.

import type { AppData, Assistant, Message, Provider, Topic } from '@/types'
import type { CherryData } from '@/types/cherry-data'

// ─── Export options ───────────────────────────────────────────────────────────

/**
 * Options controlling export behavior.
 */
export interface ExportOptions {
  /**
   * Whether to include API keys in the exported file.
   * @default false
   */
  includeApiKeys?: boolean
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Result of reference validation.
 */
export interface ValidationResult {
  ok: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate internal references within an `AppData` object.
 *
 * Checks that:
 * - Every topic's `assistantId` refers to an existing assistant.
 * - Every assistant's `model` (if set) refers to an existing model.
 * - Every message's `topicId` matches its parent topic.
 *
 * @param data The `AppData` to validate.
 * @returns A `ValidationResult` with errors and warnings.
 */
export function validateReferences(data: AppData): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Build lookup sets
  const assistantIds = new Set(data.assistants.map((a) => a.id))
  const modelIds = new Set<string>()
  for (const provider of data.providers) {
    for (const model of provider.models) {
      modelIds.add(model.id)
    }
  }

  // Check assistant → model references
  for (const assistant of data.assistants) {
    if (assistant.model && !modelIds.has(assistant.model)) {
      warnings.push(
        `Assistant "${assistant.name}" (id=${assistant.id}) references unknown model "${assistant.model}".`,
      )
    }
  }

  // Check topic → assistant references and message → topic references
  for (const topic of data.topics) {
    if (!assistantIds.has(topic.assistantId)) {
      errors.push(
        `Topic "${topic.name}" (id=${topic.id}) references unknown assistant "${topic.assistantId}".`,
      )
    }

    for (const message of topic.messages) {
      if (message.topicId !== topic.id) {
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
 * Build a Cherry Studio–compatible export JSON object from Orbit Chat's `AppData`.
 *
 * @param data The source `AppData`.
 * @param options Export options.
 * @returns A `CherryData`-shaped object suitable for JSON serialization.
 */
export function buildExportJSON(data: AppData, options: ExportOptions = {}): CherryData {
  const includeApiKeys = options.includeApiKeys ?? false

  // ── Build providers map ──
  const providers: Record<string, unknown> = {}
  for (const p of data.providers) {
    providers[p.id] = {
      id: p.id,
      name: p.name,
      apiKey: includeApiKeys ? p.apiKey : undefined,
      apiHost: p.apiHost,
      models: p.models.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        maxTokens: m.maxTokens,
        contextLength: m.contextLength,
      })),
      enabled: p.enabled,
    }
  }

  // ── Build assistants map ──
  const assistants: Record<string, unknown> = {}
  for (const a of data.assistants) {
    assistants[a.id] = {
      id: a.id,
      name: a.name,
      description: a.description,
      prompt: a.prompt,
      temperature: a.temperature,
      topP: a.topP,
      maxTokens: a.maxTokens,
      model: a.model,
      avatar: a.avatar,
      emoji: a.emoji,
      tags: a.tags,
      groupId: a.group,
      isDefault: a.isDefault,
      enabled: a.enabled,
    }
  }

  // ── Build topics map ──
  const topics: Record<string, unknown> = {}
  for (const t of data.topics) {
    topics[t.id] = {
      id: t.id,
      assistantId: t.assistantId,
      name: t.name,
      messages: t.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        reasoningContent: m.reasoningContent,
        model: m.model,
        tokens: m.tokens,
        blocks: m.blocks,
        askId: m.askId,
        branchIndex: m.branchIndex,
        parentBranchIndex: m.parentBranchIndex,
        createdAt: m.createdAt,
        status: m.status,
      })),
      prompt: t.prompt,
      temperature: t.temperature,
      topP: t.topP,
      maxTokens: t.maxTokens,
      model: t.model,
      isNameManuallyEdited: t.isNameManuallyEdited,
      pinned: t.pinned,
      favorite: t.favorite,
      archived: t.archived,
      tags: t.tags,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }
  }

  return {
    version: String(data.version),
    persist: {
      llm: { providers },
      assistants: { topics, assistants },
    },
  }
}

// ─── Download helper ──────────────────────────────────────────────────────────

/**
 * Trigger a browser download of a JSON file.
 *
 * @param data The data object to serialize and download.
 * @param filename The download file name (default `orbit-chat-export.json`).
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

  // Release the object URL after a short delay to ensure the download started.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
