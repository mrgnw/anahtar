import { resolveConfig } from './config.js';
import { createHandle } from './kit/handle.js';
import { createHandlers } from './kit/handlers.js';
import type { AuthConfig } from './types.js';

export { resolveConfig } from './config.js';
export type {
	AuthConfig,
	AuthDB,
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
	const ready = Promise.resolve().then(() => config.db.init());

	return {
		handle: createHandle(resolved, ready),
		handlers: createHandlers(resolved, ready),
		listPasskeys: async (userId: string) => {
			await ready;
			return config.db.getUserPasskeys(userId);
		},
		ready,
		config: resolved
	};
}
