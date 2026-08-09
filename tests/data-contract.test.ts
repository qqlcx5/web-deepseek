import { describe, expect, it } from 'vitest'
import type { CherryData } from '@/types/cherry-data'
import { buildAppData } from '@/utils/data-import'
import { buildExportJSON, validateReferences } from '@/utils/cherry-export'
import { parseDataJSON } from '@/utils/cherry-parser'

function createCherryFixture(): CherryData {
  return {
    time: 1_700_000_000_000,
    version: 5,
    localStorage: {
      'persist:cherry-studio': {
        llm: {
          providers: [{
            id: 'provider-1',
            name: 'Provider One',
            apiHost: 'https://api.example.com',
            apiKey: 'secret-key',
            enabled: true,
            models: [{ id: 'model-1', name: 'Model One', provider: 'provider-1' }],
          }],
        },
        assistants: {
          defaultAssistant: {
            id: 'assistant-1',
            name: 'Default',
            prompt: 'default prompt',
            model: { id: 'model-1', provider: 'provider-1', name: 'Model One' },
            topics: [{
              id: 'topic-1',
              assistantId: 'assistant-1',
              name: 'Default topic',
              createdAt: '2025-01-01T00:00:00.000Z',
              updatedAt: '2025-01-02T00:00:00.000Z',
              isNameManuallyEdited: true,
            }],
          },
          assistants: [{
            id: 'assistant-2',
            name: 'Writer',
            prompt: 'writer prompt',
            topics: [{
              id: 'topic-2',
              assistantId: 'assistant-2',
              name: 'Writer topic',
              createdAt: '2025-01-03T00:00:00.000Z',
              updatedAt: '2025-01-04T00:00:00.000Z',
            }],
          }],
        },
        settings: {
          language: 'en-US',
          theme: 'dark',
          sendMessageShortcut: 'Ctrl+Enter',
          ignoredLegacySetting: true,
        },
      },
    },
    indexedDB: {
      topics: [{
        id: 'topic-1',
        messages: [{
          id: 'message-1',
          role: 'assistant',
          blocks: ['block-thinking', 'block-text', 'block-error'],
          createdAt: 1_735_689_600_000,
        }],
      }, {
        id: 'topic-2',
        messages: [],
      }],
      message_blocks: [{
        id: 'block-text',
        messageId: 'message-1',
        type: 'main_text',
        content: 'final answer',
        status: 'success',
        createdAt: 1_735_689_600_000,
      }, {
        id: 'block-thinking',
        messageId: 'message-1',
        type: 'thinking',
        content: 'reasoning first',
        status: 'success',
        createdAt: 1_735_689_600_000,
      }, {
        id: 'block-error',
        messageId: 'message-1',
        type: 'error',
        content: 'upstream error detail',
        status: 'error',
        createdAt: 1_735_689_600_000,
      }, {
        id: 'orphan-block',
        messageId: 'deleted-message',
        type: 'main_text',
        content: 'discarded',
      }],
    },
  }
}

describe('Orbit data contract', () => {
  it('normalizes JSON-stringified Cherry persist values before mapping', () => {
    const fixture = createCherryFixture()
    const text = JSON.stringify({
      ...fixture,
      localStorage: {
        ...fixture.localStorage,
        'persist:cherry-studio': JSON.stringify(fixture.localStorage['persist:cherry-studio']),
      },
    })

    const parsed = parseDataJSON(text)

    expect(parsed.ok).toBe(true)
    if (!parsed.ok) throw new Error(parsed.error)
    expect(parsed.providerCount).toBe(1)
    expect(buildAppData(parsed.data!).topics).toHaveLength(2)
  })

  it('returns a structural error when llm is absent instead of throwing', () => {
    const parsed = parseDataJSON(JSON.stringify({
      localStorage: { 'persist:cherry-studio': {} },
      indexedDB: {},
    }))

    expect(parsed).toMatchObject({ ok: false, error: expect.stringContaining('persist:cherry-studio.llm') })
  })

  it('restores Topic metadata and Message block order from Cherry v5', () => {
    const data = buildAppData(createCherryFixture())
    const firstTopic = data.topics.find(topic => topic.id === 'topic-1')!
    const secondTopic = data.topics.find(topic => topic.id === 'topic-2')!
    const message = firstTopic.messages[0]!

    expect(firstTopic.assistantId).toBe('assistant-1')
    expect(firstTopic.name).toBe('Default topic')
    expect(firstTopic.isNameManuallyEdited).toBe(true)
    expect(secondTopic.assistantId).toBe('assistant-2')
    expect(secondTopic.name).toBe('Writer topic')
    expect(message.blocks.map(block => block.id)).toEqual(['block-thinking', 'block-text', 'block-error'])
    expect(message.reasoningContent).toBe('reasoning first')
    expect(message.content).toBe('final answer')
    expect(data.settings).not.toHaveProperty('ignoredLegacySetting')
  })

  it('exports a key-free Cherry exchange file that can be imported again', () => {
    const source = buildAppData(createCherryFixture())
    const exported = buildExportJSON(source)
    const serialized = JSON.stringify(exported)
    const restored = buildAppData(exported)

    expect(serialized).not.toContain('secret-key')
    expect(exported.localStorage['persist:cherry-studio'].assistants.defaultAssistant.id).toBe('assistant-1')
    expect(exported.localStorage['persist:cherry-studio'].assistants.assistants[1]!.topics![0]!.assistantId).toBe('assistant-2')
    expect(restored.topics.map(topic => topic.assistantId)).toEqual(['assistant-1', 'assistant-2'])
    expect(restored.topics).toHaveLength(source.topics.length)
    expect(restored.topics[0]!.messages[0]!.blocks.map(block => block.id)).toEqual(['block-thinking', 'block-text', 'block-error'])
  })

  it('allows different Providers to expose the same model ID', () => {
    const data = buildAppData(createCherryFixture())
    data.providers.push({
      ...data.providers[0]!,
      id: 'provider-2',
      name: 'Provider Two',
    })

    expect(validateReferences(data)).toMatchObject({ ok: true, errors: [] })
  })

  it('blocks export when data contains invalid entity references', () => {
    const data = buildAppData(createCherryFixture())
    data.topics[0]!.assistantId = 'missing-assistant'
    data.topics[0]!.messages[0]!.topicId = 'wrong-topic'
    data.assistants[1]!.isDefault = true
    data.providers.push({ ...data.providers[0]!, id: 'provider-1' })
    data.topics[0]!.messages[0]!.blocks.push({ ...data.topics[0]!.messages[0]!.blocks[0]! })

    const result = validateReferences(data)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.stringContaining('Provider ID 重复'),
      expect.stringContaining('默认 Assistant 数量必须为 1'),
      expect.stringContaining('不存在的 Assistant'),
      expect.stringContaining('topicId 与所属 Topic 不一致'),
      expect.stringContaining('MessageBlock ID 重复'),
    ]))
  })
})
