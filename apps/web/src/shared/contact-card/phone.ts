import type { Locale } from '../../i18n'

// An Iranian mobile number, eleven digits from 09.
const MOBILE = /^09\d{9}$/

// A phone number as a contact card shows it, in the reader's digits: a mobile
// number grouped four, three and four, as node 248:116 writes «۰۹۱۲ ۱۲۳ ۴۵۶۷»,
// and anything else as it was typed.
export const formatPhone = (locale: Locale, raw: string): string => {
  const digits = raw.replace(/\D/g, '')
  const grouped = MOBILE.test(digits) ? [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7)].join(' ') : raw
  const format = new Intl.NumberFormat(locale, { useGrouping: false })
  return grouped.replace(/\d/g, (digit) => format.format(Number(digit)))
}

// The number a tel: link dials: the digits, and a leading plus if there was one.
export const dialable = (raw: string): string => `${raw.trim().startsWith('+') ? '+' : ''}${raw.replace(/\D/g, '')}`
