import { useLingui } from '@lingui/react'
import { Box, ButtonBase, InputBase } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Icon } from '../icon'

// The props are documented in story-docs, not here, KN-207.
export interface SearchBarProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
}

// How long typing must pause before the search runs. The file draws no timing
// for it; this is short enough to feel live and long enough that a word is not
// searched letter by letter.
export const DEBOUNCE_MS = 300

// Node 155:92's edge, one pixel, and the Focus state's, two; stroke weights
// bind no variable, so they are component constants, drawn inside on a
// pseudo-element so the text sits 16 from the edge in every state, KN-266.
const EDGE = 1
const FOCUS_EDGE = 2

// The bar's 44 and the clear control's 20 square are sizes node 155:92 fixes
// without a variable, so they are component constants, as the Tooltip's width
// is.
const HEIGHT = 44
const CLEAR = 20

// The Search Bar of node 155:92: the search icon at the inline start, the
// field, and in the Filled state a clear control at the inline end. Typing is
// reported at once through onChange, and to onSearch once it pauses, with the
// value as it stands after the last keystroke; clearing searches at once and
// puts focus back in the field.
export const SearchBar = ({ value, defaultValue = '', onChange, onSearch }: SearchBarProps) => {
  const { i18n } = useLingui()
  const [own, setOwn] = useState(defaultValue)
  const text = value ?? own
  const field = useRef<HTMLInputElement | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // A pending search does not outlive the bar.
  useEffect(
    () => () => {
      clearTimeout(timer.current)
    },
    [],
  )

  const change = (next: string) => {
    setOwn(next)
    onChange?.(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onSearch?.(next), DEBOUNCE_MS)
  }

  const clear = () => {
    clearTimeout(timer.current)
    setOwn('')
    onChange?.('')
    onSearch?.('')
    field.current?.focus()
  }

  return (
    <Box
      sx={(theme) => {
        const colour = theme.karnama.semantic
        return {
          display: 'flex',
          alignItems: 'center',
          gap: `${spacing.xs}px`,
          boxSizing: 'border-box',
          width: '100%',
          height: HEIGHT,
          paddingInline: `${spacing.md}px`,
          position: 'relative',
          borderRadius: `${theme.karnama.radius.md}px`,
          backgroundColor: colour['bg/surface'],
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
          // Focus, 155:89: two pixels of border/focus, while the field has it.
          '&:focus-within::before': { borderWidth: FOCUS_EDGE, borderColor: colour['border/focus'] },
        }
      }}
    >
      <Icon name="search" size="md" />
      <InputBase
        inputRef={field}
        type="search"
        value={text}
        onChange={(event) => {
          change(event.target.value)
        }}
        placeholder={i18n._('Search in title, company or note')}
        inputProps={{ 'aria-label': i18n._('Search job opportunities') }}
        sx={(theme) => ({
          flex: 1,
          minWidth: 0,
          fontSize: `${typeScale.body.size}px`,
          lineHeight: `${typeScale.body.lineHeight}px`,
          color: theme.karnama.semantic['text/primary'],
          '& input': {
            padding: 0,
            height: 'auto',
            // The browser's own clear button would sit beside the file's.
            '&::-webkit-search-cancel-button': { appearance: 'none' },
            '&::placeholder': { color: theme.karnama.semantic['text/secondary'], opacity: 1 },
          },
        })}
      />
      {text === '' ? null : (
        // Clear, 401:441: a 20 square holding the 16 x, at the inline end.
        <ButtonBase
          aria-label={i18n._('Clear search')}
          disableRipple
          onClick={clear}
          sx={(theme) => ({
            width: CLEAR,
            height: CLEAR,
            flexShrink: 0,
            borderRadius: `${theme.karnama.radius.sm}px`,
            color: theme.karnama.semantic['text/secondary'],
            '&.Mui-focusVisible': { outlineWidth: FOCUS_EDGE, outlineStyle: 'solid', outlineColor: theme.karnama.semantic['border/focus'], outlineOffset: FOCUS_EDGE },
          })}
        >
          <Icon name="x" size="sm" color="inherit" />
        </ButtonBase>
      )}
    </Box>
  )
}
