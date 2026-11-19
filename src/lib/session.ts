import { createHash, randomBytes } from 'node:crypto';
import type { AuthDB, ResolvedConfig, SessionMethod } from './types.js';

function hashToken(bytes: Uint8Array): string {
	return createHash('sha256').update(bytes).digest('hex');
}

export async function createSession(
	db: AuthDB,
	userId: string,
	config: ResolvedConfig,
	method: SessionMethod,
): Promise<{ sessionToken: string; expiresAt: number }> {
	const tokenBytes = randomBytes(32);
	const sessionToken = tokenBytes.toString('hex');
	const tokenHash = hashToken(tokenBytes);
	const expiresAt = Date.now() + config.sessionDuration(method);

	await db.createSession(tokenHash, userId, expiresAt);

	return { sessionToken, expiresAt };
}

export async function validateSession(
	db: AuthDB,
	token: string,
): Promise<{ user: { id: string; email: string }; session: { id: string; expiresAt: number } } | null> {
	if (!token || token.length !== 64 || !/^[0-9a-f]+$/.test(token)) return null;

	const sessionId = hashToken(Buffer.from(token, 'hex'));

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
