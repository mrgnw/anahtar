import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockStartAuthentication, mockStartRegistration, mockCancelCeremony } = vi.hoisted(() => ({
	mockStartAuthentication: vi.fn(),
	mockStartRegistration: vi.fn(),
	mockCancelCeremony: vi.fn(),
}));

vi.mock('@simplewebauthn/browser', () => ({
	startAuthentication: mockStartAuthentication,
	startRegistration: mockStartRegistration,
	WebAuthnAbortService: { cancelCeremony: mockCancelCeremony },
}));

import { AuthError, createAuthClient } from './client.js';

type Route = { ok: boolean; status?: number; body?: unknown };

function installFetch(routes: Record<string, Route>) {
	const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
		const key = Object.keys(routes).find((k) => url.endsWith(k));
		const route = key ? routes[key] : { ok: false, status: 404, body: { error: 'Not found' } };
		void init;
		return {
			ok: route.ok,
			status: route.status ?? (route.ok ? 200 : 400),
			json: async () => route.body ?? {},
		} as Response;
	});
	globalThis.fetch = fetchMock as unknown as typeof fetch;
	return fetchMock;
}

function call(fetchMock: ReturnType<typeof installFetch>, suffix: string) {
	return fetchMock.mock.calls.find(([url]) => url.endsWith(suffix));
}

describe('createAuthClient', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		mockStartAuthentication.mockReset();
		mockStartRegistration.mockReset();
		mockCancelCeremony.mockReset();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.useRealTimers();
	});

	it('sendCode posts the email and returns otpLength', async () => {
		const fetchMock = installFetch({ '/start': { ok: true, body: { success: true, otpLength: 6 } } });
		const result = await createAuthClient('/auth').sendCode('a@b.co');
		expect(result.otpLength).toBe(6);
		const [url, init] = call(fetchMock, '/auth/start')!;
		expect(url).toBe('/auth/start');
		expect(JSON.parse(init!.body as string)).toEqual({ email: 'a@b.co' });
	});

	it('throws AuthError with the server message and status', async () => {
		installFetch({ '/verify': { ok: false, status: 429, body: { error: 'Too many' } } });
		const error = await createAuthClient().verifyCode('a@b.co', '00000').catch((e) => e);
		expect(error).toBeInstanceOf(AuthError);
		expect(error.message).toBe('Too many');
		expect(error.status).toBe(429);
	});

	it('passkeyLogin with email returns false without a ceremony when there are no passkeys', async () => {
		installFetch({ '/passkey/check-email': { ok: true, body: { allowCredentials: [] } } });
		expect(await createAuthClient().passkeyLogin({ email: 'a@b.co' })).toBe(false);
		expect(mockStartAuthentication).not.toHaveBeenCalled();
	});

	it('passkeyLogin completes the ceremony and posts the assertion', async () => {
		mockStartAuthentication.mockResolvedValue({ id: 'cred', response: {} });
		const fetchMock = installFetch({
			'/passkey/check-email': { ok: true, body: { allowCredentials: [{ id: 'cred' }] } },
			'/passkey/login-finish': { ok: true, body: { user: { id: '1', email: 'a@b.co' } } },
		});
		expect(await createAuthClient().passkeyLogin({ email: 'a@b.co' })).toBe(true);
		expect(call(fetchMock, '/passkey/login-finish')).toBeDefined();
	});

	it('passkeyLogin returns false and cancels when the ceremony stalls', async () => {
		vi.useFakeTimers();
		let ceremonyStarted!: () => void;
		const started = new Promise<void>((resolve) => (ceremonyStarted = resolve));
		mockStartAuthentication.mockImplementation(() => {
			ceremonyStarted();
			return new Promise(() => {});
		});
		installFetch({ '/passkey/check-email': { ok: true, body: { allowCredentials: [{ id: 'cred' }] } } });

		const pending = createAuthClient().passkeyLogin({ email: 'a@b.co', timeoutMs: 100 });
		await started;
		await vi.advanceTimersByTimeAsync(150);
		expect(await pending).toBe(false);
		expect(mockCancelCeremony).toHaveBeenCalled();
	});

	it('passkeyLogin returns false when verification fails', async () => {
		mockStartAuthentication.mockResolvedValue({ id: 'cred', response: {} });
		installFetch({
			'/passkey/login-start': { ok: true, body: { challenge: 'x' } },
			'/passkey/login-finish': { ok: false, status: 401, body: { error: 'nope' } },
		});
		expect(await createAuthClient().passkeyLogin()).toBe(false);
	});

	it('passkeyRegister returns false when the user dismisses the sheet', async () => {
		mockStartRegistration.mockRejectedValue(Object.assign(new Error('cancelled'), { name: 'NotAllowedError' }));
		installFetch({ '/passkey/register-start': { ok: true, body: { challenge: 'x' } } });
		expect(await createAuthClient().passkeyRegister()).toBe(false);
	});

	it('passkeyRegister posts the registration with a name', async () => {
		mockStartRegistration.mockResolvedValue({ id: 'cred', response: {} });
		const fetchMock = installFetch({
			'/passkey/register-start': { ok: true, body: { challenge: 'x' } },
			'/passkey/register-finish': { ok: true, body: { success: true } },
		});
		expect(await createAuthClient().passkeyRegister('Laptop')).toBe(true);
		const [, init] = call(fetchMock, '/passkey/register-finish')!;
		expect(JSON.parse(init!.body as string)).toEqual({ id: 'cred', response: {}, name: 'Laptop' });
	});
});
