import { compile, compileModule } from 'svelte/compiler';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig, type Plugin } from 'vitest/config';

function svelteTest(): Plugin {
	return {
		name: 'svelte-test',
		enforce: 'pre',
		transform(code, id) {
			if (id.endsWith('.svelte')) {
				const result = compile(code, {
					filename: id,
					generate: 'client',
					css: 'injected',
				});
				return { code: result.js.code, map: result.js.map };
			}
			if (id.endsWith('.svelte.js') || id.endsWith('.svelte.ts')) {
				const result = compileModule(code, {
					filename: id,
					generate: 'client',
				});
				return { code: result.js.code, map: result.js.map };
			}
		},
	};
}

export default defineConfig({
	plugins: [svelteTest(), svelteTesting()],
	test: {
		name: 'browser',
		include: ['src/**/*.svelte.test.ts'],
		environment: 'happy-dom',
		setupFiles: ['./vitest-setup.ts'],
	},
	resolve: {
		conditions: ['browser'],
	},
	ssr: {
		noExternal: ['@testing-library/svelte', '@testing-library/svelte-core'],
	},
});
