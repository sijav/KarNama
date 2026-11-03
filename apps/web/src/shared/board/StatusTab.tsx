import { useLingui } from '@lingui/react'
import { Box, ButtonBase, type Theme } from '@mui/material'
import { usePreferences } from '../../core/preferences'
import { formatCount } from '../../i18n/formatCount'
import { unstyledText, type as typeScale, type StatusToken } from '../../theme/tokens'
import { Icon } from '../icon'

// The props are documented in story-docs, not here, KN-207.
export interface StatusTabProps {
  name: string
  count: number
  token?: StatusToken
  selected: boolean
  onSelect: () => void
  id?: string
  'aria-controls'?: string
}

export interface AddStatusTabProps {
  onAdd: () => void
}

// Node 1274:3275 binds no variable to these: the pill's 36, the 14 at the
// sides of a tab and the 10 of the add tab, the 6 between a tab's parts and its
// dot's 8. Its edge, one pixel inside and counted in the layout, is a real
// border, dashed by CSS's own dash on the add tab; the keyboard's ring is the
// three drawn inside that a row of chips keeps from its clipped edges, KN-294.
const HEIGHT = 36
const SIDES = 14
const ADD_SIDES = 10
const GAP = 6
const DOT = 8
const EDGE = 1
const FOCUS_RING = 3

const count = unstyledText.statusTabCount
const name = unstyledText.statusTabName

// What every tab of the row shares: a pill 36 tall at radius full, its edge a
// border, and the keyboard's ring inside it. Under an sx key, which the lint
// rule reads as CSS.
const pill = {
  sx: (theme: Theme) => ({
    position: 'relative',
    flexShrink: 0,
    boxSizing: 'border-box',
    height: HEIGHT,
    borderRadius: `${theme.karnama.radius.full}px`,
    borderWidth: EDGE,
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    '&.Mui-focusVisible::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      borderStyle: 'solid',
      borderWidth: FOCUS_RING,
      borderColor: theme.karnama.semantic['border/focus'],
      pointerEvents: 'none',
    },
  }) as const,
}

// Tab / Status (Mobile), node 1274:3275, State=Default and State=Active: a
// status of the mobile board, whose column it shows. From the inline start the
// status's dot in the base of its pair, when it has one, its name at 13 on 20
// and Medium, and its count at 12 on 19 in the reader's digits, 6 apart, in a
// pill of bg/surface with an edge of border/default, the name in text/primary
// and the count in text/secondary. The chosen tab, Active, is bg/brand/container
// with an edge of text/brand and both in text/brand, the name SemiBold. A tab of
// the row the board makes a tablist; it is named by its name and count, the dot
// being decoration.
export const StatusTab = ({ name: label, count: total, token, selected, onSelect, id, 'aria-controls': controls }: StatusTabProps) => {
  const { locale } = usePreferences()
  return (
    <ButtonBase
      role="tab"
      aria-selected={selected}
      {...(id === undefined ? {} : { id })}
      {...(controls === undefined ? {} : { 'aria-controls': controls })}
      tabIndex={selected ? 0 : -1}
      disableRipple
      onClick={onSelect}
      sx={(theme) => {
        const colour = theme.karnama.semantic
        return {
          ...pill.sx(theme),
          gap: `${GAP}px`,
          paddingInline: `${SIDES}px`,
          borderStyle: 'solid',
          borderColor: selected ? colour['text/brand'] : colour['border/default'],
          backgroundColor: selected ? colour['bg/brand/container'] : colour['bg/surface'],
        }
      }}
    >
      {token === undefined ? null : (
        <Box
          aria-hidden
          sx={(theme) => ({
            flexShrink: 0,
            width: DOT,
            height: DOT,
            borderRadius: `${theme.karnama.radius.full}px`,
            backgroundColor: theme.karnama.status[token].base,
          })}
        />
      )}
      <Box
        component="span"
        sx={(theme) => ({
          fontSize: `${name.size}px`,
          lineHeight: `${name.lineHeight}px`,
          // SemiBold when chosen, the headings' weight.
          fontWeight: selected ? typeScale['heading/m'].weight : name.weight,
          letterSpacing: `${name.letterSpacing}px`,
          color: theme.karnama.semantic[selected ? 'text/brand' : 'text/primary'],
        })}
      >
        {label}
      </Box>
      <Box
        component="span"
        sx={(theme) => ({
          fontSize: `${count.size}px`,
          lineHeight: `${count.lineHeight}px`,
          fontWeight: count.weight,
          letterSpacing: `${count.letterSpacing}px`,
          color: theme.karnama.semantic[selected ? 'text/brand' : 'text/secondary'],
        })}
      >
        {formatCount(locale, total)}
      </Box>
    </ButtonBase>
  )
}

// Tab / Status (Mobile), State=Add: the row's last item, which makes a new
// status: the Icon set's plus at 16 in text/secondary, 10 at the sides, in a
// dashed edge of border/default, 38 by 36.
export const AddStatusTab = ({ onAdd }: AddStatusTabProps) => {
  const { i18n } = useLingui()
  return (
    <ButtonBase
      disableRipple
      aria-label={i18n._('Add status')}
      onClick={onAdd}
      sx={(theme) => ({
        ...pill.sx(theme),
        paddingInline: `${ADD_SIDES}px`,
        borderStyle: 'dashed',
        borderColor: theme.karnama.semantic['border/default'],
        color: theme.karnama.semantic['text/secondary'],
      })}
    >
      <Icon name="plus" size="sm" color="inherit" />
    </ButtonBase>
  )
}
