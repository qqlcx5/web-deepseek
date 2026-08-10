import { describe, it, expect } from 'vitest'
import { consumeSSEStream } from '@/utils/sse'

function makeStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  })
}

describe('consumeSSEStream', () => {
  it('emits one event per `data:` line', async () => {
    const received: string[] = []
    await consumeSSEStream(makeStream(['data: hello\n', 'data: world\n']), d => received.push(d))
    expect(received).toEqual(['hello', 'world'])
  })

  it('buffers a line split across chunks', async () => {
    const received: string[] = []
    await consumeSSEStream(makeStream(['data: hel', 'lo\ndata: world\n']), d => received.push(d))
    expect(received).toEqual(['hello', 'world'])
  })

  it('ignores comments and non-data fields', async () => {
    const received: string[] = []
    await consumeSSEStream(makeStream([': keep-alive\nevent: ping\ndata: keep\n']), d => received.push(d))
    expect(received).toEqual(['keep'])
  })

  it('forwards the [DONE] sentinel verbatim (caller decides)', async () => {
    const received: string[] = []
    await consumeSSEStream(makeStream(['data: [DONE]\n']), d => received.push(d))
    expect(received).toEqual(['[DONE]'])
  })

  it('skips malformed lines without throwing', async () => {
    const received: string[] = []
    await consumeSSEStream(makeStream(['garbage\n\ndata: ok\n']), d => received.push(d))
    expect(received).toEqual(['ok'])
  })
})
