import type { Handle } from '@sveltejs/kit';
import type { ResolvedConfig } from '../types.js';
import { validateSession } from '../session.js';

export function createHandle(config: ResolvedConfig): Handle {
	return async ({ event, resolve }) => {
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
