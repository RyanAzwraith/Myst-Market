import { defineConfig, devices } from '@playwright/test'
import { loadEnv } from 'vite'

const env = loadEnv('e2e', process.cwd(), '')

for (const [name, value] of Object.entries(env)) {
  process.env[name] ??= value
}

const baseURL = process.env.E2E_BASE_URL

if (!baseURL) {
  throw new Error(
    'Missing required environment variable: E2E_BASE_URL',
  )
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL,
    storageState: {
        cookies: [],
        origins: [],
    },
    trace: 'on-first-retry',
},
  webServer: {
    command: 'npm run dev -- --mode e2e',
    url: baseURL,
  },
  globalSetup: './e2e/globalSetup',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],

});
