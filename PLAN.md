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

## Design: session renewal (0.2.0)

Status: design for review, not yet implemented.

Sessions keep a fixed lifetime and expire. Renewal is explicit and one tap:
a "Stay signed in" chip in AuthPill runs a passkey ceremony, which mints a
fresh full-length session. This is anani's chip made native; anani deletes
its `AuthPillWrapper` renewal code, `RENEWAL_WINDOW_MS`, and layout wiring.

Rejected alternative: silent sliding renewal in `handle` (extend past the
halfway point). Dropped in review — active sessions would never expire, and
it required a breaking `method` column on the sessions table. Explicit
renewal re-proves possession and needs no schema change.

### Principle

Renewal is not a new mechanism — it is a passkey login. `passkey/login-finish`
already rotates the session via `startSession(event, userId, 'passkey')` with
a full `sessionDuration('passkey')`. The feature is exposing *when* to offer
it. No schema change, no adapter change, no new endpoints, no version-breaking
migration.

### Changes

1. **AuthPill** gains:
   - `session?: { expiresAt: number } | null` — pass `locals.session`
     through, same pattern as the existing `user` prop.
   - `renewBefore?: number` — window in ms, default 10 days (anani's
     `RENEWAL_WINDOW_MS`).
   - Chip renders when authenticated, `expiresAt - now < renewBefore`, and
     the user has ≥1 passkey (already known from `passkeyList`). Click →
     `api.passkeyLogin()` → `onSuccess` (consumer invalidates, fresh
     `expiresAt` flows back in). No passkey → no chip; the session lapses
     and the normal sign-in flow is the renewal.
2. **`kit/handlers.ts`**: `extendCurrentSession` is deleted. Passkey
   register-finish calls the existing `startSession(event, user.id,
   'passkey')` instead — same extension UX, but the token rotates on
   method upgrade, strictly stronger than extending the old token.
3. Docs: `docs/security.md` gets a "session lifetime & renewal" note;
   integration docs show passing `session` to AuthPill.

### Tests

- Component (AuthPill): chip visible inside window with passkey; hidden
  outside window, without passkey, and signed out; click calls
  `passkeyLogin` and fires `onSuccess`.
- Unit (handlers): register-finish rotates — old token invalid afterward,
  new session gets passkey duration.
- Adapters: untouched, no new adapter tests needed.

### Not in this change

Logout-everywhere, account deletion, expired-row sweep — separate candidates.
With no adapter break here, they no longer need to ride the same version.

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
