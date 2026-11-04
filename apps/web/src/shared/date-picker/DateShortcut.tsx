import { ButtonBase } from '@mui/material'
import { unstyledText } from '../../theme/tokens'

// The props are documented in story-docs, not here, KN-207.
export interface DateShortcutProps {
  label: string
  onClick: () => void
}

// Node 780:44444 binds no variable to its sizes: 3 above and below and 10 at
// the sides of a pill at radius 999, radius/full, each of the screens' three
// 47 wide, which the Persian three keep and an English label grows from.
const PADDING_BLOCK = 3
const PADDING_INLINE = 10
const MIN_WIDTH = 47
// The hover's reaction, 120 ms, ease out.
const HOVER_MS = 120
// The keyboard's ring, which the file does not draw: three inside, as the
// Action Chip's, KN-294.
const FOCUS_RING = 3

const text = unstyledText.dateShortcut

// Date Picker / Shortcut, node 780:44444, KN-756: a day the date dropdown offers
// at one press, «امروز», «دیروز» or «پریروز». Its label 12 on 19 at Regular in
// text/primary on a pill of bg/surface-secondary, which border/default fills
// under the pointer.
export const DateShortcut = ({ label, onClick }: DateShortcutProps) => (
  <ButtonBase
    disableRipple
    onClick={onClick}
    sx={(theme) => {
      const colour = theme.karnama.semantic
      return {
        position: 'relative',
        flexShrink: 0,
        boxSizing: 'border-box',
        minWidth: MIN_WIDTH,
        paddingBlock: `${PADDING_BLOCK}px`,
        paddingInline: `${PADDING_INLINE}px`,
        borderRadius: `${theme.karnama.radius.full}px`,
        backgroundColor: colour['bg/surface-secondary'],
        color: colour['text/primary'],
        fontSize: `${text.size}px`,
        lineHeight: `${text.lineHeight}px`,
        fontWeight: text.weight,
        letterSpacing: text.letterSpacing,
        whiteSpace: 'nowrap',
        transition: `background-color ${HOVER_MS}ms ease-out`,
        '@media (hover: hover)': { '&:hover': { backgroundColor: colour['border/default'] } },
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
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }
    }}
  >
    {label}
  </ButtonBase>
)
