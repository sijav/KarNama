import { describe, expect, it } from 'vitest'
import { defaultLocale, directionFor, i18n, isLocale, localeOrder, locales } from './index'
import { messages as en } from './locales/en-US'
import { messages as fa } from './locales/fa-IR'

describe('the catalogs', () => {
  it('uses English sentences as ids, so the English catalog is an identity map', () => {
    for (const [id, message] of Object.entries(en)) expect(message).toBe(id)
  })

  it('has a Persian translation for every English id', () => {
    for (const id of Object.keys(en)) expect(fa, `no Persian for "${id}"`).toHaveProperty(id)
  })

  it('falls back to the English id rather than to an empty string', () => {
    i18n.activate('fa-IR')
    // The safety net for the whole English-source-id rule. If a missing message
    // rendered empty, an untranslated screen would look broken rather than look
    // English, and nobody would notice until a user did.
    expect(i18n._('Nothing has translated this yet')).toBe('Nothing has translated this yet')
  })

  it('renders Persian when Persian exists', () => {
    i18n.activate('fa-IR')
    expect(i18n._('My job opportunities')).toBe('فرصت‌های شغلی من')
  })

  it('never says فرصت without شغلی, which is a hard terminology rule', () => {
    for (const [id, message] of Object.entries(fa)) {
      expect(message, `"${id}" uses فرصت alone`).not.toMatch(/فرصت(?!‌?های\s*شغلی|\s*شغلی)/)
    }
  })
})

describe('locale plumbing', () => {
  it('defaults to Persian, because the product is Persian', () => {
    expect(defaultLocale).toBe('fa-IR')
  })

  it('maps each locale to its direction', () => {
    expect(directionFor('fa-IR')).toBe('rtl')
    expect(directionFor('en-US')).toBe('ltr')
  })

  it('recognises the locales it has and rejects anything else', () => {
    for (const locale of Object.keys(locales)) expect(isLocale(locale)).toBe(true)
    expect(isLocale('de-DE')).toBe(false)
    expect(isLocale('')).toBe(false)
  })
})

describe('the menu order', () => {
  it('lists every locale exactly once, so a new language cannot be invisible', () => {
    expect([...localeOrder].toSorted()).toEqual(Object.keys(locales).toSorted())
    expect(new Set(localeOrder).size).toBe(localeOrder.length)
  })

  it('puts Persian first, because the product is Persian', () => {
    expect(localeOrder[0]).toBe('fa-IR')
  })
})
