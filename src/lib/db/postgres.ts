import { randomUUID } from 'node:crypto';
import type {
	AuthDB,
	AuthUser,
	OTPRecord,
	SessionRecord,
	PasskeyRecord,
	FullPasskeyRecord,
	NewPasskey,
} from '../types.js';

interface PgPool {
	query(text: string, values?: unknown[]): Promise<{ rows: Record<string, unknown>[]; rowCount: number | null }>;
}

interface PostgresAdapterOptions {
	tablePrefix?: string;
}

export function postgresAdapter(
	pool: PgPool,
	options: PostgresAdapterOptions = {},
): AuthDB {
	const p = options.tablePrefix ?? 'auth_';
	const t = {
		users: `${p}users`,
		sessions: `${p}sessions`,
		otpCodes: `${p}otp_codes`,
		passkeys: `${p}passkeys`,
		challenges: `${p}challenges`,
	};

	async function queryOne<T>(text: string, values?: unknown[]): Promise<T | undefined> {
		const { rows } = await pool.query(text, values);
		return rows[0] as T | undefined;
	}

	async function queryAll<T>(text: string, values?: unknown[]): Promise<T[]> {
		const { rows } = await pool.query(text, values);
		return rows as T[];
	}

	return {
		async init() {
			await pool.query(`
				CREATE TABLE IF NOT EXISTS ${t.users} (
					id TEXT PRIMARY KEY,
					email TEXT UNIQUE NOT NULL,
					skip_passkey_prompt BOOLEAN DEFAULT FALSE,
					created_at TIMESTAMPTZ DEFAULT NOW()
				);
				CREATE TABLE IF NOT EXISTS ${t.sessions} (
					id TEXT PRIMARY KEY,
					user_id TEXT NOT NULL REFERENCES ${t.users}(id),
					expires_at BIGINT NOT NULL,
					created_at TIMESTAMPTZ DEFAULT NOW()
				);
				CREATE TABLE IF NOT EXISTS ${t.otpCodes} (
					id TEXT PRIMARY KEY,
					email TEXT NOT NULL,
					code TEXT NOT NULL,
					attempts INTEGER NOT NULL DEFAULT 0,
					expires_at BIGINT NOT NULL,
					created_at TIMESTAMPTZ DEFAULT NOW()
				);
				CREATE TABLE IF NOT EXISTS ${t.passkeys} (
					id TEXT PRIMARY KEY,
					user_id TEXT NOT NULL REFERENCES ${t.users}(id),
					credential_id TEXT UNIQUE NOT NULL,
					public_key BYTEA NOT NULL,
					counter INTEGER NOT NULL DEFAULT 0,
					transports TEXT,
					created_at TIMESTAMPTZ DEFAULT NOW()
				);
				CREATE TABLE IF NOT EXISTS ${t.challenges} (
					challenge TEXT PRIMARY KEY,
					user_id TEXT NOT NULL,
					expires_at BIGINT NOT NULL,
					created_at TIMESTAMPTZ DEFAULT NOW()
				);
			`);
		},

		async getUserByEmail(email: string): Promise<AuthUser | null> {
			const row = await queryOne<{ id: string; email: string; skip_passkey_prompt: boolean; created_at: string }>(
				`SELECT id, email, skip_passkey_prompt, created_at FROM ${t.users} WHERE email = $1`,
				[email],
			);
			if (!row) return null;
			return {
				id: row.id,
				email: row.email,
				skipPasskeyPrompt: row.skip_passkey_prompt,
				createdAt: new Date(row.created_at).getTime(),
			};
		},

		async createUser(email: string): Promise<AuthUser> {
			const id = randomUUID();
			await pool.query(
				`INSERT INTO ${t.users} (id, email) VALUES ($1, $2)`,
				[id, email],
			);
			return {
				id,
				email,
				skipPasskeyPrompt: false,
				createdAt: Date.now(),
			};
		},

		async setSkipPasskeyPrompt(userId: string, skip: boolean) {
			await pool.query(
				`UPDATE ${t.users} SET skip_passkey_prompt = $1 WHERE id = $2`,
				[skip, userId],
			);
		},

		async createSession(tokenHash: string, userId: string, expiresAt: number) {
			await pool.query(
				`INSERT INTO ${t.sessions} (id, user_id, expires_at) VALUES ($1, $2, $3)`,
				[tokenHash, userId, expiresAt],
			);
		},

		async getSession(tokenHash: string): Promise<(SessionRecord & { email: string }) | null> {
			const row = await queryOne<{ id: string; user_id: string; expires_at: string; email: string }>(
				`SELECT s.id, s.user_id, s.expires_at, u.email
				FROM ${t.sessions} s
				JOIN ${t.users} u ON u.id = s.user_id
				WHERE s.id = $1`,
				[tokenHash],
			);
			if (!row) return null;
			return {
				id: row.id,
				userId: row.user_id,
				expiresAt: Number(row.expires_at),
				email: row.email,
			};
		},

		async deleteSession(tokenHash: string) {
			await pool.query(`DELETE FROM ${t.sessions} WHERE id = $1`, [tokenHash]);
		},

		async storeOTP(email: string, id: string, code: string, expiresAt: number) {
			await pool.query(
				`INSERT INTO ${t.otpCodes} (id, email, code, expires_at) VALUES ($1, $2, $3, $4)`,
				[id, email, code, expiresAt],
			);
		},

		async getLatestOTP(email: string): Promise<OTPRecord | null> {
			const row = await queryOne<{ id: string; email: string; code: string; attempts: number; expires_at: string }>(
				`SELECT id, email, code, attempts, expires_at FROM ${t.otpCodes} WHERE email = $1 ORDER BY created_at DESC LIMIT 1`,
				[email],
			);
			if (!row) return null;
			return {
				id: row.id,
				email: row.email,
				code: row.code,
				attempts: row.attempts,
				expiresAt: Number(row.expires_at),
			};
		},

		async updateOTPAttempts(id: string, attempts: number) {
			await pool.query(`UPDATE ${t.otpCodes} SET attempts = $1 WHERE id = $2`, [attempts, id]);
		},

		async deleteOTP(id: string) {
			await pool.query(`DELETE FROM ${t.otpCodes} WHERE id = $1`, [id]);
		},

		async deleteOTPsForEmail(email: string) {
			await pool.query(`DELETE FROM ${t.otpCodes} WHERE email = $1`, [email]);
		},

		async storeChallenge(challenge: string, userId: string, expiresAt: number) {
			await pool.query(`DELETE FROM ${t.challenges} WHERE expires_at < $1`, [Date.now()]);
			await pool.query(
				`INSERT INTO ${t.challenges} (challenge, user_id, expires_at) VALUES ($1, $2, $3)`,
				[challenge, userId, expiresAt],
			);
		},

		async consumeChallenge(challenge: string): Promise<{ userId: string } | null> {
			const row = await queryOne<{ user_id: string; expires_at: string }>(
				`SELECT user_id, expires_at FROM ${t.challenges} WHERE challenge = $1`,
				[challenge],
			);
			if (!row) return null;
			await pool.query(`DELETE FROM ${t.challenges} WHERE challenge = $1`, [challenge]);
			if (Number(row.expires_at) < Date.now()) return null;
			return { userId: row.user_id };
		},

		async getPasskeyByCredentialId(credentialId: string): Promise<FullPasskeyRecord | null> {
			const row = await queryOne<{
				id: string;
				user_id: string;
				credential_id: string;
				public_key: Buffer;
				counter: number;
				transports: string | null;
				created_at: string;
				email: string;
			}>(
				`SELECT p.id, p.user_id, p.credential_id, p.public_key, p.counter, p.transports, p.created_at, u.email
				FROM ${t.passkeys} p
				JOIN ${t.users} u ON u.id = p.user_id
				WHERE p.credential_id = $1`,
				[credentialId],
			);
			if (!row) return null;
			return {
				id: row.id,
				userId: row.user_id,
				credentialId: row.credential_id,
				publicKey: new Uint8Array(row.public_key),
				counter: row.counter,
				transports: row.transports,
				createdAt: new Date(row.created_at).getTime(),
				email: row.email,
			};
		},

		async getUserPasskeys(userId: string): Promise<PasskeyRecord[]> {
			const rows = await queryAll<{
				id: string;
				credential_id: string;
				public_key: Buffer;
				counter: number;
				transports: string | null;
				created_at: string;
			}>(
				`SELECT id, credential_id, public_key, counter, transports, created_at FROM ${t.passkeys} WHERE user_id = $1`,
				[userId],
			);
			return rows.map((row) => ({
				id: row.id,
				credentialId: row.credential_id,
				publicKey: new Uint8Array(row.public_key),
				counter: row.counter,
				transports: row.transports,
				createdAt: new Date(row.created_at).getTime(),
			}));
		},

		async storePasskey(passkey: NewPasskey) {
			await pool.query(
				`INSERT INTO ${t.passkeys} (id, user_id, credential_id, public_key, counter, transports) VALUES ($1, $2, $3, $4, $5, $6)`,
				[passkey.id, passkey.userId, passkey.credentialId, Buffer.from(passkey.publicKey), passkey.counter, passkey.transports],
			);
		},

		async updatePasskeyCounter(id: string, counter: number) {
			await pool.query(`UPDATE ${t.passkeys} SET counter = $1 WHERE id = $2`, [counter, id]);
		},

		async deletePasskey(id: string, userId: string): Promise<boolean> {
			const result = await pool.query(
				`DELETE FROM ${t.passkeys} WHERE id = $1 AND user_id = $2`,
				[id, userId],
			);
			return (result.rowCount ?? 0) > 0;
		},
	};
}
