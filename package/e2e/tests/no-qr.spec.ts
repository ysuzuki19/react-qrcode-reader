import { expect, test } from '@playwright/test';

test('action callback is not fired when the stream contains no QR', async ({ page }) => {
  await page.goto('/');

  // Wait for the video to be playing so the analyze loop is actually running.
  await page.waitForFunction(() => {
    const v = document.querySelector('video') as HTMLVideoElement | null;
    return !!v && v.readyState >= 2 && !v.paused;
  }, undefined, { timeout: 15_000 });

  // Let many analyze cycles run (delay defaults to 100ms in the fixture).
  await page.waitForTimeout(2_000);

  await expect(page.getByTestId('callcount')).toHaveText('0');
  await expect(page.getByTestId('detected')).toHaveText('');
});
