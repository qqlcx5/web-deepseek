// ─── Topic Export ─────────────────────────────────────────────────────────────
// Pure helpers: build a Markdown document from a Topic, and trigger a download.

import type { Topic } from '@/types'

/**
 * Render a Topic (its messages + any reasoning) as a Markdown string.
 */
export function buildTopicMarkdown(topic: Topic): string {
  const lines = [`# ${topic.name}`, '', `> 导出时间：${new Date().toLocaleString('zh-CN')}`, '']

  for (const message of topic.messages) {
    const role = message.role === 'user' ? '用户' : message.role === 'assistant' ? '助手' : '系统'
    lines.push(`## ${role} · ${new Date(message.createdAt).toLocaleString('zh-CN')}`, '', message.content || '_(空消息)_')

    if (message.reasoningContent) {
      lines.push('', '<details><summary>推理过程</summary>', '', message.reasoningContent, '', '</details>')
    }

    lines.push('', '---', '')
  }

  return lines.join('\n')
}

/**
 * Trigger a client-side file download for the given text content.
 */
export function downloadText(filename: string, text: string, mime = 'text/markdown;charset=utf-8'): void {
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Sanitise a topic name into a safe filename (strips characters invalid on Windows).
 */
export function safeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '_')
}
