import { describe, it, expect, vi } from 'vitest';
import { createSession, validateSession, invalidateSession } from './session.js';
import type { AuthDB, ResolvedConfig } from './types.js';

function mockConfig(overrides: Partial<ResolvedConfig> = {}): ResolvedConfig {
	return {
		db: {} as AuthDB,
		tablePrefix: 'auth_',
		cookie: 'session',
		sessionDuration: 30 * 24 * 60 * 60 * 1000,
		otpExpiry: 30 * 60 * 1000,
		otpLength: 5,
		otpMaxAttempts: 5,
		rpName: 'test',
		onSendOTP: vi.fn(),
		...overrides,
	};
}

function mockDB(overrides: Partial<AuthDB> = {}): AuthDB {
	return {
		init: vi.fn(),
		getUserByEmail: vi.fn(),
		createUser: vi.fn(),
		setSkipPasskeyPrompt: vi.fn(),
		createSession: vi.fn(),
		getSession: vi.fn(),
		deleteSession: vi.fn(),
		storeOTP: vi.fn(),
		getLatestOTP: vi.fn(),
		updateOTPAttempts: vi.fn(),
		deleteOTP: vi.fn(),
		deleteOTPsForEmail: vi.fn(),
		storeChallenge: vi.fn(),
		consumeChallenge: vi.fn(),
		getPasskeyByCredentialId: vi.fn(),
		getUserPasskeys: vi.fn(),
		storePasskey: vi.fn(),
		updatePasskeyCounter: vi.fn(),
		deletePasskey: vi.fn(),
		...overrides,
	};
}

describe('createSession', () => {
	it('returns a 64-char hex session token', async () => {
		const db = mockDB();
		const config = mockConfig();
		const result = await createSession(db, 'user-1', config);
		expect(result.sessionToken).toMatch(/^[0-9a-f]{64}$/);
	});

	it('stores a hashed token, not the raw token', async () => {
		const db = mockDB();
		const config = mockConfig();
		const result = await createSession(db, 'user-1', config);
		const [storedHash] = (db.createSession as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(storedHash).not.toBe(result.sessionToken);
		expect(storedHash).toMatch(/^[0-9a-f]{64}$/);
	});

	it('stores correct userId and future expiresAt', async () => {
		const db = mockDB();
		const config = mockConfig();
		const before = Date.now();
		await createSession(db, 'user-1', config);
		const [, userId, expiresAt] = (db.createSession as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(userId).toBe('user-1');
		expect(expiresAt).toBeGreaterThan(before);
		expect(expiresAt).toBeLessThanOrEqual(before + config.sessionDuration + 100);
	});
});

describe('validateSession', () => {
	it('returns null for empty token', async () => {
		const db = mockDB();
		expect(await validateSession(db, '')).toBeNull();
	});

	it('returns null for token with wrong length', async () => {
		const db = mockDB();
		expect(await validateSession(db, 'abc')).toBeNull();
	});

	it('returns null for token with invalid characters', async () => {
		const db = mockDB();
		expect(await validateSession(db, 'z'.repeat(64))).toBeNull();
	});

	it('returns null when session not found', async () => {
		const db = mockDB({ getSession: vi.fn().mockReturnValue(null) });
		const token = 'a'.repeat(64);
		expect(await validateSession(db, token)).toBeNull();
	});

	it('returns null and deletes expired session', async () => {
		const db = mockDB({
			getSession: vi.fn().mockReturnValue({
				id: 'session-hash',
				userId: 'user-1',
				expiresAt: Date.now() - 1000,
				email: 'test@example.com',
			}),
		});
		const token = 'a'.repeat(64);
		const result = await validateSession(db, token);
		expect(result).toBeNull();
		expect(db.deleteSession).toHaveBeenCalled();
	});

	it('returns user and session for valid token', async () => {
		const db = mockDB();
		const config = mockConfig();

		const { sessionToken } = await createSession(db, 'user-1', config);

		const [storedHash, storedUserId, storedExpiry] = (db.createSession as ReturnType<typeof vi.fn>).mock.calls[0];

		(db.getSession as ReturnType<typeof vi.fn>).mockReturnValue({
			id: storedHash,
			userId: storedUserId,
			expiresAt: storedExpiry,
			email: 'test@example.com',
		});

		const result = await validateSession(db, sessionToken);
		expect(result).not.toBeNull();
		expect(result!.user).toEqual({ id: 'user-1', email: 'test@example.com' });
		expect(result!.session.id).toBe(storedHash);
		expect(result!.session.expiresAt).toBe(storedExpiry);
	});
});

describe('invalidateSession', () => {
	it('calls deleteSession with the session id', async () => {
		const db = mockDB();
		await invalidateSession(db, 'session-hash-123');
		expect(db.deleteSession).toHaveBeenCalledWith('session-hash-123');
	});
});
