import { createHash, randomBytes } from 'node:crypto';
import type { AuthDB, AuthLocals, ResolvedConfig, SessionMethod } from './types.js';

const SESSION_TOKEN_PATTERN = /^[0-9a-f]{64}(?:\.([0-9]{1,15}))?$/;

function hashToken(bytes: Uint8Array): string {
	return createHash('sha256').update(bytes).digest('hex');
}

export async function createSession(
	db: AuthDB,
	userId: string,
	config: ResolvedConfig,
	method: SessionMethod,
	verifiedAt: number,
): Promise<{ sessionToken: string; expiresAt: number }> {
	const nonce = randomBytes(32).toString('hex');
	const sessionToken = `${nonce}.${verifiedAt}`;
	const tokenHash = hashToken(Buffer.from(sessionToken, 'utf8'));
	const expiresAt = Date.now() + config.sessionDuration(method);

	await db.createSession(tokenHash, userId, expiresAt);

	return { sessionToken, expiresAt };
}

export async function validateSession(
	db: AuthDB,
	token: string,
): Promise<{ user: NonNullable<AuthLocals['user']>; session: NonNullable<AuthLocals['session']> } | null> {
	const match = SESSION_TOKEN_PATTERN.exec(token);
	if (!match) return null;

	const sessionId = hashToken(Buffer.from(token, match[1] === undefined ? 'hex' : 'utf8'));
	const row = await db.getSession(sessionId);
	if (!row) return null;

	if (row.expiresAt < Date.now()) {
		await db.deleteSession(sessionId);
		return null;
	}

	const session: NonNullable<AuthLocals['session']> = { id: row.id, expiresAt: row.expiresAt };
	if (match[1] !== undefined) session.verifiedAt = Number(match[1]);
	return { user: { id: row.userId, email: row.email }, session };
}

export async function invalidateSession(db: AuthDB, sessionId: string): Promise<void> {
	await db.deleteSession(sessionId);
}
