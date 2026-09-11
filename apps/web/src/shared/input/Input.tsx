import { Box, InputBase } from '@mui/material'
import { useId, type ChangeEvent, type ReactNode } from 'react'
import { iconSize, spacing, type as typeScale } from '../../theme/tokens'
import { isBlank } from './blank'

// The props are documented in story-docs, not here, KN-207.
export interface InputProps {
  label: string
  value?: string
  defaultValue?: string
  placeholder?: string
  helperText?: string
  error?: string
  disabled?: boolean
  name?: string
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void
}

// Node 95:38: the field is 44 tall, the same as Button M. No variable is bound.
const FIELD_HEIGHT = 44

// The focus ring on an invalid field, KN-244, drawn inside the field rather
// than round it, so a host that clips its overflow at the field's edge cannot
// take it, KN-274: two pixels of border/focus, four in from the edge, which is
// the focused edge's two and a gap of two, the gap the ring had outside.
const RING_INSET = 4
const RING_WIDTH = 2

const { label: labelText, body } = typeScale

// Node 95:38's icon slots, off unless given: 20 by 20, text/secondary through
// currentColor, at the inline start and end, KN-267. Not hidden here: a
// decorative icon hides itself, and a slot is not a button.
const Slot = ({ children }: { children: ReactNode }) => (
  <Box
    component="span"
    sx={(theme) => ({
      display: 'inline-flex',
      flexShrink: 0,
      width: iconSize.md,
      height: iconSize.md,
      color: theme.karnama.semantic['text/secondary'],
      '& > svg': { width: '100%', height: '100%' },
      // A child that rendered nothing, an empty fragment or an icon that
      // returned null, leaves the slot empty: then it is no slot, KN-291.
      '&:empty': { display: 'none' },
    })}
  >
    {children}
  </Box>
)

// Whether a node draws anything: React renders nothing for undefined, null or
// a boolean, so `hasIcon && <Icon />` turning an icon off draws no slot rather
// than an empty 20 by 20 one, KN-291. And a string gives nothing to see when
// the Input's own blank rule holds for it, the empty string, spaces or a
// zero-width character, KN-254, KN-292. A number draws, as React draws it.
const drawn = (node: ReactNode) => node !== undefined && node !== null && typeof node !== 'boolean' && !(typeof node === 'string' && isBlank(node))

// Node 95:38, six states. The label is bound to the field for screen readers,
// the helper or error line describes it, and that line always keeps its height,
// so an error appearing never moves the field. It fills its container: the
// 240 in the file is the specimen's width, not the field's.
export const Input = ({ label, helperText, error: given, disabled = false, onChange, leadingIcon, trailingIcon, ...field }: InputProps) => {
  const id = useId()
  const messageId = `${id}-message`
  // A blank error is no error: a form that clears one to '' rather than to
  // undefined leaves the field valid, with its helper under it, KN-254.
  const error = given === undefined || isBlank(given) ? undefined : given
  const message = error ?? helperText
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing['2xs']}px` }}>
      <Box
        component="label"
        htmlFor={id}
        sx={(theme) => ({
          fontSize: `${labelText.size}px`,
          lineHeight: `${labelText.lineHeight}px`,
          fontWeight: labelText.weight,
          letterSpacing: `${labelText.letterSpacing}px`,
          color: theme.karnama.semantic['text/primary'],
        })}
      >
        {label}
      </Box>
      <InputBase
        id={id}
        disabled={disabled}
        // value, defaultValue, placeholder and name pass straight through.
        {...field}
        {...(onChange === undefined ? {} : { onChange: (event: ChangeEvent<HTMLInputElement>) => { onChange(event.target.value, event) } })}
        inputProps={{ 'aria-describedby': message === undefined ? undefined : messageId, 'aria-invalid': error === undefined ? undefined : true }}
        // Direct flex children of the field, before and after the input: the
        // direction puts the leading one at the start, the right in Persian.
        startAdornment={drawn(leadingIcon) ? <Slot>{leadingIcon}</Slot> : undefined}
        endAdornment={drawn(trailingIcon) ? <Slot>{trailingIcon}</Slot> : undefined}
        sx={(theme) => {
          const colour = theme.karnama.semantic
          const edge = error === undefined ? colour['border/default'] : colour['border/error']
          return {
            // The file's stroke is inside the field and takes no space, so the
            // padding is the file's in every state and the text sits spacing/md
            // from the edge, as 95:5 and 95:19 draw it, KN-266.
            position: 'relative',
            height: FIELD_HEIGHT,
            boxSizing: 'border-box',
            paddingInline: `${spacing.md}px`,
            // The file's gap between an icon and the text, spacing/2xs; with no
            // icon the input is the only item and it does nothing, KN-267.
            columnGap: `${spacing['2xs']}px`,
            borderRadius: `${theme.karnama.radius.md}px`,
            backgroundColor: colour['bg/surface'],
            color: colour['text/primary'],
            fontSize: `${body.size}px`,
            lineHeight: `${body.lineHeight}px`,
            fontWeight: body.weight,
            '& input': { padding: 0, height: 'auto' },
            '& input::placeholder': { color: colour['text/secondary'], opacity: 1 },
            // The stroke: a border on a pseudo-element laid over the whole field
            // and painted over its padding. Not a border on the field, which is
            // laid out; not an inset shadow, which Windows' forced colours
            // removes, leaving no edge; and not an outline, which lies outside
            // the field, where a host that clips can take it.
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              borderStyle: 'solid',
              borderWidth: 1,
              borderColor: edge,
              pointerEvents: 'none',
            },
            // The file's Hover border is text/secondary, a deliberate reuse. Not
            // while focused, disabled or in error: those borders say more.
            ...(error === undefined ? { '&:hover:not(.Mui-focused):not(.Mui-disabled)::before': { borderColor: colour['text/secondary'] } } : {}),
            // Two wide on focus, drawn inside like the rest, so the text does not
            // move. In error the border stays the error colour, so the error is
            // in view while it is being fixed; red to red is no change, so a
            // ring shows focus, below, KN-244.
            '&.Mui-focused::before': {
              borderWidth: 2,
              borderColor: error === undefined ? colour['border/focus'] : colour['border/error'],
            },
            '&.Mui-focused': {
              // In error, the ring the Checkbox and the Filter Chip draw, laid
              // inside the field four in from its edge, its curve concentric
              // with the edge's: nothing of it lies outside the field, so no
              // host has to leave it room, KN-274.
              ...(error === undefined
                ? {}
                : {
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      inset: RING_INSET,
                      boxSizing: 'border-box',
                      borderRadius: `${theme.karnama.radius.md - RING_INSET}px`,
                      borderStyle: 'solid',
                      borderWidth: RING_WIDTH,
                      borderColor: colour['border/focus'],
                      pointerEvents: 'none',
                    },
                  }),
            },
            '&.Mui-disabled': { backgroundColor: colour['bg/surface-secondary'] },
            '& input.Mui-disabled': { WebkitTextFillColor: colour['text/disabled'], color: colour['text/disabled'] },
          }
        }}
      />
      <Box
        id={messageId}
        sx={(theme) => ({
          minHeight: `${body.lineHeight}px`,
          fontSize: `${body.size}px`,
          lineHeight: `${body.lineHeight}px`,
          fontWeight: body.weight,
          color:
            error !== undefined
              ? theme.karnama.semantic['text/error']
              : disabled
                ? theme.karnama.semantic['text/disabled']
                : theme.karnama.semantic['text/secondary'],
        })}
      >
        {message}
      </Box>
    </Box>
  )
}
