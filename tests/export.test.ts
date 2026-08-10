import { describe, it, expect } from 'vitest'
import { buildTopicMarkdown, safeFilename } from '@/services/export'
import type { Topic } from '@/types'

function topic(overrides: Partial<Topic> = {}): Topic {
  return {
    id: 't1',
    assistantId: 'a',
    name: 'My Chat',
    messages: [],
    isNameManuallyEdited: false,
    pinned: false,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

describe('buildTopicMarkdown', () => {
  it('renders the topic title as an H1', () => {
    expect(buildTopicMarkdown(topic())).toContain('# My Chat')
  })

  it('renders each message with its role label', () => {
    const md = buildTopicMarkdown(topic({
      messages: [{
        id: 'm1',
        topicId: 't1',
        role: 'user',
        content: 'hi there',
        createdAt: '2024-01-01T00:00:00.000Z',
        status: 'complete',
        blocks: [],
      }],
    }))
    expect(md).toContain('用户')
    expect(md).toContain('hi there')
  })

  it('folds reasoning content into a <details> block', () => {
    const md = buildTopicMarkdown(topic({
      messages: [{
        id: 'm1',
        topicId: 't1',
        role: 'assistant',
        content: 'answer',
        reasoningContent: 'because reasons',
        createdAt: '',
        status: 'complete',
        blocks: [],
      }],
    }))
    expect(md).toContain('<details>')
    expect(md).toContain('because reasons')
  })
})

describe('safeFilename', () => {
  it('replaces characters that are invalid in Windows filenames', () => {
    expect(safeFilename('a/b:c?d*e')).toBe('a_b_c_d_e')
  })

  it('leaves already-safe names untouched', () => {
    expect(safeFilename('hello world')).toBe('hello world')
  })
})
