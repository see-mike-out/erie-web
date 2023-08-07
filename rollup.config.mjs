import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

export default {
	input: 'src/index.js',
	output: [
		{
			file: 'dist/erie-web.js',
      name: 'Erie',
			format: 'umd'
		},
		{
			file: 'dist/erie-web.min.js',
			format: 'iife',
      name: 'Erie',
			plugins: [terser()]
		}
	],
  plugins: [json()]
};