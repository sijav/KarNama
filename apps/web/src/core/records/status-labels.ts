import type { I18n } from '@lingui/core'
import { i18nFor, localeOrder } from '../../i18n'
import type { StatusOption } from '../../shared/status-picker'
import type { StatusToken } from '../../theme/tokens'
import { DEFAULT_TOKENS } from './records'

const names = (i18n: I18n): Partial<Record<StatusToken, string>> => ({
  new: i18n._('Saved'),
  applied: i18n._('Applied'),
  interview: i18n._('Interview'),
  offer: i18n._('Job offer'),
  rejected: i18n._('Rejected'),
})

export const localizedStatuses = (statuses: readonly StatusOption[], i18n: I18n): StatusOption[] =>
  statuses.map((status) => {
    const id = DEFAULT_TOKENS.find((token) => token === status.id)
    if (!id || !localeOrder.some((locale) => names(i18nFor(locale))[id] === status.name)) return status
    return { ...status, name: names(i18n)[id] ?? status.name }
  })
