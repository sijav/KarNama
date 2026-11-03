import { useLingui } from '@lingui/react'
import { Box, ButtonBase } from '@mui/material'
import { spacing, type as typeScale } from '../../theme/tokens'

// The props are documented in story-docs, not here, KN-207.
export interface ManualPathLinkProps {
  onClick: () => void
}

// The keyboard's outline, the product's two of border/focus, as the add modal's
// old row drew it, KN-029: the file draws the link no focus.
const FOCUS_OUTLINE = 2

const { body, label } = typeScale

// The Manual Path Link, node 961:101603, Default and Hover: «لینک یا متن آگهی
// ندارید؟» in text/secondary and 4 after it «ورود دستی» at Medium in
// text/brand, both in Body's 14 on 22; on hover the link is underlined. It is
// the way round the paste field to the empty form, so it is a button.
export const ManualPathLink = ({ onClick }: ManualPathLinkProps) => {
  const { i18n } = useLingui()
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: `${spacing['2xs']}px`,
        fontSize: `${body.size}px`,
        lineHeight: `${body.lineHeight}px`,
        fontWeight: body.weight,
        color: theme.karnama.semantic['text/secondary'],
      })}
    >
      <span>{i18n._('No link or posting text?')}</span>
      <ButtonBase
        disableRipple
        onClick={onClick}
        sx={(theme) => ({
          fontFamily: 'inherit',
          fontSize: `${body.size}px`,
          lineHeight: `${body.lineHeight}px`,
          fontWeight: label.weight,
          color: theme.karnama.semantic['text/brand'],
          borderRadius: `${theme.karnama.radius.sm}px`,
          '@media (hover: hover)': { '&:hover': { textDecoration: 'underline' } },
          '&.Mui-focusVisible': {
            outlineWidth: FOCUS_OUTLINE,
            outlineStyle: 'solid',
            outlineColor: theme.karnama.semantic['border/focus'],
          },
        })}
      >
        {i18n._('Manual entry')}
      </ButtonBase>
    </Box>
  )
}
