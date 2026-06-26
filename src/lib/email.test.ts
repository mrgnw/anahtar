import { describe, expect, it } from 'vitest';
import { normalizeEmail } from './email.js';

describe('normalizeEmail', () => {
	it('lowercases the address', () => {
		expect(normalizeEmail('Bob@Example.COM')).toBe('bob@example.com');
	});

	it('trims surrounding whitespace', () => {
		expect(normalizeEmail('  bob@example.com  ')).toBe('bob@example.com');
	});
});
