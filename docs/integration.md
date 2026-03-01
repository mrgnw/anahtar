# Integration guide

## Install

```sh
pnpm add @mrgnw/anahtar
```

You also need a database driver — anahtar doesn't bundle one:

```sh
pnpm add better-sqlite3        # SQLite
# or
pnpm add pg                    # PostgreSQL
```

## Create auth instance

One file wires everything together:

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
    // in prod: send via your email service
    console.log(`[dev] OTP for ${email}: ${code}`);
  },
});
```

For Cloudflare Workers + D1:

```ts
// src/lib/server/auth.ts
import { createAuth } from "@mrgnw/anahtar";
import { d1Adapter } from "@mrgnw/anahtar/d1";

type Auth = Awaited<ReturnType<typeof createAuth>>;

let _auth: Auth | null = null;
let _initPromise: Promise<Auth> | null = null;

export async function getAuth(env: App.Platform["env"]): Promise<Auth> {
  if (_auth) return _auth;
  if (_initPromise) return _initPromise;

  _initPromise = createAuth({
    db: d1Adapter(env.DB),
    rpName: "myapp",
    cookie: "myapp_session",
    onSendOTP: async (email, code) => {
      const apiKey = env.EMAIL_API_KEY;
      if (!apiKey) {
        console.log(`[dev] OTP for ${email}: ${code}`);
        return;
      }
      // send via your email provider in prod
      await sendEmail(email, code, apiKey);
    },
  });
  _auth = await _initPromise;
  return _auth;
}
```

```ts
// src/hooks.server.ts
import { getAuth } from "$lib/server/auth";

export const handle = async ({ event, resolve }) => {
  const auth = await getAuth(event.platform!.env);
  return auth.handle({ event, resolve });
};
```

```ts
// src/routes/api/auth/[...path]/+server.ts
import { getAuth } from "$lib/server/auth";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
  const auth = await getAuth(event.platform!.env);
  return auth.handlers.GET(event);
};

export const POST: RequestHandler = async (event) => {
  const auth = await getAuth(event.platform!.env);
  return auth.handlers.POST(event);
};
```

`wrangler.jsonc` must include `nodejs_als` and bind your D1 database:

```jsonc
{
  "compatibility_flags": ["nodejs_als", "nodejs_compat"],
  "d1_databases": [
    { "binding": "DB", "database_name": "my-db", "database_id": "..." },
  ],
}
```

For Postgres:

```ts
import { postgresAdapter } from "@mrgnw/anahtar/postgres";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export const auth = createAuth({
  db: postgresAdapter(pool),
  onSendOTP: async (email, code) => {
    await sendEmail(email, `Your code: ${code}`);
  },
});
```

Tables are created automatically on first use via `db.init()`.

## Wire into SvelteKit

Two files:

```ts
// src/hooks.server.ts
import { auth } from "$lib/server/auth";

export const handle = auth.handle;
// Reads the session cookie, resolves the user,
// sets event.locals.user = { id, email } | null
```

```ts
// src/routes/api/auth/[...path]/+server.ts
import { auth } from "$lib/server/auth";

export const { GET, POST } = auth.handlers;
```

This provides:

| Method | Route                               | Purpose                         |
| ------ | ----------------------------------- | ------------------------------- |
| POST   | `/api/auth/start`                   | Send OTP                        |
| POST   | `/api/auth/verify`                  | Verify OTP, create session      |
| POST   | `/api/auth/logout`                  | Destroy session                 |
| POST   | `/api/auth/passkey/check-email`     | Check if email has passkeys     |
| GET    | `/api/auth/passkey/login-start`     | Begin passkey login             |
| POST   | `/api/auth/passkey/login-finish`    | Complete passkey login          |
| POST   | `/api/auth/passkey/register-start`  | Begin passkey registration      |
| POST   | `/api/auth/passkey/register-finish` | Complete passkey registration   |
| POST   | `/api/auth/passkey/remove`          | Remove a passkey                |
| POST   | `/api/auth/skip-passkey`            | Skip passkey prompt permanently |

### Verify response

`POST /api/auth/verify` returns:

```json
{
  "user": { "id": "...", "email": "..." },
  "hasPasskey": false,
  "skipPasskeyPrompt": false
}
```

Use `hasPasskey` and `skipPasskeyPrompt` to decide whether to show the passkey onboarding prompt after login.

## UI components (optional)

Anahtar ships four Svelte components. All are optional — you can build your own UI and call the API routes directly.

### AuthFlow — full-page auth

The complete email → OTP → passkey onboarding → success flow:

```svelte
<script>
  import { AuthFlow } from '@mrgnw/anahtar/components';
  import { goto } from '$app/navigation';
