import { Box, InputBase } from '@mui/material'
import { useId, type ChangeEvent } from 'react'
import { spacing, type as typeScale } from '../../theme/tokens'

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
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void
}

// Node 95:38: the field is 44 tall, the same as Button M. No variable is bound.
const FIELD_HEIGHT = 44

const { label: labelText, body } = typeScale

// Node 95:38, six states. The label is bound to the field for screen readers,
// the helper or error line describes it, and that line always keeps its height,
// so an error appearing never moves the field. It fills its container: the
// 240 in the file is the specimen's width, not the field's.
export const Input = ({ label, helperText, error: given, disabled = false, onChange, ...field }: InputProps) => {
  const id = useId()
  const messageId = `${id}-message`
  // A blank error is no error: a form that clears one to '' rather than to
  // undefined leaves the field valid, with its helper under it, KN-254.
  const error = given === undefined || given.trim() === '' ? undefined : given
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
        sx={(theme) => {
          const colour = theme.karnama.semantic
          const edge = error === undefined ? colour['border/default'] : colour['border/error']
          return {
            height: FIELD_HEIGHT,
            boxSizing: 'border-box',
            paddingInline: `${spacing.md}px`,
            borderRadius: `${theme.karnama.radius.md}px`,
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: edge,
            backgroundColor: colour['bg/surface'],
            color: colour['text/primary'],
            fontSize: `${body.size}px`,
            lineHeight: `${body.lineHeight}px`,
            fontWeight: body.weight,
            '& input': { padding: 0, height: 'auto' },
            '& input::placeholder': { color: colour['text/secondary'], opacity: 1 },
            // The file's Hover border is text/secondary, a deliberate reuse. Not
            // while focused, disabled or in error: those borders say more.
            ...(error === undefined ? { '&:hover:not(.Mui-focused):not(.Mui-disabled)': { borderColor: colour['text/secondary'] } } : {}),
            // Two wide, one less padding, so the text does not move a pixel when
            // the field takes focus. In error the ring stays the error colour.
            '&.Mui-focused': {
              borderWidth: 2,
              borderColor: error === undefined ? colour['border/focus'] : colour['border/error'],
              paddingInline: `${spacing.md - 1}px`,
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
