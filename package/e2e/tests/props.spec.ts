import { expect, test } from '@playwright/test';

test('width and height props propagate to the rendered <video>', async ({ page }) => {
  await page.goto('/?delay=200&width=480&height=360');

  await expect(page.getByTestId('delay')).toHaveText('200');
  await expect(page.getByTestId('width')).toHaveText('480');
  await expect(page.getByTestId('height')).toHaveText('360');

  const video = page.locator('video');
  await expect(video).toHaveAttribute('width', '480');
  await expect(video).toHaveAttribute('height', '360');
});
