#!/usr/bin/env node
// Usage:
//   node generate.mjs <payload> <output.y4m>
//   node generate.mjs --blank <output.y4m>
//
// Generates a 640x480 y4m video for use with Chromium's
// --use-file-for-fake-video-capture flag. The video loops a single QR
// image (or a plain white frame in --blank mode) at 10 fps for 5 seconds.

import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import QRCode from 'qrcode';

const FRAME_W = 640;
const FRAME_H = 480;
const FPS = 10;
const DURATION_SEC = 5;
const QR_SIZE = 320;

function usage() {
  console.error(
    'Usage:\n  node generate.mjs <payload> <output.y4m>\n  node generate.mjs --blank <output.y4m>',
  );
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length !== 2) usage();
const [first, output] = args;
if (!output.endsWith('.y4m')) {
  console.error('output must end in .y4m');
  process.exit(1);
}

if (first === '--blank') {
  const res = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-f', 'lavfi',
      '-i', `color=color=white:size=${FRAME_W}x${FRAME_H}:rate=${FPS}:duration=${DURATION_SEC}`,
      '-pix_fmt', 'yuv420p',
      output,
    ],
    { stdio: 'inherit' },
  );
  process.exit(res.status ?? 1);
}

const tmp = mkdtempSync(join(tmpdir(), 'qr-y4m-'));
const pngPath = join(tmp, 'qr.png');

try {
  await QRCode.toFile(pngPath, first, {
    width: QR_SIZE,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#000000', light: '#FFFFFF' },
  });

  const res = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-loop', '1',
      '-t', String(DURATION_SEC),
      '-r', String(FPS),
      '-i', pngPath,
      '-vf', `pad=${FRAME_W}:${FRAME_H}:(ow-iw)/2:(oh-ih)/2:white,format=yuv420p`,
      output,
    ],
    { stdio: 'inherit' },
  );
  if (res.status !== 0) process.exit(res.status ?? 1);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

console.log(`generated ${output}`);
