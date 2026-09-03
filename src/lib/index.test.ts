import { describe, expect, it, vi } from 'vitest';
import { createAuth } from './index.js';
import type { AuthDB } from './types.js';

function dbWith(init: AuthDB['init']): AuthDB {
	return { init } as unknown as AuthDB;
}

function fakeEvent() {
	return {
		cookies: { get: () => undefined, delete: vi.fn() },
		locals: {},
	} as unknown as Parameters<ReturnType<typeof createAuth>['handle']>[0]['event'];
}

describe('createAuth', () => {
	it('returns synchronously and runs db.init exactly once', async () => {
		const init = vi.fn();
		const auth = createAuth({ db: dbWith(init), onSendOTP: vi.fn() });
		expect(auth.handle).toBeTypeOf('function');
		await auth.ready;
		await auth.ready;
		expect(init).toHaveBeenCalledOnce();
	});

	it('handle waits for init before resolving a request', async () => {
		const order: string[] = [];
		const init = async () => {
			await new Promise((resolve) => setTimeout(resolve, 5));
			order.push('init');
		};
		const auth = createAuth({ db: dbWith(init), onSendOTP: vi.fn() });
		const resolve = vi.fn(async () => {
			order.push('resolve');
			return new Response();
		});
		await auth.handle({ event: fakeEvent(), resolve });
		expect(order).toEqual(['init', 'resolve']);
	});

	it('ready rejects when init throws', async () => {
		const auth = createAuth({
			db: dbWith(() => {
				throw new Error('boom');
			}),
			onSendOTP: vi.fn(),
		});
		await expect(auth.ready).rejects.toThrow('boom');
	});
});
