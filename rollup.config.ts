// import { readFileSync } from 'node:fs';
import type { RollupOptions } from 'rollup';
import typescript from '@rollup/plugin-typescript';

import packageJson from './package.json' assert { type: 'json' };

const config: RollupOptions = {
	input: packageJson.source,
	external: [], // Object.keys(packageJson.peerDependencies)
	plugins: [
		typescript({
			include: ['src/**/*.ts'],
			declaration: false,
			sourceMap: true,
		}),
	],
	output: [
		{
			file: packageJson.main,
			sourcemap: true,
			format: 'cjs',
		},
		{
			file: packageJson.module,
			sourcemap: true,
			format: 'es',
		},
	],
};

export default config;
