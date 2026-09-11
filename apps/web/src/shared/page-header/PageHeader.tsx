import { useLingui } from '@lingui/react'
import { Box, ButtonBase } from '@mui/material'
import type { ReactNode } from 'react'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Icon } from '../icon'
import { LanguageSwitch } from '../language-switch'

// The props are documented in story-docs, not here, KN-207.
export interface PageHeaderProps {
  title: string
  onBack?: () => void
  action?: ReactNode
}

// The back control's ring, the product's two pixels at an offset of two; the
// header has room round it, 12 to the title and nothing that clips.
const FOCUS_EDGE = 2

// The Page Header of node 155:56: the title at the inline start, with the
// back arrow of 155:72 before it when there is somewhere to go back to, and
// the primary action at the inline end. On a narrow screen the language switch
// follows the action, DESIGN.md's section 5, since the tab bar has no room.
export const PageHeader = ({ title, onBack, action }: PageHeaderProps) => {
  const { i18n } = useLingui()
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: `${spacing.sm}px`, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.sm}px`, minWidth: 0 }}>
        {onBack === undefined ? null : (
          // The file's arrow points right, back in a right to left page; the
          // set has no left arrow, so an English page mirrors it.
          <ButtonBase
            aria-label={i18n._('Back')}
            disableRipple
            onClick={onBack}
            sx={(theme) => ({
              flexShrink: 0,
              borderRadius: `${theme.karnama.radius.sm}px`,
              transform: theme.direction === 'rtl' ? 'none' : 'scaleX(-1)',
              '&.Mui-focusVisible': { outlineWidth: FOCUS_EDGE, outlineStyle: 'solid', outlineColor: theme.karnama.semantic['border/focus'], outlineOffset: FOCUS_EDGE },
            })}
          >
            <Icon name="arrow-right" size="md" />
          </ButtonBase>
        )}
        {/* The page's heading, 20 at 600: the Heading/M role. */}
        <Box
          component="h1"
          sx={(theme) => ({
            margin: 0,
            minWidth: 0,
            fontSize: `${typeScale['heading/m'].size}px`,
            lineHeight: `${typeScale['heading/m'].lineHeight}px`,
            fontWeight: typeScale['heading/m'].weight,
            color: theme.karnama.semantic['text/primary'],
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          })}
        >
          {title}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.sm}px`, flexShrink: 0 }}>
        {action}
        {/* Below MUI's md, the build's mobile breakpoint, DESIGN.md section 5. */}
        <Box sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
          <LanguageSwitch placement="header" />
        </Box>
      </Box>
    </Box>
  )
}
