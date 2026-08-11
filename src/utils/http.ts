import hookFetch from 'hook-fetch'
import type { HookFetchPlugin } from 'hook-fetch'

// ===== Auth Plugin =====
// Injects `Authorization: Bearer ${apiKey}` into request headers

const authPlugin: HookFetchPlugin = {
  name: 'auth',
  priority: 100,
  beforeRequest(config) {
    const apiKey = (config.extra as { apiKey?: string } | undefined)?.apiKey
    if (apiKey) {
      config.headers = new Headers(config.headers)
      config.headers.set('Authorization', `Bearer ${apiKey}`)
    }
    return config
  },
}

// ===== Error Plugin =====
// Unified error handling for 401/403/429/500

const errorMessages: Record<number, string> = {
  401: '认证失败：API Key 无效或已过期',
  403: '权限不足：无法访问该资源',
  429: '请求过于频繁：请稍后再试',
  500: '服务器内部错误：请稍后重试',
}

const errorPlugin: HookFetchPlugin = {
  name: 'error-handler',
  priority: 90,
  onError(error, config) {
    const status = error.status
    if (status && status in errorMessages) {
      // Create a new error with the friendly message, preserving original
      const friendlyError = new Error(errorMessages[status])
      friendlyError.name = error.name
      ;(friendlyError as Error & { status?: number }).status = status
      return friendlyError as Error & { status?: number }
    }
    console.error(`[HTTP Error] ${config.method} ${config.url}`, {
      status,
      message: error.message,
    })
    return error
  },
}

// ===== Log Plugin =====
// Request/response interceptor logging

const logPlugin: HookFetchPlugin = {
  name: 'log',
  priority: 80,
  beforeRequest(config) {
    console.debug(`[HTTP Request] ${config.method} ${config.baseURL}${config.url}`)
    return config
  },
  afterResponse(context) {
    console.debug(`[HTTP Response] ${context.response.status} ${context.config.url}`)
    return context
  },
}

// ===== Create HTTP Instance =====

export const http = hookFetch.create({
  baseURL: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  plugins: [authPlugin, errorPlugin, logPlugin],
})

// ===== Stream Fetch =====
// Uses native fetch to obtain a ReadableStream<Uint8Array> for SSE consumption.
// hook-fetch's .stream() returns an AsyncGenerator, but useXStream expects ReadableStream.

export async function fetchStream(
  url: string,
  body: unknown,
  options: {
    baseURL?: string
    apiKey?: string
    headers?: Record<string, string>
    signal?: AbortSignal
  },
): Promise<ReadableStream<Uint8Array>> {
  const { baseURL, apiKey, headers, signal } = options
  const fullUrl = (baseURL ?? '') + url

  const resp = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      ...headers,
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!resp.ok) {
    const msg = errorMessages[resp.status] ?? `请求失败: ${resp.status} ${resp.statusText}`
    throw new Error(msg)
  }

  if (!resp.body) {
    throw new Error('响应体为空，无法建立流连接')
  }

  return resp.body as ReadableStream<Uint8Array>
}

// ===== JSON Fetch =====

export async function postJSON<T = unknown>(
  url: string,
  data: unknown,
  options?: {
    apiKey?: string
    signal?: AbortSignal
    baseURL?: string
  },
): Promise<T> {
  const { apiKey, signal, baseURL } = options ?? {}
  // If baseURL is provided, create a temporary instance; otherwise use default
  if (baseURL) {
    const tempHttp = hookFetch.create({
      baseURL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
      plugins: [authPlugin, errorPlugin, logPlugin],
    })
    const req = tempHttp.post<T>(url, data as never, {
      signal,
      extra: { apiKey },
    })
    return req.json() as Promise<T>
  }
  const req = http.post<T>(url, data as never, {
    signal,
    extra: { apiKey },
  })
  return req.json() as Promise<T>
}

