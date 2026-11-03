import { useLingui } from '@lingui/react'
import { Box, ButtonBase, Popover, useTheme } from '@mui/material'
import { useId } from 'react'
import { inlineStartOf } from '../../theme/sides'
import { spacing, unstyledText } from '../../theme/tokens'
import { CHOICE, StatusChoice, type StatusOption } from '../status-picker'
import { popoverPaper } from './popoverPaper'

// The props are documented in story-docs, not here, KN-207.
export interface InterviewResultPopoverProps {
  anchorEl: HTMLElement | null
  choices: readonly StatusOption[]
  onChoose: (id: string) => void
  onClose: () => void
}

// Node 844:85811's width, bound to no variable, and the keyboard's ring, the
// three drawn inside that the Status Picker's choices take, KN-020.
const WIDTH = 369
const FOCUS_RING = 3

const title = unstyledText.interviewResult

// Popover / نتیجهٔ مصاحبه, node 844:85811: «نتیجه چی بود؟» over a row of
// Status Choices that wraps, 8 both ways, in the redesign's popover panel. It
// opens under the card it is given, from the card's inline start, 4 below it,
// at once, after «نتیجه گرفتم» on an interview's card, and offers what the
// board gives it, which is what can follow an interview, KN-731. MUI's Popover
// traps focus while it is open, closes it on a press outside and on Escape, and
// gives focus back to whatever opened it. A named dialog, its title labelling
// it, and focus starts on the panel itself: a choice focused as it opens wears
// the keyboard's ring even when a pointer opened it, which reads as chosen.
// One press applies a choice, so each is a button, not a radio. A press closes
// the popover and hands the choice over.
export const InterviewResultPopover = ({ anchorEl, choices, onChoose, onClose }: InterviewResultPopoverProps) => {
  const { i18n } = useLingui()
  const titleId = useId()
  const start = inlineStartOf(useTheme().direction)
  return (
    <Popover
      open={anchorEl !== null}
      anchorEl={anchorEl}
      onClose={onClose}
      transitionDuration={0}
      anchorOrigin={{ vertical: 'bottom', horizontal: start }}
      transformOrigin={{ vertical: 'top', horizontal: start }}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-labelledby': titleId,
          sx: (theme) => ({ ...popoverPaper.sx(theme, WIDTH), marginTop: `${spacing['2xs']}px` }),
        },
      }}
    >
      {/* 14 on Figma's automatic 22 at Medium, bound to no text style. */}
      <Box
        component="h2"
        id={titleId}
        sx={(theme) => ({
          margin: 0,
          fontSize: `${title.size}px`,
          lineHeight: `${title.lineHeight}px`,
          fontWeight: title.weight,
          letterSpacing: `${title.letterSpacing}px`,
          color: theme.karnama.semantic['text/primary'],
        })}
      >
        {i18n._('What was the result?')}
      </Box>
      {/* The file's Choices, 844:85813: from the inline start, 8 both ways,
          each centred on its line. */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: `${spacing.xs}px` }}>
        {choices.map((option) => (
          <ButtonBase
            key={option.id}
            disableRipple
            onClick={() => {
              onClose()
              onChoose(option.id)
            }}
            sx={(theme) => ({
              borderRadius: `${theme.karnama.radius.full}px`,
              // Hover, 427:562: the ring in border/default.
              '@media (hover: hover)': { [`&:hover .${CHOICE}::after`]: { borderColor: theme.karnama.semantic['border/default'] } },
              [`&.Mui-focusVisible .${CHOICE}::after`]: { borderWidth: FOCUS_RING, borderColor: theme.karnama.semantic['border/focus'] },
            })}
          >
            <StatusChoice option={option} selected={false} />
          </ButtonBase>
        ))}
      </Box>
    </Popover>
  )
}
