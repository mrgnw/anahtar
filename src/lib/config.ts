import type { AuthConfig, ResolvedConfig } from './types.js';

const DEFAULTS = {
	cookie: 'session',
	sessionDuration: 30 * 24 * 60 * 60 * 1000,
	otpExpiry: 30 * 60 * 1000,
	otpLength: 5,
	otpMaxAttempts: 5,
	rpName: 'anahtar',
} as const;

export function resolveConfig(config: AuthConfig): ResolvedConfig {
	const { sessionDuration = DEFAULTS.sessionDuration, ...rest } = config;
	return {
		...DEFAULTS,
		...rest,
		sessionDuration: typeof sessionDuration === 'function' ? sessionDuration : () => sessionDuration,
	};
}
