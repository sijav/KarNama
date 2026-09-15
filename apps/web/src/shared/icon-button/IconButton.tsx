import { Box, IconButton as MuiIconButton, type Theme } from '@mui/material'
import { useEffect, type AriaAttributes, type DOMAttributes, type ReactElement, type Ref } from 'react'
import { spacing } from '../../theme/tokens'
import { report } from '../console-guard'
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
 * documented API into MUI's. The runtime keeps the same boundary, KN-446: each
 * branch below forwards these by name, and anything else a caller spreads in, a
 * title, a class, a data attribute, stops at the button.
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
  Pick<AriaAttributes, 'aria-describedby'> & {
    // MUI's Tooltip sets this on its child in development and reads it back
    // from the child's node once mounted, logging that the child "is not
    // forwarding its props correctly" when the node lacks it. Forwarding it is
    // how the button shows MUI that it passes on what a Tooltip gives it; a
    // production build never sets it, so nothing is drawn from it there.
    'data-mui-internal-clone-element'?: boolean
  }

// What a button that opens something says about it, KN-478: that it opens a
// menu or a dialog, whether that is open, and which element it is.
type Opener = Pick<AriaAttributes, 'aria-haspopup' | 'aria-expanded' | 'aria-controls'>

// The props are documented in story-docs, not here, KN-207.
interface IconButtonBase extends Opener {
  icon: IconName | ReactElement
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

// Exactly what the types say a trigger and an opener carry, by name, KN-446: the
// boundary the types draw is the one the element gets. A name nobody gave is left
// out rather than passed as undefined, which would still replace a prop of the
// button's own set before it, KN-448.
const forwarded = <Element extends HTMLElement>(props: TooltipTrigger<Element> & Opener) => ({
  ...(props.onFocus === undefined ? {} : { onFocus: props.onFocus }),
  ...(props.onBlur === undefined ? {} : { onBlur: props.onBlur }),
  ...(props.onMouseOver === undefined ? {} : { onMouseOver: props.onMouseOver }),
  ...(props.onMouseLeave === undefined ? {} : { onMouseLeave: props.onMouseLeave }),
  ...(props.onTouchStart === undefined ? {} : { onTouchStart: props.onTouchStart }),
  ...(props.onTouchEnd === undefined ? {} : { onTouchEnd: props.onTouchEnd }),
  ...(props['aria-describedby'] === undefined ? {} : { 'aria-describedby': props['aria-describedby'] }),
  ...(props['aria-haspopup'] === undefined ? {} : { 'aria-haspopup': props['aria-haspopup'] }),
  ...(props['aria-expanded'] === undefined ? {} : { 'aria-expanded': props['aria-expanded'] }),
  ...(props['aria-controls'] === undefined ? {} : { 'aria-controls': props['aria-controls'] }),
  ...(props['data-mui-internal-clone-element'] === undefined
    ? {}
    : { 'data-mui-internal-clone-element': props['data-mui-internal-clone-element'] }),
})

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
      report('IconButton: its aria-label is blank, so it would reach a screen reader nameless; it is left out until it has a name.')
  }, [name])
  if (name === null) return null

  // What both shapes draw. The props a Tooltip injects are taken inside each
  // branch instead, after the union is narrowed, so each carries the handlers
  // and the ref for the element it actually renders, KN-447.
  const shared = {
    'aria-label': name,
    disableRipple: true,
    onClick,
    // The hover is drawn only where the device can hover, KN-313: a touch screen
    // keeps :hover on what was tapped, so a fill drawn for every device stayed
    // after a tap, measured in Playwright's Pixel 7. MUI's own reset under
    // (hover: none) is in the style it gives a button with a ripple, and this one
    // has none.
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
          '@media (hover: hover)': { '&:hover': { backgroundColor: hover.fill, color: hover.icon } },
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
  // A name draws the set's glyph. An element, a language's flag, is drawn in
  // its place inside a span hidden from assistive technology, so the button's
  // name stays its only name whatever the element carries, KN-478.
  const mark =
    typeof icon === 'string' ? (
      <Icon name={icon} size={iconSize} color="inherit" />
    ) : (
      <Box component="span" aria-hidden sx={{ display: 'inline-flex' }}>
        {icon}
      </Box>
    )

  // Two calls rather than one with an href spread in: MUI types the anchor form
  // as its own overload, taking a REQUIRED href, so a shape whose href is
  // merely optional matches neither, KN-447. Narrowing here is also what gives
  // each form the ref and the handlers for the element it actually renders.
  //
  // What a Tooltip or a caller hands on goes last, KN-448, so nothing the button
  // sets of its own can replace the focus, pointer and touch handlers and the
  // description a Tooltip gives it, which MUI has already composed with the
  // caller's, or the state an opener gives it. A handler of the button's own under
  // one of those names would be dropped whenever one is given, so it is composed
  // with the forwarded one, never set beside it.
  if (props.href === undefined) {
    const { ref, disabled = false, ...rest } = props
    return (
      <MuiIconButton ref={ref} {...shared} disabled={disabled} {...forwarded(rest)}>
        {mark}
      </MuiIconButton>
    )
  }
  const { ref, href, ...rest } = props
  return (
    <MuiIconButton ref={ref} {...shared} href={href} {...forwarded(rest)}>
      {mark}
    </MuiIconButton>
  )
}
