// ─── AI Provider Factory ──────────────────────────────────────────────────────
// Creates and caches provider adapters by type (openai-compatible / anthropic / ollama).

import type { AIProvider, ProviderType } from './types'
import { createOpenAIProvider } from './openai-compatible'
import { createAnthropicProvider } from './anthropic'
import { createOllamaProvider } from './ollama'

/**
 * Factory input — the subset of Provider needed to select and configure
 * the correct adapter.
 */
export interface ProviderConfig {
  providerType?: ProviderType
  apiHost: string
  apiKey: string
}

/** Simple in-memory cache keyed by provider identity. */
const cache = new Map<string, AIProvider>()

function cacheKey(config: ProviderConfig): string {
  return `${config.providerType ?? 'openai-compatible'}:${config.apiHost}:${config.apiKey}`
}

/**
 * Create (or retrieve from cache) an AIProvider adapter for the given config.
 *
 * - providerType defaults to 'openai-compatible' for backward compatibility.
 * - Adapters are cached per (type, apiHost, apiKey) to avoid recreating
 *   HTTP instances on every call.
 */
export function createProvider(config: ProviderConfig): AIProvider {
  const key = cacheKey(config)

  const cached = cache.get(key)
  if (cached) return cached

  const type = config.providerType ?? 'openai-compatible'

  let provider: AIProvider

  switch (type) {
    case 'anthropic':
      provider = createAnthropicProvider({ apiHost: config.apiHost, apiKey: config.apiKey })
      break
    case 'ollama':
      provider = createOllamaProvider({ apiHost: config.apiHost, apiKey: config.apiKey })
      break
    case 'openai-compatible':
    default:
      provider = createOpenAIProvider({ apiHost: config.apiHost, apiKey: config.apiKey })
      break
  }

  cache.set(key, provider)
  return provider
}

/**
 * Clear the provider cache. Useful for testing or when config changes at runtime.
 */
export function clearProviderCache(): void {
  cache.clear()
}
