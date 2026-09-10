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
src/lib/
├── index.ts                  # createAuth() — server entry (.)
├── client.ts                 # createAuthClient() — browser entry (./client)
├── config.ts                 # defaults + resolveConfig()
├── email.ts                  # normalizeEmail(), parseEmail()
├── session.ts                # create, validate, invalidate sessions
├── otp.ts                    # generate, verify OTP codes
├── passkey.ts                # WebAuthn registration + authentication
├── device.ts                 # guessDeviceName() (./device)
├── types.ts                  # AuthConfig, AuthDB, AuthLocals, ...
├── i18n/                     # 88 locales, resolveMessages() (./i18n)
├── db/
│   ├── sqlite.ts             # better-sqlite3 adapter + schema (./sqlite)
│   ├── postgres.ts           # pg adapter (./postgres)
│   └── d1.ts                 # Cloudflare D1 adapter (./d1)
├── kit/
│   ├── handle.ts             # SvelteKit handle() → locals.user, locals.session
│   └── handlers.ts           # GET/POST route handlers
└── components/               # Optional Svelte UI (./components)
    ├── AuthFlow.svelte       # Full email→OTP→passkey flow
    ├── AuthPill.svelte       # Compact pill: sign-in, OTP, passkeys, sign-out
    ├── OtpInput.svelte       # n-digit OTP input
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
  rpId?: string; // default: request hostname
  origin?: string; // default: request origin
  cookie?: string; // default: 'session'
  sessionDuration?: number | ((method: 'otp' | 'passkey') => number); // default: 30 days (ms)
  otpExpiry?: number; // default: 30 min (ms)
  otpLength?: number; // default: 5 digits
  otpMaxAttempts?: number; // default: 5
  onSendOTP: (email: string, code: string) => Promise<void>;
}
```

### Table prefix

All tables are prefixed by the adapter option, e.g. `sqliteAdapter(db, { tablePrefix: 'myapp_' })` (default `auth_`):

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

Every method may return a value or a promise (`MaybePromise`). See `src/lib/types.ts` for the exact signatures.

```ts
interface AuthDB {
  init(): MaybePromise<void>;

  // Users
  getUserByEmail(email: string): MaybePromise<AuthUser | null>;
  createUser(email: string): MaybePromise<AuthUser>;
  setSkipPasskeyPrompt(userId: string, skip: boolean): MaybePromise<void>;

  // Sessions (id = sha256 of the token)
  createSession(tokenHash: string, userId: string, expiresAt: number): MaybePromise<void>;
  getSession(tokenHash: string): MaybePromise<(SessionRecord & { email: string }) | null>;
  deleteSession(tokenHash: string): MaybePromise<void>;
  updateSessionExpiry(tokenHash: string, expiresAt: number): MaybePromise<void>;

  // OTP
  storeOTP(email: string, id: string, code: string, expiresAt: number): MaybePromise<void>;
  getLatestOTP(email: string): MaybePromise<OTPRecord | null>;
  incrementOTPAttempts(id: string): MaybePromise<number | null>; // atomic, returns the new count
  deleteOTP(id: string): MaybePromise<void>;
  deleteOTPsForEmail(email: string): MaybePromise<void>;

  // Passkeys + challenges
  storeChallenge(challenge: string, userId: string, expiresAt: number): MaybePromise<void>;
  consumeChallenge(challenge: string): MaybePromise<{ userId: string } | null>; // single-use
  getPasskeyByCredentialId(credentialId: string): MaybePromise<FullPasskeyRecord | null>;
  getUserPasskeys(userId: string): MaybePromise<PasskeyRecord[]>;
  storePasskey(passkey: NewPasskey): MaybePromise<void>;
  updatePasskeyCounter(id: string, counter: number): MaybePromise<void>;
  deletePasskey(id: string, userId: string): MaybePromise<boolean>;
}
```

Timestamps (`createdAt`, `expiresAt`) are milliseconds.

## Design: sliding session renewal (0.2.0)

Status: design for review, not yet implemented.

Sessions renew themselves on use. Anahtar becomes the single owner of session
lifetime; anani deletes its "Stay signed in" chip and passkey re-ceremony.

### Principle

One renewal mechanism, at the one point every authenticated request passes
through: session validation in `handle`. No renewal endpoints, no UI, no
consumer code.

### Schema (breaking → 0.2.0)

`sessions` gains `method TEXT NOT NULL DEFAULT 'otp'` (`'otp' | 'passkey'`).

- `init()` auto-migrates existing tables: `ALTER TABLE … ADD COLUMN` guarded
  per adapter (postgres `IF NOT EXISTS`; sqlite/d1 catch duplicate-column).
- Pre-migration rows default to `'otp'` — the conservative duration; the next
  passkey login rotates them into a `'passkey'` session.

### Adapter interface (breaking)

```ts
createSession(tokenHash: string, userId: string, expiresAt: number, method: SessionMethod): MaybePromise<void>;
getSession(tokenHash: string): MaybePromise<(SessionRecord & { email: string }) | null>;
// SessionRecord gains: method: SessionMethod
```

`updateSessionExpiry` unchanged. No new methods. Custom adapters: add the
column and the param; built-in sqlite/postgres/d1 adapters handle it
(anani uses `d1Adapter`, unaffected).

### Renewal rule

In `handle`, after `validateSession` succeeds:

```
remaining = expiresAt - now
if remaining < sessionDuration(method) / 2:
    expiresAt = now + sessionDuration(method)
    db.updateSessionExpiry(...)
    re-set cookie with full maxAge
```

- Renewal always extends: threshold fires only when `remaining < duration/2`,
  so `now + duration > expiresAt`. Asserted.
- Write cost bounded: ≤ 1 DB write per session per half-duration, regardless
  of request rate. All other requests are read-only, same as today.
- Always on, no config. Consequence: sessions have no absolute lifetime — an
  active user stays signed in indefinitely. Matches the passkey/OTP model
  (possession-based re-auth, nothing to expire toward). Noted in
  docs/security.md.

### Deletions

- `extendCurrentSession` in `kit/handlers.ts` is removed. Passkey
  register-finish instead calls the existing `startSession(event, userId,
  'passkey')` — the session token rotates on method upgrade, which is
  strictly stronger than extending the old token.
- `locals.session` gains `method` so consumers can display it; no other
  surface changes.

### Tests

- All three adapters: `createSession`/`getSession` round-trips `method`;
  `init()` on a pre-0.2.0 schema adds the column.
- Renewal: fires past halfway, skips before halfway, cookie re-set, expiry
  extended by full duration.
- Register-finish rotates the token (old session invalid, new one `passkey`).

### Not in this change

Logout-everywhere, account deletion, expired-row sweep — separate candidates,
same 0.2.0 window if picked up.

Built-in adapters:

- `sqliteAdapter(db: Database)` — from `@mrgnw/anahtar/sqlite`
- `postgresAdapter(pool: Pool)` — from `@mrgnw/anahtar/postgres`
- `d1Adapter(env.DB)` — from `@mrgnw/anahtar/d1`

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

109 tests: 83 unit + 26 component.

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
- Published to npm as `@mrgnw/anahtar`
- Svelte components ship as `.svelte` source (compiled by the consuming project's bundler)
