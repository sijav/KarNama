import { describe, expect, it } from 'vitest'
import { dayFrom, isDay } from './days'

describe('a date as its reader wrote it, KN-494', () => {
  it.each([
    ['in Persian', '۱۰ شهریور ۱۴۰۵', '2026-09-01'],
    ['in Persian with Latin digits', '10 شهریور 1405', '2026-09-01'],
    ['in Persian with Arabic-Indic digits', '١٠ شهریور ١٤٠٥', '2026-09-01'],
    ['in Persian, on the last day of a leap year', '۳۰ اسفند ۱۴۰۳', '2025-03-20'],
    ['in Persian, on the first day of a year', '۱ فروردین ۱۴۰۵', '2026-03-21'],
    ['in English, the month first', 'September 1, 2026', '2026-09-01'],
    ['in English, the day first', '1 September 2026', '2026-09-01'],
    ['in English, on the last day of a year', '31 December 2026', '2026-12-31'],
    ['as a day already', '2026-09-04', '2026-09-04'],
    ['as nothing', '', ''],
  ])('reads a date written %s', (_how, written, day) => {
    expect(dayFrom(written)).toBe(day)
  })

  it.each([
    ['a Persian day no year has', '۳۱ اسفند ۱۴۰۴'],
    ['a day in the shape of one that is not', '2026-02-30'],
    ['words with no year', 'last spring'],
    ['a year with no day in it', 'sometime in 2026'],
  ])('reads %s as no day', (_what, written) => {
    expect(dayFrom(written)).toBeUndefined()
  })

  it('tells a real day from its shape', () => {
    expect([isDay('2024-02-29'), isDay('2026-02-29'), isDay(''), isDay('2026-9-1')]).toEqual([true, false, false, false])
  })
})
