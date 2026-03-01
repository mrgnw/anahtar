<script lang="ts">
import { guessDeviceName } from '../device.js';
import { resolveMessages, detectLocaleClient, type AuthMessages } from '../i18n/index.js';
import PasskeyPrompt from './PasskeyPrompt.svelte';
import { onMount } from 'svelte';
import { slide } from 'svelte/transition';

interface PasskeyInfo {
	id: string;
	credentialId?: string;
	name?: string | null;
	createdAt?: number;
}

interface Props {
	apiBase?: string;
	user?: { email: string } | null;
	locale?: string;
	messages?: Partial<AuthMessages>;
	onSuccess?: () => void | Promise<void>;
	onSignOut?: () => void | Promise<void>;
	onPasskeysChange?: () => void | Promise<void>;
	getPasskeys?: () => Promise<PasskeyInfo[]>;
}

let {
	apiBase = '/api/auth',
	user = null,
	locale,
	messages: messageOverrides,
	onSuccess,
	onSignOut,
	onPasskeysChange,
	getPasskeys,
}: Props = $props();

let m = $derived(resolveMessages(locale ?? detectLocaleClient(), messageOverrides));

let email = $state('');
let loading = $state(false);
let error = $state('');
let otpStep = $state(false);
let otpDigits = $state<string[]>(['', '', '', '', '']);
let otpInputs = $state<HTMLInputElement[]>([]);
let showPasskeys = $state(false);
let hoveredKey = $state<string | null>(null);
let passkeyRefresh = $state(0);
let passkeyOnboarding = $state(false);
let conditionalAbort: AbortController | null = null;

const isAuthenticated = $derived(!!user);
const passkeyPromise = $derived(
	isAuthenticated && getPasskeys && passkeyRefresh >= 0 ? getPasskeys() : null
);

onMount(() => {
	if (!isAuthenticated) tryConditionalWebAuthn();
	return () => conditionalAbort?.abort();
});

async function handleSignOut() {
	email = '';
	otpStep = false;
	passkeyOnboarding = false;
	showPasskeys = false;
	error = '';
	await onSignOut?.();
}

async function tryConditionalWebAuthn() {
	try {
		const { startAuthentication } = await import('@simplewebauthn/browser');
		const res = await fetch(`${apiBase}/passkey/login-start`);
		if (!res.ok) return;
		const options = (await res.json()) as any;
		conditionalAbort = new AbortController();
		const authResponse = await startAuthentication({
			optionsJSON: options,
			useBrowserAutofill: true,
		});
		loading = true;
		const verifyRes = await fetch(`${apiBase}/passkey/login-finish`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(authResponse),
		});
		if (verifyRes.ok) await onSuccess?.();
	} catch {
		/* not available or cancelled */
	} finally {
		loading = false;
	}
}

async function handleEmailSubmit(e: SubmitEvent) {
	e.preventDefault();
	if (!email.includes('@')) return;
	conditionalAbort?.abort();
	conditionalAbort = null;
	loading = true;
	error = '';
	try {
		// Passkey-first: check if user has passkeys before falling back to OTP
		try {
			const { startAuthentication } = await import('@simplewebauthn/browser');
			const checkRes = await fetch(`${apiBase}/passkey/check-email`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});
			if (checkRes.ok) {
				const opts = (await checkRes.json()) as any;
				if ((opts?.allowCredentials?.length ?? 0) > 0) {
					try {
						const authResp = await startAuthentication({ optionsJSON: opts });
						const vRes = await fetch(`${apiBase}/passkey/login-finish`, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(authResp),
						});
						if (vRes.ok) {
							await onSuccess?.();
							return;
						}
					} catch {
						/* cancelled */
					}
				}
			}
		} catch {
			/* passkey check failed */
		}

		const res = await fetch(`${apiBase}/start`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email }),
		});
		if (!res.ok) {
			const d = ((await res.json().catch(() => ({}))) as any);
			error = d?.error ?? m.errorGeneric;
			return;
		}
		const data = ((await res.json().catch(() => ({}))) as any);
		otpDigits = ['', '', '', '', ''];
		otpStep = true;
		if (data?.devCode) {
			const code = String(data.devCode);
			for (let i = 0; i < 5; i++) otpDigits[i] = code[i] ?? '';
			setTimeout(() => verifyOtp(code), 50);
		} else {
			setTimeout(() => otpInputs[0]?.focus(), 50);
		}
	} catch {
		error = m.errorGeneric;
	} finally {
		loading = false;
	}
}

