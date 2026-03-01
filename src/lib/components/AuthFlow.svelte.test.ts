import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import AuthFlow from './AuthFlow.svelte';

function mockFetch(responses: Record<string, { ok: boolean; body?: unknown; status?: number }>) {
	return vi.fn(async (url: string, init?: RequestInit) => {
		const key = Object.keys(responses).find((k) => url.endsWith(k));
		const resp = key ? responses[key] : { ok: false, status: 404, body: { error: 'Not found' } };
		return {
			ok: resp.ok,
			status: resp.status ?? (resp.ok ? 200 : 400),
			json: async () => resp.body ?? {},
		} as Response;
	});
}

describe('AuthFlow', () => {
	let originalFetch: typeof globalThis.fetch;

	beforeEach(() => {
		originalFetch = globalThis.fetch;
		// Mock fetch to reject passkey login-start (so tryConditionalWebAuthn silently fails)
		globalThis.fetch = mockFetch({
			'/passkey/login-start': { ok: false, status: 404 },
		});
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it('renders email input at step 1', () => {
		render(AuthFlow);
		expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
	});

	it('shows error for invalid email', async () => {
		render(AuthFlow);
		const input = screen.getByPlaceholderText('you@example.com');
		await fireEvent.input(input, { target: { value: 'notanemail' } });
		const form = input.closest('form')!;
		await fireEvent.submit(form);
		expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
	});

	it('transitions to OTP step on successful email submit', async () => {
		globalThis.fetch = mockFetch({
			'/passkey/login-start': { ok: false, status: 404 },
			'/start': { ok: true, body: { success: true } },
		});

		render(AuthFlow);
		const input = screen.getByPlaceholderText('you@example.com');
		await fireEvent.input(input, { target: { value: 'test@example.com' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

		await waitFor(() => {
			expect(screen.getByText('We sent a code to')).toBeInTheDocument();
			expect(screen.getByText('test@example.com')).toBeInTheDocument();
		});
	});

	it('shows OTP inputs in step 2', async () => {
		globalThis.fetch = mockFetch({
			'/passkey/login-start': { ok: false, status: 404 },
			'/start': { ok: true, body: { success: true } },
		});

		render(AuthFlow);
		const input = screen.getByPlaceholderText('you@example.com');
		await fireEvent.input(input, { target: { value: 'test@example.com' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

		await waitFor(() => {
			const otpInputs = screen.getAllByRole('textbox');
			expect(otpInputs.length).toBeGreaterThanOrEqual(5);
		});
	});

	it('calls onSuccess when OTP verified with existing passkey', async () => {
		const onSuccess = vi.fn();
		globalThis.fetch = mockFetch({
			'/passkey/login-start': { ok: false, status: 404 },
			'/start': { ok: true, body: { success: true } },
			'/verify': { ok: true, body: { user: { id: '1', email: 'test@example.com' }, hasPasskey: true, skipPasskeyPrompt: false } },
		});

		render(AuthFlow, { props: { onSuccess } });

		// Step 1: email
		const emailInput = screen.getByPlaceholderText('you@example.com');
		await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

		// Step 2: OTP - fill all digits
		await waitFor(() => {
			expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(5);
		});

		const otpInputs = screen.getAllByRole('textbox');
		for (let i = 0; i < 5; i++) {
			await fireEvent.input(otpInputs[i], { target: { value: String(i + 1) } });
		}

		await waitFor(() => {
			expect(onSuccess).toHaveBeenCalledOnce();
		});
	});

	it('shows error on failed email submission', async () => {
		globalThis.fetch = mockFetch({
			'/passkey/login-start': { ok: false, status: 404 },
			'/start': { ok: false, status: 400, body: { error: 'Invalid email' } },
		});

		render(AuthFlow);
		const input = screen.getByPlaceholderText('you@example.com');
		await fireEvent.input(input, { target: { value: 'bad@example.com' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

		await waitFor(() => {
			expect(screen.getByText('Invalid email')).toBeInTheDocument();
		});
	});

	it('can go back to email step from OTP step', async () => {
		globalThis.fetch = mockFetch({
			'/passkey/login-start': { ok: false, status: 404 },
			'/start': { ok: true, body: { success: true } },
		});

		render(AuthFlow);
		const input = screen.getByPlaceholderText('you@example.com');
		await fireEvent.input(input, { target: { value: 'test@example.com' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

		await waitFor(() => {
			expect(screen.getByText('Use a different email')).toBeInTheDocument();
		});

		await fireEvent.click(screen.getByText('Use a different email'));
		expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
	});

	it('resend button calls start endpoint again', async () => {
		const fetchMock = mockFetch({
			'/passkey/login-start': { ok: false, status: 404 },
			'/start': { ok: true, body: { success: true } },
		});
		globalThis.fetch = fetchMock;

		render(AuthFlow);
		const input = screen.getByPlaceholderText('you@example.com');
		await fireEvent.input(input, { target: { value: 'test@example.com' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

		await waitFor(() => {
			expect(screen.getByText("Didn't get it? Resend")).toBeInTheDocument();
		});

		const startCallsBefore = fetchMock.mock.calls.filter(
			([url]: [string]) => typeof url === 'string' && url.endsWith('/start'),
		).length;

		await fireEvent.click(screen.getByText("Didn't get it? Resend"));

		await waitFor(() => {
			const startCallsAfter = fetchMock.mock.calls.filter(
				([url]: [string]) => typeof url === 'string' && url.endsWith('/start'),
			).length;
			expect(startCallsAfter).toBe(startCallsBefore + 1);
		});
	});
});
