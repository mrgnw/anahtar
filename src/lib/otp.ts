import { randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import type { AuthDB, OtpResult, ResolvedConfig } from './types.js';

export async function generateOTP(
	db: AuthDB,
	email: string,
	config: ResolvedConfig,
): Promise<{ id: string; code: string }> {
	await db.deleteOTPsForEmail(email);

	const id = randomUUID();
	const code = String(randomInt(0, 10 ** config.otpLength)).padStart(config.otpLength, '0');
	const expiresAt = Date.now() + config.otpExpiry;

	await db.storeOTP(email, id, code, expiresAt);

	return { id, code };
}

export async function verifyOTP(
	db: AuthDB,
	email: string,
	code: string,
	config: ResolvedConfig,
): Promise<OtpResult> {
	const row = await db.getLatestOTP(email);
	if (!row) return { ok: false, error: 'invalid' };

	if (row.expiresAt < Date.now()) {
		await db.deleteOTP(row.id);
		return { ok: false, error: 'expired' };
	}

	const attempts = await db.incrementOTPAttempts(row.id);
	if (attempts === null) return { ok: false, error: 'invalid' };
	if (attempts > config.otpMaxAttempts) {
		await db.deleteOTP(row.id);
		return { ok: false, error: 'rate_limited', attemptsLeft: 0 };
	}

	if (!codesMatch(row.code, code)) {
		if (attempts >= config.otpMaxAttempts) {
			await db.deleteOTP(row.id);
			return { ok: false, error: 'rate_limited', attemptsLeft: 0 };
		}
		return { ok: false, error: 'invalid' };
	}

	const consumed = await db.consumeOTP(row.id, config.otpMaxAttempts);
	if (consumed === true) return { ok: true };
	if (row.expiresAt < Date.now()) return { ok: false, error: 'expired' };
	return { ok: false, error: 'invalid' };
}

function codesMatch(expected: string, given: string): boolean {
	const a = new TextEncoder().encode(expected);
	const b = new TextEncoder().encode(given);
	return a.length === b.length && timingSafeEqual(a, b);
}
