import { IconButton as MuiIconButton, type Theme } from '@mui/material'
import { useEffect, type AriaAttributes, type DOMAttributes, type Ref } from 'react'
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
 *
 * The ref is NOT here, because what it points at depends on which of the two
 * shapes below is being used: MUI renders an anchor for a button with an href,
 * so a ref taken on a link is a ref to an anchor, KN-447. Each shape declares
 * its own, which is the only way a caller gets the element they actually have
 * without the cast AGENTS.md forbids.
 */
type TooltipTrigger<Element extends HTMLElement> = Pick<
  DOMAttributes<Element>,
  'onFocus' | 'onBlur' | 'onMouseOver' | 'onMouseLeave' | 'onTouchStart' | 'onTouchEnd'
> &
  Pick<AriaAttributes, 'aria-describedby'>

// The props are documented in story-docs, not here, KN-207.
interface IconButtonBase {
  icon: IconName
  'aria-label': string
  tone?: 'neutral' | 'danger'
  iconSize?: 'sm' | 'md'
  onClick?: () => void
}

/**
 * A control that goes somewhere, or one that can be turned off. Never both.
 *
 * MUI renders an anchor for a button given an href, and an anchor takes no
 * `disabled` attribute: it would get `aria-disabled` and stay clickable and
 * navigable, so the button would say it was off and still work, KN-433. The
 * union makes that unrepresentable rather than documented, which is the only
 * version of this that a caller cannot get wrong.
 */
export interface IconButtonSwitch extends IconButtonBase, TooltipTrigger<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>
  href?: never
  disabled?: boolean
}

export interface IconButtonLink extends IconButtonBase, TooltipTrigger<HTMLAnchorElement> {
  ref?: Ref<HTMLAnchorElement>
  href: string
  disabled?: never
}

export type IconButtonProps = IconButtonSwitch | IconButtonLink

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
export const IconButton = (props: IconButtonProps) => {
  const { icon, 'aria-label': label, tone = 'neutral', iconSize = 'sm', onClick } = props
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

  // What both shapes draw. The props a Tooltip injects are taken inside each
  // branch instead, after the union is narrowed, so each carries the handlers
  // and the ref for the element it actually renders, KN-447.
  const shared = {
    'aria-label': name,
    disableRipple: true,
    onClick,
    sx: (theme: Theme) => {
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
    },
  }
  const mark = <Icon name={icon} size={iconSize} color="inherit" />

  // Two calls rather than one with an href spread in: MUI types the anchor form
  // as its own overload, taking a REQUIRED href, so a shape whose href is
  // merely optional matches neither, KN-447. Narrowing here is also what gives
  // each form the ref and the handlers for the element it actually renders.
  if (props.href === undefined) {
    const { icon: _icon, 'aria-label': _label, tone: _tone, iconSize: _size, onClick: _click, href: _href, disabled = false, ...trigger } = props
    return (
      <MuiIconButton {...trigger} {...shared} disabled={disabled}>
        {mark}
      </MuiIconButton>
    )
  }
  const { icon: _icon, 'aria-label': _label, tone: _tone, iconSize: _size, onClick: _click, href, ...trigger } = props
  return (
    <MuiIconButton {...trigger} {...shared} href={href}>
      {mark}
    </MuiIconButton>
  )
}