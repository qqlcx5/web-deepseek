import type { CherryData } from '@/types'

export interface ValidationResult {
  valid: boolean
  issues: string[]
}

/**
 * 导出前引用完整性校验（外键 dangling 检测）。
 * 不再校验自加字段（pinned/isDefault/enabled 已改用 Cherry 原生机制）。
 */
export function validateForExport(data: CherryData): ValidationResult {
  const issues: string[] = []
  const persist = data.localStorage['persist:cherry-studio']

  const providerIds = new Set(persist.llm.providers.map(p => p.id))
  const allAssistants = [persist.assistants.defaultAssistant, ...persist.assistants.assistants]
  const assistantIds = new Set(allAssistants.map(a => a.id))
  const blockIds = new Set(data.indexedDB.message_blocks.map(b => b.id))

  // Assistant.model → Provider
  for (const a of allAssistants) {
    if (a.model && !providerIds.has(a.model.provider)) {
      issues.push(`Assistant "${a.name}" (${a.id}) 引用了不存在的 Provider: ${a.model.provider}`)
    }
  }
  // Topic.assistantId → Assistant
  for (const a of allAssistants) {
    for (const t of a.topics ?? []) {
      if (!assistantIds.has(t.assistantId)) {
        issues.push(`Topic "${t.name}" (${t.id}) 的 assistantId ${t.assistantId} 不存在`)
      }
    }
  }
  // Message.blocks → MessageBlock
  for (const dbt of data.indexedDB.topics) {
    for (const m of dbt.messages) {
      for (const bid of m.blocks) {
        if (!blockIds.has(bid)) issues.push(`Message ${m.id} 引用了不存在的 Block: ${bid}`)
      }
    }
  }

  return { valid: issues.length === 0, issues }
}

export interface ExportOptions {
  includeApiKey: boolean
}

/**
 * 导出为 Cherry v5 JSON —— 结构直通（getCherryData 即导出体）。
 * 可选剔除 API Key（providers.apiKey 置空）。
 */
export function exportToCherryV5(data: CherryData, options: ExportOptions): string {
  const persist = data.localStorage['persist:cherry-studio']
  const exportData: CherryData = options.includeApiKey
    ? { ...data, time: Date.now() }
    : {
        ...data,
        time: Date.now(),
        localStorage: {
          ...data.localStorage,
          'persist:cherry-studio': {
            ...persist,
            llm: {
              ...persist.llm,
              providers: persist.llm.providers.map(p => ({ ...p, apiKey: '' })),
            },
          },
        },
      }
  return JSON.stringify(exportData, null, 2)
}
