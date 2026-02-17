import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { ResolvedConfig } from '../types.js';
import { generateOTP, verifyOTP } from '../otp.js';
import { createSession, invalidateSession, validateSession } from '../session.js';
import {
	generateRegistrationChallenge,
	verifyRegistrationResponse,
	generateAuthenticationChallenge,
	verifyAuthenticationResponse,
	removePasskey,
} from '../passkey.js';

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

type RouteHandler = (event: RequestEvent) => Promise<Response>;

function requireAuth(event: RequestEvent): { id: string; email: string } | Response {
	const user = event.locals.user;
	if (!user) return json({ error: 'Not authenticated' }, { status: 401 });
	return user;
}

export function createHandlers(config: ResolvedConfig): { GET: RouteHandler; POST: RouteHandler } {
	const maxAge = Math.floor(config.sessionDuration / 1000);

	function cookieOpts(event: RequestEvent) {
		return {
			httpOnly: true,
			secure: event.url.protocol === 'https:',
			sameSite: 'lax' as const,
			path: '/',
			maxAge,
		};
	}

	const routes: Record<string, { method: 'GET' | 'POST'; handler: RouteHandler }> = {
		start: {
			method: 'POST',
			handler: async (event) => {
				const body = await event.request.json().catch(() => null);
				if (!body || typeof body.email !== 'string' || !body.email.includes('@')) {
					return json({ error: 'Invalid email' }, { status: 400 });
				}

				const { code } = await generateOTP(config.db, body.email, config);
				await config.onSendOTP(body.email, code);

				return json({ success: true });
			},
		},

		verify: {
			method: 'POST',
			handler: async (event) => {
				const body = await event.request.json().catch(() => null);
				if (!body || typeof body.email !== 'string' || typeof body.code !== 'string') {
					return json({ error: 'Invalid input' }, { status: 400 });
				}

			const otp = await verifyOTP(config.db, body.email, body.code, config);
				if (!otp.ok) {
					const messages = {
						invalid: 'Invalid code. Please try again.',
						expired: 'Code expired. Please request a new one.',
						rate_limited: 'Too many attempts. Please request a new code.',
					};
					return json(
						{ error: messages[otp.error] },
						{ status: otp.error === 'rate_limited' ? 429 : 400 },
					);
				}

				let user = await config.db.getUserByEmail(body.email);
				if (!user) {
					user = await config.db.createUser(body.email);
				}

				const session = await createSession(config.db, user.id, config);
				event.cookies.set(config.cookie, session.sessionToken, cookieOpts(event));

				const passkeys = await config.db.getUserPasskeys(user.id);

				return json({
					user: { id: user.id, email: user.email },
					hasPasskey: passkeys.length > 0,
					skipPasskeyPrompt: user.skipPasskeyPrompt,
				});
			},
		},

		logout: {
			method: 'POST',
			handler: async (event) => {
				const token = event.cookies.get(config.cookie);
				if (token) {
				const result = await validateSession(config.db, token);
				if (result) {
						await invalidateSession(config.db, result.session.id);
					}
					event.cookies.delete(config.cookie, { path: '/' });
				}
				return json({ ok: true });
			},
		},

		'passkey/login-start': {
			method: 'GET',
			handler: async (event) => {
				const options = await generateAuthenticationChallenge(config.db, event.url);
				return json(options);
			},
		},

		'passkey/login-finish': {
			method: 'POST',
			handler: async (event) => {
				const body = await event.request.json().catch(() => null);
				if (!body) return json({ error: 'Invalid input' }, { status: 400 });

				const result = await verifyAuthenticationResponse(config.db, body, event.url);
				if (!result) return json({ error: 'Authentication failed' }, { status: 401 });

				const session = await createSession(config.db, result.user.id, config);
				event.cookies.set(config.cookie, session.sessionToken, cookieOpts(event));

				return json({ user: result.user });
			},
		},

		'passkey/register-start': {
			method: 'POST',
			handler: async (event) => {
				const user = requireAuth(event);
				if (user instanceof Response) return user;

				const options = await generateRegistrationChallenge(
					config.db,
					user,
					event.url,
					config,
				);
				return json(options);
			},
		},

		'passkey/register-finish': {
			method: 'POST',
			handler: async (event) => {
				const user = requireAuth(event);
				if (user instanceof Response) return user;

				const body = await event.request.json().catch(() => null);
				if (!body) return json({ error: 'Invalid input' }, { status: 400 });

				const success = await verifyRegistrationResponse(
					config.db,
					user.id,
					body,
					event.url,
				);
				if (!success) return json({ error: 'Passkey registration failed' }, { status: 400 });

				return json({ success: true });
			},
		},

		'passkey/remove': {
			method: 'POST',
			handler: async (event) => {
				const user = requireAuth(event);
				if (user instanceof Response) return user;

				const body = await event.request.json().catch(() => null);
				if (!body || typeof body.passkeyId !== 'string') {
					return json({ error: 'Invalid input' }, { status: 400 });
				}

				const success = await removePasskey(config.db, body.passkeyId, user.id);
				if (!success) return json({ error: 'Passkey not found' }, { status: 404 });

				return json({ success: true });
			},
		},

		'skip-passkey': {
			method: 'POST',
			handler: async (event) => {
				const user = requireAuth(event);
				if (user instanceof Response) return user;

				await config.db.setSkipPasskeyPrompt(user.id, true);
				return json({ success: true });
			},
		},
	};

	function getRoute(event: RequestEvent): string | null {
		const path = event.params.path;
		if (typeof path === 'string') return path;
		return null;
	}

	return {
		GET: async (event) => {
			const path = getRoute(event);
			if (!path) return json({ error: 'Not found' }, { status: 404 });

			const route = routes[path];
			if (!route || route.method !== 'GET') {
				return json({ error: 'Not found' }, { status: 404 });
			}
			return route.handler(event);
		},

		POST: async (event) => {
			const path = getRoute(event);
			if (!path) return json({ error: 'Not found' }, { status: 404 });

			const route = routes[path];
			if (!route || route.method !== 'POST') {
				return json({ error: 'Not found' }, { status: 404 });
			}
			return route.handler(event);
		},
	};
}
