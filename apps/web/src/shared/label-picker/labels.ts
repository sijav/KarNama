import type { I18n } from '@lingui/core'

/** One of the reader's own relationship labels, and how many people carry it. */
export interface PersonLabel {
  id: string
  name: string
  people: number
}

/**
 * The four labels the product offers, Label Picker 1086:3004's, which no reader
 * renames or deletes, the designer's decision of 1 Aban. Ids of their own, so a
 * label chosen in one language reads in the other.
 */
export type DefaultLabel = 'acquaintance' | 'former-colleague' | 'recruitment' | 'interviewer'
export const DEFAULT_LABELS: readonly DefaultLabel[] = ['acquaintance', 'former-colleague', 'recruitment', 'interviewer']

export const isDefaultLabel = (id: string): id is DefaultLabel => DEFAULT_LABELS.some((label) => label === id)

/** A default's name in the reader's language: «آشنا», «همکار قبلی», «کارشناس جذب», «مصاحبه‌کننده». */
export const defaultLabelName = (i18n: I18n, id: DefaultLabel): string => {
  if (id === 'acquaintance') return i18n._('Acquaintance')
  if (id === 'former-colleague') return i18n._('Former colleague')
  if (id === 'recruitment') return i18n._('Recruitment specialist')
  return i18n._('Interviewer')
}
