// ─── SSE Stream Parser ────────────────────────────────────────────────────────
// One place that knows how to split a ReadableStream into Server-Sent-Events
// `data:` payloads. Domain code (what each payload means) lives in the caller.

/**
 * Consume a streaming response body and invoke `onData` for every `data: ...`
 * line. The argument passed to `onData` is the raw payload after `data: `
 * (not yet JSON-parsed; `[DONE]` is forwarded as-is for the caller to handle).
 *
 * Incomplete trailing lines are buffered across chunks.
 */
export async function consumeSSEStream(
  stream: ReadableStream<Uint8Array>,
  onData: (data: string) => void,
): Promise<void> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const payload = line.trim()
        if (!payload.startsWith('data: ')) continue
        onData(payload.slice(6))
      }
    }
  } finally {
    reader.releaseLock()
  }
}
