// ─── Test Connection Service ───────────────────────────────────────────────────
// Performs a connectivity test against a provider and returns ok/latency/error.

import { createProvider, type ProviderConfig } from './factory'
import type { TestConnectionResult } from './types'

/**
 * Test connectivity to an AI provider.
 *
 * Creates the appropriate adapter via factory, then calls its testConnection().
 * The adapter enforces a 10s timeout internally. The result shape is
 * { ok: boolean, latency: number, error?: string }.
 *
 * Usage from UI:
 *   const result = await testProviderConnection({
 *     providerType: 'anthropic',
 *     apiHost: 'https://api.anthropic.com',
 *     apiKey: 'sk-ant-...',
 *   })
 *   // result → { ok: true, latency: 342 }
 */
export async function testProviderConnection(
  config: ProviderConfig,
): Promise<TestConnectionResult> {
  try {
    const provider = createProvider(config)
    return await provider.testConnection()
  } catch (error) {
    return {
      ok: false,
      latency: 0,
      error: (error as Error).message || '未知错误',
    }
  }
}
