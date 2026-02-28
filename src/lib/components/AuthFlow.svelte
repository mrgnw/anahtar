<script lang="ts">
import { guessDeviceName } from '../device.js';
import { resolveMessages, detectLocaleClient, type AuthMessages } from '../i18n/index.js';
import OtpInput from './OtpInput.svelte';
import PasskeyPrompt from './PasskeyPrompt.svelte';

interface Props {
	apiBase?: string;
	locale?: string;
	messages?: Partial<AuthMessages>;
	onSuccess?: () => void;
}

let { apiBase = '/api/auth', locale, messages: messageOverrides, onSuccess }: Props = $props();

let m = $derived(resolveMessages(locale ?? detectLocaleClient(), messageOverrides));

let step = $state<1 | 2 | 3 | 4>(1);
let congratsTimeout: ReturnType<typeof setTimeout> | null = null;
let email = $state('');
let loading = $state(false);
let error = $state('');
let otpInput = $state<{ clear: () => void; focus: () => void }>();

let conditionalAbort: AbortController | null = null;

$effect(() => {
	tryConditionalWebAuthn();
	return () => {
		conditionalAbort?.abort();
		if (congratsTimeout) clearTimeout(congratsTimeout);
	};
});

async function tryConditionalWebAuthn() {
	try {
		const { startAuthentication } = await import('@simplewebauthn/browser');
		const res = await fetch(`${apiBase}/passkey/login-start`);
		if (!res.ok) return;
		const options = await res.json();
		conditionalAbort = new AbortController();
		const authResponse = await startAuthentication({
			optionsJSON: options,
			useBrowserAutofill: true
		});
		// User selected a passkey — show loading while we verify
		loading = true;
		const verifyRes = await fetch(`${apiBase}/passkey/login-finish`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(authResponse)
		});
		if (verifyRes.ok) {
			onSuccess?.();
		}
	} catch {
		// Passkey autofill not available or cancelled
	} finally {
		loading = false;
	}
}

async function handleEmailSubmit() {
	error = '';
	if (!email.includes('@')) {
		error = m.errorInvalidEmail;
		return;
	}
	conditionalAbort?.abort();
	conditionalAbort = null;

	try {
		const { startAuthentication } = await import('@simplewebauthn/browser');
		const checkRes = await fetch(`${apiBase}/passkey/check-email`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email })
		});
		if (checkRes.ok) {
			const options = await checkRes.json();
			if (options.allowCredentials?.length > 0) {
				loading = true;
				try {
					const authResponse = await startAuthentication({ optionsJSON: options });
					const verifyRes = await fetch(`${apiBase}/passkey/login-finish`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(authResponse)
					});
					if (verifyRes.ok) {
						onSuccess?.();
						return;
					}
				} catch {
					// cancelled — fall through to OTP
				} finally {
					loading = false;
				}
			}
		}
	} catch {
		// passkey check failed — proceed with OTP
	}

	loading = true;
	try {
		const res = await fetch(`${apiBase}/start`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email })
		});
		if (!res.ok) {
			const data = await res.json().catch(() => null);
			error = data?.error ?? `Request failed (${res.status})`;
			return;
		}
		step = 2;
	} catch {
		error = m.errorGeneric;
	} finally {
		loading = false;
	}
}

async function handleOtpComplete(code: string) {
	error = '';
	loading = true;
	try {
		const res = await fetch(`${apiBase}/verify`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, code })
		});
		if (!res.ok) {
			const data = await res.json().catch(() => null);
			error = data?.error ?? m.errorInvalidCode;
			otpInput?.clear();
			return;
		}
		const data = await res.json();
		if (data.hasPasskey || data.skipPasskeyPrompt) {
			onSuccess?.();
		} else {
			step = 3;
		}
	} catch {
		error = m.errorGeneric;
	} finally {
		loading = false;
	}
}

async function resendCode() {
	error = '';
	loading = true;
	try {
		const res = await fetch(`${apiBase}/start`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email })
		});
		if (!res.ok) {
			const data = await res.json().catch(() => null);
			error = data?.error ?? m.errorResendFailed;
			return;
		}
		otpInput?.clear();
	} catch {
		error = m.errorGeneric;
	} finally {
		loading = false;
	}
}

