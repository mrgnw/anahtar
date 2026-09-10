import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';

const { mockStartAuthentication } = vi.hoisted(() => ({ mockStartAuthentication: vi.fn() }));

vi.mock('@simplewebauthn/browser', () => ({
	startAuthentication: mockStartAuthentication,
	WebAuthnAbortService: { cancelCeremony: vi.fn() },
}));

import SessionRenew from './SessionRenew.svelte';

const DAY = 24 * 60 * 60 * 1000;
const user = { email: 'test@example.com' };

function mockFetch(responses: Record<string, unknown>) {
	return vi.fn(async (url: string) => {
		const key = Object.keys(responses).find((k) => url.endsWith(k));
		return { ok: !!key, status: key ? 200 : 404, json: async () => responses[key ?? ''] ?? {} } as Response;
	}) as unknown as typeof fetch;
}

describe('SessionRenew', () => {
	let originalFetch: typeof globalThis.fetch;

	beforeEach(() => {
		originalFetch = globalThis.fetch;
		mockStartAuthentication.mockReset();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it('mounts standalone and renews through a passkey login', async () => {
		mockStartAuthentication.mockResolvedValue({ id: 'cred', response: {} });
		globalThis.fetch = mockFetch({
			'/passkey/list': [{ id: 'k1' }],
			'/passkey/check-email': { allowCredentials: [{ id: 'abc' }] },
			'/passkey/login-finish': { user: { id: '1', email: user.email } },
		});
		const onSuccess = vi.fn();
		render(SessionRenew, { props: { user, session: { expiresAt: Date.now() + 3 * DAY }, onSuccess } });

		await fireEvent.click(await screen.findByRole('button', { name: 'Stay signed in' }));

		await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
	});

	it('uses getPasskeys and honours renewBefore', async () => {
		globalThis.fetch = mockFetch({});
		const getPasskeys = vi.fn(async () => [{ id: 'k1' }]);
		render(SessionRenew, {
			props: { user, session: { expiresAt: Date.now() + 3 * DAY }, renewBefore: DAY, getPasskeys },
		});
		await new Promise((r) => setTimeout(r, 10));
		expect(getPasskeys).not.toHaveBeenCalled();
		expect(screen.queryByRole('button')).toBeNull();
	});

	it('renders nothing when the passkey list fails', async () => {
		globalThis.fetch = mockFetch({});
		render(SessionRenew, { props: { user, session: { expiresAt: Date.now() + 3 * DAY } } });
		await new Promise((r) => setTimeout(r, 10));
		expect(screen.queryByRole('button')).toBeNull();
	});
});
