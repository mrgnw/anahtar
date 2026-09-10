import type { Handle } from '@sveltejs/kit';
import type { ResolvedConfig } from '../types.js';
import { validateSession } from '../session.js';

export function createHandle(config: ResolvedConfig, ensureReady: () => Promise<void>): Handle {
	return async ({ event, resolve }) => {
		try {
			await ensureReady();
			const token = event.cookies.get(config.cookie);
			const result = token ? await validateSession(config.db, token) : null;
			if (token && !result) event.cookies.delete(config.cookie, { path: '/' });
			event.locals.user = result?.user ?? null;
			event.locals.session = result?.session ?? null;
		} catch (err) {
			// a db blip costs the session, not the page: resolve signed out
			config.onError('handle', err, event);
			event.locals.user = null;
			event.locals.session = null;
		}
		return resolve(event);
	};
}
