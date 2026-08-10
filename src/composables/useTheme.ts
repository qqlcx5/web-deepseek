import { ref, watch } from 'vue'
import type { ThemeMode } from '@/types'
import { loadThemeMode, saveThemeMode } from '@/utils/storage'

function getSystemDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function getInitialMode(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'light'
  const stored = loadThemeMode() as ThemeMode | null
  if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored
  return 'light'
}

const mode = ref<ThemeMode>(getInitialMode())
const isDark = ref(false)

function applyTheme() {
  const dark = mode.value === 'dark' || (mode.value === 'auto' && getSystemDark())
  isDark.value = dark
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', dark)
  }
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (mode.value === 'auto') applyTheme()
  })
}

watch(mode, () => {
  if (typeof localStorage !== 'undefined') saveThemeMode(mode.value)
  applyTheme()
}, { immediate: true })

export function useTheme() {
  function toggleTheme() {
    mode.value = isDark.value ? 'light' : 'dark'
  }

  function setTheme(newMode: ThemeMode) {
    mode.value = newMode
  }

  return {
    mode,
    isDark,
    toggleTheme,
    setTheme,
  }
}
