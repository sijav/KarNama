import { useLingui } from '@lingui/react'
import { Box, InputBase, MenuItem, Select as MuiSelect, type SelectChangeEvent } from '@mui/material'
import { useId, type ReactNode } from 'react'
import { usePreferences } from '../../core/preferences'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Icon } from '../icon'
import { OptionLabel, optionRow, optionsMenuList, optionsMenuPaper } from './options'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  leading?: ReactNode
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

// Node 183:26's field is the Input's, 44 tall, and binds no variable; the
// rows are the Option Rows of options.tsx. The edges are the file's stroke weights: one
// at rest, two focused, and one and a half while open, which Chromium floors
// as a border, so it is an inset shadow over the one pixel border, the Filter
// Chip's way, KN-282.
const FIELD_HEIGHT = 44
const EDGE = 1
const FOCUS_EDGE = 2
const OPEN_EDGE = 1.5
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
        // The field is our own InputBase. MUI's default variant, outlined, hands
        // a displayEmpty select's input a notched prop meant for its outline,
        // which InputBase passes on to a div, and React warned of it on every
        // run, KN-134.
        variant="standard"
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
          const names = new Intl.ListFormat(locale, { style: 'short', type: 'unit' }).format(list.map(labelOf))
          // A single choice keeps what leads its option, a language's flag, 8
          // before its name, as its row draws it; several are names alone. The
          // name takes the ellipsis, since the field's own cuts only text.
          const leading = multiple ? undefined : options.find((option) => option.value === list[0])?.leading
          if (leading === undefined) return names
          return (
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px`, minWidth: 0 }}>
              {leading}
              <Box component="span" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {names}
              </Box>
            </Box>
          )
        }}
        MenuProps={{
          // Menus open instantly, the prototype map's motion, DESIGN.md.
          transitionDuration: 0,
          slotProps: {
            paper: { sx: (theme) => ({ ...optionsMenuPaper.sx(theme), marginTop: `${spacing['2xs']}px` }) },
            list: optionsMenuList,
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
              // The owner's role for a control's resting edge, KN-275.
              borderColor: colour['border/control'],
              pointerEvents: 'none',
            },
            // Disabled keeps the file's edge, as an inactive control asks no
            // contrast of it, KN-275.
            '&.Mui-disabled::before': { borderColor: colour['border/default'] },
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
          <MenuItem key={option.value} value={option.value} disabled={option.disabled === true} disableRipple sx={optionRow.sx}>
            <OptionLabel label={option.label} chosen={value.includes(option.value)} leading={option.leading} />
          </MenuItem>
        ))}
      </MuiSelect>
    </Box>
  )
}
