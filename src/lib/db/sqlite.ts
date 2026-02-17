import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import type {
	AuthDB,
	AuthUser,
	OTPRecord,
	SessionRecord,
	PasskeyRecord,
	FullPasskeyRecord,
	NewPasskey,
} from '../types.js';

interface SqliteAdapterOptions {
	tablePrefix?: string;
}

export function sqliteAdapter(
	db: Database.Database,
	options: SqliteAdapterOptions = {},
): AuthDB {
	const p = options.tablePrefix ?? 'auth_';
	const t = {
		users: `${p}users`,
		sessions: `${p}sessions`,
		otpCodes: `${p}otp_codes`,
		passkeys: `${p}passkeys`,
		challenges: `${p}challenges`,
	};

	return {
		init() {
			db.pragma('journal_mode = WAL');
			db.pragma('foreign_keys = ON');
			db.exec(`
				CREATE TABLE IF NOT EXISTS ${t.users} (
					id TEXT PRIMARY KEY,
					email TEXT UNIQUE NOT NULL,
					skip_passkey_prompt INTEGER DEFAULT 0,
					created_at INTEGER DEFAULT (unixepoch())
				);
				CREATE TABLE IF NOT EXISTS ${t.sessions} (
					id TEXT PRIMARY KEY,
					user_id TEXT NOT NULL REFERENCES ${t.users}(id),
					expires_at INTEGER NOT NULL,
					created_at INTEGER DEFAULT (unixepoch())
				);
				CREATE TABLE IF NOT EXISTS ${t.otpCodes} (
					id TEXT PRIMARY KEY,
					email TEXT NOT NULL,
					code TEXT NOT NULL,
					attempts INTEGER NOT NULL DEFAULT 0,
					expires_at INTEGER NOT NULL,
					created_at INTEGER DEFAULT (unixepoch())
				);
				CREATE TABLE IF NOT EXISTS ${t.passkeys} (
					id TEXT PRIMARY KEY,
					user_id TEXT NOT NULL REFERENCES ${t.users}(id),
					credential_id TEXT UNIQUE NOT NULL,
					public_key BLOB NOT NULL,
					counter INTEGER NOT NULL DEFAULT 0,
					transports TEXT,
					created_at INTEGER DEFAULT (unixepoch())
				);
				CREATE TABLE IF NOT EXISTS ${t.challenges} (
					challenge TEXT PRIMARY KEY,
					user_id TEXT NOT NULL,
					expires_at INTEGER NOT NULL,
					created_at INTEGER DEFAULT (unixepoch())
				);
			`);
		},

		getUserByEmail(email: string): AuthUser | null {
			const row = db
				.prepare(`SELECT id, email, skip_passkey_prompt, created_at FROM ${t.users} WHERE email = ?`)
				.get(email) as { id: string; email: string; skip_passkey_prompt: number; created_at: number } | undefined;
			if (!row) return null;
			return {
				id: row.id,
				email: row.email,
				skipPasskeyPrompt: row.skip_passkey_prompt === 1,
				createdAt: row.created_at,
			};
		},

		createUser(email: string): AuthUser {
			const id = randomUUID();
			db.prepare(`INSERT INTO ${t.users} (id, email) VALUES (?, ?)`).run(id, email);
			return {
				id,
				email,
				skipPasskeyPrompt: false,
				createdAt: Math.floor(Date.now() / 1000),
			};
		},

		setSkipPasskeyPrompt(userId: string, skip: boolean) {
			db.prepare(`UPDATE ${t.users} SET skip_passkey_prompt = ? WHERE id = ?`).run(
				skip ? 1 : 0,
				userId,
			);
		},

		createSession(tokenHash: string, userId: string, expiresAt: number) {
			db.prepare(`INSERT INTO ${t.sessions} (id, user_id, expires_at) VALUES (?, ?, ?)`).run(
				tokenHash,
				userId,
				expiresAt,
			);
		},

		getSession(tokenHash: string): (SessionRecord & { email: string }) | null {
			const row = db
				.prepare(
					`SELECT s.id, s.user_id, s.expires_at, u.email
					FROM ${t.sessions} s
					JOIN ${t.users} u ON u.id = s.user_id
					WHERE s.id = ?`,
				)
				.get(tokenHash) as
				| { id: string; user_id: string; expires_at: number; email: string }
				| undefined;
			if (!row) return null;
			return {
				id: row.id,
				userId: row.user_id,
				expiresAt: row.expires_at,
				email: row.email,
			};
		},

		deleteSession(tokenHash: string) {
			db.prepare(`DELETE FROM ${t.sessions} WHERE id = ?`).run(tokenHash);
		},

		storeOTP(email: string, id: string, code: string, expiresAt: number) {
			db.prepare(
				`INSERT INTO ${t.otpCodes} (id, email, code, expires_at) VALUES (?, ?, ?, ?)`,
			).run(id, email, code, expiresAt);
		},

		getLatestOTP(email: string): OTPRecord | null {
			const row = db
				.prepare(
					`SELECT id, email, code, attempts, expires_at FROM ${t.otpCodes} WHERE email = ? ORDER BY created_at DESC LIMIT 1`,
				)
				.get(email) as
				| { id: string; email: string; code: string; attempts: number; expires_at: number }
				| undefined;
			if (!row) return null;
			return {
				id: row.id,
				email: row.email,
				code: row.code,
				attempts: row.attempts,
				expiresAt: row.expires_at,
			};
		},

		updateOTPAttempts(id: string, attempts: number) {
			db.prepare(`UPDATE ${t.otpCodes} SET attempts = ? WHERE id = ?`).run(attempts, id);
		},

		deleteOTP(id: string) {
			db.prepare(`DELETE FROM ${t.otpCodes} WHERE id = ?`).run(id);
		},

		deleteOTPsForEmail(email: string) {
			db.prepare(`DELETE FROM ${t.otpCodes} WHERE email = ?`).run(email);
		},

		storeChallenge(challenge: string, userId: string, expiresAt: number) {
			db.prepare(`DELETE FROM ${t.challenges} WHERE expires_at < ?`).run(Date.now());
			db.prepare(
				`INSERT INTO ${t.challenges} (challenge, user_id, expires_at) VALUES (?, ?, ?)`,
			).run(challenge, userId, expiresAt);
		},

		consumeChallenge(challenge: string): { userId: string } | null {
			const row = db
				.prepare(`SELECT user_id, expires_at FROM ${t.challenges} WHERE challenge = ?`)
				.get(challenge) as { user_id: string; expires_at: number } | undefined;
			if (!row) return null;
			db.prepare(`DELETE FROM ${t.challenges} WHERE challenge = ?`).run(challenge);
			if (row.expires_at < Date.now()) return null;
			return { userId: row.user_id };
		},

		getPasskeyByCredentialId(credentialId: string): FullPasskeyRecord | null {
			const row = db
				.prepare(
					`SELECT p.id, p.user_id, p.credential_id, p.public_key, p.counter, p.transports, p.created_at, u.email
					FROM ${t.passkeys} p
					JOIN ${t.users} u ON u.id = p.user_id
					WHERE p.credential_id = ?`,
				)
				.get(credentialId) as
				| {
						id: string;
						user_id: string;
						credential_id: string;
						public_key: Buffer;
						counter: number;
						transports: string | null;
						created_at: number;
						email: string;
				  }
				| undefined;
			if (!row) return null;
			return {
				id: row.id,
				userId: row.user_id,
				credentialId: row.credential_id,
				publicKey: new Uint8Array(row.public_key),
				counter: row.counter,
				transports: row.transports,
				createdAt: row.created_at,
				email: row.email,
			};
		},

		getUserPasskeys(userId: string): PasskeyRecord[] {
			const rows = db
				.prepare(
					`SELECT id, credential_id, public_key, counter, transports, created_at FROM ${t.passkeys} WHERE user_id = ?`,
				)
				.all(userId) as Array<{
				id: string;
				credential_id: string;
				public_key: Buffer;
				counter: number;
				transports: string | null;
				created_at: number;
			}>;
			return rows.map((row) => ({
				id: row.id,
				credentialId: row.credential_id,
				publicKey: new Uint8Array(row.public_key),
				counter: row.counter,
				transports: row.transports,
				createdAt: row.created_at,
			}));
		},

		storePasskey(passkey: NewPasskey) {
			db.prepare(
				`INSERT INTO ${t.passkeys} (id, user_id, credential_id, public_key, counter, transports) VALUES (?, ?, ?, ?, ?, ?)`,
			).run(
				passkey.id,
				passkey.userId,
				passkey.credentialId,
				Buffer.from(passkey.publicKey),
				passkey.counter,
				passkey.transports,
			);
		},

		updatePasskeyCounter(id: string, counter: number) {
			db.prepare(`UPDATE ${t.passkeys} SET counter = ? WHERE id = ?`).run(counter, id);
		},

		deletePasskey(id: string, userId: string): boolean {
			const result = db
				.prepare(`DELETE FROM ${t.passkeys} WHERE id = ? AND user_id = ?`)
				.run(id, userId);
			return result.changes > 0;
		},
	};
}
