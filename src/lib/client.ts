import { guessDeviceName } from './device.js';

export interface PasskeyInfo {
	id: string;
	credentialId: string;
	name: string | null;
	createdAt: number;
}

export interface VerifyResult {
	user: { id: string; email: string };
	hasPasskey: boolean;
	skipPasskeyPrompt: boolean;
}

export interface PasskeyLoginOptions {
	email?: string;
	conditional?: boolean;
	timeoutMs?: number;
}

export class AuthError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = 'AuthError';
		this.status = status;
	}
}

const DEFAULT_TIMEOUT_MS = 8000;

type WebAuthn = typeof import('@simplewebauthn/browser');

export function createAuthClient(apiBase = '/api/auth') {
	let webauthn: WebAuthn | undefined;

	async function loadWebAuthn(): Promise<WebAuthn> {
		webauthn ??= await import('@simplewebauthn/browser');
		return webauthn;
	}

	async function unwrap(res: Response) {
		const data = await res.json().catch(() => ({}));
		if (!res.ok) throw new AuthError(data?.error ?? `Request failed (${res.status})`, res.status);
		return data;
	}

	async function post(path: string, body?: unknown) {
		return unwrap(
			await fetch(`${apiBase}/${path}`, {
				method: 'POST',
				headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
				body: body === undefined ? undefined : JSON.stringify(body),
			}),
		);
	}

	async function get(path: string) {
		return unwrap(await fetch(`${apiBase}/${path}`));
	}

	return {
		sendCode: (email: string): Promise<{ otpLength: number }> => post('start', { email }),
		verifyCode: (email: string, code: string): Promise<VerifyResult> => post('verify', { email, code }),
		logout: (): Promise<void> => post('logout'),
		skipPasskeyPrompt: (): Promise<void> => post('skip-passkey'),
		passkeyList: (): Promise<PasskeyInfo[]> => get('passkey/list'),
		passkeyRemove: (passkeyId: string): Promise<void> => post('passkey/remove', { passkeyId }),
		passkeyCancel: () => webauthn?.WebAuthnAbortService.cancelCeremony(),

		async passkeyLogin(options: PasskeyLoginOptions = {}): Promise<boolean> {
			try {
				const { startAuthentication, WebAuthnAbortService } = await loadWebAuthn();
				const optionsJSON = options.email
					? await post('passkey/check-email', { email: options.email })
					: await get('passkey/login-start');
				if (options.email && !(optionsJSON.allowCredentials?.length > 0)) return false;

				const ceremony = startAuthentication({ optionsJSON, useBrowserAutofill: options.conditional });
				const assertion = options.conditional
					? await ceremony
					: await withTimeout(ceremony, options.timeoutMs ?? DEFAULT_TIMEOUT_MS, WebAuthnAbortService);
				await post('passkey/login-finish', assertion);
				return true;
			} catch {
				webauthn?.WebAuthnAbortService.cancelCeremony();
				return false;
			}
		},

		async passkeyRegister(name = guessDeviceName()): Promise<boolean> {
			const { startRegistration } = await loadWebAuthn();
			const optionsJSON = await post('passkey/register-start');
			let registration;
			try {
				registration = await startRegistration({ optionsJSON });
			} catch (e) {
				if (e instanceof Error && (e.name === 'NotAllowedError' || e.name === 'AbortError')) return false;
				throw e;
			}
			await post('passkey/register-finish', { ...registration, name });
			return true;
		},
	};
}

export type AuthClient = ReturnType<typeof createAuthClient>;

function withTimeout<T>(promise: Promise<T>, ms: number, abort: { cancelCeremony(): void }): Promise<T> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const timeout = new Promise<never>((_, reject) => {
		timer = setTimeout(() => {
			abort.cancelCeremony();
			reject(new Error('timeout'));
		}, ms);
	});
	return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