</script>

<AuthFlow onSuccess={() => goto('/')} />
```

AuthFlow handles everything: email input with conditional WebAuthn (passkey autofill), OTP verification with resend, passkey registration countdown, and success confirmation.

Props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiBase` | `string` | `'/api/auth'` | Base path for auth API routes |
| `locale` | `string` | auto-detected | Language code (e.g. `'fr'`, `'ja'`) |
| `messages` | `Partial<AuthMessages>` | — | Override specific UI strings |
| `onSuccess` | `() => void` | — | Called after successful login |

### AuthPill — compact inline auth

A pill-shaped auth component for floating islands, headers, or inline placement. Handles sign-in, OTP, passkey onboarding, passkey management, and sign-out in a compact form factor.

```svelte
<script>
  import { AuthPill } from '@mrgnw/anahtar/components';
  import { invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';

  let user = $derived($page.data.user);
</script>

<AuthPill
  {user}
  onSuccess={() => invalidateAll()}
  onSignOut={async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    invalidateAll();
  }}
/>
```

With passkey management (lets the user view, add, and remove passkeys):

```svelte
<AuthPill
  {user}
  onSuccess={() => invalidateAll()}
  onSignOut={async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    invalidateAll();
  }}
  getPasskeys={async () => {
    const res = await fetch('/api/passkeys');
    return res.json();
  }}
/>
```

Props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiBase` | `string` | `'/api/auth'` | Base path for auth API routes |
| `user` | `{ email: string } \| null` | `null` | Current user — controls signed-in vs signed-out state |
| `locale` | `string` | auto-detected | Language code (e.g. `'es'`, `'de'`) |
| `messages` | `Partial<AuthMessages>` | — | Override specific UI strings |
| `onSuccess` | `() => void` | — | Called after successful sign-in |
| `onSignOut` | `() => void` | — | Called when user clicks sign out (you handle the fetch) |
| `onPasskeysChange` | `() => void` | — | Called after a passkey is added or removed |
| `getPasskeys` | `() => Promise<PasskeyInfo[]>` | — | If provided, enables passkey management panel |

`PasskeyInfo` shape: `{ id: string; credentialId?: string; name?: string | null; createdAt?: number }`

### PasskeyPrompt — passkey onboarding

Standalone passkey registration prompt with animated countdown ring:

```svelte
<script>
  import { PasskeyPrompt, resolveMessages } from '@mrgnw/anahtar/components';
  const m = resolveMessages('en');
</script>

<PasskeyPrompt
  {m}
  onRegister={async () => {
    // call passkey/register-start + register-finish
  }}
  onSkip={() => {
    fetch('/api/auth/skip-passkey', { method: 'POST' });
  }}
/>
```

- 5-second countdown with radial progress ring, then auto-triggers registration
- Click the ring to register immediately (skips timer)
- Falls back to manual "Add passkey" / "Maybe later" on failure
- `countdownSeconds` prop to customize timing

### OtpInput — OTP digit boxes

Standalone OTP input with auto-advance, backspace navigation, and paste support:

```svelte
<script>
  import { OtpInput } from '@mrgnw/anahtar/components';
</script>

<OtpInput
  length={5}
  onComplete={(code) => verifyOtp(code)}
