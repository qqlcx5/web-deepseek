// ─── HTTP Client (hook-fetch wrapper) ─────────────────────────────────────────
// Supports dynamic baseURL + apiKey switching at runtime.

import hookFetch from 'hook-fetch'
import type { HookFetchPlugin } from 'hook-fetch'

// ─── Runtime config ───────────────────────────────────────────────────────────

interface HttpConfig {
  baseURL: string
  apiKey: string
}

let currentConfig: HttpConfig = {
  baseURL: import.meta.env.VITE_AI_API_BASE || '/ai-api',
  apiKey: import.meta.env.VITE_AI_API_KEY || '',
}

/**
 * Auth plugin — injects Bearer token into request headers.
 * Reads from the runtime config so it stays in sync after setHttpConfig().
 */
const authPlugin: HookFetchPlugin = {
  name: 'auth',
  priority: 100,
  beforeRequest(config) {
    const apiKey = currentConfig.apiKey
    if (apiKey) {
      const headers = new Headers(config.headers)
      headers.set('Authorization', `Bearer ${apiKey}`)
      config.headers = headers
    }
    return config
  },
}

/**
 * Error plugin — logs errors and passes them through.
 */
const errorPlugin: HookFetchPlugin = {
  name: 'error',
  priority: 50,
  onError(error, config) {
    console.error(
      `[HTTP Error] ${config.method} ${config.url}`,
      error.message,
      error.status,
    )
  },
}

/**
 * Default configured hook-fetch HTTP instance.
 * Uses VITE_AI_API_BASE / VITE_AI_API_KEY from env.
 */
const http = hookFetch.create({
  baseURL: currentConfig.baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  plugins: [authPlugin, errorPlugin],
})

export default http

// ─── Dynamic config ───────────────────────────────────────────────────────────

/**
 * Update runtime HTTP config (baseURL + apiKey).
 * Subsequent requests will use the new values.
 */
export function setHttpConfig(baseURL: string, apiKey: string): void {
  currentConfig = { baseURL, apiKey }
}

/**
 * Get the current HTTP config.
 */
export function getHttpConfig(): HttpConfig {
  return { ...currentConfig }
}

/**
 * Create a new hook-fetch instance with custom baseURL and apiKey.
 * Useful for per-provider requests.
 */
export function createHttp(baseURL?: string, apiKey?: string) {
  const cfg: HttpConfig = {
    baseURL: baseURL ?? currentConfig.baseURL,
    apiKey: apiKey ?? currentConfig.apiKey,
  }

  const localAuthPlugin: HookFetchPlugin = {
    name: 'auth-dynamic',
    priority: 100,
    beforeRequest(config) {
      if (cfg.apiKey) {
        const headers = new Headers(config.headers)
        headers.set('Authorization', `Bearer ${cfg.apiKey}`)
        config.headers = headers
      }
      return config
    },
  }

  return hookFetch.create({
    baseURL: cfg.baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false,
    plugins: [localAuthPlugin, errorPlugin],
  })
}
