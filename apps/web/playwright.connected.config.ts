import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: 'connected.spec.ts',
  fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:5174', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: [
    {
      command: 'node ../../agent/scripts/scenario-server.mjs',
      env: { NODE_ENV: 'test' },
      url: 'http://127.0.0.1:4400/__test__/code',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'node ../../node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174 --strictPort',
      env: { VITE_API_URL: 'http://127.0.0.1:4400/graphql', VITE_AUTH_MODE: 'live' },
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: !process.env.CI,
    },
  ],
})