/>
```

### Building your own UI

If you prefer full control, call the API routes directly:

```ts
// Send OTP
const res = await fetch("/api/auth/start", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email }),
});

// Verify OTP
const res = await fetch("/api/auth/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, code }),
});
const { hasPasskey, skipPasskeyPrompt } = await res.json();

// Logout
await fetch("/api/auth/logout", { method: "POST" });
```

#### Conditional WebAuthn (passkey autofill)

To offer instant passkey login when the page loads (before the user types anything):

```ts
import { startAuthentication } from "@simplewebauthn/browser";

async function tryConditionalWebAuthn() {
  const res = await fetch("/api/auth/passkey/login-start");
  if (!res.ok) return;
  const options = await res.json();
  const abort = new AbortController();

  const authResponse = await startAuthentication({
    optionsJSON: options,
    useBrowserAutofill: true, // enables conditional mediation
  });

  const verifyRes = await fetch("/api/auth/passkey/login-finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(authResponse),
  });
  if (verifyRes.ok) {
    // user is logged in
  }
}
```

This requires `autocomplete="username webauthn"` on your email input. The browser will show saved passkeys in the autofill dropdown.

#### Passkey-first login (check before OTP)

When a user submits their email, check for existing passkeys first:

```ts
const checkRes = await fetch("/api/auth/passkey/check-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email }),
});

if (checkRes.ok) {
  const opts = await checkRes.json();
  if (opts.allowCredentials?.length > 0) {
    // user has passkeys — try passkey auth first
    const authResp = await startAuthentication({ optionsJSON: opts });
    // ... verify with passkey/login-finish
  }
}

// fall through to OTP if no passkeys or user cancelled
```

### Theming

Components use CSS custom properties. AuthFlow uses the base set, AuthPill has additional pill-specific vars:

```css
:root {
  /* Shared (AuthFlow, OtpInput, PasskeyPrompt) */
  --anahtar-bg: transparent;
  --anahtar-fg: inherit;
  --anahtar-border: #d1d5db;
  --anahtar-ring: #3b82f6;
  --anahtar-primary: #3b82f6;
  --anahtar-primary-fg: #fff;
  --anahtar-error: #ef4444;

  /* AuthPill-specific */
  --anahtar-pill-bg: rgba(255, 255, 255, 0.9);
  --anahtar-pill-fg: #374151;
  --anahtar-pill-border: rgba(0, 0, 0, 0.06);
  --anahtar-pill-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  --anahtar-pill-icon: #6b7280;
  --anahtar-pill-sep: rgba(0, 0, 0, 0.2);
  --anahtar-pill-placeholder: #9ca3af;
}
```

## Localization (optional)

All components auto-detect the browser locale and show UI strings in the user's language. 88 locales are bundled (every language with 5M+ speakers).

Default behavior (no config needed):

```svelte
<!-- Automatically uses navigator.language -->
<AuthFlow onSuccess={() => goto('/')} />
```

Force a specific locale:

```svelte
<AuthFlow locale="fr" onSuccess={() => goto('/')} />
<AuthPill locale="ja" {user} onSuccess={() => invalidateAll()} />
```

Override specific strings:

```svelte
<AuthFlow
  messages={{ continue: 'Sign in', emailPlaceholder: 'you@company.com' }}
  onSuccess={() => goto('/')}
/>
```

### Using i18n in your own UI

```ts
import { resolveMessages, detectLocaleClient, locales } from '@mrgnw/anahtar/components';

// Auto-detect + resolve
const m = resolveMessages(detectLocaleClient());
// → m.continue, m.emailPlaceholder, m.errorInvalidCode, etc.

// Specific locale with overrides
const m = resolveMessages('de', { continue: 'Anmelden' });

// Server-side detection (in +page.server.ts or hooks)
import { detectLocaleServer } from '@mrgnw/anahtar';
const locale = detectLocaleServer(event.request); // reads Accept-Language header

