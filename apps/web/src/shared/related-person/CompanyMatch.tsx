import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import { useId } from 'react'
import { usePreferences } from '../../core/preferences'
import { formatCount } from '../../i18n/formatCount'
import { spacing } from '../../theme/tokens'
import { Button } from '../button'
import { Icon } from '../icon'
import { labelText, nameText, oneLine } from './personText'

// The props are documented in story-docs, not here, KN-207.
export interface CompanyMatchPerson {
  id: string
  name: string
  role?: string | null
  company?: string | null
}

export interface CompanyMatchProps {
  company: string
  people: readonly CompanyMatchPerson[]
  onConnect: (id: string) => void
}

// The title as the reader says it: the count in their digits, the noun in the
// plural the count takes, the company, and the verb that agrees with it.
// Persian keeps «نفر» singular after a number, so both of its forms are one
// string, and so is its verb.
const useTitle = (company: string, count: number) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const one = new Intl.PluralRules(locale).select(count) === 'one'
  const from = one ? i18n._('person from') : i18n._('people from')
  const network = one ? i18n._('is in your network') : i18n._('are in your network')
  return `${formatCount(locale, count)} ${from} ${company} ${network}`
}

// The Company Match's Person, 1096:3116: the name over «سمت · شرکت» at the
// inline start and Connect at the inline end, the 40 of the two lines with the
// 36 of the button centred on them. The file's spacer between them has no
// least width; 12, spacing/sm, is kept here, which moves nothing at the file's
// lengths and cuts a long name before it reaches the button. A group named by
// the person, so Connect is heard with whose it is.
const Match = ({ person, onConnect }: { person: CompanyMatchPerson; onConnect: (id: string) => void }) => {
  const { i18n } = useLingui()
  const nameId = useId()
  const described = [person.role, person.company].filter((part) => part !== undefined && part !== null && part !== '').join(' · ')
  return (
    <Box role="group" aria-labelledby={nameId} sx={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: `${spacing.sm}px` }}>
      <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Box component="span" id={nameId} sx={(theme) => ({ ...nameText.sx(theme), ...oneLine.sx })}>
          {person.name}
        </Box>
        {described === '' ? null : (
          <Box component="span" sx={(theme) => ({ ...labelText.sx(theme), ...oneLine.sx })}>
            {described}
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', flexShrink: 0, marginInlineStart: 'auto' }}>
        <Button
          variant="secondary"
          size="S"
          surface
          onClick={() => {
            onConnect(person.id)
          }}
        >
          {i18n._('Connect')}
        </Button>
      </Box>
    </Box>
  )
}

// Company Match, node 1096:3111: at the top of a job opportunity's related
// people tab, the people from its company who are in the reader's network and
// not linked to it. A column of bg/brand/container at radius md, 12 above and
// below, 16 at the sides and 8 between its rows, filling the tab's width: the
// title row, the user-plus at 16 and the count in Label, both text/brand, 8
// apart; then a row for each person, whose Connect, a Secondary S filled with
// the surface's white, links them, and the screen takes them off the list.
// The file draws one person; several are a row each. With nobody, nothing is
// drawn. A group named by its title.
export const CompanyMatch = ({ company, people, onConnect }: CompanyMatchProps) => {
  const titleId = useId()
  const title = useTitle(company, people.length)
  if (people.length === 0) return null
  return (
    <Box
      role="group"
      aria-labelledby={titleId}
      sx={(theme) => ({
        boxSizing: 'border-box',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: `${spacing.xs}px`,
        paddingBlock: `${spacing.sm}px`,
        paddingInline: `${spacing.md}px`,
        borderRadius: `${theme.karnama.radius.md}px`,
        backgroundColor: theme.karnama.semantic['bg/brand/container'],
      })}
    >
      {/* The file centres the icon on the title's one line; the icon and the
          line are both 16, so the code puts it at the top, which is the same
          on one line and keeps it on the first when a long company wraps. */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: `${spacing.xs}px` }}>
        <Icon name="user-plus" size="sm" color="text/brand" />
        <Box component="span" id={titleId} sx={(theme) => ({ ...labelText.sx(theme), color: theme.karnama.semantic['text/brand'] })}>
          {title}
        </Box>
      </Box>
      {people.map((person) => (
        <Match key={person.id} person={person} onConnect={onConnect} />
      ))}
    </Box>
  )
}
