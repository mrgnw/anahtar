<script lang="ts">
import { AuthError, createAuthClient } from '../client.js';
import {
	resolveMessages,
	loadMessages,
	detectLocaleClient,
	type AuthMessages,
} from '../i18n/index.js';
import OtpInput from './OtpInput.svelte';
import PasskeyPrompt from './PasskeyPrompt.svelte';
import SessionRenew from './SessionRenew.svelte';
import { onMount, type Snippet } from 'svelte';
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
	session?: { expiresAt: number } | null;
	renewBefore?: number;
	compact?: boolean;
	locale?: string;
	messages?: Partial<AuthMessages>;
	onSuccess?: () => void | Promise<void>;
	onSignOut?: () => void | Promise<void>;
	onPasskeysChange?: () => void | Promise<void>;
	getPasskeys?: () => Promise<PasskeyInfo[]>;
	onStepChange?: (step: 'email' | 'otp' | 'authenticated') => void;
	/** Extra inline icons rendered before the sign-out button when authenticated. */
	actions?: Snippet;
	/** Show `·` dot separators between pill segments. Defaults to false (flex gap only). */
	separators?: boolean;
}

let {
	apiBase = '/api/auth',
	user = null,
	session = null,
	renewBefore = 10 * 24 * 60 * 60 * 1000,
	compact = false,
	locale,
	messages: messageOverrides,
	onSuccess,
	onSignOut,
	onPasskeysChange,
	getPasskeys,
	onStepChange,
	actions,
	separators = false,
}: Props = $props();

let expanded = $state(false);

let lang = $derived(locale ?? detectLocaleClient());
let localeMessages = $state<AuthMessages | null>(null);
let m = $derived({ ...(localeMessages ?? resolveMessages(lang)), ...messageOverrides });
const api = $derived(createAuthClient(apiBase));

let email = $state('');
let loading = $state(false);
let error = $state('');
let otpStep = $state(false);
let otpLength = $state(5);
let otpInput = $state<{ clear: () => void; focus: () => void }>();
let showPasskeys = $state(false);
let pendingSuccess = $state(false);
let isTouch = $state(false);
let hoveredKey = $state<string | null>(null);
let passkeyRefresh = $state(0);
let passkeyOnboarding = $state(false);

const isAuthenticated = $derived(!!user);

function shortDate(ts?: number): string {
	if (!ts) return '';
	const d = new Date(ts);
	const mon = d.toLocaleDateString(undefined, { month: 'short' });
	return `${mon} ${d.getFullYear()}`;
}

const passkeyPromise = $derived(
	isAuthenticated && passkeyRefresh >= 0 ? (getPasskeys ?? api.passkeyList)() : null
);

onMount(() => {
	loadMessages(lang).then((messages) => (localeMessages = messages));
	isTouch = matchMedia('(pointer: coarse)').matches;
	if (!isAuthenticated) tryConditionalWebAuthn();
	return () => api.passkeyCancel();
});

async function handleSignOut() {
	await api.logout().catch(() => {});
	email = '';
	otpStep = false;
	passkeyOnboarding = false;
	pendingSuccess = false;
	showPasskeys = false;
	expanded = false;
	error = '';
	onStepChange?.('email');
	await onSignOut?.();
}

async function tryConditionalWebAuthn() {
	if (await api.passkeyLogin({ conditional: true })) await onSuccess?.();
}

async function handleEmailSubmit(e: SubmitEvent) {
	e.preventDefault();
	if (!email.includes('@')) return;
	loading = true;
	error = '';
	try {
		if (await api.passkeyLogin({ email })) {
			await onSuccess?.();
			return;
		}
		const data: { otpLength?: number; devCode?: unknown } = await api.sendCode(email);
		otpLength = data.otpLength || otpLength;
		otpStep = true;
		onStepChange?.('otp');
		if (data.devCode) {
			setTimeout(() => verifyOtp(String(data.devCode)), 50);
		} else {
			setTimeout(() => otpInput?.focus(), 50);
		}
	} catch (e) {
		error = e instanceof AuthError ? e.message : m.errorGeneric;
	} finally {
		loading = false;
	}
}

