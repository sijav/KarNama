import { useLingui } from '@lingui/react'
import { Box, ButtonBase, Fade, Popover, useMediaQuery, useTheme } from '@mui/material'
import { useId, useState } from 'react'
import { usePreferences } from '../../core/preferences'
import { formatTimeOfDay } from '../../i18n/formatTimeOfDay'
import { inlineStartOf } from '../../theme/sides'
import { spacing, unstyledText } from '../../theme/tokens'
import { Icon } from '../icon'
import { TimeList } from './TimeList'

// The props are documented in story-docs, not here, KN-207.
export interface TimeFieldProps {
  value: number | null
  onChange: (minutes: number) => void
}

// Field / ساعت in 774:16705 binds no variable: 6 between its label and its box,
// the box's 10 at the sides and radius of 6, and its one pixel edge; its 8 above
// and below and 8 between are spacing xs.
const LABEL_GAP = 6
const PADDING_INLINE = 10
const RADIUS = 6
const EDGE = 1
// The box's reactions: a press opens the list over 150 ms and closes it over 120.
const OPEN_MS = 150
const CLOSE_MS = 120
// The keyboard's ring, which the file does not draw: three inside, as the
// Select's, KN-294.
const FOCUS_RING = 3
type Query = '(prefers-reduced-motion: reduce)'
const LESS_MOTION: Query = '(prefers-reduced-motion: reduce)'
// What the box says while there is no time, as the screens draw it.
const NO_TIME = '—'

const labelText = unstyledText.timeFieldLabel
const valueText = unstyledText.timeFieldValue

// The time field of the calendar popover's interview, Field / ساعت: «ساعت» 12
// on 19 in text/secondary, 6 above a box of bg/surface inside one pixel of
// border/default at radius 6, its time 13 on 20 in text/primary at the inline
// start and the 16 clock at the inline end; the edge turns text/secondary
// under the pointer. A press opens the Time List, 774:16897, 4 under the box at
// its width, in a popover of its own whose focus starts on the chosen time and
// comes back to the box as it closes; a time chosen closes it.
export const TimeField = ({ value, onChange }: TimeFieldProps) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const start = inlineStartOf(useTheme().direction)
  const still = useMediaQuery(LESS_MOTION)
  const labelId = useId()
  const valueId = useId()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [width, setWidth] = useState(0)
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${LABEL_GAP}px` }}>
      <Box
        component="span"
        id={labelId}
        sx={(theme) => ({
          fontSize: `${labelText.size}px`,
          lineHeight: `${labelText.lineHeight}px`,
          fontWeight: labelText.weight,
          letterSpacing: labelText.letterSpacing,
          color: theme.karnama.semantic['text/secondary'],
        })}
      >
        {i18n._('Time')}
      </Box>
      <ButtonBase
        disableRipple
        aria-haspopup="listbox"
        aria-expanded={anchor !== null}
        aria-labelledby={`${labelId} ${valueId}`}
        onClick={(event) => {
          setWidth(event.currentTarget.offsetWidth)
          setAnchor(event.currentTarget)
        }}
        sx={(theme) => {
          const colour = theme.karnama.semantic
          return {
            position: 'relative',
            boxSizing: 'border-box',
            width: '100%',
            justifyContent: 'flex-start',
            gap: `${spacing.xs}px`,
            paddingBlock: `${spacing.xs}px`,
            paddingInline: `${PADDING_INLINE}px`,
            borderRadius: `${RADIUS}px`,
            borderStyle: 'solid',
            borderWidth: EDGE,
            borderColor: colour['border/default'],
            backgroundColor: colour['bg/surface'],
            color: colour['text/primary'],
            transition: `border-color ${CLOSE_MS}ms ease-out`,
            '@media (hover: hover)': { '&:hover': { borderColor: colour['text/secondary'] } },
            '&.Mui-focusVisible::after': {
              content: '""',
              position: 'absolute',
              inset: -EDGE,
              borderRadius: 'inherit',
              borderStyle: 'solid',
              borderWidth: FOCUS_RING,
              borderColor: colour['border/focus'],
              pointerEvents: 'none',
            },
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          }
        }}
      >
        <Box
          component="span"
          id={valueId}
          sx={{
            fontSize: `${valueText.size}px`,
            lineHeight: `${valueText.lineHeight}px`,
            fontWeight: valueText.weight,
            letterSpacing: valueText.letterSpacing,
          }}
        >
          {value === null ? NO_TIME : formatTimeOfDay(locale, value)}
        </Box>
        <Box component="span" sx={{ flexGrow: 1 }} />
        <Icon name="clock" size="sm" />
      </ButtonBase>
      <Popover
        open={anchor !== null}
        anchorEl={anchor}
        onClose={() => {
          setAnchor(null)
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: start }}
        transformOrigin={{ vertical: 'top', horizontal: start }}
        slots={{ transition: Fade }}
        transitionDuration={still ? 0 : { enter: OPEN_MS, exit: CLOSE_MS }}
        slotProps={{
          // The Time List draws its own surface, so the popover's paper draws none.
          paper: {
            sx: {
              marginTop: `${spacing['2xs']}px`,
              backgroundColor: 'transparent',
              backgroundImage: 'none',
              boxShadow: 'none',
              borderRadius: 0,
              overflow: 'visible',
            },
          },
        }}
      >
        <TimeList
          value={value}
          width={width}
          autoFocus
          onChange={(minutes) => {
            onChange(minutes)
            setAnchor(null)
          }}
        />
      </Popover>
    </Box>
  )
}
