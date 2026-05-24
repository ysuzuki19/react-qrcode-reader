import { expect, test } from '@playwright/test';

// We can't compare enumerateDevices()[i].deviceId against the active track's
// deviceId in fake-camera mode: Chromium issues a fresh per-origin hash on
// each context, so the IDs drift across page reloads. Instead we patch
// getUserMedia before navigation and assert that QrCodeReader forwards the
// videoConstraints prop intact.
test('videoConstraints prop is forwarded to getUserMedia', async ({ page }) => {
  await page.addInitScript(() => {
    const orig = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    const calls: MediaStreamConstraints[] = [];
    (window as unknown as { __gumCalls: MediaStreamConstraints[] }).__gumCalls = calls;
    navigator.mediaDevices.getUserMedia = (constraints) => {
      calls.push(JSON.parse(JSON.stringify(constraints)));
      return orig(constraints);
    };
  });

  const probeDeviceId = 'fixture-probe-device-id';
  await page.goto(`/?deviceId=${encodeURIComponent(probeDeviceId)}`);
  await expect(page.getByTestId('deviceId')).toHaveText(probeDeviceId);

  // Wait until the analyzer is running, which means getUserMedia has resolved.
  await page.waitForFunction(() => {
    const v = document.querySelector('video') as HTMLVideoElement | null;
    return !!v && v.readyState >= 2 && !v.paused;
  }, undefined, { timeout: 15_000 });

  const constraints = await page.evaluate(
    () =>
      (window as unknown as { __gumCalls: MediaStreamConstraints[] }).__gumCalls,
  );
  const videoConstraint = constraints
    .map((c) => c.video)
    .find(
      (v): v is MediaTrackConstraints =>
        typeof v === 'object' && v !== null && 'deviceId' in v,
    );
  expect(videoConstraint).toBeDefined();
  expect(videoConstraint?.deviceId).toBe(probeDeviceId);
});
