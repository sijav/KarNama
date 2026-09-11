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
  multiline?: boolean
  required?: boolean
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

// Node 95:38: the field is 44 tall, the same as Button M. No variable is bound.
const FIELD_HEIGHT = 44
// The add modal's paste field, node 166:69, the one field of several lines: 140
// tall, its text 16 from every edge, KN-029.
const MULTILINE_HEIGHT = 140

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
// and the helper or error line describes it. That line is drawn only when there
// is something to say, as the screens draw it: the Input is 64 tall without
// one and 90 with one, and an error appearing adds it, the owner's decision of
// KN-285, KN-287. It fills its container: the 240 in the file is the
// specimen's width, not the field's.
export const Input = ({
  label,
  helperText,
  error: given,
  disabled = false,
  multiline = false,
  required = false,
  onChange,
  leadingIcon,
  trailingIcon,
  ...field
}: InputProps) => {
  const id = useId()
  const messageId = `${id}-message`
  // A blank error is no error: a form that clears one to '' rather than to
  // undefined leaves the field valid, with its helper under it, KN-254.
  const error = given === undefined || isBlank(given) ? undefined : given
  // And a blank helper is no helper: it draws no line and describes nothing,
  // KN-287.
  const helper = helperText === undefined || isBlank(helperText) ? undefined : helperText
  const message = error ?? helper
  return (
    // No gap on the column: a gap is laid before an empty line too, and the
    // line must take no room when it has nothing to say. The label keeps its 4
    // below, and the line takes its 4 above only when it speaks, KN-287.
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box
        component="label"
        htmlFor={id}
        sx={(theme) => ({
          marginBottom: `${spacing['2xs']}px`,
          fontSize: `${labelText.size}px`,
          lineHeight: `${labelText.lineHeight}px`,
          fontWeight: labelText.weight,
          letterSpacing: `${labelText.letterSpacing}px`,
          color: theme.karnama.semantic['text/primary'],
        })}
      >
        {label}
        {/* A required field's mark, the owner's KN-075: seen after the label in
            text/error, and said by the field's own aria-required, not read out
            as a star. */}
        {required ? (
          <Box component="span" aria-hidden sx={(theme) => ({ marginInlineStart: `${spacing['2xs']}px`, color: theme.karnama.semantic['text/error'] })}>
            *
          </Box>
        ) : null}
      </Box>
      <InputBase
        id={id}
        disabled={disabled}
        // value, defaultValue, placeholder and name pass straight through.
        {...field}
        {...(multiline ? { multiline: true, rows: 1 } : {})}
        {...(onChange === undefined
          ? {}
          : {
              onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                onChange(event.target.value, event)
              },
            })}
        inputProps={{
          'aria-describedby': message === undefined ? undefined : messageId,
          'aria-invalid': error === undefined ? undefined : true,
          'aria-required': required ? true : undefined,
        }}
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
            height: multiline ? MULTILINE_HEIGHT : FIELD_HEIGHT,
            boxSizing: 'border-box',
            paddingInline: `${spacing.md}px`,
            // Several lines start at the top, 16 down, and scroll in the field.
            ...(multiline
              ? {
                  alignItems: 'flex-start',
                  paddingBlock: `${spacing.md}px`,
                  '& textarea': { padding: 0, height: '100%', overflowY: 'auto', resize: 'none' },
                  '& textarea::placeholder': { color: colour['text/secondary'], opacity: 1 },
                }
              : {}),
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
          // One 22 line under 4 while there is something to say; with nothing,
          // only the empty alert span, no room at all, and nothing here may
          // give it any: no padding, border or minimum height, KN-287.
          marginTop: message === undefined ? 0 : `${spacing['2xs']}px`,
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
        {/* The error is announced as it appears, to someone still typing in
            the field: a changed description is not read while focus stays, so
            the error goes into a live region, in the page from the first
            render and empty until then, WCAG 4.1.3, KN-286. role alert is
            already assertive and atomic, so it takes no aria-live. When the
            line has nothing to say it collapses to nothing around this span,
            which stays mounted and exposed, never hidden, or the next error
            would land in a region that was not there, KN-287. */}
        <span role="alert">{error}</span>
        {error === undefined ? helper : null}
      </Box>
    </Box>
  )
}