// List all available locale codes
Object.keys(locales); // ['af', 'ak', 'am', 'ar', ..., 'zh', 'zu']
```

The `AuthMessages` type defines all 34 translatable strings — see `src/lib/i18n/types.ts` for the full interface.

## Utilities (optional)

### guessDeviceName

Generates a human-readable name for a passkey from the user agent string:

```ts
import { guessDeviceName } from '@mrgnw/anahtar/components';
// or
import { guessDeviceName } from '@mrgnw/anahtar';

guessDeviceName(); // "Chrome on macOS"
guessDeviceName(customUA); // pass a UA string directly
```

The built-in components use this automatically when registering passkeys.

## TypeScript

Augment `App.Locals` so `event.locals.user` is typed:

```ts
// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      user: { id: string; email: string } | null;
    }
  }
}

export {};
```

## Configuration

```ts
interface AuthConfig {
  db: AuthDB;
  rpName?: string; // WebAuthn relying party name (default: 'App')
  tablePrefix?: string; // default: 'auth_' — set to '' for no prefix
  cookie?: string; // default: 'session'
  sessionDuration?: number; // default: 30 days (ms)
  otpExpiry?: number; // default: 30 min (ms)
  otpLength?: number; // default: 5 digits
  otpMaxAttempts?: number; // default: 5
  onSendOTP: (email: string, code: string) => Promise<void>;
}
```

### Table prefix

All tables use the prefix (default `auth_`):

| Default           | With `tablePrefix: 'myapp_'` |
| ----------------- | ---------------------------- |
| `auth_users`      | `myapp_users`                |
| `auth_sessions`   | `myapp_sessions`             |
| `auth_otp_codes`  | `myapp_otp_codes`            |
| `auth_passkeys`   | `myapp_passkeys`             |
| `auth_challenges` | `myapp_challenges`           |

If you set `tablePrefix: ''`, tables are `users`, `sessions`, etc.

### WebAuthn origin

`rpID` and `origin` are derived from the request URL at runtime. Override for production with the `ORIGIN` env var. No hardcoded hostnames — works on any port in dev.

**Important**: Passkeys are bound to the `rpID` (hostname). A passkey created on `preview.example.com` will not work on `example.com`. Use a consistent domain for production.

## Database migrations

Tables are created with `CREATE TABLE IF NOT EXISTS` on first `db.init()` call. This means:

**If the schema changes between anahtar versions, existing tables keep the old schema.** `CREATE TABLE IF NOT EXISTS` is a no-op when the table already exists.

Check the changelog when upgrading. If a column was added (e.g. `skip_passkey_prompt` in v0.0.14), you need to add it manually:

```sql
-- D1 / SQLite
ALTER TABLE auth_users ADD COLUMN skip_passkey_prompt INTEGER DEFAULT 0;

-- Postgres
ALTER TABLE auth_users ADD COLUMN skip_passkey_prompt INTEGER DEFAULT 0;
```

For D1 specifically, run:

```sh
npx wrangler d1 execute my-db --remote --command "ALTER TABLE auth_users ADD COLUMN skip_passkey_prompt INTEGER DEFAULT 0"
```

## Project-specific user data

Anahtar owns the users table (`auth_users`: `id`, `email`, `created_at`, `skip_passkey_prompt`). For project-specific fields, create a separate table:

```sql
CREATE TABLE user_profiles (
  user_id TEXT PRIMARY KEY REFERENCES auth_users(id),
  display_name TEXT,
  avatar_url TEXT
);
```

Access in your app:

```ts
const profile = db
  .prepare("SELECT * FROM user_profiles WHERE user_id = ?")
  .get(locals.user.id);
```

## What anahtar does NOT do

- **Send emails** — you provide `onSendOTP`
- **Manage DB connections** — you pass in your own driver instance
- **Own project-specific user data** — only `id`, `email`, `created_at`
- **Handle OAuth** — email+OTP and passkeys only
- **Run database migrations** — see [Database migrations](#database-migrations)
