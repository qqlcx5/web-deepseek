import hookFetch from 'hook-fetch'
import type { HookFetchPlugin } from 'hook-fetch'

/**
 * Auth plugin — injects Bearer token into request headers
 */
const authPlugin: HookFetchPlugin = {
  name: 'auth',
  priority: 100,
  beforeRequest(config) {
    const apiKey = import.meta.env.VITE_AI_API_KEY || ''
    if (apiKey) {
      const headers = new Headers(config.headers)
      headers.set('Authorization', `Bearer ${apiKey}`)
      config.headers = headers
    }
    return config
  },
}

/**
 * Error plugin — logs errors and passes them through
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
 * Configured hook-fetch HTTP instance
 */
const http = hookFetch.create({
  baseURL: import.meta.env.VITE_AI_API_BASE || '/ai-api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  plugins: [authPlugin, errorPlugin],
})

export default http
