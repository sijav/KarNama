import { useLingui } from '@lingui/react'
import { Box, ButtonBase, InputBase } from '@mui/material'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Icon } from '../icon'

/** The desktop toolbar's bar, or the phone's. */
export type SearchBarLayout = 'desktop' | 'mobile'

// The props are documented in story-docs, not here, KN-207.
export interface SearchBarProps {
  value?: string
  defaultValue?: string
  layout?: SearchBarLayout
  label?: string
  placeholder?: string
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

/**
 * The bar's two heights, and the clear control's 20 square: sizes the file
 * fixes without a variable, so they are component constants, as the Tooltip's
 * width is.
 *
 * The component set, node 155:92, draws 320 by 44, and the screens draw the bar
 * SHORTER on the desktop: the board's toolbar instance `241:29` and the
 * contacts' `252:48` are both 320 by 36, in a toolbar that is itself 36, beside
 * a Sort Control of the same height; the phone's, `241:156`, is 358 by 44.
 * Read again from the file for KN-315. Nothing else differs between them: both
 * hold the text 16 from the inline start and the 20 icon 16 from the inline
 * end, centred in whatever height the bar has.
 *
 * The width is the container's, which is what makes both instances right: 320
 * is what the desktop toolbar gives it, 358 is a phone's page inside its own
 * 16 gutters.
 */
const HEIGHT: Record<SearchBarLayout, number> = { desktop: 36, mobile: 44 }
const CLEAR = 20

// The Search Bar of node 155:92: the search icon at the inline start, the
// field, and in the Filled state a clear control at the inline end. Typing is
// reported at once through onChange, and to onSearch once it pauses, with the
// value as it stands after the last keystroke; clearing searches at once and
// puts focus back in the field.
export const SearchBar = ({ value, defaultValue = '', layout = 'mobile', label, placeholder, onChange, onSearch }: SearchBarProps) => {
  const { i18n } = useLingui()
  // What it searches, the board's unless the page says otherwise: the contacts
  // page uses the same bar, and a screen reader there was told it searched job
  // opportunities, KN-430.
  const [own, setOwn] = useState(defaultValue)
  const text = value ?? own
  const field = useRef<HTMLInputElement | null>(null)
  // One attempt by the reader to change the text: what the field showed before it, and whether it
  // was typing or the clear. A fresh object every time, so React always commits one; the marker
  // below is keyed by its identity rather than by a count.
  const [attempt, setAttempt] = useState<{ before: string; kind: 'typed' | 'cleared' } | null>(null)
  // The attempt already judged. A ref rather than state, so marking one cannot itself re-render and
  // restart or cancel the pause.
  const judged = useRef<object | null>(null)
  // The latest onSearch, read when the search RUNS rather than when it was started, and written
  // during commit: a search due between a commit and a passive effect would otherwise call the
  // callback from the render before it, KN-380.
  const search = useRef(onSearch)
  useLayoutEffect(() => {
    search.current = onSearch
  })

  // Each attempt is judged by its own commit, KN-380.
  //
  // KN-314 compared the last typed text with the text shown. That holds for a parent that stores
  // what it is given and fails for the others a controlled bar exists to serve: one that ignores a
  // clear kept a search running for text it had replaced, one that normalises never searched at
  // all, and one that restored a value nobody typed searched for it.
  //
  // The attempt is marked judged BEFORE anything else, so an attempt the parent ignored can never be
  // taken up later by an unrelated change to the text. Any such change re-runs this effect, whose
  // cleanup cancels a pending search and whose early return starts nothing: other changes cancel,
  // and only a reader's own change searches.
  //
  // What this cannot tell apart is written in the story docs rather than here, because it is
  // behaviour a caller meets and the documentation rule puts that in markdown, KN-207.
  useEffect(() => {
    if (!attempt || judged.current === attempt) return
    judged.current = attempt
    if (text === attempt.before) return
    if (attempt.kind === 'cleared') {
      search.current?.(text)
      return
    }
    const timer = setTimeout(() => search.current?.(text), DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
    }
  }, [attempt, text])

  const change = (next: string) => {
    setAttempt({ before: text, kind: 'typed' })
    setOwn(next)
    onChange?.(next)
  }

  const clear = () => {
    setAttempt({ before: text, kind: 'cleared' })
    setOwn('')
    onChange?.('')
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
          height: HEIGHT[layout],
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
        placeholder={placeholder ?? i18n._('Search in title, company or note')}
        inputProps={{ 'aria-label': label ?? i18n._('Search job opportunities') }}
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
