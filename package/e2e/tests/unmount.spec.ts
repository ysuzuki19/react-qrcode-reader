import { expect, test } from '@playwright/test';

// Regression guard for the setInterval cleanup in QrCodeReader's useEffect.
// If the cleanup (clearInterval) is dropped, the analyzer keeps firing after
// the component unmounts and callcount keeps growing.
test('callcount stops growing after QrCodeReader unmounts', async ({ page }) => {
  await page.goto('/');

  // 1. Wait until detection has happened at least once so we know the
  //    interval is actually running.
  await expect
    .poll(async () => Number(await page.getByTestId('callcount').textContent()), {
      timeout: 15_000,
    })
    .toBeGreaterThan(0);

  // 2. Unmount the component and confirm the <video> element is gone.
  await page.getByTestId('unmount').click();
  await expect(page.getByTestId('mounted')).toHaveText('false');
  await expect(page.locator('video')).toHaveCount(0);

  // 3. Snapshot the callcount immediately after unmount, then wait
  //    multiple analyze cycles (default delay = 100ms, so 1.5s = ~15 cycles).
  const snapshot = Number(await page.getByTestId('callcount').textContent());
  await page.waitForTimeout(1_500);
  const after = Number(await page.getByTestId('callcount').textContent());

  expect(after).toBe(snapshot);
});
