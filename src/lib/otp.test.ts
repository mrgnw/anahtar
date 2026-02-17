import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateOTP, verifyOTP } from './otp.js';
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

describe('generateOTP', () => {
	it('clears existing OTPs for the email', async () => {
		const db = mockDB();
		const config = mockConfig();
		await generateOTP(db, 'test@example.com', config);
		expect(db.deleteOTPsForEmail).toHaveBeenCalledWith('test@example.com');
	});

	it('stores a new OTP', async () => {
		const db = mockDB();
		const config = mockConfig();
		await generateOTP(db, 'test@example.com', config);
		expect(db.storeOTP).toHaveBeenCalledOnce();
		const [email, id, code, expiresAt] = (db.storeOTP as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(email).toBe('test@example.com');
		expect(typeof id).toBe('string');
		expect(code).toMatch(/^\d{5}$/);
		expect(expiresAt).toBeGreaterThan(Date.now());
	});

	it('returns id and code', async () => {
		const db = mockDB();
		const config = mockConfig();
		const result = await generateOTP(db, 'test@example.com', config);
		expect(result).toHaveProperty('id');
		expect(result).toHaveProperty('code');
		expect(result.code).toMatch(/^\d{5}$/);
	});

	it('generates code with custom length', async () => {
		const db = mockDB();
		const config = mockConfig({ otpLength: 6 });
		const result = await generateOTP(db, 'test@example.com', config);
		expect(result.code).toMatch(/^\d{6}$/);
	});
});

describe('verifyOTP', () => {
	it('returns invalid when no OTP exists', async () => {
		const db = mockDB({ getLatestOTP: vi.fn().mockReturnValue(null) });
		const config = mockConfig();
		const result = await verifyOTP(db, 'test@example.com', '12345', config);
		expect(result).toEqual({ ok: false, error: 'invalid' });
	});

	it('returns expired and deletes when OTP is expired', async () => {
		const db = mockDB({
			getLatestOTP: vi.fn().mockReturnValue({
				id: 'otp-1',
				email: 'test@example.com',
				code: '12345',
				attempts: 0,
				expiresAt: Date.now() - 1000,
			}),
		});
		const config = mockConfig();
		const result = await verifyOTP(db, 'test@example.com', '12345', config);
		expect(result).toEqual({ ok: false, error: 'expired' });
		expect(db.deleteOTP).toHaveBeenCalledWith('otp-1');
	});

	it('returns rate_limited when max attempts reached', async () => {
		const db = mockDB({
			getLatestOTP: vi.fn().mockReturnValue({
				id: 'otp-1',
				email: 'test@example.com',
				code: '12345',
				attempts: 5,
				expiresAt: Date.now() + 60000,
			}),
		});
		const config = mockConfig({ otpMaxAttempts: 5 });
		const result = await verifyOTP(db, 'test@example.com', '12345', config);
		expect(result).toEqual({ ok: false, error: 'rate_limited', attemptsLeft: 0 });
		expect(db.deleteOTP).toHaveBeenCalledWith('otp-1');
	});

	it('returns invalid and increments attempts on wrong code', async () => {
		const db = mockDB({
			getLatestOTP: vi.fn().mockReturnValue({
				id: 'otp-1',
				email: 'test@example.com',
				code: '12345',
				attempts: 0,
				expiresAt: Date.now() + 60000,
			}),
		});
		const config = mockConfig();
		const result = await verifyOTP(db, 'test@example.com', '99999', config);
		expect(result).toEqual({ ok: false, error: 'invalid' });
		expect(db.updateOTPAttempts).toHaveBeenCalledWith('otp-1', 1);
	});

	it('returns rate_limited when wrong code hits max attempts', async () => {
		const db = mockDB({
			getLatestOTP: vi.fn().mockReturnValue({
				id: 'otp-1',
				email: 'test@example.com',
				code: '12345',
				attempts: 4,
				expiresAt: Date.now() + 60000,
			}),
		});
		const config = mockConfig({ otpMaxAttempts: 5 });
		const result = await verifyOTP(db, 'test@example.com', '99999', config);
		expect(result).toEqual({ ok: false, error: 'rate_limited', attemptsLeft: 0 });
		expect(db.updateOTPAttempts).toHaveBeenCalledWith('otp-1', 5);
		expect(db.deleteOTP).toHaveBeenCalledWith('otp-1');
	});

	it('returns ok and deletes OTP on correct code', async () => {
		const db = mockDB({
			getLatestOTP: vi.fn().mockReturnValue({
				id: 'otp-1',
				email: 'test@example.com',
				code: '12345',
				attempts: 0,
				expiresAt: Date.now() + 60000,
			}),
		});
		const config = mockConfig();
		const result = await verifyOTP(db, 'test@example.com', '12345', config);
		expect(result).toEqual({ ok: true });
		expect(db.deleteOTP).toHaveBeenCalledWith('otp-1');
	});
});
