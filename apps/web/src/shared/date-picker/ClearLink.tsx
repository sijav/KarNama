import { useLingui } from '@lingui/react'
import { ButtonBase } from '@mui/material'
import { unstyledText } from '../../theme/tokens'

// The props are documented in story-docs, not here, KN-207.
export interface ClearLinkProps {
  onClick: () => void
}

// The hover's reaction, 120 ms, ease out.
const HOVER_MS = 120
// The focus outline, three wide as the Icon Button's ring is, and two clear of
// the text, since the file draws the link no focus and no box, as the Inline
// Link's.
const FOCUS_RING = 3
const FOCUS_GAP = 2

const text = unstyledText.clearLink

// Date Picker / Clear Link, node 848:2253, KN-756: «پاک کردن» in a date
// dropdown, which empties the field and closes. 12 on 19 at Regular in
// text/secondary; under the pointer text/primary and underlined, over 120 ms.
// Its description: shown only when the field has a date.
export const ClearLink = ({ onClick }: ClearLinkProps) => {
  const { i18n } = useLingui()
  return (
    <ButtonBase
      disableRipple
      onClick={onClick}
      sx={(theme) => {
        const colour = theme.karnama.semantic
        return {
          flexShrink: 0,
          padding: 0,
          borderRadius: `${theme.karnama.radius.sm}px`,
          color: colour['text/secondary'],
          fontSize: `${text.size}px`,
          lineHeight: `${text.lineHeight}px`,
          fontWeight: text.weight,
          letterSpacing: text.letterSpacing,
          whiteSpace: 'nowrap',
          textDecorationLine: 'underline',
          textDecorationColor: 'transparent',
          textDecorationThickness: 'from-font',
          textUnderlinePosition: 'from-font',
          transition: `color ${HOVER_MS}ms ease-out, text-decoration-color ${HOVER_MS}ms ease-out`,
          '@media (hover: hover)': { '&:hover': { color: colour['text/primary'], textDecorationColor: 'currentcolor' } },
          '&.Mui-focusVisible': {
            outlineStyle: 'solid',
            outlineWidth: FOCUS_RING,
            outlineColor: colour['border/focus'],
            outlineOffset: FOCUS_GAP,
          },
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }
      }}
    >
      {i18n._('Clear')}
    </ButtonBase>
  )
}
