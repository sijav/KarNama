import { useLingui } from '@lingui/react'
import { Box, ButtonBase } from '@mui/material'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Icon } from '../icon'
import { CURRENT, DESTINATIONS, insetRing, useDestinationName, type Destination } from './destinations'

// The props are documented in story-docs, not here, KN-207.
export interface TabBarProps {
  current: Destination
  onNavigate: (destination: Destination) => void
}

// Node 185:19's measures that bind no variable: the bar 72 tall and its one
// pixel of border/default along the top.
const HEIGHT = 72
const EDGE = 1

// The phone's navigation of node 185:19: the full width, bg/surface, the same
// three destinations as the sidebar in equal thirds, the first at the inline
// start, the right in Persian. Each is a 24 icon 4 above its label at 12 and
// Medium, text/secondary, or text/brand for the current page. Nothing else
// joins it: the language switch sits in the Page Header on a phone,
// DESIGN.md section 5.
export const TabBar = ({ current, onNavigate }: TabBarProps) => {
  const { i18n } = useLingui()
  const nameOf = useDestinationName()
  return (
    <Box
      component="nav"
      aria-label={i18n._('Workspace')}
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
        width: '100%',
        height: HEIGHT,
        paddingBlock: `${spacing.xs}px`,
        backgroundColor: theme.karnama.semantic['bg/surface'],
        borderBlockStartStyle: 'solid',
        borderBlockStartWidth: EDGE,
        borderBlockStartColor: theme.karnama.semantic['border/default'],
      })}
    >
      {DESTINATIONS.map(({ id, icon }) => (
        <ButtonBase
          key={id}
          disableRipple
          aria-current={id === current ? CURRENT : undefined}
          onClick={() => {
            onNavigate(id)
          }}
          sx={(theme) => ({
            position: 'relative',
            flex: '1 1 0',
            minWidth: 0,
            flexDirection: 'column',
            gap: `${spacing['2xs']}px`,
            paddingBlock: `${spacing['2xs']}px`,
            borderRadius: `${theme.karnama.radius.md}px`,
            // A button takes the browser's own font; the label takes the page's.
            fontFamily: 'inherit',
            fontSize: `${typeScale.label.size}px`,
            lineHeight: `${typeScale.label.lineHeight}px`,
            fontWeight: typeScale.label.weight,
            color: id === current ? theme.karnama.semantic['text/brand'] : theme.karnama.semantic['text/secondary'],
            ...insetRing.sx(theme, theme.karnama.radius.md),
          })}
        >
          <Icon name={icon} size="base" color="inherit" />
          <Box component="span" sx={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {nameOf(id)}
          </Box>
        </ButtonBase>
      ))}
    </Box>
  )
}
