import type { Handle } from '@sveltejs/kit';
import type { ResolvedConfig } from '../types.js';
import { validateSession } from '../session.js';

export function createHandle(config: ResolvedConfig, ready: Promise<void>): Handle {
	return async ({ event, resolve }) => {
		await ready;
		const token = event.cookies.get(config.cookie);
		if (!token) {
			event.locals.user = null;
			return resolve(event);
		}

		const result = await validateSession(config.db, token);
		if (!result) {
			event.cookies.delete(config.cookie, { path: '/' });
			event.locals.user = null;
			return resolve(event);
		}

		event.locals.user = result.user;
		return resolve(event);
	};
}
