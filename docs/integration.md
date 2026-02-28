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
import type { D1Database } from "@cloudflare/workers-types";

let _auth: ReturnType<typeof createAuth> | null = null;

export function getAuth(db: D1Database) {
  if (!_auth) {
    _auth = createAuth({
      db: d1Adapter(db),
      onSendOTP: async (email, code) => {
        // use your email provider — example: Lettermint
        await fetch("https://app.lettermint.co/api/transactional", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.LETTERMINT_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: email,
            from: "noreply@example.com",
            template_id: "YOUR_TEMPLATE_ID",
            variables: { code },
          }),
        });
      },
    });
  }
  return _auth;
}
```

```ts
// src/hooks.server.ts
import { getAuth } from "$lib/server/auth";

export const handle = async ({ event, resolve }) => {
  const auth = getAuth(event.platform!.env.DB);
  return auth.handle({ event, resolve });
};
```

```ts
// src/routes/api/auth/[...path]/+server.ts
import { getAuth } from "$lib/server/auth";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async (event) => {
  const auth = getAuth(event.platform!.env.DB);
  return auth.handlers.GET(event);
};

export const POST: RequestHandler = async (event) => {
  const auth = getAuth(event.platform!.env.DB);
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

> **D1 gotcha**: if you previously had an `auth_challenges` table with a different schema (e.g. a `challenge_type` column), `CREATE TABLE IF NOT EXISTS` will silently no-op and use the stale schema. Drop and recreate it.

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

| Method | Route                               | Purpose                       |
| ------ | ----------------------------------- | ----------------------------- |
| POST   | `/api/auth/start`                   | Send OTP                      |
| POST   | `/api/auth/verify`                  | Verify OTP, create session    |
| POST   | `/api/auth/logout`                  | Destroy session               |
| GET    | `/api/auth/passkey/login-start`     | Begin passkey login           |
| POST   | `/api/auth/passkey/login-finish`    | Complete passkey login        |
| POST   | `/api/auth/passkey/register-start`  | Begin passkey registration    |
| POST   | `/api/auth/passkey/register-finish` | Complete passkey registration |
| POST   | `/api/auth/skip-passkey`            | Skip passkey prompt           |

## UI components (optional)

Drop in the full auth flow:

```svelte
<script>
  import { AuthFlow } from '@mrgnw/anahtar/components';
  import { goto } from '$app/navigation';
</script>

<AuthFlow onSuccess={() => goto('/')} />
```

Or build your own UI and call the API routes directly.

### Theming

Components use CSS custom properties:

```css
:root {
  --anahtar-bg: transparent;
  --anahtar-fg: inherit;
  --anahtar-border: #d1d5db;
  --anahtar-ring: #3b82f6;
  --anahtar-primary: #3b82f6;
  --anahtar-primary-fg: #fff;
  --anahtar-error: #ef4444;
}
```

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
```

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

All tables use the prefix (default `auth_`):

| Default           | With `tablePrefix: 'myapp_'` |
| ----------------- | ---------------------------- |
| `auth_users`      | `myapp_users`                |
| `auth_sessions`   | `myapp_sessions`             |
| `auth_otp_codes`  | `myapp_otp_codes`            |
| `auth_passkeys`   | `myapp_passkeys`             |
| `auth_challenges` | `myapp_challenges`           |

### WebAuthn origin

`rpID` and `origin` are derived from the request URL at runtime. Override for production with the `ORIGIN` env var. No hardcoded hostnames — works on any port in dev.

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
