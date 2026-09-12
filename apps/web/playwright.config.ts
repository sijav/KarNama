import { defineConfig, devices } from '@playwright/test'

/**
 * End to end, against a real build served by vite preview.
 *
 * Against the BUILD rather than the dev server, deliberately: the dev server
 * hides the two things most likely to break a deploy, the `base` path and the
 * production bundle, and a suite that only ever sees the dev server cannot fail
 * on either.
 */
export default defineConfig({
  testDir: './e2e',
  testIgnore: 'connected.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    env: { VITE_AUTH_MODE: 'demo', VITE_API_URL: 'http://127.0.0.1:4400/graphql' },
    // `--host localhost` is load bearing on Windows. Vite's preview binds to
    // ::1 by default while Playwright polls 127.0.0.1, so the readiness probe
    // never connects and the run dies after three minutes with a timeout that
    // says nothing about the server, which was up the whole time.
    command: 'npm run build && npm run preview -- --port 4173 --strictPort --host localhost',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
