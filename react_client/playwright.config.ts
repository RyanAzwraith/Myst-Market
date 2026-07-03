import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: process.env.E2E_BASE_URL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: process.env.E2E_BASE_URL,
  },
  globalSetup: './tests/e2e/globalSetup',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],

});