import { describe, expect, it } from 'vitest';
import { normalizeEmail, parseEmail } from './email.js';

describe('parseEmail', () => {
	it('returns the normalized address for valid input', () => {
		expect(parseEmail('  Bob@Example.COM ')).toBe('bob@example.com');
	});

	it.each([
		'plain',
		'no-at.example.com',
		'a@b',
		'a b@example.com',
		'a@b.com\r\nBcc: x@y.com',
		`${'a'.repeat(250)}@example.com`,
		42,
		null,
		undefined,
	])('rejects %j', (raw) => {
		expect(parseEmail(raw)).toBeNull();
	});
});

describe('normalizeEmail', () => {
	it('lowercases the address', () => {
		expect(normalizeEmail('Bob@Example.COM')).toBe('bob@example.com');
	});

	it('trims surrounding whitespace', () => {
		expect(normalizeEmail('  bob@example.com  ')).toBe('bob@example.com');
	});
});
