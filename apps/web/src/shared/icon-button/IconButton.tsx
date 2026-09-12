import { IconButton as MuiIconButton } from '@mui/material'
import { useEffect, type ComponentProps } from 'react'
import { spacing } from '../../theme/tokens'
import { Icon, type IconName } from '../icon'

/**
 * What a Tooltip puts on its trigger, KN-310.
 *
 * MUI's Tooltip clones its child with its own ref, an `aria-describedby` naming
 * the tip, and the focus and pointer handlers that open it. A child that
 * declares only its own props drops every one of them, and the tip then
 * attaches to nothing and can never open: the Tooltip says so at the console,
 * which is how this was found.
 *
 * Named and narrow rather than the whole of MUI's surface: these are the props
 * a trigger must carry, and nothing here invites a caller to reach past the
 * documented API into MUI's.
 */
type TooltipTrigger = Pick<
  ComponentProps<typeof MuiIconButton>,
  'ref' | 'aria-describedby' | 'onFocus' | 'onBlur' | 'onMouseOver' | 'onMouseLeave' | 'onTouchStart' | 'onTouchEnd'
>

// The props are documented in story-docs, not here, KN-207.
export interface IconButtonProps extends TooltipTrigger {
  icon: IconName
  'aria-label': string
  tone?: 'neutral' | 'danger'
  iconSize?: 'sm' | 'md'
  disabled?: boolean
  /**
   * Where it goes, for a control that goes somewhere.
   *
   * An icon-only control that opens an address is a LINK, not a button: it can
   * be opened in a new tab, its address copied, and a screen reader says it is
   * a link rather than announcing a button that turns out to leave the page.
   * With this the button renders as an anchor and needs no click of its own.
   */
  href?: string
  onClick?: () => void
}

// Node 460:672 draws the disabled button at 0.7 of its opacity, which binds no
// variable, so it is a component constant; the focus ring is three pixels drawn
// inside the button, since the rows and card corners it sits in can clip, and
// WCAG's understanding of 2.4.13 asks an inset indicator to be thicker than
// two, as the Filter Chip's is, KN-294.
const DISABLED_OPACITY = 0.7
const FOCUS_RING = 3
const EDGE = 1

// An icon-only control has no text to be named by, so its name is required,
// and a name that is only blank is refused rather than rendered nameless: null.
export const nameOf = (label: string): string | null => (label.trim() === '' ? null : label)

// The Icon Button of node 460:672: a 32 square of radius md around a 16 icon,
// Neutral and Danger, each at rest, hovered and disabled. The Bulk Action Bar's
// close, 401:436, is the same square round a 20 icon, so the icon's size is a
// prop, 16 unless told otherwise.
export const IconButton = ({
  icon,
  'aria-label': label,
  tone = 'neutral',
  iconSize = 'sm',
  disabled = false,
  href,
  onClick,
  ...trigger
}: IconButtonProps) => {
  const name = nameOf(label)
  // A blank name is the caller's mistake: reported as it mounts, as the
  // Tooltip reports its own, and the button left out, so the failure stays at
  // the button rather than a throw during render taking the screen down with
  // it, KN-311.
  useEffect(() => {
    if (name === null)
      console.error('IconButton: its aria-label is blank, so it would reach a screen reader nameless; it is left out until it has a name.')
  }, [name])
  if (name === null) return null
  return (
    <MuiIconButton
      // A Tooltip's ref and its handlers, passed through to the element the tip
      // attaches to, KN-310. First, so what this component documents wins: a
      // tip describes a button, it does not rename or disable one.
      {...trigger}
      aria-label={name}
      disabled={disabled}
      disableRipple
      // MUI renders an anchor for a button given an href, which is what a
      // control that goes somewhere should be.
      {...(href === undefined ? {} : { href })}
      onClick={onClick}
      sx={(theme) => {
        const colour = theme.karnama.semantic
        const hover =
          tone === 'danger'
            ? { fill: theme.karnama.status.rejected.container, icon: colour['text/error'] }
            : { fill: colour['bg/surface-secondary'], icon: colour['text/primary'] }
        return {
          position: 'relative',
          width: spacing.xl,
          height: spacing.xl,
          padding: 0,
          borderRadius: `${theme.karnama.radius.md}px`,
          color: colour['text/secondary'],
          '&:hover': { backgroundColor: hover.fill, color: hover.icon },
          '&.Mui-disabled': { opacity: DISABLED_OPACITY, color: colour['text/disabled'] },
          '&.Mui-focusVisible::after': {
            content: '""',
            position: 'absolute',
            inset: EDGE,
            borderRadius: `${theme.karnama.radius.md - EDGE}px`,
            borderStyle: 'solid',
            borderWidth: FOCUS_RING,
            borderColor: colour['border/focus'],
            pointerEvents: 'none',
          },
        }
      }}
    >
      <Icon name={icon} size={iconSize} color="inherit" />
    </MuiIconButton>
  )
}
