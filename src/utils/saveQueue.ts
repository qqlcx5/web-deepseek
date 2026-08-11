// 串行 + 防抖保存队列
import { ref } from 'vue'

type SaveFn<T> = (data: T) => Promise<void>

export function createSaveQueue<T>(saveFn: SaveFn<T>, debounceMs = 200) {
  const status = ref<'idle' | 'saving' | 'error' | 'done'>('idle')
  let timer: ReturnType<typeof setTimeout> | null = null
  let pending: T | null = null
  let saving = false

  async function flush() {
    if (saving || !pending) return
    saving = true
    status.value = 'saving'
    const data = pending
    pending = null
    try {
      await saveFn(data)
      status.value = 'done'
      setTimeout(() => {
        if (status.value === 'done') status.value = 'idle'
      }, 1000)
    } catch (e) {
      status.value = 'error'
      console.error('[saveQueue] save failed', e)
    } finally {
      saving = false
      if (pending) flush()
    }
  }

  function enqueue(data: T) {
    pending = data
    if (timer) clearTimeout(timer)
    timer = setTimeout(flush, debounceMs)
  }

  function flushNow() {
    if (timer) clearTimeout(timer)
    timer = null
    return flush()
  }

  return { status, enqueue, flushNow }
}
