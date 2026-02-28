<script lang="ts">
import type { AuthMessages } from '../i18n/types.js';

interface Props {
	m: AuthMessages;
	countdownSeconds?: number;
	onRegister: () => Promise<void>;
	onSkip: () => void;
}

let { m, countdownSeconds = 3, onRegister, onSkip }: Props = $props();

let countdown = $state(countdownSeconds);
let failed = $state(false);
let registering = $state(false);

let interval: ReturnType<typeof setInterval> | null = null;

$effect(() => {
	interval = setInterval(() => {
		countdown -= 1;
		if (countdown <= 0) {
			clearInterval(interval!);
			interval = null;
			triggerRegistration();
		}
	}, 1000);

	return () => {
		if (interval) clearInterval(interval);
	};
});

async function triggerRegistration() {
	if (registering) return;
	registering = true;
	try {
		await onRegister();
	} catch {
		failed = true;
	} finally {
		registering = false;
	}
}

let circumference = 2 * Math.PI * 40;
let dashOffset = $derived(circumference * (1 - countdown / countdownSeconds));
</script>

<div class="anahtar-passkey-prompt">
	<div class="anahtar-passkey-ring">
		<svg viewBox="0 0 100 100" class="anahtar-passkey-ring-svg">
			<circle cx="50" cy="50" r="40" fill="none" stroke="var(--anahtar-border, #d1d5db)" stroke-width="4" />
			<circle
				cx="50" cy="50" r="40"
				fill="none"
				stroke="var(--anahtar-primary, #3b82f6)"
				stroke-width="4"
				stroke-linecap="round"
				stroke-dasharray={circumference}
				stroke-dashoffset={dashOffset}
				class="anahtar-passkey-progress"
			/>
		</svg>
		<div class="anahtar-passkey-icon">
			<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="anahtar-key-pulse">
				<circle cx="7.5" cy="15.5" r="5.5"/>
				<path d="m11.5 12 4-4"/>
				<path d="m15 7 2 2"/>
				<path d="m17.5 4.5 2 2"/>
			</svg>
		</div>
	</div>

	{#if !failed}
		<p class="anahtar-passkey-title">{m.passkeyCreating}</p>
		<p class="anahtar-passkey-subtitle">{m.passkeySubtitle}</p>
		<button onclick={onSkip} class="anahtar-passkey-skip">{m.passkeySkip}</button>
	{:else}
		<p class="anahtar-passkey-title">{m.passkeySetup}</p>
		<button onclick={triggerRegistration} class="anahtar-passkey-add" disabled={registering}>
			{m.passkeyAdd}
		</button>
		<button onclick={onSkip} class="anahtar-passkey-skip">{m.passkeyMaybeLater}</button>
	{/if}
</div>

<style>
	.anahtar-passkey-prompt {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.anahtar-passkey-ring {
		position: relative;
		width: 7rem;
		height: 7rem;
		margin-bottom: 1.5rem;
	}

	.anahtar-passkey-ring-svg {
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}

	.anahtar-passkey-progress {
		transition: stroke-dashoffset 1s linear;
	}

	.anahtar-passkey-icon {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@keyframes key-pulse {
		0%, 100% { filter: drop-shadow(0 0 0 transparent); opacity: 0.8; }
		50% { filter: drop-shadow(0 0 8px var(--anahtar-primary, #3b82f6)); opacity: 1; }
	}

	.anahtar-key-pulse {
		animation: key-pulse 2s ease-in-out infinite;
	}

	.anahtar-passkey-title {
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: 0.25rem;
	}

	.anahtar-passkey-subtitle {
		font-size: 0.875rem;
		opacity: 0.6;
		margin-bottom: 1.5rem;
	}

	.anahtar-passkey-add {
		width: 100%;
		padding: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 0.375rem;
		background: var(--anahtar-primary, #3b82f6);
		color: var(--anahtar-primary-fg, #fff);
		border: none;
		cursor: pointer;
		margin-bottom: 0.75rem;
	}

	.anahtar-passkey-add:hover {
		opacity: 0.9;
	}

	.anahtar-passkey-add:disabled {
		opacity: 0.5;
	}

	.anahtar-passkey-skip {
		font-size: 0.75rem;
		opacity: 0.6;
		background: none;
		border: none;
		cursor: pointer;
		color: inherit;
	}

	.anahtar-passkey-skip:hover {
		opacity: 1;
	}
</style>