async function verifyOtp(code: string) {
	loading = true;
	error = '';
	try {
		const data = await api.verifyCode(email, code);
		otpStep = false;
		if (!data.hasPasskey && !data.skipPasskeyPrompt) {
			pendingSuccess = true;
			passkeyOnboarding = true;
		} else {
			await onSuccess?.();
			onStepChange?.('authenticated');
		}
	} catch (e) {
		error = e instanceof AuthError ? e.message : m.errorGeneric;
		otpInput?.clear();
	} finally {
		loading = false;
	}
}

async function resend() {
	loading = true;
	try {
		await api.sendCode(email);
		otpInput?.clear();
	} catch {
		/* ignore */
	} finally {
		loading = false;
	}
}

async function handlePasskeyRegister() {
	if (!(await api.passkeyRegister())) throw new Error('cancelled');
	passkeyOnboarding = false;
	passkeyRefresh++;
	await onPasskeysChange?.();
	if (pendingSuccess) {
		pendingSuccess = false;
		await onSuccess?.();
		onStepChange?.('authenticated');
	}
}

async function handlePasskeySkip() {
	api.skipPasskeyPrompt().catch(() => {});
	passkeyOnboarding = false;
	if (pendingSuccess) {
		pendingSuccess = false;
		await onSuccess?.();
		onStepChange?.('authenticated');
	}
}

async function addPasskey() {
	loading = true;
	error = '';
	try {
		if (await api.passkeyRegister()) {
			passkeyRefresh++;
			await onPasskeysChange?.();
		}
	} catch (e) {
		error = e instanceof Error ? e.message : 'Failed';
	} finally {
		loading = false;
	}
}

async function removePasskey(id: string) {
	loading = true;
	try {
		await api.passkeyRemove(id);
		passkeyRefresh++;
		await onPasskeysChange?.();
	} catch {
		/* ignore */
	} finally {
		loading = false;
	}
}
</script>

