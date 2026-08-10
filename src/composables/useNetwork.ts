// ─── Network Status (singleton) ───────────────────────────────────────────────
// Module-level reactive `online` flag, wired to window online/offline events once.
// Stores/components import `onlineRef`; UI store watches it to fire toasts.

import { ref } from 'vue'

export const onlineRef = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)

let installed = false
function install(): void {
  if (installed || typeof window === 'undefined') return
  installed = true
  window.addEventListener('online', () => { onlineRef.value = true })
  window.addEventListener('offline', () => { onlineRef.value = false })
}

install()

export function useNetwork() {
  return { online: onlineRef }
}
