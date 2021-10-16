import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

const entry = 'lib/index.tsx';

const es_config = {
  input: entry,
  output: {
    file: 'dist/index.es.jsx',
    format: 'es',
  },
  external: ['react', 'react-dom'],
  plugins: [
    typescript(),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.ts'],
    }),
  ],
};

const dts_config = {
  input: entry,
  output: {
    file: 'dist/index.d.ts',
    format: 'es',
  },
  plugins: [dts()],
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
  external: ['react', 'react-dom'],
  plugins: [
    typescript(),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.ts'],
      exclude: 'node_modules/**',
    }),
    terser(),
  ],
};

const configs = [es_config, dts_config, umd_config];

export default configs;
