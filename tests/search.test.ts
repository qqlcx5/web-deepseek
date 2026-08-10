import { describe, it, expect } from 'vitest'
import { searchTopics } from '@/services/search'
import type { Topic } from '@/types'

function msg(id: string, topicId: string, content: string) {
  return { id, topicId, role: 'user' as const, content, createdAt: '', status: 'complete' as const, blocks: [] }
}

const topics: Topic[] = [
  {
    id: 't1',
    assistantId: 'a',
    name: 'First',
    messages: [msg('m1', 't1', 'hello world'), msg('m2', 't1', 'goodbye')],
    isNameManuallyEdited: false,
    pinned: false,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 't2',
    assistantId: 'a',
    name: 'Empty',
    messages: [],
    isNameManuallyEdited: false,
    pinned: false,
    createdAt: '',
    updatedAt: '',
  },
]

describe('searchTopics', () => {
  it('returns nothing for an empty or whitespace query', () => {
    expect(searchTopics(topics, '')).toEqual([])
    expect(searchTopics(topics, '   ')).toEqual([])
  })

  it('matches case-insensitively across messages', () => {
    const results = searchTopics(topics, 'HELLO')
    expect(results).toHaveLength(1)
    expect(results[0]!.messageId).toBe('m1')
    expect(results[0]!.topicName).toBe('First')
  })

  it('caps results at the given limit', () => {
    const many: Topic[] = [{
      id: 't',
      assistantId: 'a',
      name: 'Many',
      messages: Array.from({ length: 10 }, (_, i) => msg(`x${i}`, 't', 'hello')),
      isNameManuallyEdited: false,
      pinned: false,
      createdAt: '',
      updatedAt: '',
    }]
    expect(searchTopics(many, 'hello', 3)).toHaveLength(3)
  })

  it('reports topic metadata on each hit', () => {
    const [hit] = searchTopics(topics, 'goodbye')
    expect(hit).toMatchObject({ topicId: 't1', messageId: 'm2', content: 'goodbye' })
  })
})
