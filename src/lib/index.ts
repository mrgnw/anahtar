import { resolveConfig } from './config.js';
import { createHandle } from './kit/handle.js';
import { createHandlers } from './kit/handlers.js';
import type { AuthConfig } from './types.js';

export { resolveConfig } from './config.js';
export type {
	AuthConfig,
	AuthDB,
	AuthErrorScope,
	AuthLocals,
	AuthUser,
	FullPasskeyRecord,
	MaybePromise,
	NewPasskey,
	OTPRecord,
	OtpResult,
	PasskeyRecord,
	ResolvedConfig,
	SessionMethod,
	SessionRecord
} from './types.js';
export type { AuthMessages } from './i18n/types.js';
export { detectLocaleServer } from './i18n/index.js';

export type Auth = ReturnType<typeof createAuth>;

export function createAuth(config: AuthConfig) {
	const resolved = resolveConfig(config);
	let ready: Promise<void> | undefined;
	const ensureReady = () =>
		(ready ??= Promise.resolve()
			.then(() => config.db.init())
			.catch((err) => {
				ready = undefined; // next request retries instead of inheriting the failure
				throw err;
			}));

	return {
		handle: createHandle(resolved, ensureReady),
		handlers: createHandlers(resolved, ensureReady),
		listPasskeys: async (userId: string) => {
			await ensureReady();
			return config.db.getUserPasskeys(userId);
		},
		get ready() {
			return ensureReady();
		},
		config: resolved
	};
}
