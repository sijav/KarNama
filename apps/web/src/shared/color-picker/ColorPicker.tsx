import type { I18n } from '@lingui/core'
import { useLingui } from '@lingui/react'
import { Box, Radio, RadioGroup } from '@mui/material'
import { useId } from 'react'
import { spacing, type as typeScale, type StatusToken } from '../../theme/tokens'

// The props are documented in story-docs, not here, KN-207.
export interface ColorPickerProps {
  value: StatusToken
  onChange: (value: StatusToken) => void
}

// Node 257:17 binds no variable to these, so they are component constants, as
// the Tooltip's width is: the panel's 232, the check's 14, and the selected
// swatch's edge, two, since no variable binds a stroke weight.
const WIDTH = 232
const CHECK = 14
const EDGE = 2

// The nine pairs, in the order the file draws them from the inline start:
// the first row offer and the four custom slots, the second the other four
// defaults. Read from the swatches' x coordinates; RTL is the natural order.
export const COLOURS = ['offer', 'custom-1', 'custom-2', 'custom-3', 'custom-4', 'new', 'applied', 'interview', 'rejected'] as const satisfies readonly StatusToken[]

// Each swatch is named for its colour, as the Documentation frame 376:30 names
// the nine, since a colour is what it offers and a status name would repeat
// the board.
const colourName = (i18n: I18n, token: StatusToken): string => {
  switch (token) {
    case 'new':
      return i18n._('Gray')
    case 'applied':
      return i18n._('Indigo')
    case 'interview':
      return i18n._('Amber')
    case 'rejected':
      return i18n._('Red')
    case 'offer':
      return i18n._('Green')
    case 'custom-1':
      return i18n._('Teal')
    case 'custom-2':
      return i18n._('Purple')
    case 'custom-3':
      return i18n._('Pink')
    case 'custom-4':
      return i18n._('Cyan')
  }
}

// The swatch's own class, so the focus ring is aimed at it and at nothing a
// library class also names, the lesson of KN-205.
const SWATCH = 'KarnamaColorPicker-swatch'

// One swatch, node 257:5 to 257:15: a 32 circle in the status's container.
// Selected, 257:11, it takes a two pixel edge inside in the status's base and
// the Icon set's check in the same colour.
const Swatch = ({ token, selected }: { token: StatusToken; selected: boolean }) => (
  <Box
    aria-hidden
    className={SWATCH}
    sx={(theme) => ({
      width: spacing.xl,
      height: spacing.xl,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      boxSizing: 'border-box',
      borderRadius: `${theme.karnama.radius.full}px`,
      backgroundColor: theme.karnama.status[token].container,
      color: theme.karnama.status[token].base,
      // The colour IS what a swatch offers, so forced colours, which would
      // paint all nine the same, leave it alone; the names say which is which.
      forcedColorAdjust: 'none',
      // The edge on a pseudo-element laid over the swatch, inside and out of
      // layout, as every stroke in the file is drawn, KN-266.
      ...(selected
        ? {
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              borderStyle: 'solid',
              borderWidth: EDGE,
              borderColor: 'currentColor',
              pointerEvents: 'none',
            },
          }
        : {}),
    })}
  >
    {selected ? (
      // The Icon set's check, node 239:18, until KN-008 ships the set: its
      // path in the set's 24 grid, drawn at 14 with a two pixel stroke.
      <Box component="svg" viewBox="0 0 24 24" sx={{ width: CHECK, height: CHECK, fill: 'none', stroke: 'currentColor' }} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" vectorEffect="non-scaling-stroke" />
      </Box>
    ) : null}
  </Box>
)

// The panel, node 257:17: a title, the nine swatches as one radio group, and
// the helper under them. A native radio group, through MUI, gives one Tab stop,
// arrow keys that move and select, and the checked colour announced.
export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const { i18n } = useLingui()
  const titleId = useId()
  const helperId = useId()

  return (
    <Box
      sx={(theme) => ({
        width: WIDTH,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: `${spacing.xs}px`,
        padding: `${spacing.sm}px`,
        position: 'relative',
        backgroundColor: theme.karnama.semantic['bg/surface'],
        borderRadius: `${theme.karnama.radius.md}px`,
        boxShadow: theme.karnama.elevation.card,
        // The one pixel edge, inside and out of layout, KN-266.
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: theme.karnama.semantic['border/default'],
          pointerEvents: 'none',
        },
      })}
    >
      {/* 14 over 22 at 600: body's size and line height with the headings'
          weight. The file binds no text style here and DESIGN.md allows no
          sixth role, so it is composed, as the Status Chip's M is. */}
      <Box
        component="span"
        id={titleId}
        sx={(theme) => ({
          fontSize: `${typeScale.body.size}px`,
          lineHeight: `${typeScale.body.lineHeight}px`,
          fontWeight: typeScale['heading/m'].weight,
          color: theme.karnama.semantic['text/primary'],
        })}
      >
        {i18n._('Status colour')}
      </Box>
      <RadioGroup
        row
        value={value}
        aria-labelledby={titleId}
        aria-describedby={helperId}
        onChange={(_, chosen) => {
          const token = COLOURS.find((colour) => colour === chosen)
          if (token) onChange(token)
        }}
        // Row, wrapping, 8 both ways, as 257:4 lays it out: five to the first
        // row in the panel's 208, four to the second.
        sx={{ flexWrap: 'wrap', gap: `${spacing.xs}px` }}
      >
        {COLOURS.map((token) => (
          <Radio
            key={token}
            value={token}
            disableRipple
            icon={<Swatch token={token} selected={false} />}
            checkedIcon={<Swatch token={token} selected />}
            slotProps={{ input: { 'aria-label': colourName(i18n, token) } }}
            sx={(theme) => ({
              padding: 0,
              [`&.Mui-focusVisible .${SWATCH}`]: {
                outlineWidth: 2,
                outlineStyle: 'solid',
                outlineColor: theme.karnama.semantic['border/focus'],
                outlineOffset: 2,
              },
            })}
          />
        ))}
      </RadioGroup>
      {/* 12 at 400 with the file's AUTO line height, the font's own, which is
          CSS's normal: the label role's size with the body's weight. */}
      <Box
        component="span"
        id={helperId}
        sx={(theme) => ({
          fontSize: `${typeScale.label.size}px`,
          lineHeight: 'normal',
          fontWeight: typeScale.body.weight,
          color: theme.karnama.semantic['text/secondary'],
        })}
      >
        {i18n._('A colour was chosen for you; change it if you like.')}
      </Box>
    </Box>
  )
}
