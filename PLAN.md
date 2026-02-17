# @mrgnw/anahtar

Opinionated, reusable auth for SvelteKit. Email+OTP identification with optional passkey (WebAuthn) registration. One way to do auth across all projects.

"Anahtar" means "key" in Turkish.

## Auth flow

1. User enters email → server generates OTP, calls your `onSendOTP` callback
2. User enters 5-digit OTP → session created (cookie)
3. First login without passkey → prompt to register a passkey
4. Subsequent logins → passkey autofill (conditional WebAuthn), or fall back to email+OTP

## Package structure

```
vitest.unit.ts                # Unit test config (node env)
vitest.browser.ts             # Component test config (happy-dom + svelte compiler)
vitest-setup.ts               # @testing-library/jest-dom setup
src/
├── index.ts                  # createAuth() entry point, re-exports
├── config.ts                 # AuthConfig type + defaults
├── session.ts                # create, validate, invalidate sessions
├── otp.ts                    # generate, verify, cleanup OTP codes
├── passkey.ts                # WebAuthn registration + authentication
├── types.ts                  # AuthUser, AuthDB, PasskeyRecord, etc.
├── db/
│   ├── adapter.ts            # AuthDB interface definition
│   ├── sqlite.ts             # better-sqlite3 adapter + schema SQL
│   └── postgres.ts           # pg adapter + schema SQL
└── kit/
    ├── handle.ts             # SvelteKit handle() hook
    ├── handlers.ts           # Route handler factories
    └── components/           # Optional Svelte auth UI
        ├── AuthFlow.svelte   # Full email→OTP→passkey flow
        ├── OtpInput.svelte   # 5-digit OTP input
        └── PasskeyPrompt.svelte
```

## Dependencies

- `@simplewebauthn/server` — WebAuthn registration/authentication
- `@oslojs/crypto` + `@oslojs/encoding` — session token hashing
- `svelte` (peer dep) — for optional UI components

DB drivers are **not** dependencies. The consuming project provides its own `better-sqlite3` or `pg` instance.

## Configuration

```ts
interface AuthConfig {
  db: AuthDB;
  tablePrefix?: string; // default: 'auth_'
  cookie?: string; // default: 'session'
  sessionDuration?: number; // default: 30 days (ms)
  otpExpiry?: number; // default: 30 min (ms)
  otpLength?: number; // default: 5 digits
  otpMaxAttempts?: number; // default: 5
  onSendOTP: (email: string, code: string) => Promise<void>;
}
```

### Table prefix

All tables are prefixed with `tablePrefix` (default `auth_`):

| Default name      | With `tablePrefix: 'myapp_'` |
| ----------------- | ---------------------------- |
| `auth_users`      | `myapp_users`                |
| `auth_sessions`   | `myapp_sessions`             |
| `auth_otp_codes`  | `myapp_otp_codes`            |
| `auth_passkeys`   | `myapp_passkeys`             |
| `auth_challenges` | `myapp_challenges`           |

### WebAuthn origin

`rpID` and `origin` are derived from the request URL at runtime. Override for production by setting the `ORIGIN` env var. No hardcoded hostnames — works on any port in dev.

## DB adapter interface

```ts
interface AuthDB {
  init(): void;

  // Users
  getUserByEmail(email: string): AuthUser | null;
  createUser(email: string): AuthUser;

  // Sessions
  createSession(tokenHash: string, userId: string, expiresAt: number): void;
  getSession(tokenHash: string): SessionRecord | null;
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
```

Built-in adapters:

- `sqliteAdapter(db: Database)` — from `@mrgnw/anahtar/sqlite`
- `postgresAdapter(pool: Pool)` — from `@mrgnw/anahtar/postgres`

Both accept the `tablePrefix` and auto-create tables on `init()`.

## Integration

See [docs/integration.md](docs/integration.md) for the full guide: install, setup, config options, theming, and project-specific user data.

## Reference implementation

The `fresh-pineapple` branch of [anani](https://github.com/mrgnw/anani) contains the original implementation this package is extracted from. Key files:

- `src/lib/server/auth.ts` — session + OTP logic
- `src/lib/server/passkey.ts` — WebAuthn logic
- `src/lib/server/hooks.ts` — session resolution
- `src/lib/server/db.ts` — SQLite setup + schema
- `src/routes/auth/+page.svelte` — auth UI (email → OTP → passkey flow)
- `src/routes/api/auth/` — all API route handlers

## Testing

68 tests: 46 unit + 22 component.

```sh
pnpm test:unit     # otp, session, sqlite adapter — node env
pnpm test:browser  # AuthFlow, OtpInput, PasskeyPrompt — happy-dom
pnpm test          # both
```

Tests use two separate vitest configs because `@sveltejs/vite-plugin-svelte` hangs vitest indefinitely in DOM environments (jsdom/happy-dom) on Node 25. The workaround is `vitest.browser.ts` which uses a minimal vite plugin that calls `svelte/compiler`'s `compile()` and `compileModule()` directly, avoiding the full plugin's file watchers and server hooks.

The `svelteTesting()` plugin from `@testing-library/svelte/vite` handles DOM cleanup between tests and adds `@testing-library/svelte` to `ssr.noExternal` so its `.svelte.js` files get compiled.

**Known issue:** vitest process doesn't exit cleanly on Node 25 — tests complete and print results, but the process hangs. This is a vitest/Node 25 compatibility issue, not specific to this project.

## Build / publish

- TypeScript, compiled to ESM
- Published to GitHub Packages as `@mrgnw/anahtar`
- Svelte components ship as `.svelte` source (compiled by the consuming project's bundler)
