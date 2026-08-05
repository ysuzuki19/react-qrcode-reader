#!/usr/bin/env node
// Build → pack → install the tarball into smoke/ → run the smoke Playwright
// suite. Mirrors what `npm publish` would produce so that the test exercises
// the actual distributed artifact, not the source tree.
//
// REACT_VERSION selects which React major the consumer app runs on; it must be
// one of the majors declared in the package's peerDependencies.

import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  unlinkSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(here, '..');
const repoRoot = resolve(packageDir, '..');
const smokeDir = resolve(packageDir, 'smoke');

// smoke/package-lock.json pins the default major, so that leg is fully
// deterministic. Other majors are overridden with --no-save, which keeps the
// committed lockfile authoritative instead of forking it per major.
const DEFAULT_REACT_MAJOR = '19';
const REACT_OVERLAYS = {
  18: [
    'react@^18.3.1',
    'react-dom@^18.3.1',
    '@types/react@^18.3.12',
    '@types/react-dom@^18.3.1',
  ],
};

const reactMajor = process.env.REACT_VERSION ?? DEFAULT_REACT_MAJOR;
if (reactMajor !== DEFAULT_REACT_MAJOR && !REACT_OVERLAYS[reactMajor]) {
  console.error(
    `REACT_VERSION=${reactMajor} is not supported; expected one of ` +
      `${[DEFAULT_REACT_MAJOR, ...Object.keys(REACT_OVERLAYS)].join(', ')}`,
  );
  process.exit(1);
}

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
// then overlay the freshly packed tarball (and the React override, if any).
// `--no-save` keeps both package.json and package-lock.json untouched, so the
// working tree stays clean across runs.
step('install smoke/ base deps (npm ci)');
rmSync(resolve(smokeDir, 'node_modules'), { recursive: true, force: true });
run('npm', ['ci', '--no-audit', '--no-fund'], { cwd: smokeDir });

// The tarball and the React override must go in as ONE install: npm reconciles
// the whole tree against smoke/package.json on every install, so a React
// override applied in a separate, earlier step would be reverted to the pinned
// default by the tarball install.
const overlay = [tgzPath, ...(REACT_OVERLAYS[reactMajor] ?? [])];
step(`overlay tarball (${tgz}) + React ${reactMajor}`);
run('npm', ['install', '--no-save', '--no-audit', '--no-fund', ...overlay], {
  cwd: smokeDir,
});

// Sanity: tarball must be present in smoke/node_modules/
const installed = resolve(smokeDir, 'node_modules/react-qrcode-reader/package.json');
if (!existsSync(installed)) {
  console.error('tarball did not install into smoke/node_modules/');
  process.exit(1);
}

// Sanity: the consumer app must actually be on the requested major, otherwise
// a silently-reverted override would let the matrix report a false pass.
const reactPkg = resolve(smokeDir, 'node_modules/react/package.json');
const installedReact = JSON.parse(readFileSync(reactPkg, 'utf8')).version;
if (installedReact.split('.')[0] !== reactMajor) {
  console.error(`expected React ${reactMajor}.x in smoke/, got ${installedReact}`);
  process.exit(1);
}
console.log(`smoke/ react: ${installedReact}`);

// 6. Type-check the consumer fixture against the built artifact's .d.ts.
// This must run AFTER the overlay so dist/index.d.ts is present. It resolves
// `import React from 'react'` inside the .d.ts against smoke/'s own
// @types/react, which is what pins the types to the React major under test.
step('typecheck smoke/ against dist/index.d.ts');
run('npm', ['run', 'typecheck'], { cwd: smokeDir });

// 7. Run the smoke Playwright config (port 4174, hello.y4m fake camera).
// pree2e (y4m generation) is not wired here; ensure y4m exists explicitly.
step('ensure y4m fixtures exist');
run('node', ['e2e/fixtures/video/gen-fixtures.mjs'], { cwd: packageDir });

step('playwright (smoke)');
run('npx', ['playwright', 'test', '--config=playwright.smoke.config.ts'], {
  cwd: packageDir,
});

console.log(`\nsmoke: all checks passed (React ${installedReact})`);
