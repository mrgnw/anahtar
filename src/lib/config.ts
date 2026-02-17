import type { AuthConfig, ResolvedConfig } from './types.js';

const DEFAULTS = {
	tablePrefix: 'auth_',
	cookie: 'session',
	sessionDuration: 30 * 24 * 60 * 60 * 1000,
	otpExpiry: 30 * 60 * 1000,
	otpLength: 5,
	otpMaxAttempts: 5,
	rpName: 'anahtar',
} as const;

export function resolveConfig(config: AuthConfig): ResolvedConfig {
	return {
		...DEFAULTS,
		...config,
	};
}
