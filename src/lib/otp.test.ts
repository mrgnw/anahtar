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
		incrementOTPAttempts: vi.fn().mockReturnValue(1),
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

function validRow() {
	return {
		id: 'otp-1',
		email: 'test@example.com',
		code: '12345',
		attempts: 0,
		expiresAt: Date.now() + 60000,
	};
}

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

	it('returns rate_limited without comparing once the cap is exceeded, even for the right code', async () => {
		const db = mockDB({
			getLatestOTP: vi.fn().mockReturnValue(validRow()),
			incrementOTPAttempts: vi.fn().mockReturnValue(6),
		});
		const config = mockConfig({ otpMaxAttempts: 5 });
		const result = await verifyOTP(db, 'test@example.com', '12345', config);
		expect(result).toEqual({ ok: false, error: 'rate_limited', attemptsLeft: 0 });
		expect(db.deleteOTP).toHaveBeenCalledWith('otp-1');
	});

	it('returns invalid and counts the attempt on wrong code', async () => {
		const db = mockDB({ getLatestOTP: vi.fn().mockReturnValue(validRow()) });
		const config = mockConfig();
		const result = await verifyOTP(db, 'test@example.com', '99999', config);
		expect(result).toEqual({ ok: false, error: 'invalid' });
		expect(db.incrementOTPAttempts).toHaveBeenCalledWith('otp-1');
		expect(db.deleteOTP).not.toHaveBeenCalled();
	});

	it('returns rate_limited when the wrong code uses the last attempt', async () => {
		const db = mockDB({
			getLatestOTP: vi.fn().mockReturnValue(validRow()),
			incrementOTPAttempts: vi.fn().mockReturnValue(5),
		});
		const config = mockConfig({ otpMaxAttempts: 5 });
		const result = await verifyOTP(db, 'test@example.com', '99999', config);
		expect(result).toEqual({ ok: false, error: 'rate_limited', attemptsLeft: 0 });
		expect(db.deleteOTP).toHaveBeenCalledWith('otp-1');
	});

	it('accepts the right code on the last attempt', async () => {
		const db = mockDB({
			getLatestOTP: vi.fn().mockReturnValue(validRow()),
			incrementOTPAttempts: vi.fn().mockReturnValue(5),
		});
		const config = mockConfig({ otpMaxAttempts: 5 });
		expect(await verifyOTP(db, 'test@example.com', '12345', config)).toEqual({ ok: true });
	});

	it('returns invalid when the OTP disappeared before it could be counted', async () => {
		const db = mockDB({
			getLatestOTP: vi.fn().mockReturnValue(validRow()),
			incrementOTPAttempts: vi.fn().mockReturnValue(null),
		});
		const result = await verifyOTP(db, 'test@example.com', '12345', mockConfig());
		expect(result).toEqual({ ok: false, error: 'invalid' });
	});

	it('bounds guesses to otpMaxAttempts under concurrent requests', async () => {
		let attempts = 0;
		const db = mockDB({
			getLatestOTP: vi.fn(async () => {
				await new Promise((resolve) => setTimeout(resolve, 1));
				return validRow();
			}),
			incrementOTPAttempts: vi.fn(async () => ++attempts),
		});
		const config = mockConfig({ otpMaxAttempts: 5 });
		const results = await Promise.all(
			Array.from({ length: 50 }, () => verifyOTP(db, 'test@example.com', '00000', config)),
		);
		const invalid = results.filter((r) => !r.ok && r.error === 'invalid');
		const limited = results.filter((r) => !r.ok && r.error === 'rate_limited');
		expect(invalid).toHaveLength(4);
		expect(limited).toHaveLength(46);
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
