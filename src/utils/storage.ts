// ─── localStorage Helpers ─────────────────────────────────────────────────────
// Centralised raw access so keys live in one place. App data uses IndexedDB
// (see utils/db.ts); only lightweight UI prefs (draft, system prompt) live here.

const DRAFT_KEY = 'orbit-draft'
const PROMPT_KEY = 'orbit-prompt'
const THEME_KEY = 'theme-mode'

export function loadDraft(): string {
  return localStorage.getItem(DRAFT_KEY) ?? ''
}

export function saveDraft(value: string): void {
  localStorage.setItem(DRAFT_KEY, value)
}

export function loadPromptDraft(): string | null {
  return localStorage.getItem(PROMPT_KEY)
}

export function savePromptDraft(value: string): void {
  localStorage.setItem(PROMPT_KEY, value)
}

export function loadThemeMode(): string {
  return localStorage.getItem(THEME_KEY) || 'light'
}

export function saveThemeMode(value: string): void {
  localStorage.setItem(THEME_KEY, value)
}
