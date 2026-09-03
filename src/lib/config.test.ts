import { describe, expect, it, vi } from 'vitest';
import { resolveConfig } from './config.js';
import type { AuthDB } from './types.js';

const base = { db: {} as AuthDB, onSendOTP: vi.fn() };

describe('resolveConfig', () => {
	it('wraps a numeric sessionDuration into a function', () => {
		expect(resolveConfig({ ...base, sessionDuration: 1000 }).sessionDuration('otp')).toBe(1000);
	});

	it('defaults sessionDuration to 30 days', () => {
		expect(resolveConfig(base).sessionDuration('passkey')).toBe(30 * 24 * 60 * 60 * 1000);
	});

	it('keeps a per-method sessionDuration', () => {
		const config = resolveConfig({ ...base, sessionDuration: (m) => (m === 'passkey' ? 2 : 1) });
		expect(config.sessionDuration('passkey')).toBe(2);
		expect(config.sessionDuration('otp')).toBe(1);
	});
});
