import { useLingui } from '@lingui/react'
import { Box, InputBase, type Theme } from '@mui/material'
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { spacing, type as typeScale, unstyledText } from '../../theme/tokens'
import { Icon } from '../icon'
import { quoted } from '../quoted'
import { OptionLabel, optionRow, optionsMenuPaper } from '../select/options'
import { sourceKey, suggestionsFor, type SourceOption } from './sources'

// The props are documented in story-docs, not here, KN-207.
export interface SourcePickerProps {
  value: string
  own: readonly SourceOption[]
  common: readonly SourceOption[]
  autoFilled: boolean
  onChange: (name: string) => void
}

// Node 1223:96580 binds no variable to these: the field's 44, the Select's; its
// edges, one at rest, two focused and one and a half open, the last an inset
// shadow since Chromium floors a border of 1.5; and the menu's 256, the Open
// frame's, past which it scrolls.
const FIELD_HEIGHT = 44
const EDGE = 1
const FOCUS_EDGE = 2
const OPEN_EDGE = 1.5
const MENU_HEIGHT = 256

const { label, body } = typeScale
const { sourceLabel } = unstyledText

// What a row of the menu chooses: one of the sources, or the typed name made one.
type Item = { kind: 'source'; source: SourceOption } | { kind: 'create'; name: string }

// The Option Row's look, 408:465, is keyed to MUI's state classes, its Selected
// and its keyboard's row, so a row here carries them; and a header's id part.
type StateClass = 'Mui-selected' | 'Mui-focusVisible'
const SELECTED: StateClass = 'Mui-selected'
const ACTIVE: StateClass = 'Mui-focusVisible'
const rowClass = (selected: boolean, active: boolean) => [...(selected ? [SELECTED] : []), ...(active ? [ACTIVE] : [])].join(' ')
type IdPart = '-group-'
const GROUP: IdPart = '-group-'

// Words in a type role or an unstyled text, under an sx key, which the lint
// rule reads as CSS.
interface Words {
  size: number
  lineHeight: number
  weight: number
  letterSpacing: number
}
const words = {
  sx: (role: Words) => ({
    fontSize: `${role.size}px`,
    lineHeight: `${role.lineHeight}px`,
    fontWeight: role.weight,
    letterSpacing: `${role.letterSpacing}px`,
  }),
}

// The field, the Select's: bg/surface at radius md, 16 in and 8 between, one
// pixel of border/control at rest, KN-275, text/secondary under the pointer,
// two of border/focus focused and one and a half open.
const field = {
  sx: (theme: Theme, open: boolean) => {
    const colour = theme.karnama.semantic
    return {
      position: 'relative',
      boxSizing: 'border-box',
      width: '100%',
      height: FIELD_HEIGHT,
      gap: `${spacing.xs}px`,
      paddingInline: `${spacing.md}px`,
      borderRadius: `${theme.karnama.radius.md}px`,
      backgroundColor: colour['bg/surface'],
      color: colour['text/primary'],
      ...words.sx(body),
      '& .MuiInputBase-input': { height: `${body.lineHeight}px`, padding: 0, textOverflow: 'ellipsis' },
      '& .MuiInputBase-input::placeholder': { color: colour['text/secondary'], opacity: 1 },
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        borderStyle: 'solid',
        borderWidth: EDGE,
        borderColor: colour['border/control'],
        pointerEvents: 'none',
      },
      '@media (hover: hover)': { '&:hover:not(.Mui-focused)::before': { borderColor: colour['text/secondary'] } },
      '&.Mui-focused::before': { borderWidth: open ? EDGE : FOCUS_EDGE, borderColor: colour['border/focus'] },
      boxShadow: open ? `inset 0 0 0 ${OPEN_EDGE}px ${colour['border/focus']}` : 'none',
    }
  },
}

