import { fetchStream } from '@/utils/http'
import type { Provider, ProviderType } from '@/types'
import type { ChatRequestParams, SSEEvent, ProviderAdapterFactory } from './types'

// ===== Provider Adapters =====

/**
 * OpenAI-compatible format (also used by azure-openai, mistral, vertexai).
 * Endpoint: POST {apiHost}/chat/completions
 */
const openaiAdapter: ProviderAdapterFactory = {
  type: 'openai',
  buildRequestBody(params: ChatRequestParams): Record<string, unknown> {
    const { model, messages, temperature, maxTokens, topP, stream, tools, provider } = params

    // Handle isNotSupportArrayContent: convert array content to string
    const processedMessages = messages.map((msg) => {
      let content = msg.content
      if (
        typeof content !== 'string' &&
        (provider.apiOptions?.isNotSupportArrayContent || provider.isNotSupportArrayContent)
      ) {
        content = Array.isArray(content)
          ? content.map((c) => c.text ?? '').join('\n')
          : String(content)
      }

      // Handle isNotSupportDeveloperRole: convert 'developer' role to 'system'
      let role = msg.role
      if (
        role === 'developer' &&
        (provider.apiOptions?.isNotSupportDeveloperRole || provider.isNotSupportDeveloperRole)
      ) {
        role = 'system'
      }

      return { role, content }
    })

    const body: Record<string, unknown> = {
      model,
      messages: processedMessages,
      stream: stream ?? true,
    }

    if (temperature !== undefined) body.temperature = temperature
    if (maxTokens !== undefined) body.max_tokens = maxTokens
    if (topP !== undefined) body.top_p = topP
    if (tools?.length) body.tools = tools

    // stream_options for usage reporting
    if (
      stream &&
      !provider.apiOptions?.isNotSupportStreamOptions &&
      !provider.isNotSupportStreamOptions
    ) {
      body.stream_options = { include_usage: true }
    }

    return body
  },

  buildRequestHeaders(provider: Provider): Record<string, string> {
    const headers: Record<string, string> = {}
    if (provider.type === 'azure-openai') {
      headers['api-key'] = provider.apiKey ?? ''
    }
    return headers
  },

  parseSSEEvent(raw: unknown): SSEEvent {
    return raw as SSEEvent
  },
}

/**
 * Anthropic format.
 * Endpoint: POST {apiHost}/messages
 */
const anthropicAdapter: ProviderAdapterFactory = {
  type: 'anthropic',
  buildRequestBody(params: ChatRequestParams): Record<string, unknown> {
    const { model, messages, temperature, maxTokens, topP, stream } = params
    // Anthropic separates system from messages
    const systemMsg = messages.find((m) => m.role === 'system')
    const chatMessages = messages.filter((m) => m.role !== 'system')

    const body: Record<string, unknown> = {
      model,
      messages: chatMessages.map((m) => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : String(m.content),
      })),
      stream: stream ?? true,
      max_tokens: maxTokens ?? 4096,
    }

    if (systemMsg) {
      body.system = typeof systemMsg.content === 'string' ? systemMsg.content : String(systemMsg.content)
    }
    if (temperature !== undefined) body.temperature = temperature
    if (topP !== undefined) body.top_p = topP

    return body
  },

  buildRequestHeaders(provider: Provider): Record<string, string> {
    return {
      'x-api-key': provider.apiKey ?? '',
      'anthropic-version': '2023-06-01',
    }
  },

  parseSSEEvent(raw: unknown): SSEEvent {
    // Anthropic SSE format differs; map to common shape
    const data = raw as Record<string, unknown>
    if (data.type === 'content_block_delta') {
      const delta = data.delta as Record<string, unknown>
      return {
        choices: [
          {
            index: 0,
            delta: {
              content: (delta.text as string) ?? null,
              reasoning_content: (delta.thinking as string) ?? null,
            },
            finish_reason: null,
          },
        ],
      }
    }
    if (data.type === 'message_stop') {
      return { choices: [{ index: 0, delta: { content: null }, finish_reason: 'stop' }] }
    }
    if (data.type === 'message_delta' && data.usage) {
      return { usage: data.usage as SSEEvent['usage'] }
    }
    return {}
  },
}

