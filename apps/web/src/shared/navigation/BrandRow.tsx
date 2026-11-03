import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import { spacing, type as typeScale } from '../../theme/tokens'
import { LogoMark } from '../logo-mark'

// The row's height, the mark's square, 32, which no variable binds.
const MARK = 32

// One line, cut rather than wrapped. Under an sx key, which the lint rule reads as CSS.
const oneLine = { sx: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } } as const

// The Brand Row, drawn alike at the sidebar's top and on the sign-in card,
// 407:6953, so both draw this one, KN-518: the mark, 576:7665, KN-742, and 8
// after it the name at 20 and SemiBold on the font's normal line, which is what
// the file's lines are. The mark is decoration here, the name beside it saying
// what it is.
export const BrandRow = () => {
  const { i18n } = useLingui()
  const brand = i18n._('KarNama')
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: `${spacing.xs}px`, height: MARK }}>
      <LogoMark />
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
