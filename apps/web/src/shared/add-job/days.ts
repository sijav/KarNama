// A job's dates are calendar days, yyyy-MM-dd, which the date picker makes and
// sorting compares, KN-494. A board kept before the picker, 2026-09-12, can hold a
// date as its reader wrote it, «۱۰ شهریور ۱۴۰۵» or «1 September 2026»; reading the
// board turns one of those back into its day, and keeps any other text as written.

const DAY = /^\d{4}-\d{2}-\d{2}$/u

/** Whether a value is a real calendar day, written yyyy-MM-dd. */
export const isDay = (value: string): boolean => {
  if (!DAY.test(value)) return false
  const [year = 0, month = 1, day = 1] = value.split('-').map(Number)
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  return date.toISOString().slice(0, 10) === value
}

// The long forms a date is written in: Persian's, on its own calendar, and
// English's. Made once, and in UTC, since a day made at midnight UTC is still the
// day before in a browser west of Greenwich.
const LONG: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }
const PERSIAN = new Intl.DateTimeFormat('fa-IR', LONG)
const ENGLISH = new Intl.DateTimeFormat('en-US', LONG)

// Latin digits for Persian and Arabic-Indic ones, and no direction marks, commas
// or runs of space, so what a reader wrote compares with what a formatter writes.
const evened = (text: string): string =>
  text
    .replace(/[\u06f0-\u06f9]/gu, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/gu, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[\u200e\u200f\u061c,]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
    .toLocaleLowerCase('en-US')

// A day as each of the long forms writes it: in Persian, and in English with the
// month first, «September 1, 2026», and with the day first, «1 September 2026».
const writings = (date: Date): string[] => {
  const english = ENGLISH.format(date)
  return [evened(PERSIAN.format(date)), evened(english), evened(english.replace(/^(\p{L}+) (\d+), (\d+)$/u, '$2 $1 $3'))]
}

// The first of so many days from a start that is written as wanted, as a day.
const DAY_LENGTH = 86_400_000
const scan = (start: number, days: number, wanted: string): string | undefined => {
  for (let at = 0; at < days; at += 1) {
    const date = new Date(start + at * DAY_LENGTH)
    if (writings(date).includes(wanted)) return date.toISOString().slice(0, 10)
  }
  return undefined
}

/**
 * The day a written date names, or undefined when it names none. An empty value
 * and a day are themselves; «۱۰ شهریور ۱۴۰۵», «September 1, 2026» and «1 September
 * 2026» are 2026-09-01. A written date is looked for only in the year it names: a
 * Persian year from March of that year plus 621 to the April after, then a
 * Gregorian year through its twelve months.
 */
export const dayFrom = (written: string): string | undefined => {
  if (written === '' || isDay(written)) return written
  const wanted = evened(written)
  const year = /\d{4}/u.exec(wanted)?.[0]
  if (year === undefined) return undefined
  return scan(Date.UTC(Number(year) + 621, 2, 1), 426, wanted) ?? scan(Date.UTC(Number(year), 0, 1), 366, wanted)
}
