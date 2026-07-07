import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';

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

import AuthPill from './AuthPill.svelte';

function mockFetch(responses: Record<string, { ok: boolean; body?: unknown; status?: number }>) {
	return vi.fn(async (url: string) => {
		const key = Object.keys(responses).find((k) => url.endsWith(k));
		const resp = key ? responses[key] : { ok: false, status: 404, body: { error: 'Not found' } };
		return {
			ok: resp.ok,
			status: resp.status ?? (resp.ok ? 200 : 400),
			json: async () => resp.body ?? {},
		} as Response;
	});
}

async function submitEmail(value = 'test@example.com') {
	const input = screen.getByPlaceholderText('you@example.com');
	await fireEvent.input(input, { target: { value } });
	await fireEvent.submit(input.closest('form')!);
}

describe('AuthPill', () => {
	let originalFetch: typeof globalThis.fetch;

	beforeEach(() => {
		originalFetch = globalThis.fetch;
		// happy-dom lacks the Web Animations API that Svelte's slide transition uses.
		Element.prototype.animate ??= () =>
			({ cancel() {}, finished: Promise.resolve(), onfinish: null }) as unknown as Animation;
		mockStartAuthentication.mockReset();
		mockStartRegistration.mockReset();
		mockCancelCeremony.mockReset();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.useRealTimers();
	});

	it('falls through to email OTP when the passkey ceremony stalls', async () => {
		vi.useFakeTimers();
		// Ceremony that never resolves nor rejects — the freeze scenario.
		mockStartAuthentication.mockReturnValue(new Promise(() => {}));
		globalThis.fetch = mockFetch({
			'/passkey/login-start': { ok: false, status: 404 },
			'/passkey/check-email': { ok: true, body: { allowCredentials: [{ id: 'abc' }] } },
			'/start': { ok: true, body: { success: true } },
		});

		render(AuthPill);
		await submitEmail();

		// Advance past the 8s ceremony timeout; fallback should send the OTP.
		await vi.advanceTimersByTimeAsync(8100);

		const otpBoxes = screen.getAllByRole('textbox');
		expect(otpBoxes.length).toBeGreaterThanOrEqual(5);
		expect(otpBoxes[0]).not.toBeDisabled(); // loading cleared
		expect(mockCancelCeremony).toHaveBeenCalled(); // stalled ceremony was aborted
	});

	it('cancels the ceremony and sends OTP when the passkey attempt fails', async () => {
		mockStartAuthentication.mockRejectedValue(new Error('rpID mismatch'));
		globalThis.fetch = mockFetch({
			'/passkey/login-start': { ok: false, status: 404 },
			'/passkey/check-email': { ok: true, body: { allowCredentials: [{ id: 'abc' }] } },
			'/start': { ok: true, body: { success: true } },
		});

		render(AuthPill);
		await submitEmail();

		await waitFor(() => {
			expect(screen.getByText('We sent a code to')).toBeInTheDocument();
		});
		expect(mockCancelCeremony).toHaveBeenCalled();
	});

	it('completes passkey login and skips the email OTP path', async () => {
		const onSuccess = vi.fn();
		mockStartAuthentication.mockResolvedValue({ id: 'cred', response: {} });
		const fetchMock = mockFetch({
			'/passkey/login-start': { ok: false, status: 404 },
			'/passkey/check-email': { ok: true, body: { allowCredentials: [{ id: 'abc' }] } },
			'/passkey/login-finish': { ok: true, body: { user: { id: '1', email: 'test@example.com' } } },
			'/start': { ok: true, body: { success: true } },
		});
		globalThis.fetch = fetchMock;

		render(AuthPill, { props: { onSuccess } });
		await submitEmail();

		await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
		const startCalled = fetchMock.mock.calls.some(
			([url]) => typeof url === 'string' && url.endsWith('/start'),
		);
		expect(startCalled).toBe(false);
	});
});
