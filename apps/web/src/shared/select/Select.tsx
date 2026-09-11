import { useLingui } from '@lingui/react'
import { Box, InputBase, MenuItem, Select as MuiSelect, type SelectChangeEvent } from '@mui/material'
import { useId } from 'react'
import { usePreferences } from '../../core/preferences'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Icon } from '../icon'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

// The props are documented in story-docs, not here, KN-207.
export interface SelectProps {
  label: string
  options: readonly SelectOption[]
  value: readonly string[]
  multiple?: boolean
  placeholder?: string
  disabled?: boolean
  onChange: (value: string[]) => void
}

// Node 183:26's field is the Input's, 44 tall; the Option Row of 408:465 is
// 40. Neither binds a variable. The edges are the file's stroke weights: one
// at rest, two focused, and one and a half while open, which Chromium floors
// as a border, so it is an inset shadow over the one pixel border, the Filter
// Chip's way, KN-282.
const FIELD_HEIGHT = 44
const OPTION_HEIGHT = 40
const EDGE = 1
const FOCUS_EDGE = 2
const OPEN_EDGE = 1.5
const FOCUS_RING = 3
const CHEVRON = 20

const { label: labelText, body } = typeScale

// MUI's own class for the chevron, which the field positions and turns.
const Chevron = ({ className }: { className?: string }) => (
  <Box component="span" className={className} sx={{ display: 'inline-flex' }}>
    <Icon name="chevron-down" size="md" color="inherit" />
  </Box>
)

