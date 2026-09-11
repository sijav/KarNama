import { Box, ButtonBase } from '@mui/material'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Icon, type IconName } from '../icon'
import { CURRENT, insetRing } from './destinations'

// The props are documented in story-docs, not here, KN-207.
export interface NavItemProps {
  icon: IconName
  label: string
  active?: boolean
  onClick: () => void
}

// Node 184:14's measure that binds no variable: the row is 44 tall.
const HEIGHT = 44
// The hover's motion, the reaction on 184:9: Smart Animate, ease out, over 120 ms.
const HOVER_MS = 120

// The Nav Item of node 184:14, Default, Active and Hover: a row 44 tall of
// radius md, 12 of padding and 8 between the 20 icon at its inline start and
// the label at 14 and Medium. Default is text/secondary on nothing, Hover
// takes bg/surface-secondary, Active bg/brand/container with text/brand, and
// says it is the current page.
export const NavItem = ({ icon, label, active = false, onClick }: NavItemProps) => (
  <ButtonBase
    disableRipple
    aria-current={active ? CURRENT : undefined}
    onClick={onClick}
    sx={(theme) => {
      const colour = theme.karnama.semantic
      return {
        position: 'relative',
        flexShrink: 0,
        justifyContent: 'flex-start',
        gap: `${spacing.xs}px`,
        boxSizing: 'border-box',
        width: '100%',
        height: HEIGHT,
        paddingInline: `${spacing.sm}px`,
        borderRadius: `${theme.karnama.radius.md}px`,
        // A button takes the browser's own font; the label takes the page's.
        fontFamily: 'inherit',
        fontSize: `${typeScale.body.size}px`,
        lineHeight: 'normal',
        fontWeight: typeScale.label.weight,
        textAlign: 'start',
        color: active ? colour['text/brand'] : colour['text/secondary'],
        backgroundColor: active ? colour['bg/brand/container'] : 'transparent',
        transition: `background-color ${HOVER_MS}ms ease-out`,
        '&:hover': active ? {} : { backgroundColor: colour['bg/surface-secondary'] },
        ...insetRing.sx(theme, theme.karnama.radius.md),
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }
    }}
  >
    <Icon name={icon} size="md" color="inherit" />
    <Box component="span" sx={{ flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {label}
    </Box>
  </ButtonBase>
)
