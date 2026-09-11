import { i18n } from '@lingui/core'
import { messages as en } from './locales/en-US'
import { messages as fa } from './locales/fa-IR'

/**
 * lingui, with ENGLISH message ids as the source and Persian as a translation.
 *
 * The direction of that matters and is easy to get backwards: the id in the
 * code is the English sentence, so a missing Persian translation renders the
 * English rather than an empty string or a key. That was verified against
 * `@lingui/core` 6.6.0 rather than assumed, because a fallback to empty would
 * make an untranslated screen look broken instead of look English, and nobody
 * would notice until a user did.
 *
 * The default locale is Persian, because the product is Persian. English is the
 * source language, not the default one.
 */
// Each language names itself in its own language, the one label that must not
// be translated: a reader who cannot read the current language has to find
// their own, KN-115.
// eslint-disable-next-line lingui/no-unlocalized-strings -- KN-115
export const locales = { 'fa-IR': 'فارسی', 'en-US': 'English' } as const

export type Locale = keyof typeof locales

/**
 * The locales in the order a menu should list them, typed so a consumer needs
 * no guard.
 *
 * `Object.keys(locales)` gives `string[]`, so mapping over it forces either a
 * cast or a runtime `isLocale` check whose false branch can never happen: an
 * unreachable branch that coverage correctly refuses to call covered. A written
 * list has neither problem, and the test below keeps it in step with `locales`.
 */
export const localeOrder: readonly Locale[] = ['fa-IR', 'en-US']

export const defaultLocale: Locale = 'fa-IR'

export const directionFor = (locale: Locale): 'rtl' | 'ltr' => (locale === 'fa-IR' ? 'rtl' : 'ltr')

export const isLocale = (value: string): value is Locale => value in locales

i18n.load({ 'en-US': en, 'fa-IR': fa })
i18n.activate(defaultLocale)

export { i18n }
