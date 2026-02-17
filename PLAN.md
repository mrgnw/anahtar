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

## Integration (consuming project)

### 1. Install

```sh
pnpm add @mrgnw/anahtar
```

### 2. Create auth instance (one file)

```ts
// src/lib/server/auth.ts
import { createAuth } from "@mrgnw/anahtar";
import { sqliteAdapter } from "@mrgnw/anahtar/sqlite";
import Database from "better-sqlite3";

const db = new Database("data/app.db");

export const auth = createAuth({
  db: sqliteAdapter(db),
  onSendOTP: async (email, code) => {
    // in dev: log to console
    // in prod: send email via your preferred service
    console.log(`[dev] OTP for ${email}: ${code}`);
  },
});
```

### 3. Wire into SvelteKit (two files)

```ts
// src/hooks.server.ts
import { auth } from "$lib/server/auth";

export const handle = auth.handle;
// auth.handle reads the session cookie, resolves the user,
// and sets event.locals.user = { id, email } | null
```

```ts
// src/routes/api/auth/[...path]/+server.ts
import { auth } from "$lib/server/auth";

export const { GET, POST } = auth.handlers;
// Provides these routes automatically:
//   POST /api/auth/start              — send OTP
//   POST /api/auth/verify             — verify OTP, create session
//   POST /api/auth/logout             — destroy session
//   GET  /api/auth/passkey/login-start
//   POST /api/auth/passkey/login-finish
//   POST /api/auth/passkey/register-start
//   POST /api/auth/passkey/register-finish
```

### 4. Optional: use built-in UI components

```svelte
<script>
	import { AuthFlow } from '@mrgnw/anahtar/components';
	import { goto } from '$app/navigation';
</script>

<AuthFlow onSuccess={() => goto('/')} />
```

Or build your own UI and call the API routes directly.

### 5. Project-specific user data

Anahtar owns the users table (`auth_users`). For project-specific fields, create a separate table:

```sql
CREATE TABLE user_profiles (
	user_id TEXT PRIMARY KEY REFERENCES auth_users(id),
	display_name TEXT,
	avatar_url TEXT,
	-- whatever your project needs
);
```

Access in your app:

```ts
// locals.user comes from anahtar (set by auth.handle)
const profile = db
  .prepare("SELECT * FROM user_profiles WHERE user_id = ?")
  .get(locals.user.id);
```

### 6. TypeScript: augment App.Locals

```ts
// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      user: { id: string; email: string } | null;
    }
  }
}
```

## What anahtar does NOT do

- **Send emails** — you provide `onSendOTP`, use whatever email service you want
- **Manage DB connections** — you pass in your existing `better-sqlite3` or `pg` instance
- **Own project-specific user data** — it only manages `id`, `email`, `created_at`
- **Handle OAuth** — email+OTP and passkeys only, by design

## Reference implementation

The `auth-rework` branch of [anani](https://github.com/mrgnw/anani) contains the original implementation this package is extracted from. Key files:

- `src/lib/server/auth.ts` — session + OTP logic
- `src/lib/server/passkey.ts` — WebAuthn logic
- `src/lib/server/hooks.ts` — session resolution
- `src/lib/server/db.ts` — SQLite setup + schema
- `src/routes/auth/+page.svelte` — auth UI (email → OTP → passkey flow)
- `src/routes/api/auth/` — all API route handlers

## Build / publish

- TypeScript, compiled to ESM
- Published to GitHub Packages as `@mrgnw/anahtar`
- Svelte components ship as `.svelte` source (compiled by the consuming project's bundler)
