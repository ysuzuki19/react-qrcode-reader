import { expect, test } from '@playwright/test';

const PAYLOAD_BY_PROJECT: Record<string, string> = {
  hello: 'hello',
  url: 'https://example.com',
};

test('detects QR payload from fake camera', async ({ page }, testInfo) => {
  const expected = PAYLOAD_BY_PROJECT[testInfo.project.name];
  if (!expected) {
    throw new Error(`no payload mapping for project ${testInfo.project.name}`);
  }
  await page.goto('/');
  await expect(page.getByTestId('detected')).toHaveText(expected, { timeout: 15_000 });
  await expect.poll(async () => Number(await page.getByTestId('callcount').textContent())).toBeGreaterThan(0);
});
