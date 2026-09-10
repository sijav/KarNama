import { Box, Tooltip as MuiTooltip } from '@mui/material'
import type { ReactElement, ReactNode } from 'react'
import { iconSize, spacing, type as typeScale } from '../../theme/tokens'

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
        sx: (theme) => ({
          backgroundColor: theme.karnama.semantic['text/primary'],
          color: theme.karnama.semantic['text/on-accent'],
          borderRadius: `${theme.karnama.radius.md}px`,
          padding: `${spacing.sm}px`,
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