async function handlePasskeyRegister() {
	const { startRegistration } = await import('@simplewebauthn/browser');
	const optRes = await fetch(`${apiBase}/passkey/register-start`, { method: 'POST' });
	if (!optRes.ok) throw new Error('Failed to get registration options');
	const options = await optRes.json();

	const regResponse = await startRegistration({ optionsJSON: options });
	const res = await fetch(`${apiBase}/passkey/register-finish`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ ...regResponse, name: guessDeviceName() })
	});
	if (!res.ok) throw new Error('Registration failed');
	step = 4;
	congratsTimeout = setTimeout(() => onSuccess?.(), 3000);
}

function handlePasskeySkip() {
	fetch(`${apiBase}/skip-passkey`, { method: 'POST' });
	onSuccess?.();
}
</script>

<div class="anahtar-auth">
	{#if step === 1}
		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleEmailSubmit();
			}}
			class="anahtar-auth-form"
		>
			<input
				type="email"
				bind:value={email}
				required
				autocomplete="username webauthn"
				placeholder={m.emailPlaceholder}
				class="anahtar-input"
			/>

			{#if error}
				<p class="anahtar-error">{error}</p>
			{/if}

			<button type="submit" disabled={loading} class="anahtar-button">
				{loading ? '...' : m.continue}
			</button>
		</form>
	{:else if step === 2}
		<div class="anahtar-otp-step">
			<p class="anahtar-subtitle">{m.codeSentTo}</p>
			<p class="anahtar-email">{email}</p>

			<OtpInput bind:this={otpInput} onComplete={handleOtpComplete} disabled={loading} />

			{#if error}
				<p class="anahtar-error">{error}</p>
			{/if}

			{#if loading}
				<p class="anahtar-subtitle">{m.verifying}</p>
			{/if}

			<div class="anahtar-links">
				<button onclick={resendCode} disabled={loading} class="anahtar-link">
					{m.resend}
				</button>
				<button
					onclick={() => {
						step = 1;
						error = '';
					}}
					class="anahtar-link"
				>
					{m.differentEmail}
				</button>
			</div>
		</div>
	{:else if step === 3}
		<PasskeyPrompt {m} onRegister={handlePasskeyRegister} onSkip={handlePasskeySkip} />
	{:else if step === 4}
		<div class="anahtar-congrats">
			<div class="anahtar-congrats-icon">
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="7.5" cy="15.5" r="5.5"/>
					<path d="m11.5 12 4-4"/>
					<path d="m15 7 2 2"/>
					<path d="m17.5 4.5 2 2"/>
				</svg>
			</div>
			<p class="anahtar-congrats-title">{m.passkeySuccess}</p>
			<button onclick={() => onSuccess?.()} class="anahtar-button">
				{m.continue}
			</button>
		</div>
	{/if}
</div>

<style>
	.anahtar-auth {
		width: 100%;
		max-width: 24rem;
	}

	.anahtar-auth-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.anahtar-input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		border: 1px solid var(--anahtar-border, #d1d5db);
		border-radius: 0.375rem;
		background: var(--anahtar-bg, transparent);
		color: var(--anahtar-fg, inherit);
	}

	.anahtar-input:focus {
		outline: none;
		box-shadow: 0 0 0 2px var(--anahtar-ring, #3b82f6);
	}

	.anahtar-button {
		width: 100%;
		padding: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 0.375rem;
		background: var(--anahtar-primary, #3b82f6);
		color: var(--anahtar-primary-fg, #fff);
		border: none;
		cursor: pointer;
	}

	.anahtar-button:hover {
		opacity: 0.9;
	}

	.anahtar-button:disabled {
		opacity: 0.5;
	}

	.anahtar-otp-step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.anahtar-subtitle {
		font-size: 0.875rem;
		opacity: 0.6;
	}

	.anahtar-email {
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: 0.5rem;
	}

	.anahtar-error {
		font-size: 0.875rem;
		color: var(--anahtar-error, #ef4444);
	}

	.anahtar-links {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.anahtar-link {
		font-size: 0.875rem;
		opacity: 0.6;
		background: none;
		border: none;
		cursor: pointer;
		color: inherit;
	}

	.anahtar-link:hover {
		opacity: 1;
	}

	.anahtar-link:disabled {
		opacity: 0.3;
	}

	.anahtar-congrats {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.anahtar-congrats-icon {
		width: 4rem;
		height: 4rem;
		border-radius: 50%;
		background: var(--anahtar-primary, #3b82f6);
		color: var(--anahtar-primary-fg, #fff);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.anahtar-congrats-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}
</style>
