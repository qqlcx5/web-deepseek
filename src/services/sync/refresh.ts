// ─── Sync Refresh ──────────────────────────────────────────────────────────
// Trigger UI refresh after sync download completes.

/**
 * Marker function that indicates sync data has been applied.
 * The store-level data replacement + save() triggers Vue reactivity,
 * so this is primarily a semantic hook for future extensions (e.g. toast).
 */
export function syncApplied(): void {
  // Data refresh is handled by the store applying downloaded data + save().
}
