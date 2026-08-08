// ─── Class Name Utility ───────────────────────────────────────────────────────
// A minimal `cn()` helper for conditionally joining class names.

/**
 * Join class names, filtering out falsy values.
 *
 * @example
 * cn('btn', isActive && 'btn--active', null, 'btn--lg')
 * // => 'btn btn--lg'  (when isActive is falsy)
 *
 * @param classes Class name values (strings, falsy values, or undefined).
 * @returns A space-separated string of truthy class names.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
