import { Trans } from '@lingui/react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { LanguageSwitch } from '../shared/language-switch'

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
    {/*
      Here TEMPORARILY, and it is a placeholder inside a placeholder. DESIGN.md
      puts the switch at the bottom of the sidebar `185:11` on desktop and in
      the Page Header `155:56` on mobile, adding no new chrome, and neither
      exists yet. It sits in the shell meanwhile because a control a user cannot
      reach is not a feature: without it the language choice lives only in
      Storybook, and "switching persists" cannot be shown end to end. Move it
      when the sidebar lands, and delete this comment with it.
    */}
    <Box sx={{ mt: 6 }}>
      <LanguageSwitch />
    </Box>
  </Box>
)
