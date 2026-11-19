import Database from 'better-sqlite3';
import { describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { sqliteAdapter } from '../db/sqlite.js';
import { createAuth } from '../index.js';
import en from '../i18n/en.js';
import { generateOTP } from '../otp.js';
import type { AuthDB } from '../types.js';

function otpEvent(path: 'start' | 'verify', code?: string): RequestEvent {
	return {
		params: { path },
		request: new Request(`http://localhost/auth/${path}`, {
			method: 'POST',
			body: JSON.stringify({ email: 'user@example.com', code }),
		}),
		url: new URL(`http://localhost/auth/${path}`),
		cookies: { get: () => undefined, set: vi.fn(), delete: vi.fn() },
		locals: {},
	} as unknown as RequestEvent;
}

function dbWith(overrides: Partial<AuthDB>): AuthDB {
	return { init: vi.fn(), ...overrides } as unknown as AuthDB;
}

describe('/start', () => {
	it('reports a db failure and returns the localized message', async () => {
		const onError = vi.fn();
		const auth = createAuth({
			db: dbWith({
				deleteOTPsForEmail: () => {
					throw new Error('D1_ERROR: D1 DB is overloaded');
				},
			}),
			onSendOTP: vi.fn(),
			onError,
		});

		const response = await auth.handlers.POST(otpEvent('start'));

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({ error: en.errorGeneric });
		expect(onError).toHaveBeenCalledWith('otp-create', expect.any(Error), expect.anything());
	});

	it('reports an onSendOTP failure without leaking its message', async () => {
		const onError = vi.fn();
		const auth = createAuth({
			db: dbWith({ deleteOTPsForEmail: vi.fn(), storeOTP: vi.fn() }),
			onSendOTP: async () => {
				throw new Error('smtp relay refused: user@example.com');
			},
			onError,
		});

		const response = await auth.handlers.POST(otpEvent('start'));

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ error: en.errorGeneric });
		expect(onError).toHaveBeenCalledWith('otp-send', expect.any(Error), expect.anything());
	});
});

describe('/verify', () => {
	it('issues only one session for an eligible code', async () => {
		const db = sqliteAdapter(new Database(':memory:'));
		const auth = createAuth({ db, onSendOTP: vi.fn() });
		await auth.ready;
		const createSession = vi.spyOn(db, 'createSession');
		const { code } = await generateOTP(db, 'user@example.com', auth.config);
		const events = [otpEvent('verify', code), otpEvent('verify', code)];

		const responses = await Promise.all(events.map((event) => auth.handlers.POST(event)));

		expect(responses.map(({ status }) => status).sort()).toEqual([200, 400]);
		expect(createSession).toHaveBeenCalledOnce();
		for (const [index, response] of responses.entries()) {
			expect(events[index].cookies.set).toHaveBeenCalledTimes(response.ok ? 1 : 0);
		}
	});

	it('rejects a verification invalidated by fresh issuance and preserves the new code', async () => {
		const email = 'user@example.com';
		const db = sqliteAdapter(new Database(':memory:'));
		const auth = createAuth({ db, onSendOTP: vi.fn() });
		await auth.ready;
		const createSession = vi.spyOn(db, 'createSession');
		const { code } = await generateOTP(db, email, auth.config);
		const consumeOTP = db.consumeOTP;
		const issueFreshOTP = vi.fn(() => generateOTP(db, email, auth.config));
		vi.spyOn(db, 'consumeOTP').mockImplementationOnce(async (id, maxAttempts) => {
			await issueFreshOTP();
			return consumeOTP(id, maxAttempts);
		});
		const event = otpEvent('verify', code);

		const response = await auth.handlers.POST(event);

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ error: en.errorInvalidCode });
		expect(createSession).not.toHaveBeenCalled();
		expect(event.cookies.set).not.toHaveBeenCalled();
		expect(issueFreshOTP).toHaveBeenCalledOnce();
		const fresh = await issueFreshOTP.mock.results[0].value;
		expect(db.getLatestOTP(email)).toMatchObject({ id: fresh.id, attempts: 0 });
		expect((await auth.handlers.POST(otpEvent('verify', fresh.code))).status).toBe(200);
	});
});

function logoutAllEvent(user: { id: string; email: string } | null): RequestEvent {
	return {
		params: { path: 'logout-all' },
		request: new Request('http://localhost/auth/logout-all', { method: 'POST' }),
		url: new URL('http://localhost/auth/logout-all'),
		cookies: { get: () => 'token', set: vi.fn(), delete: vi.fn() },
		locals: { user, session: null },
	} as unknown as RequestEvent;
}

describe('/logout-all', () => {
	it('returns 401 without a session', async () => {
		const deleteSessionsForUser = vi.fn();
		const auth = createAuth({ db: dbWith({ deleteSessionsForUser }), onSendOTP: vi.fn() });

		const response = await auth.handlers.POST(logoutAllEvent(null));

		expect(response.status).toBe(401);
		expect(await response.json()).toEqual({ error: en.errorNotAuthenticated });
		expect(deleteSessionsForUser).not.toHaveBeenCalled();
	});

	it('deletes every session of the user and clears the cookie', async () => {
		const deleteSessionsForUser = vi.fn();
		const auth = createAuth({ db: dbWith({ deleteSessionsForUser }), onSendOTP: vi.fn() });
		const event = logoutAllEvent({ id: 'user-1', email: 'user@example.com' });

		const response = await auth.handlers.POST(event);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ ok: true });
		expect(deleteSessionsForUser).toHaveBeenCalledWith('user-1');
		expect(event.cookies.delete).toHaveBeenCalledWith(auth.config.cookie, { path: '/' });
	});
});
