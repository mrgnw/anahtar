import { createHash, randomBytes } from 'node:crypto';
import type { AuthDB, ResolvedConfig, SessionMethod } from './types.js';

const SESSION_TOKEN_PATTERN = /^[0-9a-f]{64}(?:\.[0-9]{1,15})?$/;

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
	if (!SESSION_TOKEN_PATTERN.test(token)) return null;

	const sessionId = hashToken(Buffer.from(token, token.length === 64 ? 'hex' : 'utf8'));

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
