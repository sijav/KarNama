import { useLingui } from '@lingui/react'
import { Box, ButtonBase, ClickAwayListener, InputBase, Menu, MenuItem, Popper, useTheme, type Theme } from '@mui/material'
import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { flushSync } from 'react-dom'
import { usePreferences } from '../../core/preferences'
import { formatCount } from '../../i18n/formatCount'
import { inlineEndOf } from '../../theme/sides'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Button } from '../button'
import { Icon } from '../icon'
import { menuItemLook } from '../menu/itemLook'
import { quoted } from '../quoted'
import { LabelChoice } from './LabelChoice'
import { DEFAULT_LABELS, defaultLabelName, type PersonLabel } from './labels'

// The props are documented in story-docs, not here, KN-207.
export interface LabelPickerProps {
  value: string | null
  labels: readonly PersonLabel[]
  onChange: (id: string | null) => void
  onCreate: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

// Node 1086:3004 binds no variable to these: the suggestions' 240 and the
// option menu's 160; the one and a half of border/focus round an input, an
// inset shadow since Chromium floors a border of 1.5, so the padding takes the
// edge's room; the panels' one pixel edge and radius of 8, radius/md. Its 4 and
// 8 are spacing 2xs and xs, its 12 spacing sm.
const SUGGESTIONS_WIDTH = 240
const MENU_WIDTH = 160
const INPUT_EDGE = 1.5
const EDGE = 1
const OPTION_HEIGHT = 38
// The keyboard's ring, three inside as the Action Chip's, KN-294.
const FOCUS_RING = 3

type Offset = 'offset'
const OFFSET: Offset = 'offset'
// The suggestions hang 4 under the input. Made once: a new array on every render
// made the Popper build its popper.js again each time, whose first placement
// lands a tick later, outside the render that asked for it, KN-804.
const HANG = [{ name: OFFSET, options: { offset: [0, spacing['2xs']] } }]

const body = typeScale.body
const label = typeScale.label

// Words in a type role, under an sx key, which the lint rule reads as CSS.
const words = {
  sx: (role: typeof body | typeof label) => ({
    fontSize: `${role.size}px`,
    lineHeight: `${role.lineHeight}px`,
    fontWeight: role.weight,
    letterSpacing: role.letterSpacing,
  }),
}

// A pill to type in, the new label's and a rename's: bg/surface inside one and
// a half of border/focus at radius 999, 4 above and below and 12 at the sides,
// Body in text/primary.
const pill = {
  sx: (theme: Theme) => ({
    boxSizing: 'border-box',
    paddingBlock: `${spacing['2xs'] + INPUT_EDGE}px`,
    paddingInline: `${spacing.sm + INPUT_EDGE}px`,
    borderRadius: `${theme.karnama.radius.full}px`,
    backgroundColor: theme.karnama.semantic['bg/surface'],
    boxShadow: `inset 0 0 0 ${INPUT_EDGE}px ${theme.karnama.semantic['border/focus']}`,
    color: theme.karnama.semantic['text/primary'],
    ...words.sx(body),
    '& input': { padding: 0, height: `${body.lineHeight}px`, fieldSizing: 'content', minWidth: spacing.lg },
  }),
}

// A 16 glyph's press, «⋯» and a rename's tick, 24 square so a finger finds it,
// with the keyboard's ring.
const tick = {
  sx: (theme: Theme) => ({
    position: 'relative',
    flexShrink: 0,
    width: spacing.lg,
    height: spacing.lg,
    borderRadius: `${theme.karnama.radius.sm}px`,
    '&.Mui-focusVisible::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      borderStyle: 'solid',
      borderWidth: FOCUS_RING,
      borderColor: theme.karnama.semantic['border/focus'],
      pointerEvents: 'none',
    },
  }),
}

// What the suggestions hold, in order: the reader's labels that match, then the
// row that makes what was typed a new one.
type Suggestion = { kind: 'label'; label: PersonLabel } | { kind: 'create'; name: string }

const sameName = (one: string, other: string, locale: string) =>
  one.trim().toLocaleLowerCase(locale) === other.trim().toLocaleLowerCase(locale)

