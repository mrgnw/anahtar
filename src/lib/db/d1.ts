import type {
	AuthDB,
	AuthUser,
	FullPasskeyRecord,
	NewPasskey,
	OTPRecord,
	PasskeyRecord,
	SessionRecord
} from '../types.js';

interface D1Database {
	prepare(sql: string): D1PreparedStatement;
	exec(sql: string): Promise<unknown>;
}

interface D1PreparedStatement {
	bind(...values: unknown[]): D1PreparedStatement;
	first<T = Record<string, unknown>>(): Promise<T | null>;
	all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
	run(): Promise<{ meta: { changes: number } }>;
}

interface D1AdapterOptions {
	tablePrefix?: string;
}

export function d1Adapter(db: D1Database, options: D1AdapterOptions = {}): AuthDB {
	const p = options.tablePrefix ?? 'auth_';
	const t = {
		users: `${p}users`,
		sessions: `${p}sessions`,
		otpCodes: `${p}otp_codes`,
		passkeys: `${p}passkeys`,
		challenges: `${p}challenges`
	};

	return {
		async init() {
			await db
				.prepare(`CREATE TABLE IF NOT EXISTS ${t.users} (
				id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL,
				skip_passkey_prompt INTEGER DEFAULT 0, created_at INTEGER DEFAULT (unixepoch())
			)`)
				.run();
			await db
				.prepare(`CREATE TABLE IF NOT EXISTS ${t.sessions} (
				id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES ${t.users}(id),
				expires_at INTEGER NOT NULL, created_at INTEGER DEFAULT (unixepoch())
			)`)
				.run();
			await db
				.prepare(`CREATE TABLE IF NOT EXISTS ${t.otpCodes} (
				id TEXT PRIMARY KEY, email TEXT NOT NULL, code TEXT NOT NULL,
				attempts INTEGER NOT NULL DEFAULT 0, expires_at INTEGER NOT NULL,
				created_at INTEGER DEFAULT (unixepoch())
			)`)
				.run();
			await db
				.prepare(`CREATE TABLE IF NOT EXISTS ${t.passkeys} (
				id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES ${t.users}(id),
				credential_id TEXT UNIQUE NOT NULL, public_key BLOB NOT NULL,
				counter INTEGER NOT NULL DEFAULT 0, transports TEXT, name TEXT,
				created_at INTEGER DEFAULT (unixepoch())
			)`)
				.run();
			await db
				.prepare(`CREATE TABLE IF NOT EXISTS ${t.challenges} (
				challenge TEXT PRIMARY KEY, user_id TEXT NOT NULL,
				expires_at INTEGER NOT NULL, created_at INTEGER DEFAULT (unixepoch())
			)`)
				.run();
		},

		async getUserByEmail(email: string): Promise<AuthUser | null> {
			const row = await db
				.prepare(`SELECT id, email, skip_passkey_prompt, created_at FROM ${t.users} WHERE email = ?`)
				.bind(email)
				.first<{ id: string; email: string; skip_passkey_prompt: number; created_at: number }>();
			if (!row) return null;
			return {
				id: row.id,
				email: row.email,
				skipPasskeyPrompt: row.skip_passkey_prompt === 1,
				createdAt: row.created_at
			};
		},

		async createUser(email: string): Promise<AuthUser> {
			const id = crypto.randomUUID();
			await db.prepare(`INSERT INTO ${t.users} (id, email) VALUES (?, ?)`).bind(id, email).run();
			return {
				id,
				email,
				skipPasskeyPrompt: false,
				createdAt: Math.floor(Date.now() / 1000)
			};
		},

		async setSkipPasskeyPrompt(userId: string, skip: boolean) {
			await db
				.prepare(`UPDATE ${t.users} SET skip_passkey_prompt = ? WHERE id = ?`)
				.bind(skip ? 1 : 0, userId)
				.run();
		},

		async createSession(tokenHash: string, userId: string, expiresAt: number) {
			await db
				.prepare(`INSERT INTO ${t.sessions} (id, user_id, expires_at) VALUES (?, ?, ?)`)
				.bind(tokenHash, userId, expiresAt)
				.run();
		},

		async getSession(tokenHash: string): Promise<(SessionRecord & { email: string }) | null> {
			const row = await db
				.prepare(
					`SELECT s.id, s.user_id, s.expires_at, u.email
					FROM ${t.sessions} s
					JOIN ${t.users} u ON u.id = s.user_id
					WHERE s.id = ?`
				)
				.bind(tokenHash)
				.first<{ id: string; user_id: string; expires_at: number; email: string }>();
			if (!row) return null;
			return {
				id: row.id,
				userId: row.user_id,
				expiresAt: row.expires_at,
				email: row.email
			};
		},

		async deleteSession(tokenHash: string) {
			await db.prepare(`DELETE FROM ${t.sessions} WHERE id = ?`).bind(tokenHash).run();
		},

		async storeOTP(email: string, id: string, code: string, expiresAt: number) {
			await db
				.prepare(`INSERT INTO ${t.otpCodes} (id, email, code, expires_at) VALUES (?, ?, ?, ?)`)
				.bind(id, email, code, expiresAt)
				.run();
		},

		async getLatestOTP(email: string): Promise<OTPRecord | null> {
			const row = await db
				.prepare(
					`SELECT id, email, code, attempts, expires_at FROM ${t.otpCodes} WHERE email = ? ORDER BY created_at DESC LIMIT 1`
				)
				.bind(email)
				.first<{ id: string; email: string; code: string; attempts: number; expires_at: number }>();
			if (!row) return null;
			return {
				id: row.id,
				email: row.email,
				code: row.code,
				attempts: row.attempts,
				expiresAt: row.expires_at
			};
		},

		async updateOTPAttempts(id: string, attempts: number) {
			await db.prepare(`UPDATE ${t.otpCodes} SET attempts = ? WHERE id = ?`).bind(attempts, id).run();
		},

		async deleteOTP(id: string) {
			await db.prepare(`DELETE FROM ${t.otpCodes} WHERE id = ?`).bind(id).run();
		},

		async deleteOTPsForEmail(email: string) {
			await db.prepare(`DELETE FROM ${t.otpCodes} WHERE email = ?`).bind(email).run();
		},

		async storeChallenge(challenge: string, userId: string, expiresAt: number) {
			await db.prepare(`DELETE FROM ${t.challenges} WHERE expires_at < ?`).bind(Date.now()).run();
			await db
				.prepare(`INSERT INTO ${t.challenges} (challenge, user_id, expires_at) VALUES (?, ?, ?)`)
				.bind(challenge, userId, expiresAt)
				.run();
		},

		async consumeChallenge(challenge: string): Promise<{ userId: string } | null> {
			const row = await db
				.prepare(`SELECT user_id, expires_at FROM ${t.challenges} WHERE challenge = ?`)
				.bind(challenge)
				.first<{ user_id: string; expires_at: number }>();
			if (!row) return null;
			await db.prepare(`DELETE FROM ${t.challenges} WHERE challenge = ?`).bind(challenge).run();
			if (row.expires_at < Date.now()) return null;
			return { userId: row.user_id };
		},

		async getPasskeyByCredentialId(credentialId: string): Promise<FullPasskeyRecord | null> {
			const row = await db
				.prepare(
					`SELECT p.id, p.user_id, p.credential_id, p.public_key, p.counter, p.transports, p.name, p.created_at, u.email
					FROM ${t.passkeys} p
					JOIN ${t.users} u ON u.id = p.user_id
					WHERE p.credential_id = ?`
				)
				.bind(credentialId)
				.first<{
					id: string;
					user_id: string;
					credential_id: string;
					public_key: ArrayBuffer;
					counter: number;
					transports: string | null;
					name: string | null;
					created_at: number;
					email: string;
				}>();
			if (!row) return null;
			return {
				id: row.id,
				userId: row.user_id,
				credentialId: row.credential_id,
				publicKey: new Uint8Array(row.public_key),
				counter: row.counter,
				transports: row.transports,
				name: row.name,
				createdAt: row.created_at,
				email: row.email
			};
		},

		async getUserPasskeys(userId: string): Promise<PasskeyRecord[]> {
			const { results } = await db
				.prepare(
					`SELECT id, credential_id, public_key, counter, transports, name, created_at FROM ${t.passkeys} WHERE user_id = ?`
				)
				.bind(userId)
				.all<{
					id: string;
					credential_id: string;
					public_key: ArrayBuffer;
					counter: number;
					transports: string | null;
					name: string | null;
					created_at: number;
				}>();
			return results.map((row) => ({
				id: row.id,
				credentialId: row.credential_id,
				publicKey: new Uint8Array(row.public_key),
				counter: row.counter,
				transports: row.transports,
				name: row.name,
				createdAt: row.created_at
			}));
		},

		async storePasskey(passkey: NewPasskey) {
			await db
				.prepare(
					`INSERT INTO ${t.passkeys} (id, user_id, credential_id, public_key, counter, transports, name) VALUES (?, ?, ?, ?, ?, ?, ?)`
				)
				.bind(
					passkey.id,
					passkey.userId,
					passkey.credentialId,
					passkey.publicKey,
					passkey.counter,
					passkey.transports,
					passkey.name
				)
				.run();
		},

		async updatePasskeyCounter(id: string, counter: number) {
			await db.prepare(`UPDATE ${t.passkeys} SET counter = ? WHERE id = ?`).bind(counter, id).run();
		},

		async deletePasskey(id: string, userId: string): Promise<boolean> {
			const result = await db.prepare(`DELETE FROM ${t.passkeys} WHERE id = ? AND user_id = ?`).bind(id, userId).run();
			return result.meta.changes > 0;
		}
	};
}
