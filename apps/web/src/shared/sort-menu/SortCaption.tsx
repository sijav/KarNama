import { useLingui } from '@lingui/react'
import { Box, ButtonBase } from '@mui/material'
import { spacing, unstyledText } from '../../theme/tokens'
import { Icon } from '../icon'

// The props are documented in story-docs, not here, KN-207.
export interface SortCaptionProps {
  caption: string
  column: string
  open: boolean
  onOpen: () => void
}

// The file draws the caption no focus and no box to draw it inside, so the
// keyboard's outline is the Inline Link's, three wide and two clear.
const FOCUS_RING = 3
const FOCUS_GAP = 2

// The caption, 11 on 17 at Regular.
const words = unstyledText.sortCaption

// Column Header / Sort, node 961:97159, Default and Hover: the order a column
// is in, as a caption at its header's inline end, in text/disabled, and the ⋯
// after it, 16 in text/secondary, 8 apart; under the pointer the caption turns
// text/primary. A press opens the column's sort menu. Its name begins with the
// caption it shows and says which column it orders.
export const SortCaption = ({ caption, column, open, onOpen }: SortCaptionProps) => {
  const { i18n } = useLingui()
  return (
    <ButtonBase
      disableRipple
      aria-haspopup="menu"
      aria-expanded={open}
      aria-label={`${caption} ${i18n._('in the column')} ${column}`}
      onClick={onOpen}
      sx={(theme) => {
        const colour = theme.karnama.semantic
        return {
          display: 'inline-flex',
          alignItems: 'center',
          gap: `${spacing.xs}px`,
          fontFamily: 'inherit',
          fontSize: `${words.size}px`,
          lineHeight: `${words.lineHeight}px`,
          fontWeight: words.weight,
          letterSpacing: `${words.letterSpacing}px`,
          color: colour['text/disabled'],
          borderRadius: `${theme.karnama.radius.sm}px`,
          '@media (hover: hover)': { '&:hover': { color: colour['text/primary'] } },
          '&.Mui-focusVisible': {
            outlineStyle: 'solid',
            outlineWidth: FOCUS_RING,
            outlineColor: colour['border/focus'],
            outlineOffset: FOCUS_GAP,
          },
        }
      }}
    >
      <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
        {caption}
      </Box>
      <Icon name="more" size="sm" />
    </ButtonBase>
  )
}
