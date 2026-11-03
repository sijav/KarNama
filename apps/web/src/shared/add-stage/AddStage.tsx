import { useLingui } from '@lingui/react'
import { ButtonBase } from '@mui/material'
import { spacing, unstyledText } from '../../theme/tokens'
import { Icon } from '../icon'

// The props are documented in story-docs, not here, KN-207.
export interface AddStageProps {
  onClick: () => void
}

// Node 961:101245's padding above and below, which no variable binds; the
// sides are spacing sm and the gap 2xs. Its edge, one pixel dashed 4 and 3 and
// counted in the layout, is a real border dashed by CSS's own dash, as every
// dashed edge here is. The focus ring inside it is three wide, as the Icon
// Button's: the file draws the chip no focus, KN-294.
const PADDING_BLOCK = 3
const EDGE = 1
const FOCUS_RING = 3
// Its label, 13 on 22 at Medium, bound to no text style.
const text = unstyledText.addStage

// Add Stage, node 961:101245: «+ افزودن وضعیت» at the end of the grouped
// picker's open stages, which makes a new stage. The plus leads the label, on
// its right in Persian, both in text/brand inside a dashed pill of
// bg/brand/default; on hover the pill fills with bg/surface-secondary.
export const AddStage = ({ onClick }: AddStageProps) => {
  const { i18n } = useLingui()
  return (
    <ButtonBase
      onClick={onClick}
      sx={(theme) => {
        const colour = theme.karnama.semantic
        return {
          position: 'relative',
          boxSizing: 'border-box',
          gap: `${spacing['2xs']}px`,
          paddingInline: `${spacing.sm}px`,
          paddingBlock: `${PADDING_BLOCK}px`,
          borderRadius: `${theme.karnama.radius.full}px`,
          borderStyle: 'dashed',
          borderWidth: EDGE,
          borderColor: colour['bg/brand/default'],
          color: colour['text/brand'],
          fontSize: `${text.size}px`,
          lineHeight: `${text.lineHeight}px`,
          fontWeight: text.weight,
          letterSpacing: text.letterSpacing,
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
      <Icon name="plus" size="sm" color="text/brand" />
      {i18n._('Add status')}
    </ButtonBase>
  )
}
