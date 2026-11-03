import { Box, ButtonBase, Slide, Snackbar, useMediaQuery, type SlideProps } from '@mui/material'
import { useEffect, useState } from 'react'
import { spacing, unstyledText } from '../../theme/tokens'
import { SIDEBAR_WIDTH, TAB_BAR_HEIGHT } from '../navigation'

// The props are documented in story-docs, not here, KN-207.
export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastProps {
  open: boolean
  message: string
  action?: ToastAction
  onClose: () => void
}

// The handoff's times, DESIGN-HANDOFF.md's motion and accessibility section: a
// message with a button stays 5 seconds and one without, «تغییرات ذخیره شد», 3,
// and it comes in over 250. The pill's radius of 12 binds no variable, 717:12416.
const WITH_ACTION_MS = 5000
const ALONE_MS = 3000
const SLIDE_MS = 250
const RADIUS = 12
// The action's keyboard outline, two of its own colour at an offset of two, as
// the product draws focus round a small control, KN-244: on a pill that is dark
// in light and light in dark, its own colour is the one that reads on both.
const FOCUS_OUTLINE = 2
// How long the status region stays empty before the message is written into
// it, so a screen reader reads it as a change, KN-326.
const SPEAK_AFTER_MS = 100

const message = unstyledText.toastMessage
const actionText = unstyledText.toastAction

// It comes up from the foot of the page.
const SlideUp = (props: SlideProps) => <Slide {...props} direction="up" />

// The message at the foot of the page, the frames' Toast, 717:12416 and its
// copies in 1062:54408, with Toast / Action, 956:3193: a pill of text/primary
// hugging its message, 13 on 20 at Regular in bg/surface, and its action, 13
// on 20 at SemiBold in text/brand-inverse, underlined on hover, 16 after it;
// 12 above and below, 16 at the sides, radius 12 and its own shadow,
// elevation.toast. It sits 24 above the foot of the page, centred over the
// page beside the sidebar, and over the tab bar on a phone; it comes up from
// below, at once for a reader who asks for less motion. MUI's Snackbar keeps
// it for 5 seconds with an action and 3 without, holding while the pointer or
// focus is on it, and closes it on Escape; a press elsewhere leaves it. A press
// on the action closes it and hands it over. Its message is spoken from a
// status region that stays in the page, written 100 after it opens, so the
// pill's own copy is hidden from a screen reader and the action is named with
// it.
export const Toast = ({ open, message: words, action, onClose }: ToastProps) => {
  const still = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [written, setWritten] = useState<string | null>(null)
  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => {
      setWritten(words)
    }, SPEAK_AFTER_MS)
    return () => {
      window.clearTimeout(timer)
    }
  }, [open, words])
  return (
    <>
      {/* The message out of sight, for a screen reader. */}
      <Box
        role="status"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          margin: -1,
          padding: 0,
          border: 0,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
        }}
      >
        {open && written === words ? words : ''}
      </Box>
      <Snackbar
        open={open}
        autoHideDuration={action === undefined ? ALONE_MS : WITH_ACTION_MS}
        onClose={(_, reason) => {
          if (reason !== 'clickaway') onClose()
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slots={{ transition: SlideUp }}
        transitionDuration={still ? 0 : SLIDE_MS}
        sx={(theme) => ({
          // A row across the page with the pill centred in it, over the tab bar
          // on a phone and over the page beside the sidebar on a desktop: left
          // and right are the sidebar's sides in Persian, which the RTL pipeline
          // turns round.
          left: 0,
          right: 0,
          transform: 'none',
          bottom: `calc(${TAB_BAR_HEIGHT + spacing.lg}px + env(safe-area-inset-bottom))`,
          paddingInline: `${spacing.md}px`,
          pointerEvents: 'none',
          [theme.breakpoints.up('md')]: { left: SIDEBAR_WIDTH, right: 0, transform: 'none', bottom: `${spacing.lg}px` },
        })}
      >
        <Box
          sx={(theme) => ({
            pointerEvents: 'auto',
            boxSizing: 'border-box',
            maxWidth: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: `${spacing.md}px`,
            paddingBlock: `${spacing.sm}px`,
            paddingInline: `${spacing.md}px`,
            borderRadius: `${RADIUS}px`,
            backgroundColor: theme.karnama.semantic['text/primary'],
            boxShadow: theme.karnama.elevation.toast,
          })}
        >
          <Box
            component="span"
            aria-hidden
            sx={(theme) => ({
              minWidth: 0,
              fontSize: `${message.size}px`,
              lineHeight: `${message.lineHeight}px`,
              fontWeight: message.weight,
              letterSpacing: `${message.letterSpacing}px`,
              color: theme.karnama.semantic['bg/surface'],
            })}
          >
            {words}
          </Box>
          {action === undefined ? null : (
            <ButtonBase
              disableRipple
              aria-label={`${action.label}: ${words}`}
              onClick={() => {
                onClose()
                action.onClick()
              }}
              sx={(theme) => ({
                flexShrink: 0,
                fontSize: `${actionText.size}px`,
                lineHeight: `${actionText.lineHeight}px`,
                fontWeight: actionText.weight,
                letterSpacing: `${actionText.letterSpacing}px`,
                color: theme.karnama.semantic['text/brand-inverse'],
                whiteSpace: 'nowrap',
                // Hover, 956:3191: the label underlined.
                '@media (hover: hover)': { '&:hover': { textDecoration: 'underline' } },
                '&.Mui-focusVisible': { outlineStyle: 'solid', outlineWidth: FOCUS_OUTLINE, outlineColor: 'currentColor', outlineOffset: FOCUS_OUTLINE },
              })}
            >
              {action.label}
            </ButtonBase>
          )}
        </Box>
      </Snackbar>
    </>
  )
}