// The Select of node 183:26, Default, Filled, Focus, Disabled and Open, on
// MUI's Select, which brings the listbox, its keys and its focus: arrows, Home,
// End and type-ahead, Escape and Tab closing it and focus going back to the
// field. The options are 408:465's Option Rows in 408:487's menu, 4 below the
// field. The value is always a list, of one at most unless `multiple`; the
// employment type holds several, DESIGN.md.
export const Select = ({ label, options, value, multiple = false, placeholder, disabled = false, onChange }: SelectProps) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const labelId = useId()
  const shown = placeholder ?? i18n._('Choose…')
  const labelOf = (chosen: string) => options.find((option) => option.value === chosen)?.label ?? chosen
  const change = (event: SelectChangeEvent<string | string[]>) => {
    const next = event.target.value
    // A multiple select can hand back a string from autofill, comma joined.
    onChange(typeof next === 'string' ? (multiple ? next.split(',') : [next]) : next)
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box
        component="span"
        id={labelId}
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
      </Box>
      <MuiSelect<string | string[]>
        labelId={labelId}
        multiple={multiple}
        displayEmpty
        disabled={disabled}
        value={multiple ? [...value] : (value[0] ?? '')}
        onChange={change}
        IconComponent={Chevron}
        input={<InputBase />}
        renderValue={(chosen) => {
          const list = typeof chosen === 'string' ? (chosen === '' ? [] : [chosen]) : chosen
          if (list.length === 0) {
            return (
              <Box component="span" sx={(theme) => ({ color: theme.karnama.semantic[disabled ? 'text/disabled' : 'text/secondary'] })}>
                {shown}
              </Box>
            )
          }
          return new Intl.ListFormat(locale, { style: 'short', type: 'unit' }).format(list.map(labelOf))
        }}
        MenuProps={{
          // Menus open instantly, the prototype map's motion, DESIGN.md.
          transitionDuration: 0,
          slotProps: {
            paper: {
              sx: (theme) => ({
                marginTop: `${spacing['2xs']}px`,
                borderRadius: `${theme.karnama.radius.md}px`,
                backgroundColor: theme.karnama.semantic['bg/surface'],
                backgroundImage: 'none',
                boxShadow: theme.karnama.elevation.optionsMenu,
                // The menu's edge, drawn inside and out of its layout: an inset
                // outline, which forced colours keep and a scrolling list does
                // not carry with it.
                outline: `${EDGE}px solid ${theme.karnama.semantic['border/default']}`,
                outlineOffset: `-${EDGE}px`,
              }),
            },
            list: { sx: { paddingBlock: `${spacing['2xs']}px` } },
          },
        }}
        sx={(theme) => {
          const colour = theme.karnama.semantic
          return {
            position: 'relative',
            height: FIELD_HEIGHT,
            boxSizing: 'border-box',
            paddingInline: `${spacing.md}px`,
            borderRadius: `${theme.karnama.radius.md}px`,
            backgroundColor: colour['bg/surface'],
            color: colour['text/primary'],
            fontSize: `${body.size}px`,
            lineHeight: `${body.lineHeight}px`,
            fontWeight: body.weight,
            // The value runs to 8 short of the chevron and is cut, not wrapped.
            '& .MuiSelect-select.MuiSelect-select.MuiSelect-select.MuiSelect-select': {
              paddingBlock: 0,
              paddingInlineStart: 0,
              paddingInlineEnd: `${CHEVRON + spacing.xs}px`,
              minHeight: 0,
              backgroundColor: 'transparent',
            },
            // The chevron: 20 in text/secondary, 16 from the inline end and
            // never turned, as 448:610 draws it open.
            '& .MuiSelect-icon': {
              top: '50%',
              insetInlineEnd: `${spacing.md}px`,
              transform: 'translateY(-50%)',
              color: colour['text/secondary'],
            },
            '& .MuiSelect-iconOpen': { transform: 'translateY(-50%)' },
            // The stroke, inside the field and out of its layout, the Input's
            // way, KN-266.
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
            '&.Mui-focused::before': { borderWidth: FOCUS_EDGE, borderColor: colour['border/focus'] },
            // Open, 448:610: one and a half of border/focus, which wins over
            // the focused two while the menu is up.
            '&&:has([aria-expanded="true"])': { boxShadow: `inset 0 0 0 ${OPEN_EDGE}px ${colour['border/focus']}` },
            '&&:has([aria-expanded="true"])::before': { borderWidth: EDGE, borderColor: colour['border/focus'] },
            '&.Mui-disabled': { backgroundColor: colour['bg/surface-secondary'], color: colour['text/disabled'] },
            '&.Mui-disabled .MuiSelect-icon': { color: colour['text/disabled'] },
          }
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled === true}
            disableRipple
            sx={(theme) => {
              const colour = theme.karnama.semantic
              return {
                position: 'relative',
                boxSizing: 'border-box',
                minHeight: OPTION_HEIGHT,
                height: OPTION_HEIGHT,
                paddingBlock: 0,
                paddingInline: `${spacing.sm}px`,
                gap: `${spacing.xs}px`,
                // Body's size and line height at Label's weight, no tracking.
                fontSize: `${body.size}px`,
                lineHeight: `${body.lineHeight}px`,
                fontWeight: labelText.weight,
                letterSpacing: body.letterSpacing,
                color: colour['text/primary'],
                '&:hover, &.Mui-focusVisible': { backgroundColor: colour['bg/surface-secondary'] },
                '&.Mui-selected, &.Mui-selected:hover, &.Mui-selected.Mui-focusVisible': {
                  backgroundColor: colour['bg/brand/container'],
                  color: colour['text/brand'],
                },
                '&.Mui-disabled': { opacity: 1, color: colour['text/disabled'] },
                // The keyboard's option, a ring drawn inside the row, as the
                // Filter Chip's and the Icon Button's are.
                '&.Mui-focusVisible::after': {
                  content: '""',
                  position: 'absolute',
                  inset: EDGE,
                  borderStyle: 'solid',
                  borderWidth: FOCUS_RING,
                  borderColor: colour['border/focus'],
                  pointerEvents: 'none',
                },
              }
            }}
          >
            <Box component="span" sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {option.label}
            </Box>
            {/* The check of 408:459, 16 in the row's colour, at the inline end. */}
            {value.includes(option.value) ? <Icon name="check" size="sm" color="inherit" /> : null}
          </MenuItem>
        ))}
      </MuiSelect>
    </Box>
  )
}
