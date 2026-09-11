import { Trans } from '@lingui/react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { Navigation, type Destination } from '../shared/navigation'

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
 * The navigation, KN-027, carries the three destinations and, in the sidebar,
 * the language switch that sat here until it landed. The screens are their own
 * cards: until they come, a destination only moves the current mark, and there
 * is no user and no signing out, so the sidebar draws neither.
 */
export const App = () => {
  const [current, setCurrent] = useState<Destination>(BOARD)
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation current={current} onNavigate={setCurrent} />
      {/* Below md the tab bar is pinned over the page's foot, so the page
          keeps its 72 clear there. */}
      <Box component="main" sx={{ flex: '1 1 auto', minWidth: 0, p: 6, pb: { xs: 15, md: 6 } }}>
        <Typography variant="h1" color="text.primary">
          <Trans id="KarNama" />
        </Typography>
      </Box>
    </Box>
  )
}
