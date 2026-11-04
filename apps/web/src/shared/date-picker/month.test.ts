import { describe, expect, it } from 'vitest'
import { addDays, calendarOf, columnOf, isOff, monthLength, monthStart, nextMonth, partsOf, previousMonth, weeksOf } from './month'
import { dayLabel, dayName, monthTitle, weekdays } from './words'

// A month's weeks as day numbers, with 0 where the month has no day, so a grid
// reads as the frame draws it.
const numbers = (weeks: (string | null)[][]) => weeks.map((week) => week.map((day) => (day === null ? 0 : partsOf('persian', day).day)))

describe('the Solar Hijri months the frame draws, 773:16585', () => {
  it('starts Shahrivar 1405 on Sunday 23 August 2026, 31 days in five weeks', () => {
    const start = monthStart('persian', '2026-09-01')
    expect(start).toBe('2026-08-23')
    expect(partsOf('persian', start)).toEqual({ year: 1405, month: 6, day: 1 })
    expect(monthLength('persian', start)).toBe(31)
    expect(numbers(weeksOf('persian', start))).toEqual([
      [0, 1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12, 13],
      [14, 15, 16, 17, 18, 19, 20],
      [21, 22, 23, 24, 25, 26, 27],
      [28, 29, 30, 31, 0, 0, 0],
    ])
  })

  it('starts Mehr 1405 on Wednesday 23 September 2026, 30 days in five weeks', () => {
    const start = nextMonth('persian', '2026-08-23')
    expect(start).toBe('2026-09-23')
    expect(monthLength('persian', start)).toBe(30)
    expect(numbers(weeksOf('persian', start))).toEqual([
      [0, 0, 0, 0, 1, 2, 3],
      [4, 5, 6, 7, 8, 9, 10],
      [11, 12, 13, 14, 15, 16, 17],
      [18, 19, 20, 21, 22, 23, 24],
      [25, 26, 27, 28, 29, 30, 0],
    ])
  })

  it('starts Aban 1405 on Friday 23 October 2026, 30 days in six weeks', () => {
    const start = nextMonth('persian', '2026-09-23')
    expect(start).toBe('2026-10-23')
    expect(numbers(weeksOf('persian', start))).toEqual([
      [0, 0, 0, 0, 0, 0, 1],
      [2, 3, 4, 5, 6, 7, 8],
      [9, 10, 11, 12, 13, 14, 15],
      [16, 17, 18, 19, 20, 21, 22],
      [23, 24, 25, 26, 27, 28, 29],
      [30, 0, 0, 0, 0, 0, 0],
    ])
    expect(previousMonth('persian', start)).toBe('2026-09-23')
  })
})

describe('the official calendar at its leap years', () => {
  it('gives Esfand 1403 thirty days and Esfand 1404 twenty-nine, Nowruz on 21 March', () => {
    expect(monthStart('persian', '2025-03-20')).toBe('2025-02-19')
    expect(monthLength('persian', '2025-02-19')).toBe(30)
    expect(nextMonth('persian', '2025-02-19')).toBe('2025-03-21')
    expect(monthLength('persian', '2026-02-20')).toBe(29)
    expect(nextMonth('persian', '2026-02-20')).toBe('2026-03-21')
    expect(partsOf('persian', '2026-03-21')).toEqual({ year: 1405, month: 1, day: 1 })
  })

  it('keeps 1404 to 1407 common, so Nowruz 1408 falls on 20 March 2029', () => {
    expect(monthLength('persian', monthStart('persian', '2029-03-19'))).toBe(29)
    expect(partsOf('persian', '2029-03-20')).toEqual({ year: 1408, month: 1, day: 1 })
    expect(previousMonth('persian', '2029-03-20')).toBe('2029-02-19')
  })
})

describe('the Gregorian months an English reader sees', () => {
  it('starts October 2026 on a Thursday, in the same Saturday-first week', () => {
    const start = monthStart('gregory', '2026-10-12')
    expect(start).toBe('2026-10-01')
    expect(monthLength('gregory', start)).toBe(31)
    const weeks = weeksOf('gregory', start)
    expect(weeks[0]).toEqual([null, null, null, null, null, '2026-10-01', '2026-10-02'])
    expect(weeks).toHaveLength(6)
    expect(weeks[5]).toEqual(['2026-10-31', null, null, null, null, null, null])
  })

  it('counts February by its leap year and turns the year', () => {
    expect(monthLength('gregory', '2027-02-01')).toBe(28)
    expect(monthLength('gregory', '2028-02-01')).toBe(29)
    expect(nextMonth('gregory', '2026-12-01')).toBe('2027-01-01')
    expect(previousMonth('gregory', '2027-01-01')).toBe('2026-12-01')
  })
})

describe('the days around a month', () => {
  it('names the calendar of each reader and the column of each day, Friday last', () => {
    expect([calendarOf('fa-IR'), calendarOf('en-US')]).toEqual(['persian', 'gregory'])
    expect([columnOf('2026-10-03'), columnOf('2026-10-04'), columnOf('2026-10-09')]).toEqual([0, 1, 6])
    expect([addDays('2026-12-31', 1), addDays('2026-03-01', -1)]).toEqual(['2027-01-01', '2026-02-28'])
  })

  it('turns off the days before the least and after the most a field allows', () => {
    expect([isOff('2026-10-01', '2026-10-02', null), isOff('2026-10-02', '2026-10-02', null)]).toEqual([true, false])
    expect([isOff('2026-10-12', null, '2026-10-11'), isOff('2026-10-11', null, '2026-10-11')]).toEqual([true, false])
    expect(isOff('2026-10-12', null, null)).toBe(false)
  })
})

describe('the calendar’s words', () => {
  it('titles the month as the frame does, the month and then its year', () => {
    expect(monthTitle('fa-IR', '2026-08-23')).toBe('شهریور ۱۴۰۵')
    expect(monthTitle('fa-IR', '2026-10-23')).toBe('آبان ۱۴۰۵')
    expect(monthTitle('en-US', '2026-10-01')).toBe('October 2026')
  })

  it('draws a day’s number in the reader’s digits and names the day in full', () => {
    expect([dayLabel('fa-IR', '2026-10-04'), dayLabel('en-US', '2026-10-04')]).toEqual(['۱۲', '4'])
    expect(dayName('fa-IR', '2026-10-12')).toBe('دوشنبه ۲۰ مهر ۱۴۰۵')
    expect(dayName('en-US', '2026-10-12')).toBe('Monday, October 12, 2026')
  })

  it('writes the week Saturday first, «ش» to «ج», and English in its short names', () => {
    expect(weekdays('fa-IR').map((day) => day.letter)).toEqual(['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'])
    expect(weekdays('fa-IR').map((day) => day.name)).toEqual(['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'])
    expect(weekdays('en-US').map((day) => day.letter)).toEqual(['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
  })
})
