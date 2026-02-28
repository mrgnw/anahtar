import { resolveConfig } from './config.js';
import { createHandle } from './kit/handle.js';
import { createHandlers } from './kit/handlers.js';
import type { AuthConfig } from './types.js';

export { resolveConfig } from './config.js';
export { guessDeviceName } from './device.js';
export type {
	AuthConfig,
	AuthDB,
	AuthUser,
	FullPasskeyRecord,
	MaybePromise,
	NewPasskey,
	OTPRecord,
	OtpResult,
	PasskeyRecord,
	ResolvedConfig,
	SessionRecord
} from './types.js';
export type { AuthMessages } from './i18n/types.js';
export { resolveMessages, detectLocaleClient, detectLocaleServer, locales } from './i18n/index.js';

export async function createAuth(config: AuthConfig) {
	const resolved = resolveConfig(config);
	await config.db.init();

	return {
		handle: createHandle(resolved),
		handlers: createHandlers(resolved),
		config: resolved
	};
}
