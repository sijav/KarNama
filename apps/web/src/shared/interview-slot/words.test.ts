import { describe, expect, it } from 'vitest'
import { i18nFor } from '../../i18n'
import { interviewDay, interviewWhen, waitingFor } from './words'

// Wednesday, 4 November 2026, 13 Aban 1405.
const TODAY = '2026-11-04'
const fa = i18nFor('fa-IR')
const en = i18nFor('en-US')

describe('when the interview is', () => {
  it('says today and tomorrow by name, with the time when it has one', () => {
    expect(interviewWhen(fa, 'fa-IR', '2026-11-04T14:00', TODAY)).toBe('امروز · ۱۴:۰۰')
    expect(interviewWhen(en, 'en-US', '2026-11-04T14:00', TODAY)).toBe('Today · 14:00')
    expect(interviewWhen(fa, 'fa-IR', '2026-11-05T10:00', TODAY)).toBe('فردا · ۱۰:۰۰')
    expect(interviewWhen(en, 'en-US', '2026-11-05', TODAY)).toBe('Tomorrow')
  })

  it('says any other day by its weekday and date in the reader’s calendar, as the frame does', () => {
    // 656:6265's «دوشنبه ۲۰ مهر · ۱۱:۰۰» is Monday 12 October 2026.
    expect(interviewWhen(fa, 'fa-IR', '2026-10-12T11:00', TODAY)).toBe('دوشنبه ۲۰ مهر · ۱۱:۰۰')
    expect(interviewWhen(en, 'en-US', '2026-10-12T11:00', TODAY)).toBe('Mon, Oct 12 · 11:00')
    expect(interviewWhen(fa, 'fa-IR', '2026-11-10', TODAY)).toBe('سه‌شنبه ۱۹ آبان')
  })

  it('names the interview’s weekday for the question', () => {
    expect(interviewDay('fa-IR', '2026-11-03T10:00')).toBe('سه‌شنبه')
    expect(interviewDay('en-US', '2026-11-03')).toBe('Tuesday')
  })
})

describe('how long the reader has waited for the result', () => {
  it('says since today on the day, and counts the days after it', () => {
    expect(waitingFor(fa, 'fa-IR', TODAY, TODAY)).toBe('از امروز')
    expect(waitingFor(en, 'en-US', TODAY, TODAY)).toBe('since today')
    expect(waitingFor(fa, 'fa-IR', '2026-11-01', TODAY)).toBe('از ۳ روز پیش')
    expect(waitingFor(en, 'en-US', '2026-11-03', TODAY)).toBe('for 1 day now')
    expect(waitingFor(en, 'en-US', '2026-11-01', TODAY)).toBe('for 3 days now')
  })
})
