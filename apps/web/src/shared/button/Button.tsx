import { Button as MuiButton } from '@mui/material'
import type { ReactNode } from 'react'
import { spacing, type as typeScale, type semantic } from '../../theme/tokens'
import { Icon, type IconName } from '../icon'

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'destructive' | 'ghost'
export type ButtonSize = 'S' | 'M' | 'L'
export type ButtonType = 'button' | 'submit'

// The props are documented in story-docs, not here, KN-207.
export interface ButtonProps {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  startIcon?: IconName
  endIcon?: IconName
  type?: ButtonType
  /** The id of the form this submits, for an action that sits outside it. */
  form?: string
  autoFocus?: boolean
  onClick?: () => void
}

type Role = keyof typeof semantic

// Node 31:4's three sizes. The heights, 36, 44 and 52, bind no variable, so
// they are component constants; the padding, the gap, the text role and the
// icon size are the file's tokens.
const SIZES = {
  S: { height: 36, padding: spacing.sm, gap: spacing['2xs'], text: typeScale.body, icon: 'sm' },
  M: { height: 44, padding: spacing.md, gap: spacing.xs, text: typeScale.body, icon: 'md' },
  L: { height: 52, padding: spacing.lg, gap: spacing.xs, text: typeScale.title, icon: 'base' },
} as const

// What each of node 31:4's five styles draws in each state: the fill, the text
// and icon colour, and the edge. A null fill is none.
interface Look {
  rest: { fill: Role | null; text: Role }
  hover: { fill: Role; text: Role }
  pressed: { fill: Role; text: Role }
  disabled: { fill: Role | null; text: Role }
  // Secondary alone has an edge at rest, one pixel of border/default inside,
  // and draws its focus inside by turning it into two of border/focus; the
  // others draw two of border/focus outside.
  edge: boolean
}

// Exported for the theme's contrast test, which reads every text and fill the
// Button pairs from here rather than from a list of its own, KN-108.
export const LOOKS: Record<ButtonVariant, Look> = {
  primary: {
    rest: { fill: 'bg/brand/default', text: 'text/on-accent' },
    hover: { fill: 'bg/brand/hover', text: 'text/on-accent' },
    pressed: { fill: 'accent/700', text: 'text/on-accent' },
    disabled: { fill: 'gray/200', text: 'text/disabled' },
    edge: false,
  },
  secondary: {
    rest: { fill: null, text: 'text/brand' },
    hover: { fill: 'bg/brand/container', text: 'text/brand' },
    pressed: { fill: 'accent/200', text: 'text/brand' },
    disabled: { fill: null, text: 'text/disabled' },
    edge: true,
  },
  text: {
    rest: { fill: null, text: 'text/brand' },
    hover: { fill: 'bg/brand/container', text: 'text/brand' },
    pressed: { fill: 'accent/200', text: 'text/brand' },
    disabled: { fill: null, text: 'text/disabled' },
    edge: false,
  },
  destructive: {
    rest: { fill: 'bg/danger/default', text: 'text/on-accent' },
    hover: { fill: 'bg/danger/hover', text: 'text/on-accent' },
    pressed: { fill: 'red/700', text: 'text/on-accent' },
    disabled: { fill: 'gray/200', text: 'text/disabled' },
    edge: false,
  },
  ghost: {
    rest: { fill: null, text: 'text/secondary' },
    hover: { fill: 'bg/surface-secondary', text: 'text/primary' },
    pressed: { fill: 'bg/surface-secondary', text: 'text/primary' },
    disabled: { fill: null, text: 'text/disabled' },
    edge: false,
  },
}

// Ghost's pressed state is its hover at 0.9 of its opacity, node 33:58's
// Ghost Pressed; the edges are the file's stroke weights, which bind no
// variable.
const GHOST_PRESSED_OPACITY = 0.9
const EDGE = 1
const FOCUS_EDGE = 2

// The Button of node 31:4: five styles in three sizes, at rest, hovered,
// pressed, disabled and focused, on MUI's Button restyled to the file. The
// label arrives translated from the caller.
export const Button = ({
  children,
  variant = 'primary',
  size = 'M',
  disabled = false,
  startIcon,
  endIcon,
  type = 'button',
  form,
  autoFocus = false,
  onClick,
}: ButtonProps) => {
  const measure = SIZES[size]
  const look = LOOKS[variant]
  return (
    <MuiButton
      type={type}
      {...(form === undefined ? {} : { form })}
      disabled={disabled}
      autoFocus={autoFocus}
      disableRipple
      disableElevation
      onClick={onClick}
      startIcon={startIcon === undefined ? undefined : <Icon name={startIcon} size={measure.icon} color="inherit" />}
      endIcon={endIcon === undefined ? undefined : <Icon name={endIcon} size={measure.icon} color="inherit" />}
      sx={(theme) => {
        const colour = theme.karnama.semantic
        const fill = (role: Role | null) => (role === null ? 'transparent' : colour[role])
        return {
          position: 'relative',
          boxSizing: 'border-box',
          minWidth: 0,
          height: measure.height,
          paddingBlock: 0,
          paddingInline: `${measure.padding}px`,
          gap: `${measure.gap}px`,
          borderRadius: `${theme.karnama.radius.md}px`,
          textTransform: 'none',
          fontSize: `${measure.text.size}px`,
          lineHeight: `${measure.text.lineHeight}px`,
          fontWeight: measure.text.weight,
          letterSpacing: 0,
          boxShadow: 'none',
          backgroundColor: fill(look.rest.fill),
          color: colour[look.rest.text],
          // MUI's icon slots carry their own margins; the gap spaces them here.
          '& .MuiButton-startIcon, & .MuiButton-endIcon': { margin: 0 },
          ...(look.edge
            ? {
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'inherit',
                  borderStyle: 'solid',
                  borderWidth: EDGE,
                  borderColor: colour['border/default'],
                  pointerEvents: 'none',
                },
              }
            : {}),
          // Each transient state is drawn by the browser's own pseudo-class AND
          // by a `data-state` attribute that says the same thing, KN-316.
          // Nothing in the product sets that attribute and it is not a prop: it
          // exists so the one place these states can be REVIEWED, Storybook,
          // can show them without a pointer, which the published Storybook has
          // none of. The real pseudo-classes are gated on its absence, so a
          // pointer crossing a forced cell cannot add a second state on top and
          // draw something the file never draws.
          '&:hover:not([data-state]), &[data-state="hover"]': {
            backgroundColor: fill(look.hover.fill),
            color: colour[look.hover.text],
            boxShadow: 'none',
          },
          '&:active:not([data-state]), &[data-state="pressed"]': {
            backgroundColor: fill(look.pressed.fill),
            color: colour[look.pressed.text],
            ...(variant === 'ghost' ? { opacity: GHOST_PRESSED_OPACITY } : {}),
          },
          '&.Mui-disabled': { backgroundColor: fill(look.disabled.fill), color: colour[look.disabled.text] },
          // Focus as the file draws it: two pixels of border/focus, inside in
          // place of Secondary's edge, outside every other style.
          '&.Mui-focusVisible:not([data-state]), &[data-state="focus"]': look.edge
            ? { '&::before': { borderWidth: FOCUS_EDGE, borderColor: colour['border/focus'] } }
            : { outlineWidth: FOCUS_EDGE, outlineStyle: 'solid', outlineColor: colour['border/focus'], outlineOffset: 0 },
        }
      }}
    >
      {children}
    </MuiButton>
  )
}
