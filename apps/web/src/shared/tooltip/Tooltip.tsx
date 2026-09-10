import { Box, Tooltip as MuiTooltip } from '@mui/material'
import type { ReactElement, ReactNode } from 'react'
import { iconSize, spacing, type as typeScale } from '../../theme/tokens'

// The tip's width, from node `410:469`, KN-210. The frame is FIXED at 260 with
// the text set to fill what is left, not sized by its text, and no variable is
// bound to it, so it is a constant here rather than a token. The tip used to
// inherit MUI's 300 cap instead: identical for the one string in the file,
// different for every other.
const TIP_WIDTH = 260

// A class on the DRAWN surface, KN-222, so a test finds the element it means
// rather than whatever MUI happens to put first inside its popper, which is
// where the role sits. A class rather than a test id because the tooltip slot
// is typed without data attributes, the same marker the Checkbox's frame uses.
export const TOOLTIP_SURFACE = 'KarnamaTooltip-surface'

export interface TooltipProps {
  /** The text of the tip. */
  title: string
  /** Drawn before the text, at 16 by 16. */
  icon?: ReactNode
  /** The control the tip describes. */
  children: ReactElement
}

/**
 * The tooltip, from Figma node `410:469`.
 *
 * Built on MUI's `Tooltip` rather than from scratch, because the parts that are
 * hard here are collision detection, portalling and dismissal, and MUI already
 * shows on FOCUS as well as hover and closes on Escape. The exit condition asks
 * for focus explicitly, and a hover-only tooltip is invisible to anyone using a
 * keyboard.
 *
 * The fill is `text/primary`. That is a deliberate reuse rather than a missing
 * token: Figma resolves this surface to the same variable as the darkest text
 * colour, so a tooltip is the page inverted rather than a colour of its own.
 *
 * `pointerEvents: none` is the "does not trap the pointer" clause. A tooltip
 * sits over whatever it describes, and one that accepts the pointer swallows
 * the click meant for the control underneath.
 */
export const Tooltip = ({ title, icon, children }: TooltipProps) => (
  <MuiTooltip
    // The "does not trap the pointer" clause, and the sx below is not enough
    // on its own: MUI's tooltip is INTERACTIVE by default and sets
    // `pointer-events: auto` itself so you can hover into it. A story
    // asserting the computed value caught that. This turns the behaviour off
    // at the source; the sx keeps it off if MUI's default ever changes.
    disableInteractive
    title={
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: `${spacing.xs}px` }}>
        {icon === undefined ? null : (
          <Box
            aria-hidden
            sx={{ flexShrink: 0, width: iconSize.sm, height: iconSize.sm, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {icon}
          </Box>
        )}
        <Box component="span">{title}</Box>
      </Box>
    }
    slotProps={{
      tooltip: {
        className: TOOLTIP_SURFACE,
        sx: (theme) => ({
          // The frame's 260 INCLUDES its padding, which is border-box. Set here
          // rather than inherited: the tip used to be 260 only because the app's
          // CssBaseline makes everything border-box, and 284 without it. KN-222.
          boxSizing: 'border-box',
          backgroundColor: theme.karnama.semantic['text/primary'],
          color: theme.karnama.semantic['text/on-accent'],
          borderRadius: `${theme.karnama.radius.md}px`,
          // Both, so the tip is exactly the frame's width and MUI's own cap
          // cannot narrow it if its default ever drops below 260.
          width: TIP_WIDTH,
          maxWidth: TIP_WIDTH,
          // 8 above and below, 12 at the sides: the frame is py spacing-xs and
          // px spacing-sm. It was 12 all round, which is a real token and so
          // passed a check that the right tokens were referenced. KN-218.
          padding: `${spacing.xs}px ${spacing.sm}px`,
          boxShadow: theme.karnama.elevation.tooltip,
          fontSize: `${typeScale.body.size}px`,
          lineHeight: `${typeScale.body.lineHeight}px`,
          fontWeight: typeScale.body.weight,
          // See the note above: the tip must never eat a click aimed at the
          // control it is describing.
          pointerEvents: 'none',
        }),
      },
    }}
  >
    {children}
  </MuiTooltip>
)
