import typescript from '@rollup/plugin-typescript';
import multi from '@rollup/plugin-multi-entry';
import terser from '@rollup/plugin-terser';

export default [
  { // --file dist/erie-web.js --format iife 
    input: 'src/**/*.ts',
    output: {
      file: 'dist/erie-web.js',
      format: 'iife'
    },
    plugins: [multi(), typescript()]
  },
  { // --file dist/erie-web.min.js --format iife --compact
    input: 'src/**/*.ts',
    output: {
      file: 'dist/erie-web.min.js',
      format: 'iife',
      compact: true
    },
    plugins: [multi(), typescript(), terser()]
  }, { // --file dist/erie-web-node.js --format cjs
    input: 'src/**/*.ts',
    output: {
      file: 'dist/erie-web-node.js',
      format: 'cjs'
    },
    plugins: [multi(), typescript()]
  }, { //--file dist/erie-web-node.min.js --format cjs --compact 
    input: 'src/**/*.ts',
    output: {
      file: 'dist/erie-web-node.min.js',
      format: 'cjs',
      compact: true
    },
    plugins: [multi(), typescript(), terser()]
  }, { // --file dist/erie-web-umd.js --format umd --name \"Erie\"
    input: 'src/**/*.ts',
    output: {
      file: 'dist/erie-web-umd.js',
      format: 'umd',
      name: "Erie"
    },
    plugins: [multi(), typescript()]
  }, { // --file dist/erie-web-umd.min.js --format umd --name \"Erie\" --compact
    input: 'src/**/*.ts',
    output: {
      file: 'dist/erie-web-umd.min.js',
      format: 'umd',
      name: "Erie",
      compact: true
    },
    plugins: [multi(), typescript(), terser()]
  }
];