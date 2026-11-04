import type { Locale } from '../../i18n'

/**
 * The calendar a reader's dates are in: the Solar Hijri for a Persian reader,
 * as the handoff says every date is, and the Gregorian for an English one, as
 * every other English date in the product is written, KN-754.
 */
export type CalendarSystem = 'persian' | 'gregory'
const PERSIAN: CalendarSystem = 'persian'
const GREGORY: CalendarSystem = 'gregory'
export const calendarOf = (locale: Locale): CalendarSystem => (locale === 'fa-IR' ? PERSIAN : GREGORY)

// The digits the parts are read in, so a Persian day parses as a number.
type Digits = 'latn'
const LATIN: Digits = 'latn'

const DAY_MS = 86_400_000
const MINUTE_MS = 60_000
// The characters of a `YYYY-MM-DD` day, and of a `YYYY-MM-DDTHH:mm` time.
const DAY_LENGTH = 10
const TIME_START = 11
const TIME_END = 16
// A week, and the shortest month of either calendar, which a month's length is
// counted on from.
export const WEEK = 7
const SHORTEST_MONTH = 28
const LONGEST_MONTH = 31

// A day is its Gregorian `YYYY-MM-DD`, at UTC midnight, so a change of clocks
// cannot add or lose one.
const timeOf = (day: string) => {
  const [year = 0, month = 1, date = 1] = day.slice(0, DAY_LENGTH).split('-').map(Number)
  return Date.UTC(year, month - 1, date)
}
const dayAt = (time: number) => new Date(time).toISOString().slice(0, DAY_LENGTH)

/** The day as a Date at its UTC midnight, for a formatter that reads it there. */
export const dateOf = (day: string) => new Date(timeOf(day))

/** The day of a `YYYY-MM-DD`, or of a `YYYY-MM-DDTHH:mm`. */
export const dayOf = (at: string) => at.slice(0, DAY_LENGTH)

/** The minutes after midnight of a `YYYY-MM-DDTHH:mm`, or null for a day alone. */
export const minutesOf = (at: string): number | null => {
  const time = at.slice(TIME_START, TIME_END)
  if (time.length !== TIME_END - TIME_START) return null
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/** A day at a time, as `YYYY-MM-DDTHH:mm`. */
export const atTime = (day: string, minutes: number) => new Date(timeOf(day) + minutes * MINUTE_MS).toISOString().slice(0, TIME_END)

/** The day `days` after `day`, or before it for a negative count. */
export const addDays = (day: string, days: number) => dayAt(timeOf(day) + days * DAY_MS)

/** A day's year, month from 1 and day of the month, in a calendar. */
export interface DayParts {
  year: number
  month: number
  day: number
}

const persianParts = new Intl.DateTimeFormat('en-US', {
  calendar: PERSIAN,
  numberingSystem: LATIN,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  timeZone: 'UTC',
})

export const partsOf = (system: CalendarSystem, day: string): DayParts => {
  if (system === 'gregory') {
    const [year = 0, month = 1, date = 1] = day.slice(0, DAY_LENGTH).split('-').map(Number)
    return { year, month, day: date }
  }
  const parts = persianParts.formatToParts(dateOf(day))
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value)
  return { year: value('year'), month: value('month'), day: value('day') }
}

/** The first day of the month that holds `day`. */
export const monthStart = (system: CalendarSystem, day: string) => addDays(day, 1 - partsOf(system, day).day)

/** How many days the month that starts on `start` has, counted until its month changes. */
export const monthLength = (system: CalendarSystem, start: string) => {
  const { month } = partsOf(system, start)
  let length = SHORTEST_MONTH
  while (length < LONGEST_MONTH && partsOf(system, addDays(start, length)).month === month) length += 1
  return length
}

export const nextMonth = (system: CalendarSystem, start: string) => addDays(start, monthLength(system, start))
export const previousMonth = (system: CalendarSystem, start: string) => monthStart(system, addDays(start, -1))

/** A day's column in the design's week, Saturday first and Friday last. */
export const columnOf = (day: string) => (dateOf(day).getUTCDay() + 1) % WEEK
export const FRIDAY = WEEK - 1

/**
 * The month that starts on `start` as weeks of seven, Saturday first, a day
 * where the month has one and null where it has none: five weeks or six, as
 * many as it needs, as 773:16585 draws them.
 */
export const weeksOf = (system: CalendarSystem, start: string): (string | null)[][] => {
  const length = monthLength(system, start)
  const cells: (string | null)[] = [
    ...Array.from({ length: columnOf(start) }, () => null),
    ...Array.from({ length }, (_, index) => addDays(start, index)),
  ]
  while (cells.length % WEEK !== 0) cells.push(null)
  return Array.from({ length: cells.length / WEEK }, (_, week) => cells.slice(week * WEEK, (week + 1) * WEEK))
}

/** Whether a day is outside the days a field allows. */
export const isOff = (day: string, min: string | null, max: string | null) => (min !== null && day < min) || (max !== null && day > max)
