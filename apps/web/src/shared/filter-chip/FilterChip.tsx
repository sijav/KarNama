import { Box } from '@mui/material'
import { usePreferences } from '../../core/preferences'
import { formatCount } from '../../i18n/formatCount'
import { spacing, type as typeScale } from '../../theme/tokens'

// Node 159:67, the pressed edge: one and a half pixels, which Chromium would
// floor to one as a border, KN-281, so it is an inset shadow, KN-282.
const PRESSED_EDGE = 1.5

export interface FilterChipProps {
  /** The status name. */
  label: string
  /** How many records sit in this status. */
  count: number
  /** Whether this filter is currently on. */
  selected?: boolean
  /** Called with the state the chip is moving TO. */
  onToggle?: (selected: boolean) => void
}

/**
 * The filter chip, from Figma node `159:71`.
 *
 * A `button` with `aria-pressed` rather than a checkbox: it is a toggle that
 * filters, and `aria-pressed` is what announces on and off without inventing a
 * form control the design does not draw.
 *
 * The label is a plain prop and NOT a catalog message. `DESIGN.md` settles that
 * a status label is record data, because the user can rename any status, so it
 * arrives already in whatever the user called it.
 *
 * The count goes through `formatCount`, which is why the Figma frame reads
 * «مصاحبه (۳)» and not «مصاحبه (3)». A Persian reader counts in Persian digits,
 * and a raw number would be the one untranslated thing on the screen.
 *
 * No disabled state, because the file does not draw one. Four states, four
 * states.
 */
export const FilterChip = ({ label, count, selected = false, onToggle }: FilterChipProps) => {
  // From preferences rather than from lingui, because this is already typed as
  // one of our locales. Narrowing `i18n.locale`, a plain string, meant a
  // fallback branch that cannot be reached and therefore cannot be tested.
  const { locale } = usePreferences()

  return (
    <Box
      component="button"
      type="button"
      aria-pressed={selected}
      onClick={() => onToggle?.(!selected)}
      sx={(theme) => {
        const colour = theme.karnama.semantic
        return {
          // No descendant selectors anywhere in this file. Every state below
          // applies to the element the user is actually pointing at, which is
          // the lesson KN-205 cost: a rule aimed through a library's class name
          // reached a child nobody meant to style.
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxSizing: 'border-box',
          height: spacing.xl,
          // The file's padding in every state, 159:63 to 159:69: 12 at each
          // side and none above or below, the 22 line centred in the 32. The
          // edge is drawn inside and takes no space, so nothing here makes room
          // for it, KN-282.
          paddingInline: `${spacing.sm}px`,
          paddingBlock: 0,
          borderRadius: `${theme.karnama.radius.full}px`,
          borderWidth: 0,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontFamily: 'inherit',
          fontSize: `${typeScale.body.size}px`,
          lineHeight: `${typeScale.body.lineHeight}px`,
          fontWeight: typeScale.body.weight,
          backgroundColor: selected ? colour['bg/brand/container'] : colour['bg/surface'],
          color: selected ? colour['text/brand'] : colour['text/secondary'],

          // The stroke, inside the chip and out of its layout as the file draws
          // it: a border on a pseudo-element laid over the chip, the Input's way,
          // KN-266. One pixel of border/default, and none when selected, which
          // 159:69 draws with no stroke until KN-279 gives it the owner's blue.
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            borderStyle: selected ? 'none' : 'solid',
            borderWidth: 1,
            borderColor: colour['border/default'],
            pointerEvents: 'none',
          },

          '&:hover': { backgroundColor: selected ? colour['bg/brand/container'] : colour['bg/surface-secondary'] },
          // Pressed, 159:67: the edge at one and a half in border/focus, as an
          // inset shadow. The one pixel border stays under it in the same
          // colour, so forced colours, which remove shadows, still draw an edge.
          '&:active': { boxShadow: `inset 0 0 0 ${PRESSED_EDGE}px ${colour['border/focus']}` },
          '&:active::before': { borderStyle: 'solid', borderColor: colour['border/focus'] },
          '&:focus-visible': {
            outlineWidth: 2,
            outlineStyle: 'solid',
            outlineColor: colour['border/focus'],
            outlineOffset: 2,
          },
        }
      }}
    >
      {/* One flex item for the label and its count, so its box is where the
          text sits and a story can measure it from the chip's edge, KN-282. */}
      <span>{`${label} (${formatCount(locale, count)})`}</span>
    </Box>
  )
}
