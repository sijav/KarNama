import { expect, it } from 'vitest'
import { i18nFor } from '../../i18n'
import type { StatusOption } from '../../shared/status-picker'
import { localizedStatuses } from './status-labels'

it('translates default names in both directions while preserving custom names and colours', () => {
  const statuses: StatusOption[] = [
    { id: 'new', token: 'custom-1', name: i18nFor('fa-IR')._('Saved') },
    { id: 'applied', token: 'applied', name: 'My custom stage' },
    { id: 'custom-stage', token: 'new', name: 'Saved' },
  ]
  const english = localizedStatuses(statuses, i18nFor('en-US'))
  expect(english[0]).toEqual({ id: 'new', token: 'custom-1', name: 'Saved' })
  expect(english.slice(1)).toEqual(statuses.slice(1))
  expect(localizedStatuses(english, i18nFor('fa-IR'))).toEqual(statuses)
})
