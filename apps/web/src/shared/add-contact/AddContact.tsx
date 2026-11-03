import { useLingui } from '@lingui/react'
import { ButtonBase } from '@mui/material'
import { spacing, unstyledText } from '../../theme/tokens'
import { Icon } from '../icon'

// The props are documented in story-docs, not here, KN-207.
export interface AddContactProps {
  onClick: () => void
}

// Node 961:101547's edge, one pixel dashed 6 and 4 and drawn inside and out of
// the layout, so it is an overlay dashed by CSS's own dash, as every dashed edge
// here is. The focus ring inside it is three wide, as the Icon Button's: the
// file draws the row no focus, KN-294.
const EDGE = 1
const FOCUS_RING = 3
// Its label, 14 on 22 at Medium, bound to no text style.
const text = unstyledText.addContact

// Add Contact, node 961:101547: «+ افزودن نفر», the row that ends the related
// people, as wide as what holds it and 46 high, the plus leading the label in
// text/brand, centred, inside a dashed edge of border/default; on hover it fills
// with bg/surface-secondary.
export const AddContact = ({ onClick }: AddContactProps) => {
  const { i18n } = useLingui()
  return (
    <ButtonBase
      onClick={onClick}
      sx={(theme) => {
        const colour = theme.karnama.semantic
        return {
          position: 'relative',
          boxSizing: 'border-box',
          width: '100%',
          gap: `${spacing.xs}px`,
          paddingBlock: `${spacing.sm}px`,
          borderRadius: `${theme.karnama.radius.md}px`,
          color: colour['text/brand'],
          fontSize: `${text.size}px`,
          lineHeight: `${text.lineHeight}px`,
          fontWeight: text.weight,
          letterSpacing: text.letterSpacing,
          whiteSpace: 'nowrap',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            borderStyle: 'dashed',
            borderWidth: EDGE,
            borderColor: colour['border/default'],
            pointerEvents: 'none',
          },
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
      <Icon name="plus" size="sm" color="text/brand" />
      {i18n._('Add person')}
    </ButtonBase>
  )
}