/**
 * Gemini format.
 * Endpoint: POST {apiHost}/models/{model}:streamGenerateContent
 */
const geminiAdapter: ProviderAdapterFactory = {
  type: 'gemini',
  buildRequestBody(params: ChatRequestParams): Record<string, unknown> {
    const { model, messages, temperature, maxTokens, topP } = params
    const systemMsg = messages.find((m) => m.role === 'system')
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: typeof m.content === 'string' ? m.content : String(m.content) }],
      }))

    const body: Record<string, unknown> = { contents }
    const genConfig: Record<string, unknown> = {}
    if (temperature !== undefined) genConfig.temperature = temperature
    if (maxTokens !== undefined) genConfig.maxOutputTokens = maxTokens
    if (topP !== undefined) genConfig.topP = topP
    if (Object.keys(genConfig).length) body.generationConfig = genConfig
    if (systemMsg) {
      body.systemInstruction = {
        parts: [{ text: typeof systemMsg.content === 'string' ? systemMsg.content : String(systemMsg.content) }],
      }
    }
    return body
  },

  buildRequestHeaders(_provider: Provider): Record<string, string> {
    return { 'Content-Type': 'application/json' }
  },

  parseSSEEvent(raw: unknown): SSEEvent {
    const data = raw as Record<string, unknown>
    const candidates = data.candidates as Array<Record<string, unknown>> | undefined
    if (candidates?.[0]) {
      const content = candidates[0].content as Record<string, unknown> | undefined
      const parts = content?.parts as Array<Record<string, unknown>> | undefined
      const text = parts?.[0]?.text as string | undefined
      return {
        choices: [
          {
            index: 0,
            delta: { content: text ?? null },
            finish_reason: (candidates[0].finishReason as string) ?? null,
          },
        ],
        usage: data.usage as SSEEvent['usage'],
      }
    }
    return {}
  },
}

// ===== Adapter Registry =====

const adapterMap: Partial<Record<ProviderType, ProviderAdapterFactory>> = {
  openai: openaiAdapter,
  'azure-openai': openaiAdapter,
  mistral: openaiAdapter,
  vertexai: openaiAdapter,
  anthropic: anthropicAdapter,
  gemini: geminiAdapter,
}

function getAdapter(type: ProviderType): ProviderAdapterFactory {
  return adapterMap[type] ?? openaiAdapter
}

// ===== Endpoint paths per provider type =====

const endpointMap: Partial<Record<ProviderType, string>> = {
  openai: '/chat/completions',
  'azure-openai': '/chat/completions',
  mistral: '/chat/completions',
  vertexai: '/chat/completions',
  anthropic: '/messages',
  gemini: '', // Gemini uses model-specific path, handled below
}

// ===== Chat API =====

export const chatApi = {
  /**
   * Initiate a streaming chat request.
   * Returns a ReadableStream<Uint8Array> for SSE consumption.
   */
  async chatStream(params: ChatRequestParams): Promise<ReadableStream<Uint8Array>> {
    const { provider } = params
    const adapter = getAdapter(provider.type)
    const body = adapter.buildRequestBody(params)
    const headers = adapter.buildRequestHeaders(provider)

    const endpoint = endpointMap[provider.type] ?? '/chat/completions'

    // Gemini uses a different URL pattern
    let url = endpoint
    if (provider.type === 'gemini') {
      url = `/models/${params.model}:streamGenerateContent?alt=sse`
    }

    return fetchStream(url, body, {
      baseURL: provider.apiHost,
      apiKey: provider.apiKey,
      headers,
      signal: params.signal,
    })
  },

  /**
   * Get the adapter for a provider type (exposed for testing/customization).
   */
  getAdapter,
}
