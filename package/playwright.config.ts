import { resolve } from 'node:path';

import { defineConfig } from '@playwright/test';

// Playwright runs from package/, so cwd is the package root.
const videoDir = resolve(process.cwd(), 'e2e/fixtures/video');

function chromiumArgs(y4m: string): string[] {
  return [
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    `--use-file-for-fake-video-capture=${resolve(videoDir, y4m)}`,
  ];
}

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run fixture:dev',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'hello',
      testMatch: [
        'qr-read.spec.ts',
        'props.spec.ts',
        'video-constraints.spec.ts',
      ],
      use: {
        browserName: 'chromium',
        launchOptions: { args: chromiumArgs('hello.y4m') },
      },
    },
    {
      name: 'url',
      testMatch: ['qr-read.spec.ts'],
      use: {
        browserName: 'chromium',
        launchOptions: { args: chromiumArgs('url.y4m') },
      },
    },
    {
      name: 'blank',
      testMatch: ['no-qr.spec.ts'],
      use: {
        browserName: 'chromium',
        launchOptions: { args: chromiumArgs('blank.y4m') },
      },
    },
  ],
});
