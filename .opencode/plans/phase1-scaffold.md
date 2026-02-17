# Phase 1: Scaffold + Types

## Summary
Set up the package structure, all shared types, and config. This is the foundation that all other phases depend on.

## Files to create

### package.json
- name: `@mrgnw/anahtar`
- type: module
- scripts: build (svelte-package), check (svelte-check), test (vitest)
- exports: `.` (main), `./sqlite`, `./postgres`, `./components`
- deps: `@oslojs/crypto`, `@oslojs/encoding`, `@simplewebauthn/server`
- peerDeps: `svelte ^5`, `@sveltejs/kit ^2`
- devDeps: `@sveltejs/package`, `svelte-check`, `typescript`, `vitest`, `@types/better-sqlite3`

### tsconfig.json
- extends `.svelte-kit/tsconfig.json`
- strict, ESNext module/target, bundler moduleResolution

### svelte.config.js
- vitePreprocess, kit.files.lib = 'src/lib'

### vite.config.ts
- sveltekit plugin, vitest include `src/**/*.test.ts`

### src/lib/types.ts

```ts
export interface AuthUser {
	id: string;
	email: string;
	skipPasskeyPrompt: boolean;
	createdAt: number;
}

export interface SessionRecord {
	id: string;
	userId: string;
	expiresAt: number;
}

export interface OTPRecord {
	id: string;
	email: string;
	code: string;
	attempts: number;
	expiresAt: number;
}

export interface PasskeyRecord {
	id: string;
	credentialId: string;
	publicKey: Uint8Array;
	counter: number;
	transports: string | null;
	createdAt: number;
}

export interface FullPasskeyRecord extends PasskeyRecord {
	userId: string;
	email: string;
}

export interface NewPasskey {
	id: string;
	userId: string;
	credentialId: string;
	publicKey: Uint8Array;
	counter: number;
	transports: string | null;
}

export type OtpResult =
	| { ok: true }
	| { ok: false; error: 'invalid' }
	| { ok: false; error: 'expired' }
	| { ok: false; error: 'rate_limited'; attemptsLeft: number };

export interface AuthDB {
	init(): void;

	// Users
	getUserByEmail(email: string): AuthUser | null;
	createUser(email: string): AuthUser;
	setSkipPasskeyPrompt(userId: string, skip: boolean): void;

	// Sessions
	createSession(tokenHash: string, userId: string, expiresAt: number): void;
	getSession(tokenHash: string): (SessionRecord & { email: string }) | null;
	deleteSession(tokenHash: string): void;

	// OTP
	storeOTP(email: string, id: string, code: string, expiresAt: number): void;
	getLatestOTP(email: string): OTPRecord | null;
	updateOTPAttempts(id: string, attempts: number): void;
	deleteOTP(id: string): void;
	deleteOTPsForEmail(email: string): void;

	// Passkeys + challenges
	storeChallenge(challenge: string, userId: string, expiresAt: number): void;
	consumeChallenge(challenge: string): { userId: string } | null;
	getPasskeyByCredentialId(credentialId: string): FullPasskeyRecord | null;
	getUserPasskeys(userId: string): PasskeyRecord[];
	storePasskey(passkey: NewPasskey): void;
	updatePasskeyCounter(id: string, counter: number): void;
	deletePasskey(id: string, userId: string): boolean;
}

export interface AuthConfig {
	db: AuthDB;
	tablePrefix?: string;
	cookie?: string;
	sessionDuration?: number;
	otpExpiry?: number;
	otpLength?: number;
	otpMaxAttempts?: number;
	rpName?: string;
	onSendOTP: (email: string, code: string) => Promise<void>;
}

export interface ResolvedConfig extends Required<Omit<AuthConfig, 'onSendOTP'>> {
	onSendOTP: (email: string, code: string) => Promise<void>;
}
```

### src/lib/config.ts

```ts
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
```

