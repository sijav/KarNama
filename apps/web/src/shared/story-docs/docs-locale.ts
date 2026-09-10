import { isLocale, type Locale } from '../../i18n'

/**
 * Reading the Language toolbar out of whatever Storybook hands us.
 *
 * These are separated from the hook that uses them for one reason: they are the
 * part that can be TESTED. This repository covers React by rendering stories in
 * a real browser, and a Docs page cannot be rendered as a story, so the hook
 * itself is excluded from coverage. Everything it decides lives here instead,
 * where it is ordinary data in and data out.
 */

/** The `locale` global, or null when it is absent or not one of ours. */
export const localeIn = (globals: unknown): Locale | null => {
  if (typeof globals !== 'object' || globals === null) return null
  const value = (globals as Record<string, unknown>).locale
  return typeof value === 'string' && isLocale(value) ? value : null
}

/**
 * Where the docs context keeps the current globals.
 *
 * Storybook publishes no documented accessor for this, so the shape is probed
 * rather than asserted: every candidate is checked and the first that yields one
 * of our locales wins. When none does, the caller falls back to the product
 * default and the toolbar still drives the page from its first change onwards,
 * which degrades to slightly-wrong-until-touched instead of crashing.
 *
 * The initial value has to come from somewhere like this because the page mounts
 * AFTER the event that set the globals, so the channel cannot supply it.
 */
export const localeInContext = (context: unknown): Locale | null => {
  if (typeof context !== 'object' || context === null) return null
  const seen = context as Record<string, unknown>
  const nested = (value: unknown, key: string): unknown =>
    typeof value === 'object' && value !== null ? (value as Record<string, unknown>)[key] : undefined
  const candidates = [
    seen.globals,
    nested(seen.store, 'globals'),
    nested(nested(seen.store, 'userGlobals'), 'globals'),
    nested(seen.userGlobals, 'globals'),
  ]
  for (const candidate of candidates) {
    const found = localeIn(candidate)
    if (found) return found
  }
  return null
}
