import { resolve } from 'node:path';

import { defineConfig } from '@playwright/test';

// Mirrors playwright.config.ts but targets the smoke fixture (which consumes the
// packed tarball under smoke/node_modules/react-qrcode-reader).
const videoDir = resolve(process.cwd(), 'e2e/fixtures/video');

export default defineConfig({
  testDir: './smoke/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-smoke' }]]
    : [['list']],
  use: {
    baseURL: 'http://localhost:4174',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm --prefix smoke run dev',
    url: 'http://localhost:4174',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'smoke',
      use: {
        browserName: 'chromium',
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            `--use-file-for-fake-video-capture=${resolve(videoDir, 'hello.y4m')}`,
          ],
        },
      },
    },
  ],
});
