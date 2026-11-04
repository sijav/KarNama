import { useLingui } from '@lingui/react'
import { Box, InputBase, Popover, useTheme } from '@mui/material'
import { useId, useState, type ReactNode } from 'react'
import { inlineStartOf } from '../../theme/sides'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Icon } from '../icon'
import { labelText } from '../related-person/personText'

// The props of the picker the person modal's job opportunities and the related
// people tab open, KN-772 and KN-775.
export interface SearchPickerProps<Item> {
  anchorEl: HTMLElement | null
  width: number
  label: string
  heading?: string
  items: readonly Item[]
  idOf: (item: Item) => string
  matches: (item: Item, query: string) => boolean
  isLinked: (item: Item) => boolean
  renderItem: (item: Item, linked: boolean) => ReactNode
  footer?: (query: string) => ReactNode
  onEnterWithNone?: (query: string) => void
  onChoose: (item: Item) => void
  onClose: () => void
}

// Nodes 1092:3072 and 1096:3129 bind no variable to these: the panel's one pixel
// edge, in its layout; the search's one and a half of border/focus, an inset
// shadow since Chromium floors a border of 1.5, so its padding takes the edge's
// room; and the three options shown before the list scrolls, 54 each and 4
// apart.
const EDGE = 1
const SEARCH_EDGE = 1.5
const OPTION_HEIGHT = 54
const SHOWN_OPTIONS = 3

// The search suggests from a list it filters, typed so the lint rule reads it
// as a value and not as copy.
type Autocomplete = 'list'
const FROM_LIST: Autocomplete = 'list'

// What an item can be found by holds what is typed, whatever the case.
export const holds = (locale: string, query: string, ...parts: readonly (string | null | undefined)[]) => {
  const wanted = query.trim().toLocaleLowerCase(locale)
  if (wanted === '') return true
  return parts.some((part) => (part ?? '').toLocaleLowerCase(locale).includes(wanted))
}

