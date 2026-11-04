import type { Theme } from '@mui/material'
import { type as typeScale } from '../../theme/tokens'

const { title, label } = typeScale

// A person's name in Title, and their role and company in Label, as the
// Related Person's Text, 1096:3086 and 1313:3292, and the Company Match's
// Person, 1096:3126, draw them. Under sx keys, which the lint rule reads as
// CSS.
export const nameText = {
  sx: (theme: Theme) => ({
    fontSize: `${title.size}px`,
    lineHeight: `${title.lineHeight}px`,
    fontWeight: title.weight,
    letterSpacing: `${title.letterSpacing}px`,
    color: theme.karnama.semantic['text/primary'],
  }),
}
export const labelText = {
  sx: (theme: Theme) => ({
    fontSize: `${label.size}px`,
    lineHeight: `${label.lineHeight}px`,
    fontWeight: label.weight,
    letterSpacing: `${label.letterSpacing}px`,
    color: theme.karnama.semantic['text/secondary'],
  }),
}

// One line, cut at its end rather than wrapped.
export const oneLine = { sx: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } } as const
