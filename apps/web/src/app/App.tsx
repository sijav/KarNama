import { Trans } from '@lingui/react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

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
 * The board, the navigation and the language button are their own cards.
 * Components are built and storybooked on their own before any screen composes
 * them, so what is here exists to give the gate something real to lint, type
 * check, test, build and render.
 */
export const App = () => (
  <Box component="main" sx={{ p: 6, minHeight: '100vh', bgcolor: 'background.default' }}>
    <Typography variant="h1" color="text.primary">
      <Trans id="KarNama" />
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
      <Trans id="My job opportunities" />
    </Typography>
  </Box>
)
