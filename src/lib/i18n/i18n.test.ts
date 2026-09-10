import { describe, expect, it } from 'vitest';
import { loadMessages, localeCodes, resolveMessages } from './index.js';
import en from './en.js';

describe('i18n', () => {
	it('resolves en synchronously before anything is loaded', () => {
		expect(resolveMessages('en').continue).toBe(en.continue);
		expect(resolveMessages('xx')).toBe(en);
	});

	it('loads a locale on demand and serves it synchronously after', async () => {
		const de = await loadMessages('de-DE');
		expect(de.continue).not.toBe(en.continue);
		expect(resolveMessages('de').continue).toBe(de.continue);
	});

	it('falls back to en for a locale outside the allowlist', async () => {
		expect(await loadMessages('xx')).toBe(en);
	});

	it('applies overrides', async () => {
		expect((await loadMessages('de', { continue: 'Anmelden' })).continue).toBe('Anmelden');
		expect(resolveMessages('de', { continue: 'Anmelden' }).continue).toBe('Anmelden');
	});

	it('fills untranslated keys of a partial locale from en', async () => {
		expect((await loadMessages('de')).staySignedIn).toBe(en.staySignedIn);
	});

	it('lists 88 locales', () => {
		expect(localeCodes).toHaveLength(88);
		expect(localeCodes).toContain('en');
	});
});
