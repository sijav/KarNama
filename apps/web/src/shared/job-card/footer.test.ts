import { describe, expect, it } from 'vitest'
import { i18nFor, type Locale } from '../../i18n'
import { cardFooter, MONTHS_FROM_DAYS, NEAR_DEADLINE_DAYS, type FooterColumn, type FooterDates } from './footer'

// Today, and the days around it, as calendar days.
const TODAY = '2026-11-04'
const day = (offset: number) => {
  const at = new Date(Date.parse(`${TODAY}T00:00:00Z`) + offset * 86_400_000)
  return at.toISOString().slice(0, 10)
}

const footer = (locale: Locale, column: FooterColumn, dates: FooterDates) => cardFooter(i18nFor(locale), locale, column, dates, TODAY)

describe('the saved column, with a deadline', () => {
  it('counts four days left in grey, with the clock and the pencil on the deadline', () => {
    expect(footer('fa-IR', 'saved', { saved: day(-2), deadline: day(4) })).toEqual({ text: '۴ روز مهلت', urgent: false, clock: true, edits: 'deadline' })
    expect(footer('en-US', 'saved', { saved: day(-2), deadline: day(4) }).text).toBe('4 days to go')
  })

  it('turns red at three days left and stays red to one', () => {
    expect(NEAR_DEADLINE_DAYS).toBe(3)
    expect(footer('fa-IR', 'saved', { saved: day(-2), deadline: day(3) })).toEqual({ text: '۳ روز مهلت', urgent: true, clock: true, edits: 'deadline' })
    expect(footer('fa-IR', 'saved', { saved: day(-2), deadline: day(1) })).toEqual({ text: '۱ روز مهلت', urgent: true, clock: true, edits: 'deadline' })
    expect(footer('en-US', 'saved', { saved: day(-2), deadline: day(1) }).text).toBe('1 day to go')
  })

  it('says the last day is today, in red', () => {
    expect(footer('fa-IR', 'saved', { saved: day(-2), deadline: TODAY })).toEqual({ text: 'امروز آخرین روزه', urgent: true, clock: true, edits: 'deadline' })
    expect(footer('en-US', 'saved', { saved: day(-2), deadline: TODAY }).text).toBe('Today is the last day')
  })

  it('says it has passed, in grey and with no number, from the day after', () => {
    expect(footer('fa-IR', 'saved', { saved: day(-9), deadline: day(-1) })).toEqual({ text: 'مهلتش تموم شد', urgent: false, clock: true, edits: 'deadline' })
    expect(footer('en-US', 'saved', { saved: day(-9), deadline: day(-40) }).text).toBe('The deadline has passed')
  })

  it('says a large number more simply, in months and half months rounded down', () => {
    expect(MONTHS_FROM_DAYS).toBe(30)
    expect(footer('fa-IR', 'saved', { saved: day(0), deadline: day(29) }).text).toBe('۲۹ روز مهلت')
    expect(footer('fa-IR', 'saved', { saved: day(0), deadline: day(30) }).text).toBe('۱ ماه مهلت')
    expect(footer('fa-IR', 'saved', { saved: day(0), deadline: day(44) }).text).toBe('۱ ماه مهلت')
    expect(footer('fa-IR', 'saved', { saved: day(0), deadline: day(45) }).text).toBe('۱ ماه و نیم مهلت')
    expect(footer('fa-IR', 'saved', { saved: day(0), deadline: day(60) }).text).toBe('۲ ماه مهلت')
    expect(footer('fa-IR', 'saved', { saved: day(0), deadline: day(75) }).text).toBe('۲ ماه و نیم مهلت')
    expect(footer('en-US', 'saved', { saved: day(0), deadline: day(45) }).text).toBe('1 month and a half to go')
    expect(footer('en-US', 'saved', { saved: day(0), deadline: day(75) }).text).toBe('2 months and a half to go')
  })
})

describe('the saved column, without a deadline', () => {
  it('says it was saved today, in grey with no clock and no pencil', () => {
    expect(footer('fa-IR', 'saved', { saved: TODAY })).toEqual({ text: 'امروز ذخیره شد', urgent: false, clock: false, edits: null })
    expect(footer('en-US', 'saved', { saved: TODAY, deadline: null }).text).toBe('Saved today')
  })

  it('counts the days since, from yesterday', () => {
    expect(footer('fa-IR', 'saved', { saved: day(-1) })).toEqual({ text: '۱ روز پیش ذخیره شد', urgent: false, clock: false, edits: null })
    expect(footer('fa-IR', 'saved', { saved: day(-12) }).text).toBe('۱۲ روز پیش ذخیره شد')
    expect(footer('en-US', 'saved', { saved: day(-1) }).text).toBe('1 day since it was saved')
    expect(footer('en-US', 'saved', { saved: day(-12) }).text).toBe('12 days since it was saved')
  })
})

describe('a stage in progress', () => {
  it('counts the days since applying, with the pencil on the application', () => {
    expect(footer('fa-IR', 'progress', { saved: day(-20), applied: day(-5) })).toEqual({ text: '۵ روز از درخواست', urgent: false, clock: false, edits: 'applied' })
    expect(footer('en-US', 'progress', { saved: day(-20), applied: day(-1) }).text).toBe('1 day since applying')
    expect(footer('fa-IR', 'progress', { saved: day(-90), applied: day(-50) }).text).toBe('۱ ماه و نیم از درخواست')
  })

  it('says it was applied for today on the day', () => {
    expect(footer('fa-IR', 'progress', { saved: day(-3), applied: TODAY }).text).toBe('امروز درخواست شد')
    expect(footer('en-US', 'progress', { saved: day(-3), applied: TODAY }).text).toBe('Applied today')
  })
})

describe('a closed outcome', () => {
  it('says how long it took, from applying to the day it closed', () => {
    expect(footer('fa-IR', 'closed', { saved: day(-30), applied: day(-20), closed: day(-10) })).toEqual({
      text: 'بعد از ۱۰ روز بسته شد',
      urgent: false,
      clock: false,
      edits: null,
    })
    expect(footer('en-US', 'closed', { saved: day(-30), applied: day(-20), closed: day(-19) }).text).toBe('After 1 day it was closed')
  })

  it('counts from the day it was saved when it was never applied for', () => {
    expect(footer('fa-IR', 'closed', { saved: day(-8), applied: null, closed: day(-1) }).text).toBe('بعد از ۷ روز بسته شد')
  })

  it('says it closed the same day', () => {
    expect(footer('fa-IR', 'closed', { saved: day(-3), applied: day(-3), closed: day(-3) }).text).toBe('همون روز بسته شد')
    expect(footer('en-US', 'closed', { saved: day(-3), applied: day(-3), closed: day(-3) }).text).toBe('Closed the same day')
  })
})
