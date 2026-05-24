import { expect, test } from '@playwright/test';

const PAYLOAD_BY_PROJECT: Record<string, string> = {
  hello: 'hello',
  url: 'https://example.com',
};

test('action and onRead callbacks both fire on QR detection', async ({ page }, testInfo) => {
  const expected = PAYLOAD_BY_PROJECT[testInfo.project.name];
  if (!expected) {
    throw new Error(`no payload mapping for project ${testInfo.project.name}`);
  }
  await page.goto('/');
  // action receives the string payload.
  await expect(page.getByTestId('detected')).toHaveText(expected, { timeout: 15_000 });
  // onRead receives the full QRCode object; we display .data — same string.
  await expect(page.getByTestId('onread')).toHaveText(expected);
  await expect
    .poll(async () => Number(await page.getByTestId('callcount').textContent()))
    .toBeGreaterThan(0);
});
