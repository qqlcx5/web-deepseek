// ─── Shared AI utilities ──────────────────────────────────────────────────────

/**
 * Normalise a raw apiHost into a proper base URL.
 *
 * Handles these common formats:
 *   - Full path:  https://api.example.com/v1/chat/completions#
 *   - With /v1/:   https://api.example.com/v1/
 *   - Bare domain: https://api.example.com
 *   - Non-standard: https://ark...com/api/v3/chat/completions#
 *
 * Strategy:
 *   1. Strip trailing # and whitespace.
 *   2. If URL ends with /chat/completions, extract the base.
 *   3. If URL contains /vN, keep up to and including it.
 *   4. Otherwise append /v1.
 */
export function normalizeBaseUrl(raw: string): string {
  const host = raw.trim().replace(/#+$/, '').replace(/\/+$/, '')

  const chatIdx = host.indexOf('/chat/completions')
  if (chatIdx !== -1) {
    return host.slice(0, chatIdx)
  }

  if (/\/v\d+/.test(host)) {
    return host
  }

  return host + '/v1'
}

/**
 * Fetch with an optional AbortSignal and configurable timeout (ms).
 * Throws an AbortError if the signal fires, or a generic Error on timeout.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs, signal, ...rest } = init

  const controller = new AbortController()
  const timeoutId = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : undefined

  // Combine external signal with timeout signal
  const combinedSignal = signal
    ? anySignal([signal, controller.signal])
    : controller.signal

  try {
    const response = await fetch(url, { ...rest, signal: combinedSignal })
    return response
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

/**
 * Combine multiple AbortSignals so that aborting any one of them
 * triggers the combined signal.
 */
export function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController()

  const onAbort = () => {
    controller.abort()
    for (const sig of signals) {
      sig.removeEventListener('abort', onAbort)
    }
  }

  for (const sig of signals) {
    if (sig.aborted) {
      controller.abort()
      return controller.signal
    }
    sig.addEventListener('abort', onAbort, { once: true })
  }

  return controller.signal
}
