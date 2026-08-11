// ─── Page / Document Context Formatting ───────────────────────────────────────
// Formats documents as <page_context> or Markdown blocks. Toggles for
// includeUrl/Title/CapturedAt controlled via settings. Returns empty string
// when no document is provided.

export interface DocumentEntity {
  url?: string
  title?: string
  capturedAt?: string
  content?: string
  /** markdownContent for already-rendered Markdown from parsed documents. */
  markdownContent?: string
  /** Type of document (pdf, docx, web page, etc.) */
  docType?: string
}

export interface ContextSettings {
  includeUrl: boolean
  includeTitle: boolean
  includeCapturedAt: boolean
}

const DEFAULT_CONTEXT_SETTINGS: ContextSettings = {
  includeUrl: true,
  includeTitle: true,
  includeCapturedAt: false,
}

function formatMeta(doc: DocumentEntity, settings: ContextSettings): string {
  const lines: string[] = []
  if (settings.includeTitle && doc.title) lines.push(`标题：${doc.title}`)
  if (settings.includeUrl && doc.url) lines.push(`来源：${doc.url}`)
  if (settings.includeCapturedAt && doc.capturedAt) lines.push(`抓取时间：${doc.capturedAt}`)
  return lines.join('\n')
}

export function buildPageContext(
  doc: DocumentEntity | null | undefined,
  settings: ContextSettings = DEFAULT_CONTEXT_SETTINGS,
): string {
  if (!doc) return ''

  const body = doc.markdownContent ?? doc.content ?? ''
  if (!body.trim()) return ''

  const meta = formatMeta(doc, settings)

  // <page_context>  block for structural injection
  if (meta) {
    return `<page_context>\n${meta}\n\n${body}\n</page_context>`
  }
  return `<page_context>\n${body}\n</page_context>`
}
