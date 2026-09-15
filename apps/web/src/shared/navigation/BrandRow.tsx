import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import { spacing, type as typeScale } from '../../theme/tokens'

// The mark's square, 32, which node 406:451 binds to no variable.
const MARK = 32

// One line, cut rather than wrapped. Under an sx key, which the lint rule reads as CSS.
const oneLine = { sx: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } } as const

// The Brand Row, drawn alike at the sidebar's top, 406:451, and on the sign-in
// card, 407:6953, so both draw this one, KN-518: the mark, the name's first letter
// in text/on-accent on bg/brand/default, and 8 after it the name at 20 and
// SemiBold, both on the font's normal line, which is what the file's lines are.
export const BrandRow = () => {
  const { i18n } = useLingui()
  const brand = i18n._('KarNama')
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: `${spacing.xs}px`, height: MARK }}>
      <Box
        aria-hidden
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          width: MARK,
          height: MARK,
          borderRadius: `${theme.karnama.radius.md}px`,
          backgroundColor: theme.karnama.semantic['bg/brand/default'],
          color: theme.karnama.semantic['text/on-accent'],
          fontSize: `${typeScale.title.size}px`,
          fontWeight: typeScale['heading/m'].weight,
          lineHeight: 'normal',
        })}
      >
        {brand.charAt(0)}
      </Box>
      <Box
        component="span"
        sx={(theme) => ({
          ...oneLine.sx,
          fontSize: `${typeScale['heading/m'].size}px`,
          fontWeight: typeScale['heading/m'].weight,
          lineHeight: 'normal',
          color: theme.karnama.semantic['text/primary'],
        })}
      >
        {brand}
      </Box>
    </Box>
  )
}
