import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

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
  typescript(),
  babel({
    babelHelpers: 'bundled',
    extensions: ['.ts'],
    exclude: 'node_modules/**',
  }),
];

const external = ['react', 'react-dom'];

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
      react: 'react',
    },
  },
  external,
  plugins: [...plugins_for_build, terser()],
};

const configs = [es_config, dts_config, umd_config];

export default configs;
