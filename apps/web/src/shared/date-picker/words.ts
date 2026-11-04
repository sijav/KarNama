import type { Locale } from '../../i18n'
import { addDays, dateOf, WEEK } from './month'

// The kinds of words a calendar writes, each made once per locale. The reader's
// default calendar is the one `calendarOf` names, the Solar Hijri for fa-IR and
// the Gregorian for en-US, and their digits are the reader's.
type Kind = 'month' | 'year' | 'day' | 'date' | 'weekday' | 'letter' | 'full'
const OPTIONS: Record<Kind, Intl.DateTimeFormatOptions> = {
  month: { month: 'long', timeZone: 'UTC' },
  year: { year: 'numeric', timeZone: 'UTC' },
  day: { day: 'numeric', timeZone: 'UTC' },
  date: { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' },
  weekday: { weekday: 'long', timeZone: 'UTC' },
  letter: { weekday: 'narrow', timeZone: 'UTC' },
  full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' },
}
// English's narrow names repeat S and T, so its letters are the short names.
const ENGLISH_LETTER: Intl.DateTimeFormatOptions = { weekday: 'short', timeZone: 'UTC' }

const formatters = new Map<string, Intl.DateTimeFormat>()
const formatterFor = (locale: Locale, kind: Kind) => {
  const key = `${locale}|${kind}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, kind === 'letter' && locale === 'en-US' ? ENGLISH_LETTER : OPTIONS[kind])
    formatters.set(key, formatter)
  }
  return formatter
}

const write = (locale: Locale, kind: Kind, day: string) => formatterFor(locale, kind).format(dateOf(day))

/**
 * The calendar's title, the month's name and its year, «شهریور ۱۴۰۵» and
 * "October 2026": Intl's Persian writes the year first, so the two are joined.
 */
export const monthTitle = (locale: Locale, day: string) => `${write(locale, 'month', day)} ${write(locale, 'year', day)}`

/** The day of the month as the cell draws it, «۱۲» or "12". */
export const dayLabel = (locale: Locale, day: string) => write(locale, 'day', day)

/**
 * A day in full, for a screen reader: «دوشنبه ۲۰ مهر ۱۴۰۵», whose weekday Intl's
 * Persian would put last after the year, and "Monday, October 12, 2026".
 */
export const dayName = (locale: Locale, day: string) =>
  locale === 'fa-IR' ? `${write(locale, 'weekday', day)} ${write(locale, 'date', day)}` : write(locale, 'full', day)

// A Saturday, which the week starts from.
const SATURDAY = '2026-10-03'

/** The week's letters, Saturday first, «ش» to «ج», and their names in full. */
export const weekdays = (locale: Locale) =>
  Array.from({ length: WEEK }, (_, index) => {
    const day = addDays(SATURDAY, index)
    return { letter: write(locale, 'letter', day), name: write(locale, 'weekday', day) }
  })
