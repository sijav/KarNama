import Box from '@mui/material/Box'
import { useState } from 'react'
import { Navigation, useDestinationName, type Destination } from '../shared/navigation'
import { PageHeader } from '../shared/page-header'

// The page the shell opens on, the board.
const BOARD: Destination = 'jobs'

/**
 * The application shell.
 *
 * Deliberately almost empty, and deliberately NOT wrapping itself in
 * `AppProviders`. It used to, and that made the locale unreachable from
 * outside: the Storybook language toolbar switched the decorator while the
 * shell went on mounting its own provider underneath at the default locale, so
 * the English story rendered Persian and passed nothing. Providers belong at
 * the root, composed once, so the same tree the application mounts is the tree
 * a story renders.
 *
 * The navigation, KN-027, carries the three destinations and, on a wide
 * screen, the language switch at the sidebar's foot. On a phone the sidebar
 * gives way to the tab bar, which has room for nothing more, so the page's
 * Page Header carries the switch there, DESIGN.md section 5, and the shell
 * draws it with the current destination's name, KN-355. The screens are their
 * own cards: until they come, a destination only moves the current mark and
 * the header's title, and there is no user and no signing out, so the sidebar
 * draws neither.
 */
export const App = () => {
  const [current, setCurrent] = useState<Destination>(BOARD)
  const nameOf = useDestinationName()
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation current={current} onNavigate={setCurrent} />
      {/* Below md the tab bar is pinned over the page's foot, so the page
          keeps its 72 clear there. */}
      <Box component="main" sx={{ flex: '1 1 auto', minWidth: 0, p: 6, pb: { xs: 15, md: 6 } }}>
        <PageHeader title={nameOf(current)} />
      </Box>
    </Box>
  )
}
