import Database from 'better-sqlite3';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sqliteAdapter } from '../db/sqlite.js';
import { resolveConfig } from '../config.js';
import { createSession, validateSession } from '../session.js';
import type { AuthDB, ResolvedConfig } from '../types.js';
import { createHandlers } from './handlers.js';

vi.mock('../passkey.js', () => ({
	generateAuthenticationChallenge: vi.fn(),
	generateAuthenticationChallengeForUser: vi.fn(),
	generateRegistrationChallenge: vi.fn(),
	removePasskey: vi.fn(),
	verifyAuthenticationResponse: vi.fn(),
	verifyRegistrationResponse: vi.fn().mockResolvedValue({ ok: true }),
}));

const DAY = 24 * 60 * 60 * 1000;
const OTP_DURATION = 30 * DAY;
const PASSKEY_DURATION = 90 * DAY;

let db: AuthDB;
let config: ResolvedConfig;

beforeEach(() => {
	db = sqliteAdapter(new Database(':memory:'));
	db.init();
	config = resolveConfig({
		db,
		onSendOTP: vi.fn(),
		sessionDuration: (method) => (method === 'passkey' ? PASSKEY_DURATION : OTP_DURATION),
	});
});

function fakeEvent(path: string, cookies: Map<string, string>, body: unknown) {
	const set = vi.fn((name: string, value: string, _opts: { maxAge: number }) => {
		cookies.set(name, value);
	});
	const event = {
		params: { path },
		url: new URL('https://example.test/api/auth/' + path),
		request: new Request('https://example.test/api/auth/' + path, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		}),
		cookies: {
			get: (name: string) => cookies.get(name),
			set,
			delete: (name: string) => cookies.delete(name),
		},
		locals: { user: null, session: null } as { user: unknown; session: unknown },
	};
	return { event, set };
}

describe('passkey/register-finish', () => {
	it('rotates the session into a passkey-length one', async () => {
		const user = await db.createUser('a@example.com');
		const otp = await createSession(db, user.id, config, 'otp');
		const cookies = new Map([[config.cookie, otp.sessionToken]]);
		const { event, set } = fakeEvent('passkey/register-finish', cookies, {
			response: { clientDataJSON: 'x' },
		});
		const current = await validateSession(db, otp.sessionToken);
		event.locals.user = current!.user;
		event.locals.session = current!.session;

		const handlers = createHandlers(config, () => Promise.resolve());
		const res = await handlers.POST(event as never);
		expect(res.status).toBe(200);

		expect(set).toHaveBeenCalledOnce();
		const [name, token, opts] = set.mock.calls[0];
		expect(name).toBe(config.cookie);
		expect(token).not.toBe(otp.sessionToken);
		expect(opts.maxAge).toBe(PASSKEY_DURATION / 1000);

		expect(await validateSession(db, otp.sessionToken)).toBeNull();
		const renewed = await validateSession(db, token);
		expect(renewed?.user.id).toBe(user.id);
		expect(renewed!.session.expiresAt - Date.now()).toBeGreaterThan(PASSKEY_DURATION - 5000);
	});
});