// Label Picker, node 1086:3004, KN-771: the person modal's relationship label,
// optional. «برچسب» over the choices, which wrap 8 apart from the inline start:
// the four defaults, the chosen label when it is the reader's own, then the
// dashed «برچسب تازه». A press chooses a label and another takes it off. «برچسب
// تازه» becomes an input whose suggestions hang 4 under it, 240 wide: the
// reader's labels that match, each with «⋯» for «تغییر نام» and «حذف برچسب», a
// divider, and «ساختن برچسب «…»». It is a combobox: the arrows move through the
// suggestions, Enter chooses or makes one, Escape and a press outside leave it.
// A rename is done in its row with a tick; a delete asks in its row, never a
// modal on the modal, and takes the label off the people who carry it, never
// the people. The four defaults have no «⋯», 1 Aban.
export const LabelPicker = ({ value, labels, onChange, onCreate, onRename, onDelete }: LabelPickerProps) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const end = inlineEndOf(useTheme().direction)
  const titleId = useId()
  const listId = useId()
  const [typing, setTyping] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [input, setInput] = useState<HTMLElement | null>(null)
  const [menu, setMenu] = useState<{ id: string; anchor: HTMLElement } | null>(null)
  const [renaming, setRenaming] = useState<{ id: string; draft: string } | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  // Whether the menu gives focus back to its «⋯» as it closes: not when a rename
  // or a delete takes the row's place, and «⋯» with it.
  const [restoreFocus, setRestoreFocus] = useState(true)
  const addSlot = useRef<HTMLDivElement>(null)
  const confirm = useRef<HTMLDivElement>(null)
  const renameId = useId()

  const chosenOwn = labels.find((own) => own.id === value)
  const typed = query.trim()
  const matches = labels.filter((own) => own.name.toLocaleLowerCase(locale).includes(typed.toLocaleLowerCase(locale)))
  const taken = [...labels.map((own) => own.name), ...DEFAULT_LABELS.map((id) => defaultLabelName(i18n, id))].some((name) =>
    sameName(name, typed, locale),
  )
  const making: Suggestion[] = typed === '' || taken ? [] : [{ kind: 'create', name: typed }]
  const suggestions: Suggestion[] = [...matches.map((own): Suggestion => ({ kind: 'label', label: own })), ...making]
  const current = Math.min(active, suggestions.length - 1)

  // Leaves the new label. When the keyboard leaves it, focus goes back to
  // «برچسب تازه», drawn at once so the press is still the keyboard's own.
  const leave = (byKey: boolean) => {
    const done = () => {
      setTyping(false)
      setQuery('')
      setActive(0)
      setRenaming(null)
      setDeleting(null)
    }
    if (!byKey) {
      done()
      return
    }
    flushSync(done)
    addSlot.current?.querySelector('button')?.focus()
  }
  const act = (suggestion: Suggestion, byKey: boolean) => {
    if (suggestion.kind === 'label') onChange(suggestion.label.id)
    else onCreate(suggestion.name)
    leave(byKey)
  }
  const keyed = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (suggestions.length > 0) setActive((current + (event.key === 'ArrowDown' ? 1 : -1) + suggestions.length) % suggestions.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const suggestion = suggestions[current]
      if (suggestion) act(suggestion, true)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      leave(true)
    }
  }
  // Back to the new label's input once a row's rename or delete is done, drawn
  // at once: the row that held focus is gone, and focus left on the page would
  // be taken back by a modal round the picker, its reader's place lost, KN-804.
  const backToTyping = (done: () => void) => {
    flushSync(done)
    input?.querySelector('input')?.focus()
  }
  const rename = (own: PersonLabel, draft: string) => {
    backToTyping(() => {
      if (draft.trim() !== '' && draft.trim() !== own.name) onRename(own.id, draft.trim())
      setRenaming(null)
    })
  }
  const note = (own: PersonLabel) =>
    own.people === 0
      ? i18n._('No one carries it yet.')
      : `${i18n._('It comes off')} ${formatCount(locale, own.people)} ${new Intl.PluralRules(locale).select(own.people) === 'one' ? i18n._('person.') : i18n._('people.')} ${i18n._('The people themselves stay.')}`

  const row = (suggestion: Suggestion, index: number) => {
    const id = `${listId}-${String(index)}`
    const highlighted = index === current
    if (suggestion.kind === 'label' && renaming?.id === suggestion.label.id) {
      const own = suggestion.label
      return (
        <Box
          key={own.id}
          role="presentation"
          sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px`, padding: `${spacing.xs}px ${spacing.sm}px` }}
        >
          <InputBase
            value={renaming.draft}
            inputProps={{ id: renameId, 'aria-label': i18n._('New name') }}
            onChange={(event) => {
              setRenaming({ id: own.id, draft: event.target.value })
            }}
            onKeyDown={(event) => {
              // Enter keeps the name and nothing else: the person modal's form
              // round the picker would take it for its own save, KN-804.
              if (event.key === 'Enter') {
                event.preventDefault()
                rename(own, renaming.draft)
              }
              if (event.key === 'Escape') {
                event.stopPropagation()
                backToTyping(() => {
                  setRenaming(null)
                })
              }
            }}
            sx={(theme) => ({ ...pill.sx(theme), flexGrow: 1, '& input': { padding: 0, height: `${body.lineHeight}px` } })}
          />
          <ButtonBase
            disableRipple
            aria-label={i18n._('Confirm the new name')}
            onClick={() => {
              rename(own, renaming.draft)
            }}
            sx={(theme) => tick.sx(theme)}
          >
            <Icon name="check" size="sm" color="text/secondary" />
          </ButtonBase>
        </Box>
      )
    }
    if (suggestion.kind === 'label' && deleting === suggestion.label.id) {
      const own = suggestion.label
      return (
        <Box
          key={own.id}
          ref={confirm}
          role="presentation"
          sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.xs}px`, padding: `${spacing.sm}px` }}
        >
          <Box component="span" sx={(theme) => ({ ...words.sx(body), color: theme.karnama.semantic['text/primary'] })}>
            {`${i18n._('Delete the label')} ${quoted(i18n, own.name)}${i18n._('?')}`}
          </Box>
          <Box component="span" sx={(theme) => ({ ...words.sx(label), color: theme.karnama.semantic['text/secondary'] })}>
            {note(own)}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: `${spacing.xs}px` }}>
            <Button
              variant="ghost"
              size="S"
              onClick={() => {
                backToTyping(() => {
                  setDeleting(null)
                })
              }}
            >
              {i18n._('Keep')}
            </Button>
            <Button
              variant="destructive"
              size="S"
              onClick={() => {
                backToTyping(() => {
                  onDelete(own.id)
                  setDeleting(null)
                })
              }}
            >
              {i18n._('Delete')}
            </Button>
          </Box>
        </Box>
      )
    }
    return (
      <Box key={suggestion.kind === 'label' ? suggestion.label.id : id} role="presentation" sx={{ position: 'relative' }}>
        <Box
          id={id}
          role="option"
          aria-selected={highlighted}
          onMouseDown={(event) => {
            // Keeps focus in the input, which the press then leaves.
            event.preventDefault()
          }}
          onMouseEnter={() => {
            setActive(index)
          }}
          onClick={() => {
            act(suggestion, false)
          }}
          sx={(theme) => ({
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: `${spacing.xs}px`,
            height: OPTION_HEIGHT,
            paddingBlock: `${spacing.xs}px`,
            paddingInline: `${spacing.sm}px`,
            cursor: 'pointer',
            backgroundColor: highlighted ? theme.karnama.semantic['bg/surface-secondary'] : 'transparent',
            color: theme.karnama.semantic[suggestion.kind === 'create' ? 'text/brand' : 'text/primary'],
            ...words.sx(body),
          })}
        >
          {suggestion.kind === 'create' ? <Icon name="plus" size="sm" color="inherit" /> : null}
          {suggestion.kind === 'create' ? `${i18n._('Create the label')} ${quoted(i18n, suggestion.name)}` : suggestion.label.name}
        </Box>
        {suggestion.kind === 'label' ? (
          <ButtonBase
            disableRipple
            aria-label={`${i18n._('Manage the label')} ${quoted(i18n, suggestion.label.name)}`}
            aria-haspopup="menu"
            onClick={(event) => {
              setRestoreFocus(true)
              setMenu({ id: suggestion.label.id, anchor: event.currentTarget })
            }}
            sx={(theme) => ({
              ...tick.sx(theme),
              position: 'absolute',
              insetBlockStart: 0,
              insetBlockEnd: 0,
              insetInlineEnd: spacing.sm,
              margin: 'auto',
            })}
          >
            <Icon name="more" size="sm" color="text/secondary" />
          </ButtonBase>
        ) : null}
      </Box>
    )
  }

  const labelsShown = suggestions.filter((suggestion) => suggestion.kind === 'label')
  const create = suggestions.find((suggestion) => suggestion.kind === 'create')
  const open = typing && suggestions.length > 0 && input !== null
  return (
    <ClickAwayListener
      onClickAway={() => {
        if (typing && menu === null) leave(false)
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: `${spacing.xs}px`, width: '100%' }}>
        <Box component="span" id={titleId} sx={(theme) => ({ ...words.sx(label), color: theme.karnama.semantic['text/primary'] })}>
          {i18n._('Label')}
        </Box>
        <Box
          role="group"
          aria-labelledby={titleId}
          sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: `${spacing.xs}px`, width: '100%' }}
        >
          {DEFAULT_LABELS.map((id) => (
            <LabelChoice
              key={id}
              label={defaultLabelName(i18n, id)}
              selected={value === id}
              onClick={() => {
                onChange(value === id ? null : id)
              }}
            />
          ))}
          {chosenOwn === undefined ? null : (
            <LabelChoice
              label={chosenOwn.name}
              selected
              onClick={() => {
                onChange(null)
              }}
            />
          )}
          <Box ref={addSlot} sx={{ display: 'contents' }}>
            {typing ? (
              <InputBase
                ref={setInput}
                autoFocus
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActive(0)
                }}
                onKeyDown={keyed}
                inputProps={{
                  role: 'combobox',
                  'aria-label': i18n._('New label'),
                  'aria-autocomplete': 'list',
                  'aria-expanded': open,
                  'aria-controls': listId,
                  ...(open && suggestions[current] ? { 'aria-activedescendant': `${listId}-${String(current)}` } : {}),
                }}
                sx={(theme) => pill.sx(theme)}
              />
            ) : (
              <LabelChoice
                add
                label={i18n._('New label')}
                onClick={() => {
                  setTyping(true)
                }}
              />
            )}
          </Box>
        </Box>
        <Popper
          open={open}
          anchorEl={input}
          placement="bottom-end"
          disablePortal
          modifiers={HANG}
          sx={(theme) => ({
            zIndex: 1,
            boxSizing: 'border-box',
            width: SUGGESTIONS_WIDTH,
            padding: `${spacing['2xs']}px`,
            borderRadius: `${theme.karnama.radius.md}px`,
            borderStyle: 'solid',
            borderWidth: EDGE,
            borderColor: theme.karnama.semantic['border/default'],
            backgroundColor: theme.karnama.semantic['bg/surface'],
            boxShadow: theme.karnama.elevation.labelSuggestions,
          })}
        >
          <Box id={listId} role="listbox" aria-label={i18n._('Your labels')}>
            {labelsShown.length === 0 ? null : (
              <Box
                role="presentation"
                sx={(theme) => ({
                  ...words.sx(label),
                  paddingBlock: `${spacing['2xs']}px`,
                  paddingInline: `${spacing.sm}px`,
                  color: theme.karnama.semantic['text/secondary'],
                })}
              >
                {i18n._('Your labels')}
              </Box>
            )}
            {labelsShown.map((suggestion, index) => row(suggestion, index))}
            {create === undefined ? null : (
              <>
                {labelsShown.length === 0 ? null : (
                  <Box
                    role="presentation"
                    sx={(theme) => ({ height: `${EDGE}px`, backgroundColor: theme.karnama.semantic['border/default'] })}
                  />
                )}
                {row(create, labelsShown.length)}
              </>
            )}
          </Box>
        </Popper>
        <Menu
          anchorEl={menu?.anchor ?? null}
          open={menu !== null}
          onClose={() => {
            setMenu(null)
          }}
          disableRestoreFocus={!restoreFocus}
          transitionDuration={0}
          anchorOrigin={{ vertical: 'bottom', horizontal: end }}
          transformOrigin={{ vertical: 'top', horizontal: end }}
          slotProps={{
            paper: {
              sx: (theme) => ({
                width: MENU_WIDTH,
                marginTop: `${spacing['2xs']}px`,
                borderRadius: `${theme.karnama.radius.md}px`,
                backgroundColor: theme.karnama.semantic['bg/surface'],
                backgroundImage: 'none',
                boxShadow: theme.karnama.elevation.labelSuggestions,
                outline: `${EDGE}px solid ${theme.karnama.semantic['border/default']}`,
                outlineOffset: `-${EDGE}px`,
              }),
            },
            list: { sx: { padding: `${spacing['2xs']}px` } },
          }}
        >
          <MenuItem
            disableRipple
            onClick={() => {
              const own = labels.find((candidate) => candidate.id === menu?.id)
              // The row becomes its name to edit, drawn at once so focus can go to
              // it, which the menu then does not take back.
              flushSync(() => {
                setRestoreFocus(false)
                setMenu(null)
                if (own) setRenaming({ id: own.id, draft: own.name })
              })
              document.getElementById(renameId)?.focus()
            }}
            sx={(theme) => menuItemLook.sx(theme, { destructive: false, blocked: false })}
          >
            {i18n._('Rename')}
          </MenuItem>
          <MenuItem
            disableRipple
            onClick={() => {
              const id = menu?.id ?? null
              // The row asks, drawn at once so focus can go to «نگه داشتن».
              flushSync(() => {
                setRestoreFocus(false)
                setMenu(null)
                setDeleting(id)
              })
              confirm.current?.querySelector('button')?.focus()
            }}
            sx={(theme) => menuItemLook.sx(theme, { destructive: true, blocked: false })}
          >
            {i18n._('Delete label')}
          </MenuItem>
        </Menu>
      </Box>
    </ClickAwayListener>
  )
}
