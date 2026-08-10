// ─── Global Keyboard Shortcuts ────────────────────────────────────────────────
// Returns a single keydown handler. Bind/unbind it from the host component.
// Decoupled from any store: callers pass the ui host (for modal/layout actions)
// plus a `newConversation` callback (owned by the chat store).

interface ShortcutHost {
  modal: string
  toggleFocusMode: () => void
  closeDrawers: () => void
}

export function useKeyboardShortcuts(
  host: ShortcutHost,
  actions: { newConversation: () => void },
) {
  function handleKeydown(e: KeyboardEvent): void {
    const meta = e.metaKey || e.ctrlKey

    if (meta && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      host.modal = 'command'
      return
    }
    if (meta && e.key.toLowerCase() === 'n') {
      e.preventDefault()
      actions.newConversation()
      return
    }
    if (meta && e.shiftKey && e.key.toLowerCase() === 'f') {
      e.preventDefault()
      host.toggleFocusMode()
      return
    }
    if (e.key === 'Escape') {
      host.modal = ''
      host.closeDrawers()
    }
  }

  return { handleKeydown }
}
