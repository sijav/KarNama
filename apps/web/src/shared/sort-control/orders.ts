import type { I18n } from '@lingui/core'

// The four orders the design permits, DESIGN.md section 3, in the order node
// 447:601 lists them: newest, oldest, nearest deadline, company name.
export type SortOrder = 'newest' | 'oldest' | 'deadline' | 'company'
export const SORT_ORDERS: readonly SortOrder[] = ['newest', 'oldest', 'deadline', 'company']
export const isSortOrder = (value: string): value is SortOrder => SORT_ORDERS.some((order) => order === value)

// Each order's name in the reader's language, from the catalog.
export const sortLabels = (i18n: I18n): Record<SortOrder, string> => ({
  newest: i18n._('Newest'),
  oldest: i18n._('Oldest'),
  deadline: i18n._('Nearest deadline'),
  company: i18n._('Company name, A to Z'),
})
