import { Box, Radio, useRadioGroup } from '@mui/material'
import { type as typeScale } from '../../theme/tokens'

// The props are documented in story-docs, not here, KN-207.
export interface ReasonOptionProps {
  value: string
  label: string
}

// Node 865:33595 binds no variable to these: the row's 44, its radius of 10,
// 11 above and below and 14 at the sides, the 10 between, the radio's 18, and
// the strokes, one pixel at rest, one and a half when chosen, the radio's one
// and a half and, chosen, five. Each stroke is an inset shadow, since Chromium
// floors a border of 1.5. The keyboard's ring is the Color Picker's, two of
// border/focus two clear, which the file does not draw.
const HEIGHT = 44
const RADIUS = 10
const PAD_BLOCK = 11
const PAD_INLINE = 14
const GAP = 10
const RADIO = 18
const EDGE = 1
const CHOSEN_EDGE = 1.5
const RADIO_EDGE = 1.5
const RADIO_CHOSEN = 5
const FOCUS_RING = 2

// The radio, 18 across on bg/surface: one and a half of border/default, or,
// chosen, five of bg/brand/default, which leaves an 8 of the surface inside.
const Ring = ({ chosen }: { chosen: boolean }) => (
  <Box
    component="span"
    sx={(theme) => {
      const colour = theme.karnama.semantic
      return {
        display: 'block',
        width: RADIO,
        height: RADIO,
        borderRadius: '50%',
        backgroundColor: colour['bg/surface'],
        boxShadow: chosen ? `inset 0 0 0 ${RADIO_CHOSEN}px ${colour['bg/brand/default']}` : `inset 0 0 0 ${RADIO_EDGE}px ${colour['border/default']}`,
      }
    }}
  />
)

// Reason Option, node 865:33595, Default, Hover, Selected and Selected Hover: one
// reason a job opportunity is deleted, a radio of the delete modal's group. A
// row 44 tall at radius 10, the radio at the inline start and the label, 14 on
// 22 at Medium in text/primary, 10 after it. At rest bg/surface with one pixel
// of border/default; under the pointer the edge turns text/secondary; chosen,
// the row fills with bg/brand/subtle inside one and a half of bg/brand/default,
// text/secondary under the pointer. The whole row is the radio's label.
export const ReasonOption = ({ value, label }: ReasonOptionProps) => {
  const group = useRadioGroup()
  const chosen = group?.value === value
  return (
    <Box
      component="label"
      sx={(theme) => {
        const colour = theme.karnama.semantic
        const width = chosen ? CHOSEN_EDGE : EDGE
        return {
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: `${GAP}px`,
          height: HEIGHT,
          paddingBlock: `${PAD_BLOCK}px`,
          paddingInline: `${PAD_INLINE}px`,
          borderRadius: `${RADIUS}px`,
          cursor: 'pointer',
          backgroundColor: colour[chosen ? 'bg/brand/subtle' : 'bg/surface'],
          boxShadow: `inset 0 0 0 ${width}px ${colour[chosen ? 'bg/brand/default' : 'border/default']}`,
          '@media (hover: hover)': { '&:hover': { boxShadow: `inset 0 0 0 ${width}px ${colour['text/secondary']}` } },
          '&:has(.Mui-focusVisible)': {
            outlineStyle: 'solid',
            outlineWidth: FOCUS_RING,
            outlineColor: colour['border/focus'],
            outlineOffset: FOCUS_RING,
          },
        }
      }}
    >
      <Radio value={value} disableRipple icon={<Ring chosen={false} />} checkedIcon={<Ring chosen />} sx={{ padding: 0, flexShrink: 0 }} />
      <Box
        component="span"
        sx={(theme) => ({
          flex: 1,
          minWidth: 0,
          fontSize: `${typeScale.body.size}px`,
          lineHeight: `${typeScale.body.lineHeight}px`,
          fontWeight: typeScale.label.weight,
          color: theme.karnama.semantic['text/primary'],
        })}
      >
        {label}
      </Box>
    </Box>
  )
}
