import { defineProject } from 'vitest/config';

export default defineProject({
	test: {
		name: 'unit',
		include: ['src/**/*.test.ts'],
		exclude: ['src/**/*.svelte.test.ts'],
		environment: 'node',
	},
});
