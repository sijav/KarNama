import { useLingui } from '@lingui/react'
import { Box, ButtonBase } from '@mui/material'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Icon } from '../icon'
import { holds, LinkedMark, SearchPicker } from '../picker'
import { quoted } from '../quoted'
import { labelText, oneLine } from '../related-person/personText'

// A person of the reader's network the picker offers.
export interface PickerPerson {
  id: string
  name: string
  role?: string | null
  company?: string | null
}

// The props are documented in story-docs, not here, KN-207.
export interface PersonPickerProps {
  anchorEl: HTMLElement | null
  people: readonly PickerPerson[]
  linkedIds: readonly string[]
  onPick: (id: string) => void
  onCreate: (name: string) => void
  onClose: () => void
}

// Node 1096:3129 is 400 wide and binds no variable to it, nor to its divider's
// one pixel.
const WIDTH = 400
const EDGE = 1

const present = (value: string | null | undefined): value is string => value !== undefined && value !== null && value !== ''

// Person Picker, node 1096:3129: the related people tab's «+ افزودن نفر». The
// shared picker at 400, headed «از شبکهٔ شما»: each person of the reader's
// network it finds, their name in Body over «سمت · شرکت» in Label
// text/secondary at the inline start, the ones linked already muted with «وصل
// است» at the inline end. With something typed, a divider and «افزودن «…» به
// شبکه به‌عنوان نفر تازه» in Body text/brand after its plus, which asks for the
// add form with the name filled; Enter asks for it too when no one can be
// chosen. Choosing either closes it first.
export const PersonPicker = ({ anchorEl, people, linkedIds, onPick, onCreate, onClose }: PersonPickerProps) => {
  const { i18n } = useLingui()
  const linked = new Set(linkedIds)
  const create = (query: string) => {
    const name = query.trim()
    if (name === '') return
    onClose()
    onCreate(name)
  }
  return (
    <SearchPicker
      anchorEl={anchorEl}
      width={WIDTH}
      label={i18n._('Search your network')}
      heading={i18n._('From your network')}
      items={people}
      idOf={(person) => person.id}
      matches={(person, query) => holds(i18n.locale, query, person.name, person.role, person.company)}
      isLinked={(person) => linked.has(person.id)}
      renderItem={(person, isLinked) => {
        const described = [person.role, person.company].filter(present).join(' · ')
        return (
          <>
            <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <Box
                component="span"
                sx={(theme) => ({
                  ...oneLine.sx,
                  fontSize: `${typeScale.body.size}px`,
                  lineHeight: `${typeScale.body.lineHeight}px`,
                  fontWeight: typeScale.body.weight,
                  color: theme.karnama.semantic[isLinked ? 'text/secondary' : 'text/primary'],
                })}
              >
                {person.name}
              </Box>
              {described === '' ? null : (
                <Box component="span" sx={(theme) => ({ ...labelText.sx(theme), ...oneLine.sx })}>
                  {described}
                </Box>
              )}
            </Box>
            {isLinked ? <LinkedMark /> : null}
          </>
        )
      }}
      footer={(query) =>
        query.trim() === '' ? null : (
          <>
            <Box
              aria-hidden
              sx={(theme) => ({ flexShrink: 0, height: `${EDGE}px`, backgroundColor: theme.karnama.semantic['border/default'] })}
            />
            <ButtonBase
              disableRipple
              onClick={() => {
                create(query)
              }}
              sx={(theme) => ({
                justifyContent: 'flex-start',
                gap: `${spacing.xs}px`,
                paddingBlock: `${spacing.xs}px`,
                paddingInline: `${spacing.sm}px`,
                borderRadius: `${theme.karnama.radius.sm}px`,
                fontFamily: 'inherit',
                fontSize: `${typeScale.body.size}px`,
                lineHeight: `${typeScale.body.lineHeight}px`,
                fontWeight: typeScale.body.weight,
                textAlign: 'start',
                color: theme.karnama.semantic['text/brand'],
                '@media (hover: hover)': { '&:hover': { backgroundColor: theme.karnama.semantic['bg/surface-secondary'] } },
                '&.Mui-focusVisible': {
                  outlineWidth: 2,
                  outlineStyle: 'solid',
                  outlineColor: theme.karnama.semantic['border/focus'],
                  outlineOffset: -2,
                },
              })}
            >
              <Icon name="plus" size="sm" color="inherit" />
              {`${i18n._('Add')} ${quoted(i18n, query.trim())} ${i18n._('to the network as a new person')}`}
            </ButtonBase>
          </>
        )
      }
      onEnterWithNone={create}
      onChoose={(person) => {
        onClose()
        onPick(person.id)
      }}
      onClose={onClose}
    />
  )
}
