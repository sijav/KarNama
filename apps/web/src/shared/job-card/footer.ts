import type { I18n } from '@lingui/core'
import type { Locale } from '../../i18n'
import { formatCount } from '../../i18n/formatCount'

/** Which footer a card's column asks for: the saved column, a stage in progress, or a closed outcome. */
export type FooterColumn = 'saved' | 'progress' | 'closed'

/** A card's dates as calendar days, `YYYY-MM-DD`. */
export interface FooterDates {
  saved: string
  applied?: string | null
  deadline?: string | null
  closed?: string | null
}

/** What a card's footer says, and how it is drawn. */
export interface CardFooter {
  text: string
  /** Red, the file's near deadline; grey otherwise. */
  urgent: boolean
  /** The clock before the words, which a deadline alone draws. */
  clock: boolean
  /** The date the pencil beside the words edits, or null for none. */
  edits: 'deadline' | 'applied' | null
}

/** The days left at or under which a deadline is red, the file's three. */
export const NEAR_DEADLINE_DAYS = 3

/** The days from which a span is said in months and half months. */
export const MONTHS_FROM_DAYS = 30

const HALF_MONTH_DAYS = 15
const DAY_MS = 86_400_000

// A calendar day as the days since 1970 at its UTC midnight, so a change of
// clocks between two days cannot add or lose one.
const dayNumber = (date: string) => {
  const [year = 0, month = 1, day = 1] = date.split('-').map(Number)
  return Date.UTC(year, month - 1, day) / DAY_MS
}

// Whole calendar days from one day to another.
const daysFrom = (from: string, to: string) => Math.round(dayNumber(to) - dayNumber(from))

// The dates the pencil edits, typed so the lint rule reads them as values.
const DEADLINE: NonNullable<CardFooter['edits']> = 'deadline'
const APPLIED: NonNullable<CardFooter['edits']> = 'applied'

// A span as the reader says it: days in their digits and plural under thirty,
// then months and a half, rounded down, so time left is never overstated.
const amount = (i18n: I18n, locale: Locale, days: number) => {
  const plural = new Intl.PluralRules(locale)
  if (days < MONTHS_FROM_DAYS) return `${formatCount(locale, days)} ${plural.select(days) === 'one' ? i18n._('day') : i18n._('days')}`
  const halves = Math.floor(days / HALF_MONTH_DAYS)
  const months = Math.floor(halves / 2)
  const unit = plural.select(months) === 'one' ? i18n._('month') : i18n._('months')
  return halves % 2 === 1 ? `${formatCount(locale, months)} ${unit} ${i18n._('and a half')}` : `${formatCount(locale, months)} ${unit}`
}

/**
 * A card's footer, Card / Kanban 793:1820's description and the handoff's
 * پاورقی کارت, KN-744. The saved column counts down to its deadline, the clock
 * leading, red at three days or fewer and on the last day, grey with no number
 * once it has passed; without a deadline it says when it was saved. A stage in
 * progress counts the days since applying, and a closed outcome how long the
 * search for it took, from applying, or saving when it was never applied. The
 * pencil edits the deadline or the application, never the day it was saved.
 */
export const cardFooter = (i18n: I18n, locale: Locale, column: FooterColumn, dates: FooterDates, today: string): CardFooter => {
  const start = dates.applied ?? dates.saved
  if (column === 'closed') {
    const took = daysFrom(start, dates.closed ?? today)
    const text = took <= 0 ? i18n._('Closed the same day') : `${i18n._('After')} ${amount(i18n, locale, took)} ${i18n._('it was closed')}`
    return { text, urgent: false, clock: false, edits: null }
  }
  if (column === 'progress') {
    const since = daysFrom(start, today)
    const text = since <= 0 ? i18n._('Applied today') : `${amount(i18n, locale, since)} ${i18n._('since applying')}`
    return { text, urgent: false, clock: false, edits: APPLIED }
  }
  if (dates.deadline !== undefined && dates.deadline !== null) {
    const left = daysFrom(today, dates.deadline)
    if (left < 0) return { text: i18n._('The deadline has passed'), urgent: false, clock: true, edits: DEADLINE }
    if (left === 0) return { text: i18n._('Today is the last day'), urgent: true, clock: true, edits: DEADLINE }
    return { text: `${amount(i18n, locale, left)} ${i18n._('to go')}`, urgent: left <= NEAR_DEADLINE_DAYS, clock: true, edits: DEADLINE }
  }
  const ago = daysFrom(dates.saved, today)
  const text = ago <= 0 ? i18n._('Saved today') : `${amount(i18n, locale, ago)} ${i18n._('since it was saved')}`
  return { text, urgent: false, clock: false, edits: null }
}
