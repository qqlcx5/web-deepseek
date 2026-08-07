/**
 * 对话流式请求 - 基于 hook-fetch + SSE 插件
 * 支持 OpenAI 兼容 Chat Completions 和 Anthropic Messages
 *
 * 使用 hook-fetch 的 .stream() 异步生成器消费 SSE 流，
 * sseTextDecoderPlugin 负责解码/拆分/JSON 解析。
 */

import type { ChatStreamDelta, Provider } from '@/types';
import hookFetch from 'hook-fetch';
import { sseTextDecoderPlugin } from 'hook-fetch/plugins';

export interface StreamOptions {
  provider: Provider;
  model: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  signal: AbortSignal;
}

/**
 * 判断 provider 类型：openai / anthropic
 */
export function detectProviderType(provider: Provider): 'openai' | 'anthropic' {
  const host = provider.apiHost?.toLowerCase() || '';
  const id = provider.id?.toLowerCase() || '';

  if (id.includes('anthropic') || id.includes('claude') || host.includes('anthropic')) {
    return 'anthropic';
  }
  return 'openai';
}

/**
 * 发起流式对话，yield delta
 */
export async function* streamChat(opts: StreamOptions): AsyncGenerator<ChatStreamDelta> {
  const type = detectProviderType(opts.provider);
  if (type === 'anthropic') {
    yield* streamAnthropic(opts);
  } else {
    yield* streamOpenAI(opts);
  }
}

// ============ OpenAI 兼容 ============

async function* streamOpenAI(opts: StreamOptions): AsyncGenerator<ChatStreamDelta> {
  const { provider, model, messages, temperature, topP, maxTokens, signal } = opts;

  const url = normalizeUrl(provider.apiHost, '/v1/chat/completions');

  const body: Record<string, unknown> = {
    model,
    messages,
    stream: true,
  };
  if (temperature !== undefined) body.temperature = temperature;
  if (topP !== undefined) body.top_p = topP;
  if (maxTokens !== undefined) body.max_tokens = maxTokens;

  // hook-fetch 的 controller 需要 AbortController 实例
  const controller = new AbortController();
  signal.addEventListener('abort', () => controller.abort());

  const request = hookFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(provider.apiKey ? { Authorization: `Bearer ${provider.apiKey}` } : {}),
    },
    data: JSON.stringify(body),
    controller: controller as any,
    plugins: [
      sseTextDecoderPlugin({
        json: true,
        prefix: 'data:',
        doneSymbol: '[DONE]',
      }),
    ],
  } as any);

  for await (const chunk of request.stream()) {
    const parsed = chunk.result as any;
    if (!parsed || typeof parsed === 'string') continue;
    const delta = parsed.choices?.[0]?.delta;
    if (delta?.content || delta?.reasoning_content) {
      yield { content: delta.content, reasoning_content: delta.reasoning_content };
    }
  }
}

// ============ Anthropic Messages ============

async function* streamAnthropic(opts: StreamOptions): AsyncGenerator<ChatStreamDelta> {
  const { provider, model, messages, temperature, topP, maxTokens, signal } = opts;

  const url = normalizeUrl(provider.apiHost, '/v1/messages');

  // Anthropic 格式：system 单独提取，messages 只含 user/assistant
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');

  const body: Record<string, unknown> = {
    model,
    messages: chatMessages,
    stream: true,
    max_tokens: maxTokens || 4096,
  };
  if (systemMsg) body.system = systemMsg.content;
  if (temperature !== undefined) body.temperature = temperature;
  if (topP !== undefined) body.top_p = topP;

  const controller = new AbortController();
  signal.addEventListener('abort', () => controller.abort());

  const request = hookFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey || '',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    data: JSON.stringify(body),
    controller: controller as any,
    plugins: [
      sseTextDecoderPlugin({
        json: true,
        prefix: 'data:',
      }),
    ],
  } as any);

  for await (const chunk of request.stream()) {
    const parsed = chunk.result as any;
    if (!parsed || typeof parsed === 'string') continue;
    if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
      yield { content: parsed.delta.text };
    }
    if (parsed.type === 'message_stop') {
      return;
    }
  }
}

// ============ 工具 ============

function normalizeUrl(apiHost: string, path: string): string {
  let base = apiHost.trim();
  if (!base.startsWith('http://') && !base.startsWith('https://')) {
    base = `https://${base}`;
  }
  if (base.endsWith('/')) base = base.slice(0, -1);
  // 如果 apiHost 已含完整路径（如 /v1/chat/completions），直接使用
  if (base.endsWith('/v1/chat/completions') || base.endsWith('/v1/messages')) {
    return base;
  }
  // 去掉末尾可能已有的 /v1
  if (base.endsWith('/v1')) {
    return `${base}${path.replace('/v1', '')}`;
  }
  return `${base}${path}`;
}
