import Database from 'better-sqlite3';
import { createHash, randomBytes } from 'node:crypto';
import type { RequestEvent } from '@sveltejs/kit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sqliteAdapter } from '../db/sqlite.js';
import { createAuth } from '../index.js';
import {
	generateRegistrationChallenge,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
} from '../passkey.js';
import { validateSession } from '../session.js';

vi.mock('../passkey.js', () => ({
	generateAuthenticationChallenge: vi.fn(),
	generateAuthenticationChallengeForUser: vi.fn(),
	generateRegistrationChallenge: vi.fn().mockResolvedValue({ challenge: 'registration-challenge' }),
	removePasskey: vi.fn(),
	verifyAuthenticationResponse: vi.fn(),
	verifyRegistrationResponse: vi.fn().mockResolvedValue({ ok: true }),
}));

const DAY = 24 * 60 * 60 * 1000;
const OTP_DURATION = 30 * DAY;
const PASSKEY_DURATION = 90 * DAY;
const ENROLLMENT_WINDOW = 5 * 60 * 1000;
const NOW = Date.UTC(2026, 0, 1);
const EMAIL = 'a@example.com';
const WEBAUTHN_RESPONSE = { id: 'credential', response: { clientDataJSON: 'x' } };

let auth: ReturnType<typeof createAuth>;
let database: Database.Database;
let cookies: Map<string, string>;
const onSendOTP = vi.fn<(email: string, code: string) => Promise<void>>();

beforeEach(() => {
	vi.clearAllMocks();
	vi.useFakeTimers({ toFake: ['Date'] });
	vi.setSystemTime(NOW);
	database = new Database(':memory:');
	auth = createAuth({
		db: sqliteAdapter(database),
		onSendOTP,
		sessionDuration: (method) => (method === 'passkey' ? PASSKEY_DURATION : OTP_DURATION),
	});
	cookies = new Map();
});

afterEach(() => {
	vi.useRealTimers();
	database.close();
});

async function request(path: string, body?: unknown, method = 'POST') {
	const set = vi.fn((name: string, value: string, _opts: { maxAge: number }) => {
		cookies.set(name, value);
	});
	const url = new URL('https://example.test/api/auth/' + path);
	const event = {
		params: { path },
		url,
		request: new Request(url, {
			method,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		}),
		cookies: {
			get: (name: string) => cookies.get(name),
			set,
			delete: (name: string) => cookies.delete(name),
		},
		locals: { user: null, session: null },
	} as unknown as RequestEvent;
	const handler = method === 'GET' ? auth.handlers.GET : auth.handlers.POST;
	return { response: await auth.handle({ event, resolve: handler }), set };
}

async function signInWithEmail() {
	expect((await request('start', { email: EMAIL })).response.status).toBe(200);
	const [, code] = onSendOTP.mock.lastCall!;
	const { response } = await request('verify', { email: EMAIL, code });
	expect(response.status).toBe(200);
	return response.json();
}

describe('passkey enrollment', () => {
	it('allows immediate first enrollment and preserves the original proof when rotating the session', async () => {
		const { user, hasPasskey } = await signInWithEmail();
		expect(hasPasskey).toBe(false);
		const { db, cookie } = auth.config;
		const originalToken = cookies.get(cookie)!;

		expect((await request('passkey/register-start')).response.status).toBe(200);
		vi.setSystemTime(NOW + ENROLLMENT_WINDOW - 1);
		const { response, set } = await request('passkey/register-finish', WEBAUTHN_RESPONSE);
		expect(response.status).toBe(200);
		expect(set).toHaveBeenCalledOnce();
		const [name, token, opts] = set.mock.calls[0];
		expect(name).toBe(cookie);
		expect(token).not.toBe(originalToken);
		expect(opts.maxAge).toBe(PASSKEY_DURATION / 1000);

		expect(await validateSession(db, originalToken)).toBeNull();
		const renewed = await validateSession(db, token);
		expect(renewed?.user.id).toBe(user.id);
		expect(renewed?.session.expiresAt).toBe(Date.now() + PASSKEY_DURATION);

		vi.setSystemTime(NOW + ENROLLMENT_WINDOW);
		expect((await request('passkey/register-start')).response.status).toBe(403);
	});

	it('requires sign-in at both steps while keeping legacy sessions signed in', async () => {
		await auth.ready;
		const { db, cookie } = auth.config;
		const user = await db.createUser(EMAIL);
		const legacyToken = randomBytes(32);
		await db.createSession(
			createHash('sha256').update(legacyToken).digest('hex'),
			user.id,
			NOW + OTP_DURATION,
		);
		cookies.set(cookie, legacyToken.toString('hex'));

		expect((await request('passkey/list', undefined, 'GET')).response.status).toBe(200);
		expect((await request('passkey/register-start')).response.status).toBe(403);
		const { response } = await request('passkey/register-finish', WEBAUTHN_RESPONSE);
		expect(response.status).toBe(403);
		expect(await response.json()).toEqual({
			error: 'Sign in again with an email code or an existing passkey to add a passkey.',
		});
		expect(generateRegistrationChallenge).not.toHaveBeenCalled();
		expect(verifyRegistrationResponse).not.toHaveBeenCalled();

		expect((await signInWithEmail()).user.id).toBe(user.id);
		expect((await request('passkey/register-start')).response.status).toBe(200);
	});

	it('keeps sign-in proof with the session and account that earned it', async () => {
		await signInWithEmail();
		const originalCookies = cookies;

		vi.setSystemTime(NOW + ENROLLMENT_WINDOW);
		cookies = new Map();
		const otherUser = await auth.config.db.createUser('b@example.com');
		vi.mocked(verifyAuthenticationResponse).mockResolvedValueOnce({ user: otherUser });
		expect((await request('passkey/login-finish', WEBAUTHN_RESPONSE)).response.status).toBe(200);
		expect((await request('passkey/register-start')).response.status).toBe(200);
		expect(generateRegistrationChallenge).toHaveBeenLastCalledWith(
			auth.config.db,
			{ id: otherUser.id, email: otherUser.email },
			expect.any(URL),
			auth.config,
		);

		cookies = originalCookies;
		expect((await request('passkey/register-start')).response.status).toBe(403);
	});

	it('checks freshness again at finish and accepts a new passkey sign-in', async () => {
		const { user } = await signInWithEmail();
		expect((await request('passkey/register-start')).response.status).toBe(200);

		vi.setSystemTime(NOW + ENROLLMENT_WINDOW);
		expect((await request('passkey/register-finish', WEBAUTHN_RESPONSE)).response.status).toBe(403);
		expect(verifyRegistrationResponse).not.toHaveBeenCalled();
		expect((await request('passkey/list', undefined, 'GET')).response.status).toBe(200);

		vi.mocked(verifyAuthenticationResponse).mockResolvedValueOnce({ user });
		expect((await request('passkey/login-finish', WEBAUTHN_RESPONSE)).response.status).toBe(200);
		expect((await request('passkey/register-start')).response.status).toBe(200);
		expect((await request('passkey/register-finish', WEBAUTHN_RESPONSE)).response.status).toBe(200);
	});

	it('requires an authenticated session at both steps', async () => {
		expect((await request('passkey/register-start')).response.status).toBe(401);
		expect((await request('passkey/register-finish', WEBAUTHN_RESPONSE)).response.status).toBe(401);
	});
});