function handleOtpInput(i: number, e: Event) {
	const input = e.target as HTMLInputElement;
	const val = input.value.replace(/\D/g, '');
	if (val.length > 1) {
		for (let j = 0; j < 5; j++) otpDigits[j] = val[j] ?? '';
		const next = otpDigits.findIndex((d) => !d);
		otpInputs[next === -1 ? 4 : next]?.focus();
	} else {
		otpDigits[i] = val.slice(0, 1);
		input.value = otpDigits[i];
		if (val && i < 4) otpInputs[i + 1]?.focus();
	}
	if (otpDigits.every((d) => d.length === 1)) verifyOtp(otpDigits.join(''));
}

function handleOtpKeydown(i: number, e: KeyboardEvent) {
	if (e.key === 'Backspace' && !otpDigits[i] && i > 0) otpInputs[i - 1]?.focus();
}

function handleOtpPaste(e: ClipboardEvent) {
	e.preventDefault();
	const pasted = (e.clipboardData?.getData('text') ?? '').replace(/\D/g, '');
	for (let i = 0; i < 5; i++) otpDigits[i] = pasted[i] ?? '';
	const next = otpDigits.findIndex((d) => !d);
	otpInputs[next === -1 ? 4 : next]?.focus();
	if (otpDigits.every((d) => d.length === 1)) verifyOtp(otpDigits.join(''));
}

async function verifyOtp(code: string) {
	loading = true;
	error = '';
	try {
		const res = await fetch(`${apiBase}/verify`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, code }),
		});
		if (!res.ok) {
			const d = ((await res.json().catch(() => ({}))) as any);
			error = d?.error ?? m.errorInvalidCode;
			otpDigits = ['', '', '', '', ''];
			setTimeout(() => otpInputs[0]?.focus(), 50);
			return;
		}
		const data = ((await res.json().catch(() => ({}))) as any);
		await onSuccess?.();
		otpStep = false;
		if (!data.hasPasskey && !data.skipPasskeyPrompt) {
			passkeyOnboarding = true;
		}
	} catch {
		error = m.errorGeneric;
	} finally {
		loading = false;
	}
}

async function resend() {
	loading = true;
	try {
		await fetch(`${apiBase}/start`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email }),
		});
		otpDigits = ['', '', '', '', ''];
		setTimeout(() => otpInputs[0]?.focus(), 50);
	} catch {
		/* ignore */
	} finally {
		loading = false;
	}
}

async function handlePasskeyRegister() {
	const { startRegistration } = await import('@simplewebauthn/browser');
	const optRes = await fetch(`${apiBase}/passkey/register-start`, { method: 'POST' });
	if (!optRes.ok) throw new Error('Failed to get registration options');
	const options = (await optRes.json()) as any;
	const regResponse = await startRegistration({ optionsJSON: options });
	const res = await fetch(`${apiBase}/passkey/register-finish`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ ...regResponse, name: guessDeviceName() }),
	});
	if (!res.ok) throw new Error('Registration failed');
	passkeyOnboarding = false;
	passkeyRefresh++;
	await onPasskeysChange?.();
}

function handlePasskeySkip() {
	fetch(`${apiBase}/skip-passkey`, { method: 'POST' });
	passkeyOnboarding = false;
}

