#!/usr/bin/env node
// Build → pack → install the tarball into smoke/ → run the smoke Playwright
// suite. Mirrors what `npm publish` would produce so that the test exercises
// the actual distributed artifact, not the source tree.

import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readdirSync, rmSync, unlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(here, '..');
const repoRoot = resolve(packageDir, '..');
const smokeDir = resolve(packageDir, 'smoke');

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (res.status !== 0) {
    console.error(`\nfailed: ${cmd} ${args.join(' ')} (exit ${res.status})`);
    process.exit(res.status ?? 1);
  }
}

function step(name) {
  console.log(`\n==> ${name}`);
}

// 1. Clean any prior tarballs so we don't accidentally install a stale one.
step('clean prior tarballs');
for (const f of readdirSync(packageDir)) {
  if (f.startsWith('react-qrcode-reader-') && f.endsWith('.tgz')) {
    unlinkSync(resolve(packageDir, f));
  }
}

// 2. Mirror prepublishOnly: copy ancillary files in so npm pack picks them up.
step('stage README / LICENSE / MIGRATION');
for (const f of ['README.md', 'LICENSE', 'MIGRATION.md']) {
  copyFileSync(resolve(repoRoot, f), resolve(packageDir, f));
}

// 3. Build the dist with rollup.
step('npm run build');
run('npm', ['run', 'build'], { cwd: packageDir });

// 4. Pack the tarball.
step('npm pack');
run('npm', ['pack'], { cwd: packageDir });

const tgz = readdirSync(packageDir).find(
  (f) => f.startsWith('react-qrcode-reader-') && f.endsWith('.tgz'),
);
if (!tgz) {
  console.error('no tarball was produced');
  process.exit(1);
}
const tgzPath = resolve(packageDir, tgz);
console.log(`packed: ${tgz}`);

// 5. Re-install smoke/ base deps from the committed lockfile (deterministic),
// then overlay the freshly packed tarball. `--no-save` keeps both
// package.json and package-lock.json untouched, so the working tree stays
// clean across runs.
step('install smoke/ base deps (npm ci)');
rmSync(resolve(smokeDir, 'node_modules'), { recursive: true, force: true });
run('npm', ['ci', '--no-audit', '--no-fund'], { cwd: smokeDir });

step(`overlay tarball: ${tgz}`);
run('npm', ['install', '--no-save', '--no-audit', '--no-fund', tgzPath], {
  cwd: smokeDir,
});

// Sanity: tarball must be present in smoke/node_modules/
const installed = resolve(smokeDir, 'node_modules/react-qrcode-reader/package.json');
if (!existsSync(installed)) {
  console.error('tarball did not install into smoke/node_modules/');
  process.exit(1);
}

// 6. Run the smoke Playwright config (which uses port 4174 and the hello.y4m
// fake camera). pree2e (y4m generation) is not wired here; if y4m is missing
// we generate it explicitly.
step('ensure y4m fixtures exist');
run('node', ['e2e/fixtures/video/gen-fixtures.mjs'], { cwd: packageDir });

step('playwright (smoke)');
run('npx', ['playwright', 'test', '--config=playwright.smoke.config.ts'], {
  cwd: packageDir,
});

console.log('\nsmoke: all checks passed');
