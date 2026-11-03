import { ButtonBase } from '@mui/material'
import { unstyledText } from '../../theme/tokens'

// The props are documented in story-docs, not here, KN-207.
export interface InlineLinkProps {
  label: string
  onClick: () => void
}

// The focus outline, three wide as the Icon Button's ring is, and two clear of
// the text, since the file draws the link no focus and no box to draw it inside.
const FOCUS_RING = 3
const FOCUS_GAP = 2
// Its text, 12 at Regular on Figma's automatic line of 19, bound to no text style.
const text = unstyledText.inlineLink

// Link / Inline, node 961:98862: a quiet action set in a line, as the interview
// slot's «تاریخش عوض شد». 12 at Regular in text/secondary on one line,
// underlined at the font's own position. Its Hover variant draws exactly what
// Default does, so nothing changes on hover.
export const InlineLink = ({ label, onClick }: InlineLinkProps) => (
  <ButtonBase
    onClick={onClick}
    sx={(theme) => ({
      padding: 0,
      borderRadius: `${theme.karnama.radius.sm}px`,
      color: theme.karnama.semantic['text/secondary'],
      fontSize: `${text.size}px`,
      fontWeight: text.weight,
      lineHeight: `${text.lineHeight}px`,
      letterSpacing: text.letterSpacing,
      whiteSpace: 'nowrap',
      textDecorationLine: 'underline',
      textDecorationThickness: 'from-font',
      textUnderlinePosition: 'from-font',
      '&.Mui-focusVisible': {
        outlineStyle: 'solid',
        outlineWidth: FOCUS_RING,
        outlineColor: theme.karnama.semantic['border/focus'],
        outlineOffset: FOCUS_GAP,
      },
    })}
  >
    {label}
  </ButtonBase>
)
