import { ButtonBase } from '@mui/material'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Icon } from '../icon'

// The props are documented in story-docs, not here, KN-207.
export interface LabelChoiceProps {
  label: string
  selected?: boolean
  add?: boolean
  onClick: () => void
}

// Node 1086:2944 binds no variable to these: its one pixel edge, inside and in
// the layout, which Add dashes; its 4 above and below and between are spacing
// 2xs and its 12 at the sides spacing sm.
const EDGE = 1
// The hover's reaction, 120 ms, ease out.
const HOVER_MS = 120
// The keyboard's ring, which the file does not draw: three inside, as the
// Action Chip's, KN-294.
const FOCUS_RING = 3

const text = typeScale.body

// Label Choice, node 1086:2944, KN-771: one relationship label in the person
// modal's label picker, in Default, Hover, Selected and Add. A pill of
// bg/surface inside border/default, its label Body in text/secondary, which
// bg/surface-secondary fills under the pointer. Selected is bg/brand/container
// inside border/focus, its label in text/brand after a 16 check. Add is the
// dashed «برچسب تازه» in text/brand after a 16 plus. A label can be chosen and
// taken off, so it is a toggle; Add is a button.
export const LabelChoice = ({ label, selected = false, add = false, onClick }: LabelChoiceProps) => (
  <ButtonBase
    disableRipple
    aria-pressed={add ? undefined : selected}
    onClick={onClick}
    sx={(theme) => {
      const colour = theme.karnama.semantic
      return {
        position: 'relative',
        flexShrink: 0,
        boxSizing: 'border-box',
        gap: `${spacing['2xs']}px`,
        paddingBlock: `${spacing['2xs']}px`,
        paddingInline: `${spacing.sm}px`,
        borderRadius: `${theme.karnama.radius.full}px`,
        borderStyle: add ? 'dashed' : 'solid',
        borderWidth: EDGE,
        borderColor: colour[selected && !add ? 'border/focus' : 'border/default'],
        backgroundColor: add ? 'transparent' : colour[selected ? 'bg/brand/container' : 'bg/surface'],
        color: colour[selected || add ? 'text/brand' : 'text/secondary'],
        fontSize: `${text.size}px`,
        lineHeight: `${text.lineHeight}px`,
        fontWeight: text.weight,
        letterSpacing: text.letterSpacing,
        whiteSpace: 'nowrap',
        transition: `background-color ${HOVER_MS}ms ease-out`,
        ...(selected || add ? {} : { '@media (hover: hover)': { '&:hover': { backgroundColor: colour['bg/surface-secondary'] } } }),
        '&.Mui-focusVisible::after': {
          content: '""',
          position: 'absolute',
          inset: -EDGE,
          borderRadius: 'inherit',
          borderStyle: 'solid',
          borderWidth: FOCUS_RING,
          borderColor: colour['border/focus'],
          pointerEvents: 'none',
        },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }
    }}
  >
    {add ? <Icon name="plus" size="sm" color="inherit" /> : selected ? <Icon name="check" size="sm" color="inherit" /> : null}
    <span>{label}</span>
  </ButtonBase>
)
