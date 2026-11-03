import type { Locale } from './index'

/**
 * A time of day, given as minutes after midnight, in the reader's own digits:
 * hours and minutes of two digits each, «۰۹:۳۰» for a Persian reader and
 * «09:30» for an English one, as Date Picker / Time Item, 786:1753, writes it,
 * KN-755.
 *
 * One formatter per locale, made once, as `formatClock` keeps its own.
 */
const formatters = new Map<Locale, Intl.NumberFormat>()

export const formatTimeOfDay = (locale: Locale, minutes: number): string => {
  let formatter = formatters.get(locale)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { minimumIntegerDigits: 2, useGrouping: false })
    formatters.set(locale, formatter)
  }
  return `${formatter.format(Math.floor(minutes / 60))}:${formatter.format(minutes % 60)}`
}
