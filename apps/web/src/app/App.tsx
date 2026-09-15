import { useLingui } from '@lingui/react'
import Box from '@mui/material/Box'
import { useEffect, useState } from 'react'
import { apiErrorText, extractJob } from '../core/api'
import { useAuth } from '../core/auth'
import { AuthScreen, JobsScreen, NetworkScreen } from '../screens'
import { Navigation, TAB_BAR_HEIGHT, type Destination } from '../shared/navigation'
import { spacing } from '../theme/tokens'
import { addressOf, destinationIn, pathForHash, siteBase } from './routes'

// The site's base, `/KarNama/` on GitHub Pages and `/` on a dev server, which
// every address the app reads and writes sits under. Read as a path against the
// page, since a Storybook build gives the preview a relative one.
const BASE = siteBase(import.meta.env.BASE_URL, window.location.href)

// The page the address is at. An address from when the page was in the hash,
// shared before the app moved to paths, is replaced by the path it names, once,
// as the shell first renders, KN-505.
const addressed = (): Destination => {
  const moved = pathForHash(window.location.hash, BASE)
  if (moved !== undefined) window.history.replaceState(window.history.state, '', moved)
  return destinationIn(window.location.pathname, BASE)
}

/**
 * The application shell.
 *
 * Deliberately NOT wrapping itself in `AppProviders`. It used to, and that made
 * the locale unreachable from outside: the Storybook language toolbar switched
 * the decorator while the shell went on mounting its own provider underneath at
 * the default locale, so the English story rendered Persian and passed nothing.
 * Providers belong at the root, composed once, so the same tree the application
 * mounts is the tree a story renders.
 *
 * The navigation, KN-027, carries the three destinations and, on a wide screen,
 * the shell's own controls at the sidebar's foot: the language, settings and
 * signing out. On a phone the sidebar gives way to the tab bar, which has room
 * for nothing more, so each screen's Page Header carries them, DESIGN.md
 * section 5, KN-478. Nothing sits in a row above a page's title.
 *
 * The destination is the address's path under the base, KN-505: `/jobs`, `/add`
 * and `/network`, each served on Pages from a page the build writes. `add` is a
 * destination in the navigation and a modal on the board, as the design has it:
 * job detail and adding are never pages of their own.
 */
export const App = () => {
  // Whether the page under the shell is selecting, so the tab bar can give the
  // foot of the screen to the Bulk Action Bar, KN-356. It lives here because
  // the navigation is the shell's and the selection is the page's.
  const [selecting, setSelecting] = useState(false)
  const [current, setCurrent] = useState<Destination>(addressed)
  const { session, signingUp, signOut, error } = useAuth()
  const { i18n } = useLingui()

  // The address and the state follow each other: the navigation pushes a path,
  // and the back button, or anything else that moves the history, sets the state.
  useEffect(() => {
    const read = () => {
      setCurrent(destinationIn(window.location.pathname, BASE))
    }
    window.addEventListener('popstate', read)
    return () => {
      window.removeEventListener('popstate', read)
    }
  }, [])

  // A pushed path fires no popstate, so the state is set here too. Going to the
  // page already shown adds nothing to the history, as a hash left unchanged did.
  const navigate = (destination: Destination) => {
    const address = addressOf(destination, BASE)
    if (window.location.pathname !== address) window.history.pushState(null, '', address)
    setCurrent(destination)
  }

  // Everything in the archive belongs to someone, so there is nothing to show
  // until somebody has signed in and said who they are, KN-046.
  if (!session || signingUp) return <AuthScreen />

  return (
    <Box sx={{ display: 'flex', height: '100dvh', minWidth: 0, overflow: 'hidden', bgcolor: 'background.default' }}>
      <Navigation
        selecting={selecting}
        // The add flow opens over the board, and its frames keep the board the
        // current page while it is open, 243:814 and 243:682, KN-481.
        current={current === 'add' ? 'jobs' : current}
        onNavigate={navigate}
        userName={session.name}
        userPhone={session.phone}
        onSignOut={signOut}
      />
      {/* No padding of its own: each page brings its gutters with its Header
          band, 32 on a desktop and 16 on a phone, KN-481 and KN-452. Below md
          the tab bar is pinned over the page's foot, so the page keeps its 72
          clear there. */}
      <Box
        component="main"
        sx={{
          flex: '1 1 auto',
          minWidth: 0,
          minHeight: 0,
          overflowY: current === 'network' ? 'auto' : 'hidden',
          display: 'flex',
          flexDirection: 'column',
          pb: { xs: `calc(${TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom))`, md: 0 },
        }}
      >
        {error ? (
          <Box role="alert" sx={{ color: 'error.main', px: { xs: `${spacing.md}px`, md: `${spacing.xl}px` }, pt: `${spacing.md}px` }}>
            {apiErrorText(i18n, error)}
          </Box>
        ) : null}
        {current === 'network' ? (
          <NetworkScreen onSelecting={setSelecting} onSignOut={signOut} />
        ) : (
          <JobsScreen
            onSelecting={setSelecting}
            onSignOut={signOut}
            // Reading a posting is the server's work, and the shell is where the
            // product meets the server, KN-495.
            onExtract={extractJob}
            addOpen={current === 'add'}
            onAddClose={() => {
              navigate('jobs')
            }}
          />
        )}
      </Box>
    </Box>
  )
}