async function addPasskey() {
	loading = true;
	error = '';
	try {
		const { startRegistration } = await import('@simplewebauthn/browser');
		const startRes = await fetch(`${apiBase}/passkey/register-start`, { method: 'POST' });
		if (!startRes.ok) {
			error = 'Failed to start';
			return;
		}
		const opts = (await startRes.json()) as any;
		const regResponse = await startRegistration({ optionsJSON: opts });
		const finishRes = await fetch(`${apiBase}/passkey/register-finish`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ...regResponse, name: guessDeviceName() }),
		});
		if (!finishRes.ok) {
			error = 'Failed to register';
			return;
		}
		passkeyRefresh++;
		await onPasskeysChange?.();
	} catch (e) {
		error = e instanceof Error ? e.message : 'Failed';
	} finally {
		loading = false;
	}
}

async function removePasskey(id: string) {
	loading = true;
	try {
		await fetch(`${apiBase}/passkey/remove`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ passkeyId: id }),
		});
		passkeyRefresh++;
		await onPasskeysChange?.();
	} catch {
		/* ignore */
	} finally {
		loading = false;
	}
}
</script>

<div class="anahtar-pill-island" class:anahtar-pill-loading={loading}>
	<div class="anahtar-pill">
		{#if isAuthenticated}
			<span class="anahtar-pill-email">{user?.email}</span>
			<span class="anahtar-pill-sep">&middot;</span>
			{#if getPasskeys}
				<button
					class="anahtar-pill-icon"
					class:anahtar-pill-icon-active={showPasskeys}
					onclick={() => (showPasskeys = !showPasskeys)}
					title="Passkeys"
					disabled={loading}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="7.5" cy="15.5" r="5.5"/><path d="m11.5 12 4-4"/><path d="m15 7 2 2"/><path d="m17.5 4.5 2 2"/>
					</svg>
				</button>
				<span class="anahtar-pill-sep">&middot;</span>
			{/if}
			<button class="anahtar-pill-icon anahtar-pill-signout" onclick={handleSignOut} title="Sign out" disabled={loading}>
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
				</svg>
			</button>

		{:else if otpStep}
			<span class="anahtar-pill-otp-label">{email}</span>
			<span class="anahtar-pill-sep">&middot;</span>
			<div class="anahtar-pill-otp-boxes">
				{#each otpDigits as _, i}
					<input
						bind:this={otpInputs[i]}
						class="anahtar-pill-otp-box"
						type="text"
						inputmode="numeric"
						autocomplete={i === 0 ? 'one-time-code' : 'off'}
						value={otpDigits[i]}
						disabled={loading}
						oninput={(e) => handleOtpInput(i, e)}
						onkeydown={(e) => handleOtpKeydown(i, e)}
						onpaste={handleOtpPaste}
					/>
				{/each}
			</div>

		{:else}
			<form onsubmit={handleEmailSubmit} class="anahtar-pill-form">
				<input
					type="email"
					bind:value={email}
					placeholder={m.emailPlaceholder}
					class="anahtar-pill-email-input"
					autocomplete="username webauthn"
					disabled={loading}
				/>
				<button type="submit" class="anahtar-pill-go" disabled={loading || !email.includes('@')}>
					{loading ? '...' : m.continue}
				</button>
			</form>
		{/if}
	</div>

	{#if otpStep}
		<div class="anahtar-pill-otp-help" transition:slide={{ duration: 150 }}>
			<span class="anahtar-pill-otp-help-text">{m.codeSentTo}</span>
			<span class="anahtar-pill-otp-help-sep">&middot;</span>
			<button class="anahtar-pill-otp-help-link" onclick={() => { otpStep = false; error = ''; }}>{m.differentEmail}</button>
			<span class="anahtar-pill-otp-help-sep">&middot;</span>
			<button class="anahtar-pill-otp-help-link" onclick={resend} disabled={loading}>{m.resend}</button>
		</div>
	{/if}

	{#if error}
		<p class="anahtar-pill-error" transition:slide={{ duration: 150 }}>{error}</p>
	{/if}

	{#if passkeyOnboarding && isAuthenticated}
		<div class="anahtar-pill-onboarding" transition:slide={{ duration: 200 }}>
			<PasskeyPrompt {m} onRegister={handlePasskeyRegister} onSkip={handlePasskeySkip} />
		</div>
	{/if}

	{#if showPasskeys && isAuthenticated && !passkeyOnboarding}
		<div class="anahtar-pill-passkeys" transition:slide={{ duration: 180 }}>
			{#if passkeyPromise}
				{#await passkeyPromise then keys}
					{#each keys as key}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
							class="anahtar-pill-key-row"
							onmouseenter={() => (hoveredKey = key.id)}
							onmouseleave={() => (hoveredKey = null)}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<circle cx="7.5" cy="15.5" r="5.5"/><path d="m11.5 12 4-4"/><path d="m15 7 2 2"/><path d="m17.5 4.5 2 2"/>
							</svg>
							<span class="anahtar-pill-key-name">{key.name ?? 'Passkey'}</span>
							{#if hoveredKey === key.id}
								<button
									class="anahtar-pill-key-remove"
									onclick={() => removePasskey(key.id)}
									disabled={loading}
								>&times;</button>
							{/if}
						</div>
					{/each}
				{/await}
			{/if}
			<button class="anahtar-pill-key-add" onclick={addPasskey} disabled={loading}>
				<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>
				</svg>
				Add passkey
			</button>
		</div>
	{/if}
</div>

<style>
	.anahtar-pill-island {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.25rem;
	}

	.anahtar-pill-loading { opacity: 0.7; }

	.anahtar-pill {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		background: var(--anahtar-pill-bg, rgba(255, 255, 255, 0.9));
		backdrop-filter: blur(8px);
		border: 1px solid var(--anahtar-pill-border, rgba(0, 0, 0, 0.06));
		border-radius: 9999px;
		padding: 0.25rem 0.75rem;
		box-shadow: var(--anahtar-pill-shadow, 0 2px 12px rgba(0, 0, 0, 0.08));
		font-size: 0.875rem;
		white-space: nowrap;
		height: 2.25rem;
		box-sizing: border-box;
	}

	.anahtar-pill-sep {
		color: var(--anahtar-pill-sep, rgba(0, 0, 0, 0.2));
		font-size: 0.75rem;
		user-select: none;
	}

	.anahtar-pill-email {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--anahtar-pill-fg, #374151);
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.anahtar-pill-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.2rem;
		border-radius: 9999px;
		color: var(--anahtar-pill-icon, #6b7280);
		transition: color 0.15s, background 0.15s;
		line-height: 1;
	}
	.anahtar-pill-icon:hover:not(:disabled) { color: var(--anahtar-pill-fg, #111827); background: rgba(0,0,0,0.06); }
	.anahtar-pill-icon:disabled { opacity: 0.4; cursor: not-allowed; }
	.anahtar-pill-icon-active { color: var(--anahtar-primary, #3730a3); }
	.anahtar-pill-signout:hover:not(:disabled) { color: var(--anahtar-error, #ef4444); }

	/* Sign-in form */
	.anahtar-pill-form {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.anahtar-pill-email-input {
		border: none;
		background: transparent;
		outline: none;
		font-size: 0.875rem;
		color: var(--anahtar-pill-fg, #111827);
		width: 190px;
		padding: 0.125rem 0;
	}
	.anahtar-pill-email-input::placeholder { color: var(--anahtar-pill-placeholder, #9ca3af); }

	.anahtar-pill-go {
		background: var(--anahtar-primary, #3730a3);
		color: var(--anahtar-primary-fg, #fff);
		border: none;
		border-radius: 9999px;
		padding: 0.25rem 0.75rem;
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 0.15s;
		white-space: nowrap;
	}
	.anahtar-pill-go:disabled { opacity: 0.4; cursor: not-allowed; }
	.anahtar-pill-go:hover:not(:disabled) { opacity: 0.85; }

	/* OTP */
	.anahtar-pill-otp-label {
		font-size: 0.8125rem;
		color: var(--anahtar-pill-fg, #374151);
		font-weight: 500;
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.anahtar-pill-otp-boxes { display: flex; gap: 0.2rem; }

	.anahtar-pill-otp-box {
		width: 1.75rem;
		height: 1.75rem;
		text-align: center;
		font-size: 0.9375rem;
		border: 1px solid var(--anahtar-pill-border, rgba(0,0,0,0.15));
		border-radius: 0.3rem;
		background: var(--anahtar-pill-bg, rgba(255,255,255,0.8));
		outline: none;
		color: var(--anahtar-pill-fg, #111827);
	}
	.anahtar-pill-otp-box:focus {
		border-color: var(--anahtar-primary, #3730a3);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--anahtar-primary, #3730a3) 20%, transparent);
	}

	/* OTP helper row */
	.anahtar-pill-otp-help {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0 0.5rem;
	}

	.anahtar-pill-otp-help-text {
		font-size: 0.75rem;
		color: var(--anahtar-pill-icon, #6b7280);
	}

	.anahtar-pill-otp-help-sep {
		color: var(--anahtar-pill-sep, rgba(0, 0, 0, 0.15));
		font-size: 0.625rem;
		user-select: none;
	}

	.anahtar-pill-otp-help-link {
		font-size: 0.75rem;
		color: var(--anahtar-primary, #3730a3);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		transition: opacity 0.15s;
	}
	.anahtar-pill-otp-help-link:hover:not(:disabled) { opacity: 0.7; }
	.anahtar-pill-otp-help-link:disabled { opacity: 0.4; cursor: not-allowed; }

	/* Passkey onboarding card */
	.anahtar-pill-onboarding {
		background: var(--anahtar-pill-bg, rgba(255,255,255,0.97));
		backdrop-filter: blur(12px);
		border: 1px solid var(--anahtar-pill-border, rgba(0,0,0,0.06));
		border-radius: 1rem;
		padding: 1.25rem 1.5rem;
		box-shadow: var(--anahtar-pill-shadow, 0 4px 24px rgba(0,0,0,0.1));
		min-width: 220px;
	}

	/* Passkey panel */
	.anahtar-pill-passkeys {
		background: var(--anahtar-pill-bg, rgba(255,255,255,0.95));
		backdrop-filter: blur(8px);
		border: 1px solid var(--anahtar-pill-border, rgba(0,0,0,0.06));
		border-radius: 0.75rem;
		padding: 0.5rem 0.75rem;
		box-shadow: var(--anahtar-pill-shadow, 0 2px 12px rgba(0,0,0,0.08));
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 180px;
	}

	.anahtar-pill-key-row {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
		color: var(--anahtar-pill-fg, #374151);
		padding: 0.2rem 0;
	}

	.anahtar-pill-key-name {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.anahtar-pill-key-remove {
		background: none;
		border: none;
		color: var(--anahtar-pill-icon, #9ca3af);
		cursor: pointer;
		font-size: 1rem;
		line-height: 1;
		padding: 0 0.125rem;
		transition: color 0.15s;
	}
	.anahtar-pill-key-remove:hover { color: var(--anahtar-error, #ef4444); }
	.anahtar-pill-key-remove:disabled { opacity: 0.4; }

	.anahtar-pill-key-add {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.75rem;
		color: var(--anahtar-pill-icon, #6b7280);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.2rem 0;
		transition: color 0.15s;
		margin-top: 0.125rem;
	}
	.anahtar-pill-key-add:hover:not(:disabled) { color: var(--anahtar-primary, #3730a3); }
	.anahtar-pill-key-add:disabled { opacity: 0.4; cursor: not-allowed; }

	.anahtar-pill-error {
		font-size: 0.75rem;
		color: var(--anahtar-error, #ef4444);
		text-align: right;
		padding: 0 0.5rem;
	}
</style>
