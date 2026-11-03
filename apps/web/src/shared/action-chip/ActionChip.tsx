import { ButtonBase } from '@mui/material'
import { spacing, unstyledText } from '../../theme/tokens'

// The props are documented in story-docs, not here, KN-207.
export interface ActionChipProps {
  label: string
  onClick: () => void
}

// Node 961:98854's corner, and its padding above and below the label, which no
// variable binds. The padding at the sides is spacing xs.
const RADIUS = 6
const PADDING_BLOCK = 3
// The file's one pixel edge, and the focus ring just inside it, three wide, as
// the Icon Button's: the file draws the chip no focus, and an inset indicator
// thinner than two falls short of WCAG's 2.4.13, KN-294.
const EDGE = 1
const FOCUS_RING = 3
// Its label, 12 at Medium on Figma's automatic line of 19, bound to no text style.
const text = unstyledText.actionChip

// Chip / Action, node 961:98854: an answer the reader can give with one press,
// as the interview slot's «دور بعدی», «منتظر نتیجه» and «نتیجه گرفتم». At rest
// bg/surface inside border/default; on hover bg/surface-secondary inside
// text/secondary; the label always text/brand at 12 and Medium on one line.
export const ActionChip = ({ label, onClick }: ActionChipProps) => (
  <ButtonBase
    onClick={onClick}
    sx={(theme) => {
      const colour = theme.karnama.semantic
      return {
        position: 'relative',
        boxSizing: 'border-box',
        paddingInline: `${spacing.xs}px`,
        paddingBlock: `${PADDING_BLOCK}px`,
        borderRadius: `${RADIUS}px`,
        borderStyle: 'solid',
        borderWidth: EDGE,
        borderColor: colour['border/default'],
        backgroundColor: colour['bg/surface'],
        color: colour['text/brand'],
        fontSize: `${text.size}px`,
        fontWeight: text.weight,
        lineHeight: `${text.lineHeight}px`,
        letterSpacing: text.letterSpacing,
        whiteSpace: 'nowrap',
        '@media (hover: hover)': {
          '&:hover': { backgroundColor: colour['bg/surface-secondary'], borderColor: colour['text/secondary'] },
        },
        '&.Mui-focusVisible::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: `${RADIUS - EDGE}px`,
          borderStyle: 'solid',
          borderWidth: FOCUS_RING,
          borderColor: colour['border/focus'],
          pointerEvents: 'none',
        },
      }
    }}
  >
    {label}
  </ButtonBase>
)
