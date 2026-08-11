import type { CherryData } from '@/types'

export interface ParseResult {
  data?: CherryData
  warnings: string[]
  errors: string[]
}

/**
 * 解析 Cherry v5 JSON —— 结构直通（内存模型即 CherryData），仅做字段校验。
 * 不再做分离↔扁平转换、状态机映射、自加字段处理。
 */
export function parseCherryV5(json: string): ParseResult {
  const warnings: string[] = []
  const errors: string[] = []

  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch (e) {
    errors.push(`JSON 解析失败: ${(e as Error).message}`)
    return { warnings, errors }
  }

  const cherry = raw as Partial<CherryData>

  if (cherry.version !== 5) {
    errors.push(`版本号 ${cherry.version ?? '?'}，预期 5`)
  }
  if (!cherry.localStorage?.['persist:cherry-studio']) {
    errors.push('缺少 localStorage["persist:cherry-studio"]')
  }
  if (!cherry.indexedDB) {
    errors.push('缺少 indexedDB')
  }
  if (errors.length > 0) return { warnings, errors }

  const data = cherry as CherryData
  const persist = data.localStorage['persist:cherry-studio']

  if (!persist.assistants?.defaultAssistant) warnings.push('缺少 defaultAssistant')
  if (!persist.llm?.providers?.length) warnings.push('未导入任何 Provider')
  if (!persist.assistants?.assistants?.length && !persist.assistants?.defaultAssistant) {
    warnings.push('未导入任何 Assistant')
  }
  if (!data.indexedDB.topics?.length) warnings.push('未导入任何 Topic')

  return { data, warnings, errors }
}
