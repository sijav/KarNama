import { IconButton as MuiIconButton } from '@mui/material'
import { spacing } from '../../theme/tokens'
import { Icon, type IconName } from '../icon'

// The props are documented in story-docs, not here, KN-207.
export interface IconButtonProps {
  icon: IconName
  'aria-label': string
  tone?: 'neutral' | 'danger'
  iconSize?: 'sm' | 'md'
  disabled?: boolean
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
// and a name that is only blank is refused rather than rendered nameless.
export const nameOf = (label: string) => {
  if (label.trim() === '') throw new Error('an icon button needs a name a screen reader can read')
  return label
}

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
  onClick,
}: IconButtonProps) => (
  <MuiIconButton
    aria-label={nameOf(label)}
    disabled={disabled}
    disableRipple
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
