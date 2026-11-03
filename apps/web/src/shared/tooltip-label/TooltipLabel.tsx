import { Tooltip as MuiTooltip, tooltipClasses } from '@mui/material'
import { useContext, type ReactElement } from 'react'
import { spacing, unstyledText } from '../../theme/tokens'
import { DescribedByATooltip, tooltipPair } from '../tooltip'

// The props are documented in story-docs, not here, KN-207.
export interface TooltipLabelProps {
  title: string
  children: ReactElement
}

// A class on the DRAWN surface, KN-222, so a test finds the element it means
// rather than MUI's popper around it, which carries the role.
export const TOOLTIP_LABEL_SURFACE = 'KarnamaTooltipLabel-surface'

// The spec's delay, 1123:57071: about 300 ms before it opens, every time, the
// next one too, which MUI would otherwise open at once; it closes at once.
const OPEN_AFTER_MS = 300
// The label's 12 on 15 at Regular, bound to no text style.
const text = unstyledText.tooltipLabel

// Tooltip / Label, node 1123:56919: an icon-only button's name on one line,
// opened by hover or keyboard focus of the button itself, above it, centred, 4
// away, and below it when there is no room, KN-777. MUI's Tooltip flips by
// Popper's own flip, opens on focus only when the focus is the keyboard's, and
// keeps the button's own aria-label, which is the same text, so the label names
// nothing new. The file draws no motion, so there is none either way. Inside the
// old describe Tooltip, which already speaks for its element, it adds nothing,
// so the two never show at once.
export const TooltipLabel = ({ title, children }: TooltipLabelProps) => {
  const described = useContext(DescribedByATooltip)
  if (described) return children
  return (
    <MuiTooltip
      title={title}
      placement="top"
      enterDelay={OPEN_AFTER_MS}
      enterNextDelay={OPEN_AFTER_MS}
      leaveDelay={0}
      disableInteractive
      slotProps={{
        transition: { timeout: 0 },
        tooltip: {
          className: TOOLTIP_LABEL_SURFACE,
          sx: (theme) => ({
            ...tooltipPair(theme),
            margin: 0,
            padding: `${spacing['2xs']}px ${spacing.xs}px`,
            borderRadius: `${theme.karnama.radius.sm}px`,
            fontSize: `${text.size}px`,
            lineHeight: `${text.lineHeight}px`,
            fontWeight: text.weight,
            letterSpacing: text.letterSpacing,
            maxWidth: 'none',
            whiteSpace: 'nowrap',
            // It never takes a click aimed at the button it names.
            pointerEvents: 'none',
            // The 4 between it and the button, on whichever side Popper puts it,
            // in place of MUI's own 14.
            [`.${tooltipClasses.popper}[data-popper-placement*="top"] &`]: { marginBottom: `${spacing['2xs']}px` },
            [`.${tooltipClasses.popper}[data-popper-placement*="bottom"] &`]: { marginTop: `${spacing['2xs']}px` },
          }),
        },
      }}
    >
      {children}
    </MuiTooltip>
  )
}
