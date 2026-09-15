import { Box } from '@mui/material'
import { useId, useState, type ChangeEvent, type InputHTMLAttributes, type MouseEvent, type SyntheticEvent } from 'react'
import { usePreferences } from '../../core/preferences'
import { latinDigits } from '../../i18n/digits'
import { formatCount } from '../../i18n/formatCount'
import { spacing, type as typeScale } from '../../theme/tokens'
import { isBlank } from '../input'

// The props are documented in story-docs, not here, KN-207.
export interface CodeInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  enterKeyHint?: InputHTMLAttributes<HTMLInputElement>['enterKeyHint']
}

// Node 407:6981's Code Row: five boxes, each 56 tall, 8 apart.
const LENGTH = 5
const BOX_HEIGHT = 56
// A digit's line, the file's 32, bound to no text style.
const DIGIT_LINE = 32
// Every box's edge is one pixel, and the current box's two, drawn inside.
const EDGE = 1
const FOCUS_EDGE = 2
// The field's own text, never seen: 16, so no phone zooms into it.
const FIELD_TEXT = 16

// A code typed, pasted or filled in, as its digits: Persian and Arabic-Indic ones
// read as Latin, anything else dropped, and the first five kept.
const digitsOf = (text: string) => latinDigits(text).replace(/\D/g, '').slice(0, LENGTH)

// The Code Row of the Auth Code frames, 407:6981 and 407:7052, KN-586: five boxes
// drawn over one real field. Typing, pasting, a phone's autofill and Backspace are
// the field's own, and a screen reader meets that field alone; the boxes are drawn
// for the eye and hidden from it. The file draws no label, so the field is named by
// `label`, and no error, which takes the Input's line.
export const CodeInput = ({ label, value, onChange, error: given, enterKeyHint }: CodeInputProps) => {
  const { locale } = usePreferences()
  const id = useId()
  // An element id, never shown.
  // eslint-disable-next-line lingui/no-unlocalized-strings -- KN-214
  const messageId = `${id}-message`
  // A blank error is no error, the Input's rule, KN-254.
  const error = given === undefined || isBlank(given) ? undefined : given
  const [focused, setFocused] = useState(false)
  // Where the caret is, which is the box the next digit goes in.
  const [caret, setCaret] = useState(0)
  const current = Math.min(caret, LENGTH - 1)

  const change = (event: ChangeEvent<HTMLInputElement>) => {
    const field = event.currentTarget
    const typed = field.value
    const next = digitsOf(typed)
    // A change kept as it came leaves the caret where the browser put it; one that
    // had to be filtered or cut puts it after the last digit kept.
    const at = next === typed ? Number(field.selectionStart) : next.length
    if (next !== typed) {
      field.value = next
      field.setSelectionRange(at, at)
    }
    setCaret(at)
    onChange(next)
  }

  // A press on a box puts the caret at that box, at most after the last digit: the
  // field's own text is transparent and does not sit under the boxes. A press that
  // selected something, a double press, keeps its selection.
  const press = (event: MouseEvent<HTMLInputElement>) => {
    const field = event.currentTarget
    if (field.selectionStart !== field.selectionEnd) return
    // The field lies over the whole row, so its box is the row's.
    const row = field.getBoundingClientRect()
    const share = (row.width + spacing.xs) / LENGTH
    const at = Math.min(Math.max(Math.floor((event.clientX - row.left) / share), 0), LENGTH - 1, value.length)
    field.setSelectionRange(at, at)
    setCaret(at)
  }

  // The caret as the field has it, after a selection change or on focus.
  const follow = (event: SyntheticEvent<HTMLInputElement>) => {
    setCaret(Number(event.currentTarget.selectionStart))
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* The code runs left to right whatever the page does, as the file's Persian
          frame draws it, the first digit in the leftmost box, KN-458. */}
      <Box dir="ltr" sx={{ position: 'relative' }}>
        <Box aria-hidden sx={{ display: 'flex', gap: `${spacing.xs}px` }}>
          {Array.from({ length: LENGTH }, (_, at) => {
            const digit = value.charAt(at)
            const isCurrent = focused && at === current
            return (
              <Box
                key={at}
                sx={(theme) => ({
                  position: 'relative',
                  flex: '1 1 0',
                  minWidth: 0,
                  height: BOX_HEIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  borderRadius: `${theme.karnama.radius.md}px`,
                  backgroundColor: theme.karnama.semantic['bg/surface'],
                  color: theme.karnama.semantic['text/primary'],
                  fontSize: `${typeScale['heading/m'].size}px`,
                  fontWeight: typeScale['heading/m'].weight,
                  lineHeight: `${DIGIT_LINE}px`,
                  // The edge, drawn inside and taking no room, DESIGN.md's rule for
                  // a stroke: two of border/focus on the current box while the field
                  // has focus, else one of border/error in error or of border/default.
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    borderStyle: 'solid',
                    borderWidth: isCurrent ? FOCUS_EDGE : EDGE,
                    borderColor: isCurrent
                      ? theme.karnama.semantic['border/focus']
                      : error === undefined
                        ? theme.karnama.semantic['border/default']
                        : theme.karnama.semantic['border/error'],
                    pointerEvents: 'none',
                  },
                })}
              >
                {digit === '' ? null : formatCount(locale, Number(digit))}
              </Box>
            )
          })}
        </Box>
        <Box
          component="input"
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          {...(enterKeyHint === undefined ? {} : { enterKeyHint })}
          aria-label={label}
          aria-invalid={error === undefined ? undefined : true}
          aria-describedby={error === undefined ? undefined : messageId}
          value={value}
          onChange={change}
          onSelect={follow}
          onFocus={(event: SyntheticEvent<HTMLInputElement>) => {
            setFocused(true)
            follow(event)
          }}
          onBlur={() => {
            setFocused(false)
          }}
          onClick={press}
          // Over the whole row and drawing nothing: its text, caret and selection
          // transparent, and the paint Chromium gives an autofilled field kept off.
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            margin: 0,
            padding: 0,
            border: 0,
            outline: 'none',
            backgroundColor: 'transparent',
            color: 'transparent',
            caretColor: 'transparent',
            fontFamily: 'inherit',
            fontSize: `${FIELD_TEXT}px`,
            cursor: 'text',
            '&::selection': { color: 'transparent', backgroundColor: 'transparent' },
            '&:-webkit-autofill': { WebkitTextFillColor: 'transparent', transition: 'background-color 100000s 0s' },
          }}
        />
      </Box>
      {/* The Input's own line, KN-286 and KN-287: 4 below the row and 14 on 22 in
          text/error while there is an error, and around an alert that stays in the
          page, empty until then, so an error appearing is announced. */}
      <Box
        id={messageId}
        sx={(theme) => ({
          marginTop: error === undefined ? 0 : `${spacing['2xs']}px`,
          fontSize: `${typeScale.body.size}px`,
          lineHeight: `${typeScale.body.lineHeight}px`,
          fontWeight: typeScale.body.weight,
          color: theme.karnama.semantic['text/error'],
        })}
      >
        <span role="alert">{error}</span>
      </Box>
    </Box>
  )
}
