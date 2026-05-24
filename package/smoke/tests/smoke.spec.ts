import { expect, test } from '@playwright/test';

// This test runs against the BUILT artifact installed from the packed tarball
// (see ../scripts/smoke.mjs). It validates that:
//   1. The package's main/module/types entries resolve correctly via npm.
//   2. Both `action` and `onRead` API surfaces actually fire on detection.
//   3. The named export `QRCode` survives the build/types pipeline (the smoke
//      fixture imports it; a missing export would fail TypeScript-via-Vite at
//      transform time, surfacing as a 500 from the dev server).
test('built artifact: action and onRead both fire on QR detection', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('detected')).toHaveText('hello', { timeout: 15_000 });
  await expect(page.getByTestId('onread')).toHaveText('hello', { timeout: 15_000 });
});
