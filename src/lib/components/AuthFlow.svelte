<script lang="ts">
import { onMount } from 'svelte';
import { AuthError, createAuthClient } from '../client.js';
import {
	resolveMessages,
	loadMessages,
	detectLocaleClient,
	type AuthMessages,
} from '../i18n/index.js';
import OtpInput from './OtpInput.svelte';
import PasskeyPrompt from './PasskeyPrompt.svelte';

interface Props {
	apiBase?: string;
	locale?: string;
	messages?: Partial<AuthMessages>;
	onSuccess?: () => void;
}

let { apiBase = '/api/auth', locale, messages: messageOverrides, onSuccess }: Props = $props();

let lang = $derived(locale ?? detectLocaleClient());
let localeMessages = $state<AuthMessages | null>(null);
let m = $derived({ ...(localeMessages ?? resolveMessages(lang)), ...messageOverrides });
const api = $derived(createAuthClient(apiBase));

let step = $state<1 | 2 | 3 | 4>(1);
let congratsTimeout: ReturnType<typeof setTimeout> | null = null;
let email = $state('');
let loading = $state(false);
let error = $state('');
let otpInput = $state<{ clear: () => void; focus: () => void }>();
let otpLength = $state(5);

onMount(() => {
	loadMessages(lang).then((messages) => (localeMessages = messages));
	tryConditionalWebAuthn();
	return () => {
		api.passkeyCancel();
		if (congratsTimeout) clearTimeout(congratsTimeout);
	};
});

async function tryConditionalWebAuthn() {
	if (await api.passkeyLogin({ conditional: true })) onSuccess?.();
}

async function handleEmailSubmit() {
	error = '';
	if (!email.includes('@')) {
		error = m.errorInvalidEmail;
		return;
	}
	loading = true;
	try {
		if (await api.passkeyLogin({ email })) {
			onSuccess?.();
			return;
		}
		otpLength = (await api.sendCode(email)).otpLength || otpLength;
		step = 2;
	} catch (e) {
		error = e instanceof AuthError ? e.message : m.errorGeneric;
	} finally {
		loading = false;
	}
}

async function handleOtpComplete(code: string) {
	error = '';
	loading = true;
	try {
		const result = await api.verifyCode(email, code);
		if (result.hasPasskey || result.skipPasskeyPrompt) {
			onSuccess?.();
		} else {
			step = 3;
		}
	} catch (e) {
		error = e instanceof AuthError ? e.message : m.errorGeneric;
		otpInput?.clear();
	} finally {
		loading = false;
	}
}

async function resendCode() {
	error = '';
	loading = true;
	try {
		await api.sendCode(email);
		otpInput?.clear();
	} catch (e) {
		error = e instanceof AuthError ? e.message : m.errorResendFailed;
	} finally {
		loading = false;
	}
}

async function handlePasskeyRegister() {
	if (!(await api.passkeyRegister())) throw new Error('cancelled');
	step = 4;
	congratsTimeout = setTimeout(() => onSuccess?.(), 3000);
}

function handlePasskeySkip() {
	api.skipPasskeyPrompt().catch(() => {});
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
			<div class="anahtar-input-row">
				<input
					type="email"
					bind:value={email}
					required
					autocomplete="username webauthn"
					autocapitalize="none"
					autocorrect="off"
					spellcheck="false"
					placeholder={m.emailPlaceholder}
					class="anahtar-input"
				/>
				<button type="submit" disabled={loading} class="anahtar-submit-icon" aria-label={m.continue}>
					{#if loading}
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="anahtar-spinner"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
					{/if}
				</button>
			</div>

			{#if error}
				<p class="anahtar-error">{error}</p>
			{/if}
		</form>
	{:else if step === 2}
		<div class="anahtar-otp-step">
			<p class="anahtar-subtitle">{m.codeSentTo}</p>
			<p class="anahtar-email">{email}</p>

			<OtpInput bind:this={otpInput} length={otpLength} onComplete={handleOtpComplete} disabled={loading} />

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
		gap: 0.75rem;
	}

	.anahtar-input-row {
		display: flex;
		align-items: center;
		border: 1px solid var(--anahtar-border, #d1d5db);
		border-radius: 0.5rem;
		overflow: hidden;
		transition: box-shadow 0.15s;
	}

	.anahtar-input-row:focus-within {
		box-shadow: 0 0 0 2px var(--anahtar-ring, #3b82f6);
	}

	.anahtar-input {
		flex: 1;
		min-width: 0;
		padding: 0.625rem 0.75rem;
		font-size: 0.875rem;
		border: none;
		background: var(--anahtar-bg, transparent);
		color: var(--anahtar-fg, inherit);
	}

	.anahtar-input:focus {
		outline: none;
	}

	.anahtar-submit-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		flex-shrink: 0;
		background: var(--anahtar-primary, #3b82f6);
		color: var(--anahtar-primary-fg, #fff);
		border: none;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.anahtar-submit-icon:hover {
		opacity: 0.85;
	}

	.anahtar-submit-icon:disabled {
		opacity: 0.5;
	}

	@keyframes anahtar-spin {
		to { transform: rotate(360deg); }
	}

	.anahtar-spinner {
		animation: anahtar-spin 0.8s linear infinite;
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
