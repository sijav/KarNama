import type { I18n } from '@lingui/core'

// The five built-in statuses. The four custom slots have no default name.
export type DefaultStatus = 'new' | 'applied' | 'interview' | 'rejected' | 'offer'

// The names a fresh account first sees, from the legend at node 410:470. They
// are SEED values: once a status exists, its name is record data the user can
// rename, so the Status Chip takes its label from the record and never from
// here. That is why these are the only status names in the catalog, KN-010.
export const defaultStatusName = (i18n: I18n, status: DefaultStatus): string => {
  switch (status) {
    case 'new':
      return i18n._('Saved')
    case 'applied':
      return i18n._('Applied')
    case 'interview':
      return i18n._('Interview')
    case 'rejected':
      return i18n._('Rejected')
    case 'offer':
      return i18n._('Job offer')
  }
}
