import type { I18n } from '@lingui/core'

// The kinds of column whose orders differ: the four default stages, and every
// stage the reader made, which orders as the offer column does.
export type ColumnKind = 'saved' | 'applied' | 'interview' | 'offer' | 'custom'

// What a column can be ordered by. Newest and oldest go by the column's own
// date: when it was saved, when the reader applied, or when it entered the
// stage. Ordering the cards by them, and keeping the choice, is KN-736's.
export type ColumnOrderId = 'deadline' | 'waiting' | 'interview-date' | 'newest' | 'oldest' | 'company'

// An order as its column's menu names it, and as the column header's caption
// does once it is chosen.
export interface ColumnOrder {
  id: ColumnOrderId
  label: string
  caption: string
}

const DEADLINE: ColumnOrderId = 'deadline'
const WAITING: ColumnOrderId = 'waiting'
const INTERVIEW_DATE: ColumnOrderId = 'interview-date'
const NEWEST: ColumnOrderId = 'newest'
const OLDEST: ColumnOrderId = 'oldest'
const COMPANY: ColumnOrderId = 'company'

// A column's own default, named in its menu with «(پیش‌فرض)» after it, and in
// the caption, by the frames, sometimes in other words.
const byDefault = (i18n: I18n, id: ColumnOrderId, name: string, caption: string): ColumnOrder => ({
  id,
  label: `${name} ${i18n._('(default)')}`,
  caption,
})
const named = (id: ColumnOrderId, label: string): ColumnOrder => ({ id, label, caption: label })

// Each column's orders as the screens 912:82571, 912:83039, 912:83507 and
// 912:83975 list them, the default first; a stage the reader made has the
// offer column's three, 919:2886.
const ORDERS: Record<ColumnKind, (i18n: I18n) => readonly ColumnOrder[]> = {
  saved: (i18n) => [
    byDefault(i18n, DEADLINE, i18n._('By deadline'), i18n._('By deadline')),
    named(NEWEST, i18n._('Newest saved')),
    named(OLDEST, i18n._('Oldest saved')),
    named(COMPANY, i18n._('Company name')),
  ],
  applied: (i18n) => [
    byDefault(i18n, WAITING, i18n._('Waiting time'), i18n._('By waiting time')),
    named(NEWEST, i18n._('Newest application')),
    named(OLDEST, i18n._('Oldest application')),
    named(COMPANY, i18n._('Company name')),
  ],
  interview: (i18n) => [
    byDefault(i18n, INTERVIEW_DATE, i18n._('Interview date'), i18n._('By interview date')),
    named(NEWEST, i18n._('Newest arrival')),
    named(OLDEST, i18n._('Oldest arrival')),
    named(COMPANY, i18n._('Company name')),
  ],
  offer: (i18n) => [
    byDefault(i18n, NEWEST, i18n._('By arrival'), i18n._('By arrival')),
    named(OLDEST, i18n._('Oldest arrival')),
    named(COMPANY, i18n._('Company name')),
  ],
  custom: (i18n) => ORDERS.offer(i18n),
}

// The orders a column of that kind offers, its default first, in the reader's
// language.
export const columnOrders = (i18n: I18n, kind: ColumnKind): readonly ColumnOrder[] => ORDERS[kind](i18n)