### src/lib/index.ts

```ts
export type {
	AuthUser,
	AuthDB,
	AuthConfig,
	SessionRecord,
	OTPRecord,
	PasskeyRecord,
	OtpResult,
} from './types.js';

// createAuth() will be added in Phase 4
```

## Verify
```sh
pnpm install
pnpm build
pnpm check
```

---

## Phase 2: Core Logic (3 parallel agents)

### Agent A: src/lib/otp.ts
- `generateOTP(db: AuthDB, email: string, config: ResolvedConfig)` — returns `{ id, code }`
- `verifyOTP(db: AuthDB, email: string, code: string, config: ResolvedConfig)` — returns `OtpResult`
- Uses `config.otpExpiry`, `config.otpLength`, `config.otpMaxAttempts`
- Extracted from anani `auth.ts:11-74`

### Agent B: src/lib/session.ts
- `createSession(db: AuthDB, userId: string, config: ResolvedConfig)` — returns `{ sessionToken, expiresAt }`
- `validateSession(db: AuthDB, token: string)` — returns `{ user, session } | null`
- `invalidateSession(db: AuthDB, sessionId: string)` — void
- Token hashing: `sha256(tokenBytes)` via `@oslojs/crypto`
- Extracted from anani `auth.ts:97-168`

### Agent C: src/lib/passkey.ts
- `getWebAuthnConfig(requestUrl: URL)` — derives rpID/origin from URL or ORIGIN env
- `generateRegistrationChallenge(db, user, requestUrl, config)`
- `verifyRegistrationResponse(db, userId, response, requestUrl, config)`
- `generateAuthenticationChallenge(db, requestUrl, config)`
- `verifyAuthenticationResponse(db, response, requestUrl, config)`
- `getUserPasskeys(db, userId)`
- `removePasskey(db, passkeyId, userId)`
- Extracted from anani `passkey.ts` (250 lines)

Each agent also writes its own `*.test.ts` using a mock AuthDB.

---

## Phase 3: DB Adapters

### src/lib/db/sqlite.ts — `sqliteAdapter(db: BetterSqlite3.Database, options?)`
Schema (with table prefix):
```sql
CREATE TABLE IF NOT EXISTS {prefix}users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    skip_passkey_prompt INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE IF NOT EXISTS {prefix}sessions (...);
CREATE TABLE IF NOT EXISTS {prefix}otp_codes (...);
CREATE TABLE IF NOT EXISTS {prefix}passkeys (...);
CREATE TABLE IF NOT EXISTS {prefix}challenges (...);
```

### src/lib/db/postgres.ts — `postgresAdapter(pool: pg.Pool, options?)`
Same interface, PostgreSQL syntax.

---

## Phase 4: SvelteKit Integration

### src/lib/kit/handle.ts
Factory returning SvelteKit `Handle` — reads cookie, validates session, sets `event.locals.user`.

### src/lib/kit/handlers.ts
Factory returning `{ GET, POST }` for catch-all route. Parses path to dispatch:
- POST start → generateOTP + onSendOTP
- POST verify → verifyOTP + createUser + createSession + set cookie
- POST logout → invalidateSession + delete cookie
- GET passkey/login-start → generateAuthenticationChallenge
- POST passkey/login-finish → verifyAuthenticationResponse + createSession
- POST passkey/register-start → generateRegistrationChallenge (requires auth)
- POST passkey/register-finish → verifyRegistrationResponse (requires auth)
- POST passkey/remove → removePasskey (requires auth)
- POST skip-passkey → setSkipPasskeyPrompt (requires auth)

### src/lib/index.ts — `createAuth(config)` returns `{ handle, handlers }`

---

## Phase 5: Svelte UI Components
- AuthFlow.svelte — full email→OTP→passkey flow
- OtpInput.svelte — 5-digit input with auto-advance
- PasskeyPrompt.svelte — countdown + registration trigger
