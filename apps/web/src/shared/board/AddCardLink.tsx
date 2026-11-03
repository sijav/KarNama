import { useLingui } from '@lingui/react'
import { ButtonBase } from '@mui/material'
import { spacing, unstyledText } from '../../theme/tokens'
import { Icon } from '../icon'

// The props are documented in story-docs, not here, KN-207.
export interface AddCardLinkProps {
  column: string
  onAdd: () => void
}

// Node 961:95525 binds no variable to the 6 between its plus and its label; its
// 8 above and below, 12 at the sides and radius of 8 are spacing xs, spacing sm
// and radius/md, which it leaves unbound. The file draws it no focus, so the
// keyboard's ring is the three inside that the Add Stage takes, KN-750.
const GAP = 6
const FOCUS_RING = 3
// Its label, 13 on 20 at Medium, bound to no text style.
const text = unstyledText.addCardLink

// Board / Add Card Link, node 961:95525, Default and Hover: «+ افزودن فرصت شغلی»
// right after a column's last card, as wide as the cards, which opens the add
// modal with the column's status. The 16 plus leads the label, both in
// text/secondary; on hover the row fills with bg/surface-secondary. Its name
// says which column it adds to, beginning with the label it shows.
export const AddCardLink = ({ column, onAdd }: AddCardLinkProps) => {
  const { i18n } = useLingui()
  return (
    <ButtonBase
      disableRipple
      aria-label={`${i18n._('Add a job opportunity to')} ${column}`}
      onClick={onAdd}
      sx={(theme) => {
        const colour = theme.karnama.semantic
        return {
          position: 'relative',
          boxSizing: 'border-box',
          width: '100%',
          justifyContent: 'flex-start',
          gap: `${GAP}px`,
          paddingBlock: `${spacing.xs}px`,
          paddingInline: `${spacing.sm}px`,
          borderRadius: `${theme.karnama.radius.md}px`,
          color: colour['text/secondary'],
          fontSize: `${text.size}px`,
          lineHeight: `${text.lineHeight}px`,
          fontWeight: text.weight,
          letterSpacing: `${text.letterSpacing}px`,
          whiteSpace: 'nowrap',
          '@media (hover: hover)': { '&:hover': { backgroundColor: colour['bg/surface-secondary'] } },
          '&.Mui-focusVisible::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            borderStyle: 'solid',
            borderWidth: FOCUS_RING,
            borderColor: colour['border/focus'],
            pointerEvents: 'none',
          },
        }
      }}
    >
      <Icon name="plus" size="sm" color="inherit" />
      {i18n._('Add job opportunity')}
    </ButtonBase>
  )
}