// Source Picker, node 1223:96580, Default, Hover, Empty, Open and Typing: the
// «منبع» field of the add form and the job modal's info tab. «منبع», 12 on 19 at
// Medium, 4 above the field, which shows the source or «انتخاب یا نوشتن منبع»
// with the 20 chevron at its inline end; «از روی لینک آگهی پر شد.» 4 under it
// when the link filled it. A press or an arrow opens the menu, 4 above the field
// and as wide, out of the layout, since the field ends a scrolling form: «منبع‌های
// شما» and «منبع‌های رایج», the Select's Option Rows under their headers. Typing
// folds what is typed quietly and narrows the list; when nothing is exactly it,
// «منظور شما این بود؟» offers the sources one letter away and «ساختن منبع «…»»
// makes it a source. The arrows move, Enter chooses, Escape and leaving put the
// value back.
export const SourcePicker = ({ value, own, common, autoFilled, onChange }: SourcePickerProps) => {
  const { i18n } = useLingui()
  const inputId = useId()
  const labelId = useId()
  const listId = useId()
  const input = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState<string | null>(null)
  // The row the arrows or the pointer are on, none at first; and whether the
  // arrows put it there, which alone draws the keyboard's ring, as no frame
  // draws a row picked out.
  const [active, setActive] = useState(-1)
  const [byKey, setByKey] = useState(false)

  const found = suggestionsFor(typed ?? '', own, common)
  // The groups with rows, each with where its rows start among the items.
  const groups = [
    { title: i18n._('Your sources'), sources: found.own },
    { title: i18n._('Common sources'), sources: found.common },
    { title: i18n._('Did you mean?'), sources: found.near },
  ]
    .filter((group) => group.sources.length > 0)
    .map((group, at, list) => ({ ...group, start: list.slice(0, at).reduce((sum, before) => sum + before.sources.length, 0) }))
  const items: Item[] = [
    ...groups.flatMap((group) => group.sources.map((source): Item => ({ kind: 'source', source }))),
    ...(found.create === null ? [] : [{ kind: 'create', name: found.create } satisfies Item]),
  ]
  const chosen = sourceKey(value)
  const optionId = (at: number) => `${listId}-${String(at)}`

  const close = () => {
    setOpen(false)
    setTyped(null)
    setActive(-1)
    setByKey(false)
  }
  // A press opens the menu with no row under the keyboard, an arrow on the
  // chosen source or the first; what the field shows is selected, so what is
  // typed next takes its place.
  const openMenu = (byArrow: boolean) => {
    setOpen(true)
    setActive(
      byArrow
        ? Math.max(
            0,
            items.findIndex((item) => item.kind === 'source' && sourceKey(item.source.name) === chosen),
          )
        : -1,
    )
    setByKey(byArrow)
    input.current?.select()
  }
  const choose = (item: Item) => {
    onChange(item.kind === 'source' ? item.source.name : item.name)
    close()
  }
  const keyed = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      if (!open) openMenu(true)
      else {
        // From no row, down is the first and up the last.
        setActive((Math.max(active, step === 1 ? -1 : 0) + step + items.length) % items.length)
        setByKey(true)
      }
    } else if (event.key === 'Enter' && open) {
      // Enter chooses here, and the form round the field does not take it: the
      // row the arrows or the pointer are on; else the source typed exactly, or
      // the typed name made one, never a near one the reader did not pick; with
      // nothing typed, it only closes the menu.
      event.preventDefault()
      const typedOne: Item[] =
        found.exact !== null
          ? [{ kind: 'source', source: found.exact }]
          : found.create === null
            ? []
            : [{ kind: 'create', name: found.create }]
      const item = items[active] ?? typedOne[0]
      if (item) choose(item)
      else close()
    } else if (event.key === 'Escape' && open) {
      // A modal round the field stays open: Escape closes only the menu.
      event.stopPropagation()
      close()
    }
  }

  const row = (at: number, item: Item, children: ReactNode, selected: boolean) => {
    return (
      <Box
        key={at}
        id={optionId(at)}
        role="option"
        aria-selected={selected}
        className={rowClass(selected, byKey && at === active)}
        onMouseDown={(event) => {
          // Keeps focus in the field, which the press then leaves.
          event.preventDefault()
        }}
        onMouseEnter={() => {
          setActive(at)
          setByKey(false)
        }}
        onClick={() => {
          choose(item)
        }}
        sx={(theme) =>
          item.kind === 'source'
            ? { ...optionRow.sx(theme), display: 'flex', alignItems: 'center', cursor: 'pointer' }
            : {
                ...optionRow.sx(theme),
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                height: 'auto',
                minHeight: 0,
                paddingBlock: `${spacing.xs}px`,
                fontWeight: body.weight,
                color: theme.karnama.semantic['text/brand'],
              }
        }
      >
        {children}
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing['2xs']}px`, width: '100%' }}>
      <Box
        component="label"
        id={labelId}
        htmlFor={inputId}
        sx={(theme) => ({ ...words.sx(sourceLabel), color: theme.karnama.semantic['text/primary'] })}
      >
        {i18n._('Source')}
      </Box>
      <Box sx={{ position: 'relative' }}>
        <InputBase
          id={inputId}
          inputRef={input}
          value={typed ?? value}
          placeholder={i18n._('Choose or type a source')}
          onChange={(event) => {
            setTyped(event.target.value)
            setOpen(true)
            setActive(-1)
            setByKey(false)
          }}
          onClick={() => {
            if (!open) openMenu(false)
          }}
          onKeyDown={keyed}
          onBlur={close}
          inputProps={{
            role: 'combobox',
            autoComplete: 'off',
            'aria-autocomplete': 'list',
            'aria-expanded': open,
            'aria-controls': listId,
            'aria-activedescendant': open && active >= 0 ? optionId(active) : undefined,
          }}
          endAdornment={
            <Box component="span" aria-hidden sx={(theme) => ({ display: 'inline-flex', color: theme.karnama.semantic['text/secondary'] })}>
              <Icon name="chevron-down" size="md" color="inherit" />
            </Box>
          }
          sx={(theme) => field.sx(theme, open)}
        />
        {open ? (
          <Box
            onMouseDown={(event) => {
              // A press on the menu's own edge or scroll keeps focus in the field.
              event.preventDefault()
            }}
            sx={(theme) => ({
              ...optionsMenuPaper.sx(theme),
              position: 'absolute',
              bottom: `calc(100% + ${spacing['2xs']}px)`,
              insetInline: 0,
              zIndex: 1,
              boxSizing: 'border-box',
              maxHeight: MENU_HEIGHT,
              overflowY: 'auto',
              paddingBlock: `${spacing['2xs']}px`,
            })}
          >
            <Box role="listbox" id={listId} aria-labelledby={labelId}>
              {groups.map((group, at) => (
                <Box key={group.title} role="group" aria-labelledby={`${listId}${GROUP}${String(at)}`}>
                  <Box
                    id={`${listId}${GROUP}${String(at)}`}
                    role="presentation"
                    sx={(theme) => ({
                      paddingInline: `${spacing.sm}px`,
                      paddingBlock: `${spacing['2xs']}px`,
                      ...words.sx(label),
                      color: theme.karnama.semantic['text/secondary'],
                    })}
                  >
                    {group.title}
                  </Box>
                  {group.sources.map((source, offset) => {
                    const selected = sourceKey(source.name) === chosen
                    return row(
                      group.start + offset,
                      { kind: 'source', source },
                      <OptionLabel label={source.name} chosen={selected} />,
                      selected,
                    )
                  })}
                </Box>
              ))}
              {found.create === null ? null : (
                <>
                  {groups.length > 0 ? (
                    <Box aria-hidden sx={(theme) => ({ height: `${EDGE}px`, backgroundColor: theme.karnama.semantic['border/default'] })} />
                  ) : null}
                  {row(
                    items.length - 1,
                    { kind: 'create', name: found.create },
                    <>
                      <Icon name="plus" size="sm" color="text/brand" />
                      <Box component="span">{`${i18n._('Create the source')} ${quoted(i18n, found.create)}`}</Box>
                    </>,
                    false,
                  )}
                </>
              )}
            </Box>
          </Box>
        ) : null}
      </Box>
      {autoFilled ? (
        <Box component="span" sx={(theme) => ({ ...words.sx(label), color: theme.karnama.semantic['text/secondary'] })}>
          {i18n._('Filled in from the posting link.')}
        </Box>
      ) : null}
    </Box>
  )
}
