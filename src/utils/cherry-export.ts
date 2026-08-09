// ─── Cherry Studio v5 Export ─────────────────────────────────────────────────
// AppData remains the source of truth. This file only creates an exchange payload.

import type { AppData, Assistant, ChatMessage, MessageBlock, Provider, Topic } from '@/types'
import type {
  CherryAssistant,
  CherryData,
  CherryMessage,
  CherryMessageBlock,
  CherryModelRef,
  CherryProvider,
  CherryTopic,
  CherryTopicRef,
} from '@/types/cherry-data'

export interface ExportOptions {
  includeApiKeys?: boolean
}

export interface ValidationResult {
  ok: boolean
  errors: string[]
  warnings: string[]
}

function modelRef(data: AppData, modelId: string | undefined): CherryModelRef | undefined {
  if (!modelId) return undefined
  for (const provider of data.providers) {
    const model = provider.models.find(candidate => candidate.id === modelId)
    if (model) {
      return {
        id: model.id,
        provider: provider.id,
        name: model.name,
        group: model.group,
        supported_text_delta: model.supportedTextDelta,
      }
    }
  }
  return undefined
}

function toTimestamp(iso: string): number {
  const timestamp = new Date(iso).getTime()
  return Number.isNaN(timestamp) ? Date.now() : timestamp
}

function exportMessageStatus(status: ChatMessage['status']): string {
  if (status === 'complete') return 'success'
  if (status === 'sending') return 'pending'
  return status
}

function exportBlock(block: MessageBlock, messageId: string): CherryMessageBlock {
  return {
    id: block.id,
    messageId,
    type: block.type,
    status: block.status,
    content: block.content,
    createdAt: toTimestamp(block.createdAt),
    citationReferences: block.citationReferences,
  }
}

