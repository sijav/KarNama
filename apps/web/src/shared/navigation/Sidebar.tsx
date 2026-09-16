import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import { useId } from 'react'
import { usePreferences } from '../../core/preferences'
import { iconSize, spacing, type as typeScale } from '../../theme/tokens'
import { formatPhone } from '../contact-card'
import { ShellControls } from '../shell-controls'
import { BrandRow } from './BrandRow'
import { DESTINATIONS, useDestinationName, type Destination } from './destinations'
import { NavItem } from './NavItem'

// The props are documented in story-docs, not here, KN-207.
export interface SidebarProps {
  current: Destination
  userName?: string
  userPhone?: string
  onNavigate: (destination: Destination) => void
  onSignOut?: () => void
}

// Node 185:11's measures that bind no variable: 240 wide; the avatar a 32
// square; one pixel of edge and divider.
const WIDTH = 240
const MARK = 32
const EDGE = 1

// The foot's row starts where its first button's centre meets the Nav Items'
// icon column: an item's 12 of padding and half its 20 icon, less half the 32
// button, KN-478.
const FOOT_INSET = spacing.sm + iconSize.md / 2 - spacing.xl / 2

// One line, cut rather than wrapped. Under an sx key, which the lint rule reads as CSS.
const oneLine = { sx: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } } as const

// The desktop navigation of node 185:11, on the page's inline end side, the
// right in Persian, with its one pixel of border/default on the edge that faces
// the page. From the top: the brand, the signed-in user, a divider, and under
// «فضای کار» the three destinations; at the foot, below the room the file leaves
// empty, the shell's own controls, the language, settings and «خروج», as a row
// of Icon Buttons, DESIGN.md section 5, KN-478.
export const Sidebar = ({ current, userName, userPhone, onNavigate, onSignOut }: SidebarProps) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const nameOf = useDestinationName()
  const workspace = useId()
  return (
    <Box
      component="aside"
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        gap: `${spacing.xs}px`,
        boxSizing: 'border-box',
        width: WIDTH,
        height: '100%',
        paddingBlock: `${spacing.lg}px`,
        paddingInline: `${spacing.md}px`,
        backgroundColor: theme.karnama.semantic['bg/surface'],
        borderInlineEndStyle: 'solid',
        borderInlineEndWidth: EDGE,
        borderInlineEndColor: theme.karnama.semantic['border/default'],
        overflowY: 'auto',
      })}
    >
      {/* The Brand Row, 406:451, the one the sign-in card draws too, KN-518. */}
      <BrandRow />
      {/* The User Row, 406:457: a 32 avatar in bg/brand/container, the name at
          14 and Medium over the phone at 12, 4 apart. */}
      {userName === undefined ? null : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            gap: `${spacing.xs}px`,
            paddingBlock: `${spacing.xs}px`,
            paddingInline: `${spacing.sm}px`,
          }}
        >
          <Box
            aria-hidden
            sx={(theme) => ({
              flexShrink: 0,
              width: MARK,
              height: MARK,
              borderRadius: `${theme.karnama.radius.full}px`,
              backgroundColor: theme.karnama.semantic['bg/brand/container'],
            })}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: `${spacing['2xs']}px`, minWidth: 0 }}>
            <Box
              component="span"
              sx={(theme) => ({
                ...oneLine.sx,
                maxWidth: '100%',
                fontSize: `${typeScale.body.size}px`,
                fontWeight: typeScale.label.weight,
                lineHeight: 'normal',
                color: theme.karnama.semantic['text/primary'],
              })}
            >
              {userName}
            </Box>
            {userPhone === undefined ? null : (
              // Left to right, so its groups stay in order, as the Contact Card's.
              <Box
                component="span"
                dir="ltr"
                sx={(theme) => ({
                  fontSize: `${typeScale.label.size}px`,
                  fontWeight: typeScale.body.weight,
                  lineHeight: 'normal',
                  color: theme.karnama.semantic['text/secondary'],
                })}
              >
                {formatPhone(locale, userPhone)}
              </Box>
            )}
          </Box>
        </Box>
      )}
      {/* The Sidebar Divider, one pixel, written as one: MUI reads a bare 1 as
          the whole height. */}
      <Box
        aria-hidden
        sx={(theme) => ({ flexShrink: 0, height: `${EDGE}px`, backgroundColor: theme.karnama.semantic['border/default'] })}
      />
      {/* The Spacer, 185:4. */}
      <Box aria-hidden sx={{ flexShrink: 0, height: spacing.md }} />
      <Box
        component="nav"
        aria-labelledby={workspace}
        sx={{ display: 'flex', flexDirection: 'column', flexShrink: 0, gap: `${spacing.xs}px` }}
      >
        {/* The Section Label, 406:454: «فضای کار» at 12 and Medium. The file draws it in
            text/disabled, 2.54 to one on this surface, under the 4.5 WCAG asks of text that size;
            it is information rather than an inactive control, so it takes text/secondary, KN-666. */}
        <Box
          id={workspace}
          sx={(theme) => ({
            paddingBlock: `${spacing['2xs']}px`,
            paddingInline: `${spacing.sm}px`,
            fontSize: `${typeScale.label.size}px`,
            fontWeight: typeScale.label.weight,
            lineHeight: 'normal',
            color: theme.karnama.semantic['text/secondary'],
          })}
        >
          {i18n._('Workspace')}
        </Box>
        {DESTINATIONS.map(({ id, icon }) => (
          <NavItem
            key={id}
            icon={icon}
            label={nameOf(id)}
            active={id === current}
            onClick={() => {
              onNavigate(id)
            }}
          />
        ))}
      </Box>
      {/* The Grow Spacer, 366:447. */}
      <Box aria-hidden sx={{ flex: '1 1 auto' }} />
      <Box sx={{ flexShrink: 0, paddingInlineStart: `${FOOT_INSET}px` }}>
        <ShellControls placement="sidebar" {...(onSignOut === undefined ? {} : { onSignOut })} />
      </Box>
    </Box>
  )
}
