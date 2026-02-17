<script lang="ts">
	import { onDestroy } from 'svelte';

	interface Props {
		countdownSeconds?: number;
		onRegister: () => Promise<void>;
		onSkip: () => void;
	}

	let { countdownSeconds = 3, onRegister, onSkip }: Props = $props();

	let countdown = $state(countdownSeconds);
	let failed = $state(false);
	let registering = $state(false);

	let interval = setInterval(() => {
		countdown -= 1;
		if (countdown <= 0) {
			clearInterval(interval);
			triggerRegistration();
		}
	}, 1000);

	onDestroy(() => {
		if (interval) clearInterval(interval);
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
		<svg viewBox="0 0 100 100">
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
			<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z"/>
				<path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8"/>
				<path d="M15 2v5h5"/>
			</svg>
		</div>
	</div>

	{#if !failed}
		<p class="anahtar-passkey-title">Making you a passkey</p>
		<p class="anahtar-passkey-subtitle">for easier login</p>
		<button onclick={onSkip} class="anahtar-passkey-skip">Skip</button>
	{:else}
		<p class="anahtar-passkey-title">Set up a passkey?</p>
		<button onclick={triggerRegistration} class="anahtar-passkey-add" disabled={registering}>
			Add passkey
		</button>
		<button onclick={onSkip} class="anahtar-passkey-skip">Maybe later</button>
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

	.anahtar-passkey-ring svg {
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
