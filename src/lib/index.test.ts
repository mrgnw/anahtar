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

	it('retries init on the next request after a failure', async () => {
		let calls = 0;
		const init = vi.fn(() => {
			calls += 1;
			if (calls === 1) throw new Error('D1_ERROR: D1 DB is overloaded');
		});
		const auth = createAuth({ db: dbWith(init), onSendOTP: vi.fn(), onError: vi.fn() });
		const resolve = vi.fn(async () => new Response('ok'));

		await auth.handle({ event: fakeEvent(), resolve });
		const second = await auth.handle({ event: fakeEvent(), resolve });

		expect(init).toHaveBeenCalledTimes(2);
		expect(await second.text()).toBe('ok');
	});

	it('resolves signed out when the db throws', async () => {
		const onError = vi.fn();
		const auth = createAuth({
			db: dbWith(() => {
				throw new Error('boom');
			}),
			onSendOTP: vi.fn(),
			onError,
		});
		const event = fakeEvent();

		const response = await auth.handle({ event, resolve: async () => new Response('ok') });

		expect(await response.text()).toBe('ok');
		expect(event.locals.user).toBeNull();
		expect(event.locals.session).toBeNull();
		expect(onError).toHaveBeenCalledWith('handle', expect.any(Error), event);
	});
});
