import { randomInt, randomUUID } from 'node:crypto';
import type { AuthDB, OtpResult, ResolvedConfig } from './types.js';

export async function generateOTP(
	db: AuthDB,
	email: string,
	config: ResolvedConfig,
): Promise<{ id: string; code: string }> {
	await db.deleteOTPsForEmail(email);

	const id = randomUUID();
	const max = 10 ** config.otpLength;
	const min = 10 ** (config.otpLength - 1);
	const code = String(randomInt(min, max));
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

	if (row.attempts >= config.otpMaxAttempts) {
		await db.deleteOTP(row.id);
		return { ok: false, error: 'rate_limited', attemptsLeft: 0 };
	}

	if (row.code !== code) {
		const newAttempts = row.attempts + 1;
		await db.updateOTPAttempts(row.id, newAttempts);
		if (newAttempts >= config.otpMaxAttempts) {
			await db.deleteOTP(row.id);
			return { ok: false, error: 'rate_limited', attemptsLeft: 0 };
		}
		return { ok: false, error: 'invalid' };
	}

	await db.deleteOTP(row.id);
	return { ok: true };
}
