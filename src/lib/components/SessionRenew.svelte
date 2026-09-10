<script lang="ts">
import { createAuthClient } from '../client.js';
import { resolveMessages, detectLocaleClient, type AuthMessages } from '../i18n/index.js';

interface Props {
	apiBase?: string;
	user?: { email: string } | null;
	session?: { expiresAt: number } | null;
	renewBefore?: number;
	getPasskeys?: () => Promise<{ id: string }[]>;
	onSuccess?: () => void | Promise<void>;
	locale?: string;
	messages?: Partial<AuthMessages>;
}

let {
	apiBase = '/api/auth',
	user = null,
	session = null,
	renewBefore = 10 * 24 * 60 * 60 * 1000,
	getPasskeys,
	onSuccess,
	locale,
	messages: messageOverrides,
}: Props = $props();

let loading = $state(false);

const m = $derived(resolveMessages(locale ?? detectLocaleClient(), messageOverrides));
const api = $derived(createAuthClient(apiBase));
const due = $derived(!!user && !!session && session.expiresAt - Date.now() < renewBefore);
const passkeys = $derived(due ? (getPasskeys ?? api.passkeyList)().catch(() => []) : null);

async function renew() {
	if (!user) return;
	loading = true;
	try {
		if (await api.passkeyLogin({ email: user.email })) await onSuccess?.();
	} finally {
		loading = false;
	}
}
</script>

{#if passkeys}
	{#await passkeys then keys}
		{#if keys.length > 0}
			<button class="anahtar-renew" onclick={renew} disabled={loading}>{m.staySignedIn}</button>
		{/if}
	{/await}
{/if}

<style>
	.anahtar-renew {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--anahtar-primary, #3730a3);
		background: color-mix(in srgb, var(--anahtar-primary, #3730a3) 10%, transparent);
		border: none;
		border-radius: 9999px;
		padding: 0.15rem 0.55rem;
		cursor: pointer;
		white-space: nowrap;
		line-height: 1.4;
		transition: opacity 0.15s;
	}
	.anahtar-renew:hover:not(:disabled) { opacity: 0.75; }
	.anahtar-renew:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
