import { setupI18n } from '@lingui/core'
import { describe, expect, it } from 'vitest'
import { messages as en } from '../../i18n/locales/en-US'
import { messages as fa } from '../../i18n/locales/fa-IR'
import { defaultStatusName, type DefaultStatus } from './defaultStatusName'

// The five seed names in both languages, the Persian exactly as the legend at
// node 410:470 writes them. A fresh instance rather than the app's, so the
// locale switched here cannot leak into anything else.
const i18n = setupI18n({ locale: 'fa-IR', messages: { 'fa-IR': fa, 'en-US': en } })

const legend: [DefaultStatus, string, string][] = [
  ['new', 'ذخیره‌شده', 'Saved'],
  ['applied', 'درخواست‌شده', 'Applied'],
  ['interview', 'مصاحبه', 'Interview'],
  ['rejected', 'رد شده', 'Rejected'],
  ['offer', 'پیشنهاد کار', 'Job offer'],
]

describe('the default status names', () => {
  it.each(legend)('%s is %s in Persian and %s in English', (status, persian, english) => {
    i18n.activate('fa-IR')
    expect(defaultStatusName(i18n, status)).toBe(persian)
    i18n.activate('en-US')
    expect(defaultStatusName(i18n, status)).toBe(english)
  })
})
