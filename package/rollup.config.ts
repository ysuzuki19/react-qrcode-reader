import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';

const entry = 'lib/index.tsx';

const dts_config = {
  input: entry,
  output: {
    file: 'dist/index.d.ts',
    format: 'es',
  },
  plugins: [dts()],
};

const plugins_for_build = [
  resolve(),
  commonjs(),
  // The classic runtime keeps the emitted code's only React dependency on
  // `react` itself. `react-jsx` would emit `react/jsx-runtime`, which has no
  // UMD global and would therefore have to be inlined into the UMD bundle --
  // pinning the published artifact to one React major.
  typescript({ compilerOptions: { outDir: 'dist', jsx: 'react' } }),
  babel({
    babelHelpers: 'bundled',
    extensions: ['.ts'],
    exclude: 'node_modules/**',
  }),
];

const external = (id) =>
  id === 'react' ||
  id.startsWith('react/') ||
  id === 'react-dom' ||
  id.startsWith('react-dom/');

const es_config = {
  input: entry,
  output: {
    file: 'dist/index.es.jsx',
    format: 'es',
  },
  external,
  plugins: plugins_for_build,
};

const umd_config = {
  input: entry,
  output: {
    file: 'dist/index.umd.min.jsx',
    format: 'umd',
    name: 'QrCodeReader',
    exports: 'named',
    indent: false,
    globals: {
      react: 'React',
    },
  },
  external,
  plugins: [...plugins_for_build, terser()],
};

const configs = [es_config, dts_config, umd_config];

export default configs;
