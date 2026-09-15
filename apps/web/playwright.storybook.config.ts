import { defineConfig, devices } from '@playwright/test'

/**
 * The published Storybook, opened story by story, KN-226: a production build,
 * served under the base Pages publishes it at, every story in headless Chromium,
 * failing on any page error or console error. `npm run e2e` does not run it; the
 * Pages workflow runs it before it publishes, and `npm run check:storybook` builds
 * and runs it here.
 */
const BASE = process.env.KARNAMA_STORYBOOK_BASE ?? '/'
// A port of its own and no reuse, so a server left running from another build is
// never the one checked.
const PORT = 6106

export default defineConfig({
  testDir: './e2e/storybook',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // A story that fails once is shown that time; a retry would hide it.
  retries: 0,
  // Input's Multiline types twenty lines: 24 seconds alone and 40 six at a time.
  timeout: 120_000,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report/storybook' }]] : [['list']],
  use: { baseURL: `http://127.0.0.1:${PORT}${BASE}`, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node e2e/storybook/serve.ts',
    env: { PORT: String(PORT), KARNAMA_STORYBOOK_BASE: BASE },
    url: `http://127.0.0.1:${PORT}${BASE}iframe.html`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