{#snippet renewChip()}
	<SessionRenew {apiBase} {user} {session} {renewBefore} {getPasskeys} {onSuccess} {locale} messages={messageOverrides} />
{/snippet}

<div class="anahtar-pill-island" class:anahtar-pill-loading={loading}>
	<div class="anahtar-pill">
		{#if isAuthenticated && compact && !expanded}
			<button class="anahtar-pill-icon" onclick={() => (expanded = true)} title={user?.email}>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>
				</svg>
			</button>
			{@render renewChip()}
		{:else if isAuthenticated}
			<span class="anahtar-pill-email">{user?.email}</span>
			{@render renewChip()}
			{#if separators}<span class="anahtar-pill-sep">&middot;</span>{/if}
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
			{#if separators}<span class="anahtar-pill-sep">&middot;</span>{/if}
			{#if actions}
				{@render actions()}
				{#if separators}<span class="anahtar-pill-sep">&middot;</span>{/if}
			{/if}
			<button class="anahtar-pill-icon anahtar-pill-signout" onclick={handleSignOut} title="Sign out" disabled={loading}>
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
				</svg>
			</button>
			{#if compact}
				{#if separators}<span class="anahtar-pill-sep">&middot;</span>{/if}
				<button class="anahtar-pill-icon" onclick={() => { expanded = false; showPasskeys = false; }} title="Collapse">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>
					</svg>
				</button>
			{/if}

		{:else if otpStep}
			<span class="anahtar-pill-otp-label">{email}</span>
			{#if separators}<span class="anahtar-pill-sep">&middot;</span>{/if}
			<div class="anahtar-pill-otp-boxes">
				<OtpInput bind:this={otpInput} length={otpLength} onComplete={verifyOtp} disabled={loading} />
			</div>

		{:else}
			<form onsubmit={handleEmailSubmit} class="anahtar-pill-form">
				<input
					type="email"
					bind:value={email}
					placeholder={m.emailPlaceholder}
					class="anahtar-pill-email-input"
					autocomplete="username webauthn"
					autocapitalize="none"
					autocorrect="off"
					spellcheck="false"
					disabled={loading}
				/>
			<button type="submit" class="anahtar-pill-go" disabled={loading || !email.includes('@')} aria-label={m.continue}>
				{#if loading}
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="anahtar-spinner" aria-hidden="true">
						<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
					</svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
					</svg>
				{/if}
			</button>
			</form>
		{/if}
	</div>

	{#if otpStep}
		<div class="anahtar-pill-otp-help" transition:slide={{ duration: 150 }}>
			<span class="anahtar-pill-otp-help-text">{m.codeSentTo}</span>
			<span class="anahtar-pill-otp-help-sep">&middot;</span>
			<button class="anahtar-pill-otp-help-link" onclick={() => { otpStep = false; error = ''; onStepChange?.('email'); }}>{m.differentEmail}</button>
			<span class="anahtar-pill-otp-help-sep">&middot;</span>
			<button class="anahtar-pill-otp-help-link" onclick={resend} disabled={loading}>{m.resend}</button>
		</div>
	{/if}

	{#if error}
		<p class="anahtar-pill-error" transition:slide={{ duration: 150 }}>{error}</p>
	{/if}

	{#if passkeyOnboarding}
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
							{#if key.createdAt}
								<span class="anahtar-pill-key-date">{shortDate(key.createdAt)}</span>
							{/if}
							{#if isTouch || hoveredKey === key.id}
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
				Add
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
		overflow: hidden;
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
		flex: 1;
		min-width: 0;
		overflow: hidden;
	}

	.anahtar-pill-email-input {
		border: none;
		background: transparent;
		outline: none;
		font-size: 0.875rem;
		color: var(--anahtar-pill-fg, #111827);
		flex: 1;
		min-width: 0;
		padding: 0.125rem 0;
	}
	.anahtar-pill-email-input::placeholder { color: var(--anahtar-pill-placeholder, #9ca3af); }

	.anahtar-pill-go {
		background: var(--anahtar-primary, #3730a3);
		color: var(--anahtar-primary-fg, #fff);
		border: none;
		border-radius: 9999px;
		padding: 0.3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		cursor: pointer;
		transition: opacity 0.15s;
		line-height: 1;
	}
	.anahtar-pill-go:disabled { opacity: 0.4; cursor: not-allowed; }
	.anahtar-pill-go:hover:not(:disabled) { opacity: 0.85; }

	@keyframes anahtar-spin {
		to { transform: rotate(360deg); }
	}
	.anahtar-spinner { animation: anahtar-spin 0.8s linear infinite; }

	/* OTP */
	.anahtar-pill-otp-label {
		font-size: 0.8125rem;
		color: var(--anahtar-pill-fg, #374151);
		font-weight: 500;
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.anahtar-pill-otp-boxes {
		display: flex;
		--anahtar-otp-size: 1.75rem;
		--anahtar-otp-height: 1.75rem;
		--anahtar-otp-gap: 0.2rem;
		--anahtar-otp-font-size: 0.9375rem;
		--anahtar-otp-radius: 0.3rem;
		--anahtar-border: var(--anahtar-pill-border, rgba(0, 0, 0, 0.15));
		--anahtar-bg: var(--anahtar-pill-bg, rgba(255, 255, 255, 0.8));
		--anahtar-fg: var(--anahtar-pill-fg, #111827);
		--anahtar-ring: color-mix(in srgb, var(--anahtar-primary, #3730a3) 20%, transparent);
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
		padding: 0.375rem 0.625rem;
		box-shadow: var(--anahtar-pill-shadow, 0 2px 12px rgba(0,0,0,0.08));
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 160px;
	}

	.anahtar-pill-key-row {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.75rem;
		color: var(--anahtar-pill-fg, #374151);
		padding: 0.15rem 0;
	}

	.anahtar-pill-key-name {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.anahtar-pill-key-date {
		font-size: 0.6875rem;
		color: var(--anahtar-pill-icon, #9ca3af);
		white-space: nowrap;
	}

	.anahtar-pill-key-remove {
		background: none;
		border: none;
		color: var(--anahtar-pill-icon, #9ca3af);
		cursor: pointer;
		font-size: 0.875rem;
		line-height: 1;
		padding: 0 0.125rem;
		transition: color 0.15s;
	}
	.anahtar-pill-key-remove:hover { color: var(--anahtar-error, #ef4444); }
	.anahtar-pill-key-remove:disabled { opacity: 0.4; }

	.anahtar-pill-key-add {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.6875rem;
		color: var(--anahtar-pill-icon, #6b7280);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.15rem 0;
		transition: color 0.15s;
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
