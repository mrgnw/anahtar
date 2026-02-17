<script lang="ts">
	interface Props {
		length?: number;
		onComplete?: (code: string) => void;
		disabled?: boolean;
	}

	let { length = 5, onComplete, disabled = false }: Props = $props();

	let digits = $state<string[]>(Array(length).fill(''));
	let inputs = $state<HTMLInputElement[]>([]);

	export function clear() {
		digits = Array(length).fill('');
		inputs[0]?.focus();
	}

	export function focus() {
		inputs[0]?.focus();
	}

	function handleInput(index: number, e: Event) {
		const input = e.target as HTMLInputElement;
		const val = input.value.replace(/\D/g, '');
		digits[index] = val.slice(0, 1);
		input.value = digits[index];

		if (val && index < length - 1) {
			inputs[index + 1]?.focus();
		}

		if (digits.every((d) => d.length === 1)) {
			onComplete?.(digits.join(''));
		}
	}

	function handleKeydown(index: number, e: KeyboardEvent) {
		if (e.key === 'Backspace' && !digits[index] && index > 0) {
			inputs[index - 1]?.focus();
		}
	}

	function handlePaste(e: ClipboardEvent) {
		e.preventDefault();
		const pasted = (e.clipboardData?.getData('text') ?? '').replace(/\D/g, '');
		for (let i = 0; i < length; i++) {
			digits[i] = pasted[i] ?? '';
		}
		const nextEmpty = digits.findIndex((d) => !d);
		const focusIdx = nextEmpty === -1 ? length - 1 : nextEmpty;
		inputs[focusIdx]?.focus();

		if (digits.every((d) => d.length === 1)) {
			onComplete?.(digits.join(''));
		}
	}
</script>

<div class="anahtar-otp">
	{#each digits as _, i}
		<input
			bind:this={inputs[i]}
			type="text"
			maxlength="1"
			inputmode="numeric"
			value={digits[i]}
			{disabled}
			oninput={(e) => handleInput(i, e)}
			onkeydown={(e) => handleKeydown(i, e)}
			onpaste={handlePaste}
			class="anahtar-otp-digit"
		/>
	{/each}
</div>

<style>
	.anahtar-otp {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
	}

	.anahtar-otp-digit {
		width: 2.75rem;
		height: 3rem;
		text-align: center;
		font-size: 1.125rem;
		border: 1px solid var(--anahtar-border, #d1d5db);
		border-radius: 0.375rem;
		background: var(--anahtar-bg, transparent);
		color: var(--anahtar-fg, inherit);
	}

	.anahtar-otp-digit:focus {
		outline: none;
		box-shadow: 0 0 0 2px var(--anahtar-ring, #3b82f6);
	}

	.anahtar-otp-digit:disabled {
		opacity: 0.5;
	}
</style>
