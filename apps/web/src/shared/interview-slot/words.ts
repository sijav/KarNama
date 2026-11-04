import type { I18n } from '@lingui/core'
import type { Locale } from '../../i18n'
import { formatCount } from '../../i18n/formatCount'
import { formatTimeOfDay } from '../../i18n/formatTimeOfDay'

const DAY_MS = 86_400_000
// The characters of a `YYYY-MM-DD` day and of a `YYYY-MM-DDTHH:mm` time.
const DAY_LENGTH = 10
const TIME_START = 11
const TIME_END = 16

// A calendar day as the days since 1970 at its UTC midnight, so a change of
// clocks between two days cannot add or lose one.
const dayNumber = (date: string) => {
  const [year = 0, month = 1, day = 1] = date.slice(0, DAY_LENGTH).split('-').map(Number)
  return Date.UTC(year, month - 1, day) / DAY_MS
}

// The time an interview is at, minutes after midnight, or null for a day given
// with no time.
const timeOf = (at: string): number | null => {
  const time = at.slice(TIME_START, TIME_END)
  if (time.length !== TIME_END - TIME_START) return null
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// The day at its UTC midnight, for a formatter that reads it there.
const utcDay = (at: string) => new Date(dayNumber(at) * DAY_MS)

// One formatter of each kind per locale, made once: the reader's calendar, the
// solar one for a Persian reader, and their digits. The day and date take the
// short names, which Persian writes as the long ones, «دوشنبه ۲۰ مهر», and
// which keep the English row, "Mon, Oct 12 · 11:00", on its one line in the
// card; the question names the day in full.
const DAY_AND_DATE: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }
const WEEKDAY: Intl.DateTimeFormatOptions = { weekday: 'long', timeZone: 'UTC' }
const formatters = new Map<string, Intl.DateTimeFormat>()
const formatterFor = (locale: Locale, kind: 'date' | 'weekday') => {
  const key = `${locale}|${kind}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, kind === 'date' ? DAY_AND_DATE : WEEKDAY)
    formatters.set(key, formatter)
  }
  return formatter
}

/**
 * When the interview is, as Card / Interview Slot's dated row says it,
 * 656:6264, KN-747: «امروز · ۱۴:۰۰», «فردا · ۱۰:۰۰», or the day and date,
 * «دوشنبه ۲۰ مهر · ۱۱:۰۰», each without the time when the interview has none.
 * `at` is `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm`, `today` `YYYY-MM-DD`.
 */
export const interviewWhen = (i18n: I18n, locale: Locale, at: string, today: string): string => {
  const ahead = dayNumber(at) - dayNumber(today)
  const day = ahead === 0 ? i18n._('Today') : ahead === 1 ? i18n._('Tomorrow') : formatterFor(locale, 'date').format(utcDay(at))
  const time = timeOf(at)
  return time === null ? day : `${day} · ${formatTimeOfDay(locale, time)}`
}

/** The interview's weekday, as the question names it, «سه‌شنبه», 662:6991. */
export const interviewDay = (locale: Locale, at: string): string => formatterFor(locale, 'weekday').format(utcDay(at))

/**
 * How long the reader has waited for the result, 656:6285: «از امروز», or «از
 * ۳ روز پیش» in the reader's digits.
 */
export const waitingFor = (i18n: I18n, locale: Locale, since: string, today: string): string => {
  const waited = dayNumber(today) - dayNumber(since)
  if (waited <= 0) return i18n._('since today')
  const unit = new Intl.PluralRules(locale).select(waited) === 'one' ? i18n._('day') : i18n._('days')
  return `${i18n._('for')} ${formatCount(locale, waited)} ${unit} ${i18n._('now')}`
}
