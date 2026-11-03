import { ButtonBase } from '@mui/material'
import { Icon } from '../icon'
import { TooltipLabel } from '../tooltip-label'

// The props are documented in story-docs, not here, KN-207.
export interface PopoverCloseProps {
  'aria-label': string
  onClick: () => void
  size?: 22 | 20 | 16
}

// Node 848:2247's radius, 6, which binds no variable. The file draws no focus,
// and a ring inside a square this small would cover its x, so keyboard focus is
// the product's outline, two of border/focus at an offset of two, KN-244, as the
// Checkbox's is.
const RADIUS = 6
const FOCUS_OUTLINE = 2

// Popover / Close, node 848:2247: the x at 16 in text/secondary, centred in a
// square of radius 6, 22 in the date popovers, 20 in every redesigned modal's
// header and 16 as the Search Bar's clear; no fill at rest and
// bg/surface-secondary on hover; a press closes what it sits on without a
// change. An icon-only button, so it names itself with Tooltip / Label, KN-777.
export const PopoverClose = ({ 'aria-label': label, onClick, size = 22 }: PopoverCloseProps) => (
  <TooltipLabel title={label}>
    <ButtonBase
      aria-label={label}
      onClick={onClick}
      disableRipple
      sx={(theme) => {
        const colour = theme.karnama.semantic
        return {
          flexShrink: 0,
          width: size,
          height: size,
          borderRadius: `${RADIUS}px`,
          color: colour['text/secondary'],
          '@media (hover: hover)': { '&:hover': { backgroundColor: colour['bg/surface-secondary'] } },
          '&.Mui-focusVisible': {
            outlineStyle: 'solid',
            outlineWidth: FOCUS_OUTLINE,
            outlineColor: colour['border/focus'],
            outlineOffset: FOCUS_OUTLINE,
          },
        }
      }}
    >
      <Icon name="x" size="sm" color="inherit" />
    </ButtonBase>
  </TooltipLabel>
)
