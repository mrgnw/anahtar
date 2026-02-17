import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { randomBytes } from 'node:crypto';
import type { AuthDB, ResolvedConfig } from './types.js';

export async function createSession(
	db: AuthDB,
	userId: string,
	config: ResolvedConfig,
): Promise<{ sessionToken: string; expiresAt: number }> {
	const tokenBytes = randomBytes(32);
	const sessionToken = encodeHexLowerCase(tokenBytes);
	const tokenHash = encodeHexLowerCase(sha256(tokenBytes));
	const expiresAt = Date.now() + config.sessionDuration;

	await db.createSession(tokenHash, userId, expiresAt);

	return { sessionToken, expiresAt };
}

export async function validateSession(
	db: AuthDB,
	token: string,
): Promise<{ user: { id: string; email: string }; session: { id: string; expiresAt: number } } | null> {
	if (!token || token.length !== 64 || !/^[0-9a-f]+$/.test(token)) return null;

	const tokenBytes = new Uint8Array(
		token.match(/.{2}/g)!.map((b) => Number.parseInt(b, 16)),
	);
	const sessionId = encodeHexLowerCase(sha256(tokenBytes));

	const row = await db.getSession(sessionId);
	if (!row) return null;

	if (row.expiresAt < Date.now()) {
		await db.deleteSession(sessionId);
		return null;
	}

	return {
		user: { id: row.userId, email: row.email },
		session: { id: row.id, expiresAt: row.expiresAt },
	};
}

export async function invalidateSession(db: AuthDB, sessionId: string): Promise<void> {
	await db.deleteSession(sessionId);
}
