<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import OtpInput from './OtpInput.svelte';
	import PasskeyPrompt from './PasskeyPrompt.svelte';

	interface Props {
		apiBase?: string;
		onSuccess?: () => void;
	}

	let { apiBase = '/api/auth', onSuccess }: Props = $props();

	let step = $state<1 | 2 | 3>(1);
	let email = $state('');
	let loading = $state(false);
	let error = $state('');
	let otpInput = $state<OtpInput>();

	let conditionalAbort: AbortController | null = null;

	onMount(() => {
		tryConditionalWebAuthn();
	});

	onDestroy(() => {
		conditionalAbort?.abort();
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
				useBrowserAutofill: true,
			});
			const verifyRes = await fetch(`${apiBase}/passkey/login-finish`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(authResponse),
			});
			if (verifyRes.ok) {
				onSuccess?.();
			}
		} catch {
			// Passkey autofill not available or cancelled
		}
	}

	async function handleEmailSubmit() {
		error = '';
		if (!email.includes('@')) {
			error = 'Please enter a valid email address.';
			return;
		}
		loading = true;
		conditionalAbort?.abort();
		conditionalAbort = null;
		try {
			const res = await fetch(`${apiBase}/start`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => null);
				error = data?.error ?? `Request failed (${res.status})`;
				return;
			}
			step = 2;
		} catch {
			error = 'Something went wrong. Please try again.';
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
				body: JSON.stringify({ email, code }),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => null);
				error = data?.error ?? 'Invalid code. Please try again.';
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
			error = 'Something went wrong. Please try again.';
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
				body: JSON.stringify({ email }),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => null);
				error = data?.error ?? 'Failed to resend code.';
				return;
			}
			otpInput?.clear();
		} catch {
			error = 'Something went wrong. Please try again.';
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
			body: JSON.stringify(regResponse),
		});
		if (!res.ok) throw new Error('Registration failed');
		onSuccess?.();
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
				placeholder="you@example.com"
				class="anahtar-input"
			/>

			{#if error}
				<p class="anahtar-error">{error}</p>
			{/if}

			<button type="submit" disabled={loading} class="anahtar-button">
				{loading ? '...' : 'Continue'}
			</button>
		</form>
	{:else if step === 2}
		<div class="anahtar-otp-step">
			<p class="anahtar-subtitle">We sent a code to</p>
			<p class="anahtar-email">{email}</p>

			<OtpInput bind:this={otpInput} onComplete={handleOtpComplete} disabled={loading} />

			{#if error}
				<p class="anahtar-error">{error}</p>
			{/if}

			{#if loading}
				<p class="anahtar-subtitle">Verifying...</p>
			{/if}

			<div class="anahtar-links">
				<button onclick={resendCode} disabled={loading} class="anahtar-link">
					Didn't get it? Resend
				</button>
				<button
					onclick={() => {
						step = 1;
						error = '';
					}}
					class="anahtar-link"
				>
					Use a different email
				</button>
			</div>
		</div>
	{:else if step === 3}
		<PasskeyPrompt onRegister={handlePasskeyRegister} onSkip={handlePasskeySkip} />
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
</style>