export function validateReferences(data: AppData): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const providerIds = new Set<string>()
  const assistantIds = new Set<string>()
  const topicIds = new Set<string>()
  const messageIds = new Set<string>()
  const blockIds = new Set<string>()

  for (const provider of data.providers) {
    if (providerIds.has(provider.id)) errors.push(`Provider ID 重复：${provider.id}`)
    providerIds.add(provider.id)
    const providerModelIds = new Set<string>()
    for (const model of provider.models) {
      if (providerModelIds.has(model.id)) {
        errors.push(`Provider “${provider.name}”内模型 ID 重复：${model.id}`)
      }
      providerModelIds.add(model.id)
    }
  }

  const defaultAssistants = data.assistants.filter(assistant => assistant.isDefault)
  if (data.assistants.length > 0 && defaultAssistants.length !== 1) {
    errors.push(`默认 Assistant 数量必须为 1，当前为 ${defaultAssistants.length}`)
  }

  for (const assistant of data.assistants) {
    if (assistantIds.has(assistant.id)) errors.push(`Assistant ID 重复：${assistant.id}`)
    assistantIds.add(assistant.id)
    const modelExists = assistant.model
      ? data.providers.some(provider => provider.models.some(model => model.id === assistant.model))
      : true
    if (!modelExists) {
      warnings.push(`Assistant “${assistant.name}”引用了不存在的模型：${assistant.model}（导出时将保留引用，但该模型不会被其他客户端识别）`)
    }
  }

  for (const topic of data.topics) {
    if (topicIds.has(topic.id)) errors.push(`Topic ID 重复：${topic.id}`)
    topicIds.add(topic.id)
    if (!assistantIds.has(topic.assistantId)) {
      errors.push(`Topic “${topic.name}”引用了不存在的 Assistant：${topic.assistantId}`)
    }

    for (const message of topic.messages) {
      if (messageIds.has(message.id)) errors.push(`Message ID 重复：${message.id}`)
      messageIds.add(message.id)
      if (message.topicId !== topic.id) {
        errors.push(`Message ${message.id} 的 topicId 与所属 Topic 不一致`)
      }
      for (const block of message.blocks) {
        if (blockIds.has(block.id)) errors.push(`MessageBlock ID 重复：${block.id}`)
        blockIds.add(block.id)
      }
      const blockText = message.blocks
        .filter(block => block.type === 'main_text')
        .map(block => block.content)
        .join('')
      if (blockText && blockText !== message.content) {
        warnings.push(`Message ${message.id} 的 content 与 main_text blocks 不一致，将以 blocks 导出。`)
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings }
}

function exportProvider(provider: Provider, includeApiKeys: boolean): CherryProvider {
  return {
    id: provider.id,
    name: provider.name,
    apiHost: provider.apiHost,
    apiKey: includeApiKeys ? provider.apiKey : undefined,
    enabled: provider.enabled,
    models: provider.models.map(model => ({
      id: model.id,
      name: model.name,
      provider: provider.id,
      group: model.group,
      supported_text_delta: model.supportedTextDelta,
    })),
  }
}

function exportAssistant(data: AppData, assistant: Assistant): CherryAssistant {
  const topics: CherryTopicRef[] = data.topics
    .filter(topic => topic.assistantId === assistant.id)
    .map(topic => ({
      id: topic.id,
      assistantId: topic.assistantId,
      name: topic.name,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
      isNameManuallyEdited: topic.isNameManuallyEdited,
    }))
  const model = modelRef(data, assistant.model)

  return {
    id: assistant.id,
    name: assistant.name,
    emoji: assistant.emoji,
    prompt: assistant.prompt,
    description: assistant.description,
    topics,
    model,
    defaultModel: model,
    enableWebSearch: assistant.enableWebSearch,
    settings: {
      temperature: assistant.temperature,
      topP: assistant.topP,
      maxTokens: assistant.maxTokens,
    },
  }
}

function exportTopic(data: AppData, topic: Topic, blocks: CherryMessageBlock[]): CherryTopic {
  return {
    id: topic.id,
    messages: topic.messages.map((message): CherryMessage => {
      const messageBlocks = message.blocks.length > 0
        ? message.blocks
        : message.content
          ? [{
              id: `block-${message.id}`,
              type: 'main_text' as const,
              content: message.content,
              status: 'success' as const,
              createdAt: message.createdAt,
            }]
          : []

      for (const block of messageBlocks) blocks.push(exportBlock(block, message.id))
      const model = modelRef(data, message.model)

      return {
        id: message.id,
        role: message.role,
        topicId: topic.id,
        assistantId: topic.assistantId,
        createdAt: toTimestamp(message.createdAt),
        status: exportMessageStatus(message.status),
        blocks: messageBlocks.map(block => block.id),
        modelId: model?.provider,
        model,
        usage: message.usage,
        content: '',
      }
    }),
  }
}

export function buildExportJSON(data: AppData, options: ExportOptions = {}): CherryData {
  const includeApiKeys = options.includeApiKeys ?? false
  const defaultAssistant = data.assistants.find(assistant => assistant.isDefault)
  const exportedAssistants = data.assistants.map(assistant => exportAssistant(data, assistant))
  const exportedDefaultAssistant = exportedAssistants.find(assistant => assistant.id === defaultAssistant?.id)
  const messageBlocks: CherryMessageBlock[] = []
  const topics = data.topics.map(topic => exportTopic(data, topic, messageBlocks))
  const defaultModel = modelRef(data, defaultAssistant?.model)

  return {
    time: Date.now(),
    version: 5,
    localStorage: {
      'persist:cherry-studio': {
        llm: {
          providers: data.providers.map(provider => exportProvider(provider, includeApiKeys)),
          defaultModel,
          topicNamingModel: defaultModel,
          translateModel: defaultModel,
          quickAssistantModel: defaultModel,
          quickModel: defaultModel,
        },
        assistants: {
          defaultAssistant: exportedDefaultAssistant ?? exportedAssistants[0] ?? {
            id: 'default',
            name: '默认助手',
            prompt: '',
            topics: [],
          },
          assistants: exportedAssistants,
        },
        settings: {
          language: data.settings.language,
          theme: data.settings.theme,
          fontSize: data.settings.fontSize,
          sendMessageShortcut: data.settings.sendShortcut,
          messageStyle: data.settings.messageStyle,
          messageFont: data.settings.messageFont,
          codeShowLineNumbers: data.settings.codeShowLineNumbers,
          codeWrappable: data.settings.codeWrappable,
          codeCollapsible: data.settings.codeCollapsible,
          foldDisplayMode: data.settings.foldDisplayMode,
          showTokens: data.settings.showTokens,
          showMessageDivider: data.settings.showMessageDivider,
          enableTopicNaming: data.settings.enableTopicNaming,
          pinTopicsToTop: data.settings.pinTopicsToTop,
        },
      },
    },
    indexedDB: { topics, message_blocks: messageBlocks },
  }
}

export function downloadJson(data: unknown, filename = 'orbit-chat-export.json'): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
