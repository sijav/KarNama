import type { Locale } from '../../i18n'

// A day as the reader writes it: «۱۳ شهریور ۱۴۰۵» in Persian, on its own
// calendar, and 4 September 2026 in English, the file's history rows. The
// formatters are made once per language.
const days = new Map<Locale, Intl.DateTimeFormat>()
export const formatDay = (locale: Locale, iso: string): string => {
  let formatter = days.get(locale)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    days.set(locale, formatter)
  }
  return formatter.format(new Date(iso))
}

// A file's kind as the file row says it, its extension in capitals: «PDF».
export const fileKind = (name: string): string => {
  const dot = name.lastIndexOf('.')
  return dot > 0 && dot < name.length - 1 ? name.slice(dot + 1).toUpperCase() : ''
}

// A file's size in the reader's digits, in kilobytes up to a megabyte and in
// megabytes to one place beyond it, with the units the caller translates.
export const fileSize = (locale: Locale, bytes: number, units: { kilobytes: string; megabytes: string }): string => {
  const kilobytes = bytes / 1024
  if (kilobytes < 1024) return `${new Intl.NumberFormat(locale).format(Math.max(1, Math.round(kilobytes)))} ${units.kilobytes}`
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(kilobytes / 1024)} ${units.megabytes}`
}