// The picker's panel, the Job Picker of 1092:3072 and the Person Picker,
// 1096:3129: at the caller's width under its anchor, 4 below from its inline
// start, bg/surface at radius 8 inside one pixel of border/default, 8 round its
// parts and 4 between, elevation.picker. A search inside one and a half of
// border/focus at radius 4, its icon at its start; an optional heading in
// Label text/secondary; each item it finds, 54 tall at radius 4, the active one
// on bg/surface-secondary, the linked ones there but not choosable; and an
// optional footer. The search is a combobox over the list: the arrows move
// through the ones that can be chosen, Enter chooses, or, with none, does what
// the caller says; a press chooses too, and Escape and a press outside close.
export const SearchPicker = <Item,>({
  anchorEl,
  width,
  label,
  heading,
  items,
  idOf,
  matches,
  isLinked,
  renderItem,
  footer,
  onEnterWithNone,
  onChoose,
  onClose,
}: SearchPickerProps<Item>) => {
  const { i18n } = useLingui()
  const start = inlineStartOf(useTheme().direction)
  const listId = useId()
  const optionPrefix = useId()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  // Each opening starts with an empty search: React's pattern for state that
  // follows a prop, adjusted during render.
  const [openedFrom, setOpenedFrom] = useState(anchorEl)
  if (anchorEl !== openedFrom) {
    setOpenedFrom(anchorEl)
    setQuery('')
    setActive(0)
  }
  const found = items.filter((item) => matches(item, query))
  const choosable = found.filter((item) => !isLinked(item))
  const activeItem = choosable[Math.min(active, choosable.length - 1)]
  return (
    <Popover
      open={anchorEl !== null}
      anchorEl={anchorEl}
      onClose={onClose}
      // Menus open instantly, the prototype map's motion, DESIGN.md.
      transitionDuration={0}
      anchorOrigin={{ vertical: 'bottom', horizontal: start }}
      transformOrigin={{ vertical: 0, horizontal: start }}
      slotProps={{
        paper: {
          sx: (theme) => ({
            boxSizing: 'border-box',
            width,
            marginTop: `${spacing['2xs']}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: `${spacing['2xs']}px`,
            padding: `${spacing.xs}px`,
            borderRadius: `${theme.karnama.radius.md}px`,
            border: `${EDGE}px solid ${theme.karnama.semantic['border/default']}`,
            backgroundColor: theme.karnama.semantic['bg/surface'],
            backgroundImage: 'none',
            boxShadow: theme.karnama.elevation.picker,
          }),
        },
      }}
    >
      <InputBase
        autoFocus
        value={query}
        placeholder={label}
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(0)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActive((current) => Math.min(current + 1, Math.max(choosable.length - 1, 0)))
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActive((current) => Math.max(current - 1, 0))
          } else if (event.key === 'Enter') {
            event.preventDefault()
            if (activeItem !== undefined) onChoose(activeItem)
            else onEnterWithNone?.(query)
          }
        }}
        startAdornment={<Icon name="search" size="sm" />}
        inputProps={{
          role: 'combobox',
          'aria-label': label,
          'aria-expanded': true,
          'aria-controls': listId,
          'aria-autocomplete': FROM_LIST,
          ...(activeItem === undefined ? {} : { 'aria-activedescendant': `${optionPrefix}-${idOf(activeItem)}` }),
        }}
        sx={(theme) => ({
          gap: `${spacing.xs}px`,
          paddingBlock: `${spacing.xs + SEARCH_EDGE}px`,
          paddingInline: `${spacing.sm + SEARCH_EDGE}px`,
          borderRadius: `${theme.karnama.radius.sm}px`,
          backgroundColor: theme.karnama.semantic['bg/surface'],
          boxShadow: `inset 0 0 0 ${SEARCH_EDGE}px ${theme.karnama.semantic['border/focus']}`,
          fontSize: `${typeScale.body.size}px`,
          lineHeight: `${typeScale.body.lineHeight}px`,
          color: theme.karnama.semantic['text/primary'],
          '& .MuiInputBase-input': { padding: 0, height: `${typeScale.body.lineHeight}px` },
          '& .MuiInputBase-input::placeholder': { color: theme.karnama.semantic['text/secondary'], opacity: 1 },
        })}
      />
      {heading === undefined ? null : (
        <Box
          component="span"
          sx={(theme) => ({ ...labelText.sx(theme), paddingBlock: `${spacing['2xs']}px`, paddingInline: `${spacing.sm}px` })}
        >
          {heading}
        </Box>
      )}
      <Box
        component="ul"
        role="listbox"
        id={listId}
        aria-label={heading ?? label}
        sx={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: `${spacing['2xs']}px`,
          maxHeight: SHOWN_OPTIONS * OPTION_HEIGHT + (SHOWN_OPTIONS - 1) * spacing['2xs'],
          overflowY: 'auto',
        }}
      >
        {found.length === 0 ? (
          <Box
            component="li"
            role="presentation"
            sx={(theme) => ({
              fontSize: `${typeScale.body.size}px`,
              lineHeight: `${typeScale.body.lineHeight}px`,
              paddingBlock: `${spacing.xs}px`,
              paddingInline: `${spacing.sm}px`,
              color: theme.karnama.semantic['text/secondary'],
            })}
          >
            {i18n._('No results found')}
          </Box>
        ) : null}
        {found.map((item) => {
          const linked = isLinked(item)
          const isActive = activeItem !== undefined && idOf(activeItem) === idOf(item)
          return (
            <Box
              key={idOf(item)}
              component="li"
              role="option"
              id={`${optionPrefix}-${idOf(item)}`}
              aria-selected={isActive}
              aria-disabled={linked}
              onMouseEnter={() => {
                if (!linked) setActive(choosable.indexOf(item))
              }}
              onClick={() => {
                if (!linked) onChoose(item)
              }}
              sx={(theme) => ({
                boxSizing: 'border-box',
                flexShrink: 0,
                height: OPTION_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                gap: `${spacing.xs}px`,
                paddingBlock: `${spacing.xs}px`,
                paddingInline: `${spacing.sm}px`,
                borderRadius: `${theme.karnama.radius.sm}px`,
                cursor: linked ? 'default' : 'pointer',
                backgroundColor: isActive ? theme.karnama.semantic['bg/surface-secondary'] : 'transparent',
              })}
            >
              {renderItem(item, linked)}
            </Box>
          )
        })}
      </Box>
      {footer?.(query)}
    </Popover>
  )
}

// An item's mark when it is linked already: the check and «وصل است» in Label
// text/brand, at the option's inline end.
export const LinkedMark = () => {
  const { i18n } = useLingui()
  return (
    <Box
      component="span"
      sx={(theme) => ({
        ...labelText.sx(theme),
        flexShrink: 0,
        marginInlineStart: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: `${spacing['2xs']}px`,
        color: theme.karnama.semantic['text/brand'],
      })}
    >
      <Icon name="check" size="sm" color="inherit" />
      {i18n._('Linked')}
    </Box>
  )
}
