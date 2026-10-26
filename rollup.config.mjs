import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default [
  { // --file dist/erie-web.js --format iife 
    cache: false,
    input: 'src/index.ts',
    output: {
      file: 'dist/erie-web.js',
      format: 'iife'
    },
    plugins: [typescript()]
  },
  { // --file dist/erie-web.min.js --format iife --compact
    cache: false,
    input: 'src/index.ts',
    output: {
      file: 'dist/erie-web.min.js',
      format: 'iife',
      compact: true
    },
    plugins: [typescript(), terser()]
  }, { // --file dist/erie-web-node.js --format cjs
    cache: false,
    input: 'src/index.ts',
    output: {
      file: 'dist/erie-web-node.js',
      format: 'cjs'
    },
    plugins: [typescript()]
  }, { //--file dist/erie-web-node.min.js --format cjs --compact 
    cache: false,
    input: 'src/index.ts',
    output: {
      file: 'dist/erie-web-node.min.js',
      format: 'cjs',
      compact: true
    },
    plugins: [typescript(), terser()]
  }, { // --file dist/erie-web-umd.js --format umd --name \"Erie\"
    cache: false,
    input: 'src/index.ts',
    output: {
      file: 'dist/erie-web-umd.js',
      format: 'umd',
      name: "Erie"
    },
    plugins: [typescript()]
  }, { // --file dist/erie-web-umd.min.js --format umd --name \"Erie\" --compact
    cache: false,
    input: 'src/index.ts',
    output: {
      file: 'dist/erie-web-umd.min.js',
      format: 'umd',
      name: "Erie",
      compact: true
    },
    plugins: [typescript(), terser()]
  }, { // --file dist/erie-web-umd.js --format es
    cache: false,
    input: 'src/index.ts',
    output: {
      file: 'dist/erie-web-esm.js',
      format: 'es'
    },
    plugins: [typescript()]
  }, { // --file dist/erie-web-umd.min.js --format es --compact
    cache: false,
    input: 'src/index.ts',
    output: {
      file: 'dist/erie-web-esm.min.js',
      format: 'es',
      compact: true
    },
    plugins: [typescript(), terser()]
  }
];