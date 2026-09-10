import { Box } from '@mui/material'
import { usePreferences } from '../../core/preferences'
import { formatCount } from '../../i18n/formatCount'
import { spacing, type as typeScale } from '../../theme/tokens'

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
          height: spacing.xl,
          paddingInline: `${spacing.sm}px`,
          paddingBlock: `${spacing['2xs']}px`,
          borderRadius: `${theme.karnama.radius.full}px`,
          borderWidth: 1,
          borderStyle: 'solid',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontFamily: 'inherit',
          fontSize: `${typeScale.body.size}px`,
          lineHeight: `${typeScale.body.lineHeight}px`,
          fontWeight: typeScale.body.weight,

          ...(selected
            ? {
                // Selected reads as filled rather than outlined, so the border
                // matches the fill instead of drawing a second edge.
                backgroundColor: colour['bg/brand/container'],
                borderColor: colour['bg/brand/container'],
                color: colour['text/brand'],
              }
            : {
                backgroundColor: colour['bg/surface'],
                borderColor: colour['border/default'],
                color: colour['text/secondary'],
              }),

          '&:hover': { backgroundColor: selected ? colour['bg/brand/container'] : colour['bg/surface-secondary'] },
          '&:active': { borderColor: colour['border/focus'] },
          '&:focus-visible': {
            outlineWidth: 2,
            outlineStyle: 'solid',
            outlineColor: colour['border/focus'],
            outlineOffset: 2,
          },
        }
      }}
    >
      {`${label} (${formatCount(locale, count)})`}
    </Box>
  )
}
