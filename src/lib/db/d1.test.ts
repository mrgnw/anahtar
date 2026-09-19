import Database from 'better-sqlite3';
import { beforeEach, describe, expect, it } from 'vitest';
import type { AuthDB } from '../types.js';
import { d1Adapter } from './d1.js';

type D1Statement = {
	bind(...values: unknown[]): D1Statement;
	first<T>(): Promise<T | null>;
	all<T>(): Promise<{ results: T[] }>;
	run(): Promise<{ meta: { changes: number } }>;
};

function d1Shim(rawDb: InstanceType<typeof Database>) {
	function statement(sql: string, values: unknown[]): D1Statement {
		const stmt = rawDb.prepare(sql);
		return {
			bind: (...next: unknown[]) => statement(sql, next),
			first: async <T>() => (stmt.get(...values) as T | undefined) ?? null,
			all: async <T>() => ({ results: stmt.all(...values) as T[] }),
			run: async () => {
				if (stmt.reader) {
					stmt.all(...values);
					return { meta: { changes: 0 } };
				}
				return { meta: { changes: stmt.run(...values).changes } };
			}
		};
	}
	return {
		prepare: (sql: string) => statement(sql, []),
		exec: async (sql: string) => rawDb.exec(sql)
	};
}

let db: AuthDB;
let rawDb: InstanceType<typeof Database>;

beforeEach(async () => {
	rawDb = new Database(':memory:');
	db = d1Adapter(d1Shim(rawDb));
	await db.init();
});

describe('d1Adapter through the better-sqlite3 shim', () => {
	it('init creates all tables', () => {
		const names = rawDb.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").pluck().all();
		expect(names).toEqual(['auth_challenges', 'auth_otp_codes', 'auth_passkeys', 'auth_sessions', 'auth_users']);
	});

	it('createSession and getSession round-trip', async () => {
		const user = await db.createUser('sess@example.com');
		const expiresAt = Date.now() + 60000;
		await db.createSession('hash-abc', user.id, expiresAt);
		const session = await db.getSession('hash-abc');
		expect(session).toEqual({ id: 'hash-abc', userId: user.id, expiresAt, email: 'sess@example.com' });
	});

	it('deleteSessionsForUser removes only that user\'s sessions', async () => {
		const alice = await db.createUser('alice@example.com');
		const bob = await db.createUser('bob@example.com');
		await db.createSession('a1', alice.id, Date.now() + 60000);
		await db.createSession('a2', alice.id, Date.now() + 60000);
		await db.createSession('b1', bob.id, Date.now() + 60000);
		await db.deleteSessionsForUser(alice.id);
		expect(await db.getSession('a1')).toBeNull();
		expect(await db.getSession('a2')).toBeNull();
		expect(await db.getSession('b1')).not.toBeNull();
	});

	it('deleteExpired removes only expired rows across sessions, OTPs and challenges', async () => {
		const user = await db.createUser('sweep@example.com');
		const now = Date.now();
		await db.createSession('old', user.id, now - 1000);
		await db.createSession('live', user.id, now + 60000);
		await db.storeOTP('sweep@example.com', 'otp-old', '11111', now - 1000);
		await db.storeOTP('sweep@example.com', 'otp-live', '22222', now + 60000);
		await db.storeChallenge('ch-live', user.id, now + 60000);
		await db.storeChallenge('ch-old', user.id, now - 1000);

		await db.deleteExpired(now);

		expect(await db.getSession('old')).toBeNull();
		expect(await db.getSession('live')).not.toBeNull();
		expect(rawDb.prepare('SELECT id FROM auth_otp_codes').pluck().all()).toEqual(['otp-live']);
		expect(rawDb.prepare('SELECT challenge FROM auth_challenges').pluck().all()).toEqual(['ch-live']);
	});
});
