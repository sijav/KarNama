import { Box, Tooltip as MuiTooltip } from '@mui/material'
import { cloneElement, useCallback, useEffect, useId, useRef, type ReactElement, type ReactNode } from 'react'
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

// The props are documented in story-docs, not here, KN-207.
export interface TooltipProps {
  title: string
  icon?: ReactNode
  children: ReactElement<{ 'aria-describedby'?: string }>
}

// Node 410:469, on MUI's Tooltip, which already opens on keyboard focus as well
// as hover, closes on Escape, and keeps the tip on screen.
export const Tooltip = ({ title, icon, children }: TooltipProps) => {
  // The description, present from the first render, KN-231. MUI links the
  // tip only while it is OPEN, and it opens about 100ms after focus, so a
  // screen reader announcing the focused trigger heard no description at
  // all. A hidden copy is still read when something points at it.
  const descriptionId = useId()

  // Whether the tip can attach, checked in every environment and whenever the
  // trigger changes, KN-211 and KN-233. MUI applies the tooltip's OWN ref to the
  // child, so `attach` is called with the trigger's node when the child forwards
  // its ref, and with null when it goes. A missing node is reported only after
  // a short grace, so a trigger that mounts a render late is not a mistake.
  const node = useRef<Element | null>(null)
  const grace = useRef<ReturnType<typeof setTimeout>>(undefined)
  const expectNode = useCallback(() => {
    clearTimeout(grace.current)
    grace.current = setTimeout(() => {
      if (node.current) return
      console.error(
        'Tooltip: its child did not take a ref, so the tip can never open. Pass one element that spreads its props, ref included, onto a DOM element; a Fragment cannot.',
      )
    }, 100)
  }, [])
  const attach = useCallback(
    (element: Element | null) => {
      node.current = element
      if (!element) {
        expectNode()
        return
      }
      // MUI spreads the tooltip's props onto the child together with its ref,
      // so the node that took the ref must carry the description link as well.
      // It does not when the child drops its props, which MUI itself reports
      // only in development, or sets an aria-describedby of its own.
      if (element.getAttribute('aria-describedby')?.split(' ').includes(descriptionId)) return
      console.error(
        'Tooltip: its child took the ref but not the props, so the tip can never open and is not its description. Spread every prop it is given onto the element.',
      )
    },
    [descriptionId, expectNode],
  )
  // The tooltip's description JOINS any the trigger already has, KN-235, on
  // the child itself: MUI spreads the child's own props after the tooltip's,
  // so a link passed through MUI was replaced by the child's, and a trigger
  // with a field hint lost the tip's text and was then reported as broken.
  const own = children.props['aria-describedby']
  const described = cloneElement(children, { 'aria-describedby': own ? `${own} ${descriptionId}` : descriptionId })

  useEffect(() => {
    if (!node.current) expectNode()
    return () => {
      clearTimeout(grace.current)
    }
  }, [expectNode])

  return (
  <>
  <MuiTooltip
    ref={attach}
    // The "does not trap the pointer" clause, and the sx below is not enough
    // on its own: MUI's tooltip is INTERACTIVE by default and sets
    // `pointer-events: auto` itself so you can hover into it. A story
    // asserting the computed value caught that. This turns the behaviour off
    // at the source; the sx keeps it off if MUI's default ever changes.
    disableInteractive
    // DESCRIBE the trigger, never name it, KN-209. MUI's default LABELS its
    // child through aria-labelledby, which outranks the child's own aria-label,
    // so an icon-only "Delete status" button was announced as the tip's
    // paragraph. With this the tip is its description and the trigger keeps
    // its name, which means the trigger must HAVE a name of its own.
    describeChild
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
    {described}
  </MuiTooltip>
  <Box component="span" id={descriptionId} hidden>
    {title}
  </Box>
  </>
  )
}
