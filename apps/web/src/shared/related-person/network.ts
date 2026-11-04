import { useLingui } from '@lingui/react'
import { usePreferences } from '../../core/preferences'
import { formatCount } from '../../i18n/formatCount'

// The reader's network at a company as the reader says it: the count in their
// digits, the noun in the plural the count takes, the company, and the verb
// that agrees with it, «۱ نفر از دیجی‌کالا در شبکهٔ شماست» in the Company Match,
// 1096:3113, and «۳ نفر از دیجی‌کالا در شبکهٔ شما هستند» under the add form's
// company, 150:94. Persian keeps «نفر» singular after a number, so its noun is
// one string for both; its verb is not.
export const useNetworkAt = (company: string, count: number) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const one = new Intl.PluralRules(locale).select(count) === 'one'
  const from = one ? i18n._('person from') : i18n._('people from')
  const network = one ? i18n._('is in your network') : i18n._('are in your network')
  return `${formatCount(locale, count)} ${from} ${company} ${network}`
}
