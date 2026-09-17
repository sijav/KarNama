import { useLingui } from '@lingui/react'
import Box from '@mui/material/Box'
import { useLayoutEffect, useRef, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation, useMatch, useNavigate } from 'react-router'
import { apiErrorText, extractJob } from '../core/api'
import { useAuth } from '../core/auth'
import { AuthScreen, JobsScreen, NetworkScreen } from '../screens'
import { Navigation, TAB_BAR_HEIGHT, type Destination } from '../shared/navigation'
import { spacing } from '../theme/tokens'
import { PATH, pathForHash, siteBase } from './routes'

// The site's base, `/KarNama/` on GitHub Pages and `/` on a dev server, which
// every address the app reads and writes sits under. Read as a path against the
// page, since a Storybook build gives the preview a relative one, and handed to
// the router as its basename rather than parsed by hand, KN-698.
const BASE = siteBase(import.meta.env.BASE_URL, window.location.href)

/**
 * An address shared before the page moved out of the hash, replaced by the path
 * it names, KN-505.
 *
 * **This runs before the router is constructed, and that ordering is the whole
 * point.** `history.replaceState` fires no `popstate`, so a router that has
 * already read its initial location would go on routing `/` while the address
 * says `/network`, and nothing would look wrong until someone opened a link
 * shared a month ago.
 */
const migrateLegacyHash = () => {
  const moved = pathForHash(window.location.hash, BASE)
  if (moved !== undefined) window.history.replaceState(window.history.state, '', moved)
  return null
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
 * job detail and adding are never pages of their own, which is why it renders the
 * board with its flow open rather than a page of its own, KN-698.
 */
export const App = () => {
  // The hash migration happens in a state initialiser, which React runs during
  // the first render of THIS component, before any child mounts. So the address
  // is already a path by the time the router below reads it.
  useState(migrateLegacyHash)

  return (
    <BrowserRouter basename={BASE}>
      <Shell />
    </BrowserRouter>
  )
}

/**
 * Which SCREEN is showing, which is not the same as which destination.
 *
 * The add flow is a modal over the board, DESIGN.md's navigation section, so
 * `/jobs` and `/add` are one screen and only `/network` is the other. Named
 * rather than read off `current` where it is used, because `current` is `'add'`
 * on the add route and keying anything on that would treat opening the flow as
 * a change of screen, KN-473.
 */
type Screen = 'jobs' | 'network'

const Shell = () => {
  // Whether the page under the shell is selecting, so the tab bar can give the
  // foot of the screen to the Bulk Action Bar, KN-356. It lives here because
  // the navigation is the shell's and the selection is the page's.
  const [selecting, setSelecting] = useState(false)
  const { session, signingUp, signOut, error } = useAuth()
  const { i18n } = useLingui()
  // The address is the router's, and the basename is already off the front of it.
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  // Which destination is showing comes from the ROUTER's own match, against the
  // same PATH values the routes below are given, so the page drawn and the tab lit
  // cannot disagree, KN-700. Splitting the path by hand disagreed in both
  // directions: a route matches the WHOLE remaining pathname unless it ends in a
  // wildcard, so `/network/anything` is the board while the split said network;
  // and matching ignores CASE, so `/NETWORK` is the network page while the split
  // said jobs. Both are reachable, since Pages answers an unknown path with
  // `404.html`, which is this app.
  const network = useMatch(PATH.network)
  const add = useMatch(PATH.add)
  const current: Destination = network ? 'network' : add ? 'add' : 'jobs'
  const screen: Screen = current === 'network' ? 'network' : 'jobs'

  // The page region, and the only thing here that outlives a route change: the
  // screen inside it is replaced, this is not. It takes focus when the screen
  // changes, so it is focusable on purpose and never by Tab.
  const main = useRef<HTMLElement | null>(null)
  const shown = useRef<Screen | undefined>(undefined)

  // Where a reader carries on from when the screen is replaced under them,
  // DESIGN.md's navigation section, KN-473. A LAYOUT effect because React runs
  // it once the arriving route has committed and before paint, so no frame is
  // ever painted with focus lost. The first screen is skipped, since arriving
  // at the app should take focus from nobody, and `shown` is cleared only while
  // signed out, never in a cleanup: that is what stops StrictMode's second
  // setup from reading as a change of screen.
  useLayoutEffect(() => {
    if (!session || signingUp) {
      shown.current = undefined
      return
    }
    const before = shown.current
    shown.current = screen
    if (before === undefined || before === screen) return
    main.current?.focus()
  }, [screen, session, signingUp])

  // Everything in the archive belongs to someone, so there is nothing to show
  // until somebody has signed in and said who they are, KN-046.
  if (!session || signingUp) return <AuthScreen />

  const board = (addOpen: boolean) => (
    <JobsScreen
      onSelecting={setSelecting}
      onSignOut={signOut}
      // Reading a posting is the server's work, and the shell is where the
      // product meets the server, KN-495.
      onExtract={extractJob}
      addOpen={addOpen}
      onAddClose={() => {
        // Back to the board with the search it had, KN-697. This still PUSHES:
        // the close's own history is KN-579's, and replacing here would trade one
        // defect for another, leaving two identical board entries so that Back
        // appears to do nothing.
        void navigate(`${PATH.jobs}${search}`)
      }}
    />
  )

  return (
    <Box sx={{ display: 'flex', height: '100dvh', minWidth: 0, overflow: 'hidden', bgcolor: 'background.default' }}>
      <Navigation
        selecting={selecting}
        // The add flow opens over the board, and its frames keep the board the
        // current page while it is open, 243:814 and 243:682, KN-481.
        current={current === 'add' ? 'jobs' : current}
        // Going to the page already shown adds nothing to the history. The
        // router pushes whatever address it is handed, the one already showing
        // included, so the guard the hand-rolled shell had is still ours to
        // keep: without it Back returns to the same page once for every time the
        // reader pressed it, KN-698. Compared on the PATH rather than on the
        // current destination, so a mistyped address still gets fixed by
        // pressing the page it is nearest, as it did before.
        onNavigate={(destination) => {
          // The add flow is a MODAL over the board, DESIGN.md line 791, so it
          // keeps the search the board is showing, KN-697: a reader who searches,
          // opens it and cancels must not land on a board they never searched.
          // Every other destination is a different page and drops the query.
          const to = destination === 'add' ? `${PATH.add}${search}` : PATH[destination]
          if (pathname !== PATH[destination]) void navigate(to)
        }}
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
        ref={main}
        // Focusable on purpose and never by Tab: the effect above puts focus
        // here when the screen changes, KN-473.
        tabIndex={-1}
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
        <Routes>
          <Route path={PATH.network} element={<NetworkScreen onSelecting={setSelecting} onSignOut={signOut} />} />
          <Route path={PATH.add} element={board(true)} />
          {/* Anything else is the board, which keeps what Pages serves from
              404.html showing the archive rather than redirecting a mistyped
              address somewhere else, KN-505 and KN-698. */}
          <Route path="*" element={board(false)} />
        </Routes>
      </Box>
    </Box>
  )
}
