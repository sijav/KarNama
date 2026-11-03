import { useLingui } from '@lingui/react'
import { Box, ButtonBase } from '@mui/material'
import { spacing, unstyledText } from '../../theme/tokens'
import { GLYPHS } from '../icon'

// The props are documented in story-docs, not here, KN-207.
export interface AddStatusColumnProps {
  onAdd: () => void
}

// Node 961:95530 binds no variable to these: the stage columns' 300, 13 above
// and below, and the plus's 18, which is none of the icon sizes. Its 16 at the
// sides, 8 between the plus and the label and radius of 16 are spacing md,
// spacing xs and radius/lg, which it leaves unbound. Its edge, one pixel dashed
// 5 and 4 and counted in the layout, is a real border dashed by CSS's own dash,
// as every dashed edge here is; the keyboard's ring is the three inside the
// Add Stage takes, KN-750.
const WIDTH = 300
const PADDING_BLOCK = 13
const PLUS = 18
const EDGE = 1
const FOCUS_RING = 3
// Its label, 14 on 22 at Medium, bound to no text style.
const text = unstyledText.addStatusColumn

// Board / Add Status Column, node 961:95530, Default and Hover: a dashed
// column as wide as a stage's, always beside the open stages, that makes a new
// stage. The plus leads «افزودن وضعیت», both in text/secondary and centred, in
// an edge of text/disabled; on hover it fills with bg/surface-secondary. The
// plus is the Icon set's at 18, drawn from its geometry, as the Color Picker
// draws its 14 check, with the set's two pixel stroke, KN-008.
export const AddStatusColumn = ({ onAdd }: AddStatusColumnProps) => {
  const { i18n } = useLingui()
  return (
    <ButtonBase
      disableRipple
      onClick={onAdd}
      sx={(theme) => {
        const colour = theme.karnama.semantic
        return {
          position: 'relative',
          boxSizing: 'border-box',
          flexShrink: 0,
          width: WIDTH,
          gap: `${spacing.xs}px`,
          paddingBlock: `${PADDING_BLOCK}px`,
          paddingInline: `${spacing.md}px`,
          borderRadius: `${theme.karnama.radius.lg}px`,
          borderStyle: 'dashed',
          borderWidth: EDGE,
          borderColor: colour['text/disabled'],
          color: colour['text/secondary'],
          fontSize: `${text.size}px`,
          lineHeight: `${text.lineHeight}px`,
          fontWeight: text.weight,
          letterSpacing: `${text.letterSpacing}px`,
          whiteSpace: 'nowrap',
          '@media (hover: hover)': { '&:hover': { backgroundColor: colour['bg/surface-secondary'] } },
          '&.Mui-focusVisible::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            borderStyle: 'solid',
            borderWidth: FOCUS_RING,
            borderColor: colour['border/focus'],
            pointerEvents: 'none',
          },
        }
      }}
    >
      <Box
        component="svg"
        aria-hidden
        viewBox="0 0 24 24"
        sx={{ flexShrink: 0, width: PLUS, height: PLUS, fill: 'none', stroke: 'currentColor' }}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {GLYPHS.plus.stroke.map((d) => (
          <path key={d} d={d} vectorEffect="non-scaling-stroke" />
        ))}
      </Box>
      {i18n._('Add status')}
    </ButtonBase>
  )
}
