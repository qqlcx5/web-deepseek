// ─── Formatting Utilities ─────────────────────────────────────────────────────
// Time, date, and file-size formatting helpers for the UI.

// ─── formatTime ───────────────────────────────────────────────────────────────

/**
 * Format an ISO date string as `HH:MM`.
 *
 * @param iso ISO 8601 date string.
 * @returns Formatted time, e.g. `14:05`.
 */
export function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '--:--'
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

// ─── formatFileSize ───────────────────────────────────────────────────────────

/**
 * Format a byte count as a human-readable file size string.
 *
 * @param bytes The size in bytes.
 * @returns Formatted string, e.g. `1 KB`, `2.3 MB`.
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

// ─── formatDate ───────────────────────────────────────────────────────────────

/**
 * Format an ISO date string as a short relative date.
 *
 * - Today → `今天`
 * - Yesterday → `昨天`
 * - This year → `MM-DD`
 * - Other years → `YYYY-MM-DD`
 *
 * @param iso ISO 8601 date string.
 * @returns Formatted date string.
 */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'

  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')

  if (d.getFullYear() === now.getFullYear()) {
    return `${mm}-${dd}`
  }

  return `${d.getFullYear()}-${mm}-${dd}`
}
