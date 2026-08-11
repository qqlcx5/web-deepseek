import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAppStore } from '@/stores/app'

describe('settings reactivity', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  function getStore() {
    const store = useAppStore()
    // Init with a known baseline
    store.updateSettings({
      language: 'zh-CN',
      theme: 'auto',
      fontSize: 14,
      sendShortcut: 'Enter',
      autoScroll: true,
      messageStyle: 'bubble',
      messageFont: 'system',
      confirmDeleteMessage: true,
      showTokens: false,
    })
    return store
  }

  it('reflects settings updates immediately without requiring refresh', () => {
    const store = getStore()

    store.updateSettings({ fontSize: 18 })
    expect(store.settings.fontSize).toBe(18)

    store.updateSettings({ autoScroll: false })
    expect(store.settings.autoScroll).toBe(false)

    store.updateSettings({ theme: 'dark' })
    expect(store.settings.theme).toBe('dark')
  })

  it('preserves unchanged fields after a partial update', () => {
    const store = getStore()

    store.updateSettings({ fontSize: 20 })
    expect(store.settings.fontSize).toBe(20)
    expect(store.settings.language).toBe('zh-CN')
    expect(store.settings.messageStyle).toBe('bubble')
  })

  it('supports batch settings updates', () => {
    const store = getStore()

    store.updateSettings({
      sendShortcut: 'Ctrl+Enter',
      showTokens: true,
      confirmDeleteMessage: false,
    })

    expect(store.settings.sendShortcut).toBe('Ctrl+Enter')
    expect(store.settings.showTokens).toBe(true)
    expect(store.settings.confirmDeleteMessage).toBe(false)
  })

  it('retains boolean settings correctly', () => {
    const store = getStore()

    // Toggle boolean fields
    store.updateSettings({ autoScroll: false })
    expect(store.settings.autoScroll).toBe(false)

    store.updateSettings({ autoScroll: true })
    expect(store.settings.autoScroll).toBe(true)

    store.updateSettings({ showTokens: true })
    expect(store.settings.showTokens).toBe(true)

    store.updateSettings({ showTokens: false })
    expect(store.settings.showTokens).toBe(false)
  })

  it('retains enum/union settings correctly', () => {
    const store = getStore()

    store.updateSettings({ theme: 'light' })
    expect(store.settings.theme).toBe('light')

    store.updateSettings({ theme: 'dark' })
    expect(store.settings.theme).toBe('dark')

    store.updateSettings({ sendShortcut: 'Shift+Enter' })
    expect(store.settings.sendShortcut).toBe('Shift+Enter')

    store.updateSettings({ messageFont: 'serif' })
    expect(store.settings.messageFont).toBe('serif')
  })

  it('accepts additional unknown keys via Object.assign but existing keys stay intact', () => {
    const store = getStore()
    const prevFontSize = store.settings.fontSize

    // Object.assign merges unknown keys into the reactive object
    store.updateSettings({ nonexistentField: 'bogus' } as Partial<Settings>)

    // Known fields unchanged
    expect(store.settings.fontSize).toBe(prevFontSize)
  })
})
