import Box from '@mui/material/Box'
import { useEffect, useState } from 'react'
import { useAuth } from '../core/auth'
import { AuthScreen, JobsScreen, NetworkScreen } from '../screens'
import { Navigation, type Destination } from '../shared/navigation'
import { addressOf, destinationIn } from './routes'

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
 * the language switch at the sidebar's foot. On a phone the sidebar gives way to
 * the tab bar, which has room for nothing more, so each screen's Page Header
 * carries the switch there, DESIGN.md section 5, KN-355.
 *
 * The destination is the address's, KN-042: `#/jobs`, `#/add` and `#/network`,
 * a hash because GitHub Pages has no server to rewrite a deep link. `add` is a
 * destination in the navigation and a modal on the board, as the design has it:
 * job detail and adding are never pages of their own.
 */
export const App = () => {
  // Whether the page under the shell is selecting, so the tab bar can give the
  // foot of the screen to the Bulk Action Bar, KN-356. It lives here because
  // the navigation is the shell's and the selection is the page's.
  const [selecting, setSelecting] = useState(false)
  const [current, setCurrent] = useState<Destination>(() => destinationIn(window.location.hash))
  const { session, signingUp, signOut } = useAuth()

  // The address and the state follow each other: the navigation sets the hash,
  // and the back button, a typed address or a shared link sets the state.
  useEffect(() => {
    const read = () => {
      setCurrent(destinationIn(window.location.hash))
    }
    window.addEventListener('hashchange', read)
    return () => {
      window.removeEventListener('hashchange', read)
    }
  }, [])

  const navigate = (destination: Destination) => {
    window.location.hash = addressOf(destination)
    setCurrent(destination)
  }

  // Everything in the archive belongs to someone, so there is nothing to show
  // until somebody has signed in and said who they are, KN-046.
  if (!session || signingUp) return <AuthScreen />

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation selecting={selecting} current={current} onNavigate={navigate} userName={session.name} userPhone={session.phone} onSignOut={signOut} />
      {/* Below md the tab bar is pinned over the page's foot, so the page
          keeps its 72 clear there. */}
      <Box component="main" sx={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', p: 6, pb: { xs: 15, md: 6 } }}>
        {current === 'network' ? (
          <NetworkScreen onSelecting={setSelecting} />
        ) : (
          <JobsScreen
            onSelecting={setSelecting}
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
