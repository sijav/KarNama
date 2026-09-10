import type { Locale } from './index'

/**
 * A number, in the reader's own digits and grouping.
 *
 * A Persian reader counts in Persian digits, so «۳» and «۱٬۲۳۴», not «3» and
 * «1,234». A raw number would be the one untranslated thing on a screen that is
 * otherwise entirely Persian.
 *
 * `i18n.number` from lingui does this and is DEPRECATED, which the linter
 * catches: it asks for `Intl.NumberFormat` directly. This is that, in one place,
 * so the next component with a count does not rediscover the deprecation.
 *
 * Formatters are cached because a board draws one chip per status and a count
 * per card, and `Intl.NumberFormat` is expensive enough to construct that doing
 * it per render is the kind of thing that shows up later as a slow list.
 */
const formatters = new Map<Locale, Intl.NumberFormat>()

export const formatCount = (locale: Locale, value: number): string => {
  let formatter = formatters.get(locale)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale)
    formatters.set(locale, formatter)
  }
  return formatter.format(value)
}
