import { describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { createAuth } from '../index.js';
import en from '../i18n/en.js';
import type { AuthDB } from '../types.js';

function startEvent(): RequestEvent {
	return {
		params: { path: 'start' },
		request: new Request('http://localhost/auth/start', {
			method: 'POST',
			body: JSON.stringify({ email: 'user@example.com' }),
		}),
		url: new URL('http://localhost/auth/start'),
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

		const response = await auth.handlers.POST(startEvent());

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

		const response = await auth.handlers.POST(startEvent());

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ error: en.errorGeneric });
		expect(onError).toHaveBeenCalledWith('otp-send', expect.any(Error), expect.anything());
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
