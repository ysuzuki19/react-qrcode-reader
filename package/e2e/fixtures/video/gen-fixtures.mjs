#!/usr/bin/env node
// Generates all y4m fixtures used by the e2e suite. Skips files that already
// exist so local re-runs are fast; CI starts from a clean tree and generates
// fresh.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const generator = resolve(here, 'generate.mjs');

const fixtures = [
  { arg: 'hello', file: 'hello.y4m' },
  { arg: 'https://example.com', file: 'url.y4m' },
  { arg: '--blank', file: 'blank.y4m' },
];

for (const { arg, file } of fixtures) {
  const out = resolve(here, file);
  if (existsSync(out)) {
    console.log(`skip ${file} (already exists)`);
    continue;
  }
  const res = spawnSync('node', [generator, arg, out], { stdio: 'inherit' });
  if (res.status !== 0) process.exit(res.status ?? 1);
}
