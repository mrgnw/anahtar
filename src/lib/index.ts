import type { AuthConfig } from './types.js';
import { resolveConfig } from './config.js';
import { createHandle } from './kit/handle.js';
import { createHandlers } from './kit/handlers.js';

export type {
	AuthUser,
	AuthDB,
	AuthConfig,
	ResolvedConfig,
	SessionRecord,
	OTPRecord,
	PasskeyRecord,
	FullPasskeyRecord,
	NewPasskey,
	OtpResult,
	MaybePromise,
} from './types.js';

export { resolveConfig } from './config.js';

export async function createAuth(config: AuthConfig) {
	const resolved = resolveConfig(config);
	await config.db.init();

	return {
		handle: createHandle(resolved),
		handlers: createHandlers(resolved),
		config: resolved,
	};
}
