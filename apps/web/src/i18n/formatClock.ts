import type { Locale } from './index'

/**
 * A count of seconds as a clock, in the reader's own digits: minutes and seconds
 * of two digits each, «۰۰:۵۹» for a Persian reader and «00:59» for an English one.
 * The sign-in code step counts down to a resend with it, as node 407:6996 writes
 * the time, KN-587.
 *
 * One formatter per locale, made once, as `formatCount` keeps its own.
 */
const formatters = new Map<Locale, Intl.NumberFormat>()

export const formatClock = (locale: Locale, seconds: number): string => {
  let formatter = formatters.get(locale)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { minimumIntegerDigits: 2, useGrouping: false })
    formatters.set(locale, formatter)
  }
  return `${formatter.format(Math.floor(seconds / 60))}:${formatter.format(seconds % 60)}`
}
