import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { randomBytes } from 'node:crypto';
import type { AuthDB, AuthLocals, ResolvedConfig, SessionMethod } from './types.js';

const SESSION_TOKEN_PATTERN = /^[0-9a-f]{64}(?:\.([0-9]{1,15}))?$/;

function hashSessionToken(token: string): string {
	const bytes = Buffer.from(token, token.length === 64 ? 'hex' : 'utf8');
	return encodeHexLowerCase(sha256(bytes));
}

export async function createSession(
	db: AuthDB,
	userId: string,
	config: ResolvedConfig,
	method: SessionMethod,
	verifiedAt: number,
): Promise<{ sessionToken: string; expiresAt: number }> {
	const nonce = encodeHexLowerCase(randomBytes(32));
	const sessionToken = `${nonce}.${verifiedAt}`;
	const tokenHash = hashSessionToken(sessionToken);
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

	const sessionId = hashSessionToken(token);
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
