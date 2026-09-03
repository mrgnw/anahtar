import type { Handle } from '@sveltejs/kit';
import type { ResolvedConfig } from '../types.js';
import { validateSession } from '../session.js';

export function createHandle(config: ResolvedConfig, ready: Promise<void>): Handle {
	return async ({ event, resolve }) => {
		await ready;
		const token = event.cookies.get(config.cookie);
		const result = token ? await validateSession(config.db, token) : null;
		if (token && !result) event.cookies.delete(config.cookie, { path: '/' });
		event.locals.user = result?.user ?? null;
		event.locals.session = result?.session ?? null;
		return resolve(event);
	};
}
