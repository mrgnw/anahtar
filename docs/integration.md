# Integration guide

## Install

```sh
pnpm add @mrgnw/anahtar
```

## Pick an adapter

Anahtar doesn't bundle a database driver — you provide your own.

### SQLite (Node.js / self-hosted)

```sh
pnpm add better-sqlite3
```

```ts
// src/lib/server/auth.ts
import { createAuth } from '@mrgnw/anahtar';
import { sqliteAdapter } from '@mrgnw/anahtar/sqlite';
import Database from 'better-sqlite3';

const db = new Database('data/app.db');

export const auth = createAuth({
  db: sqliteAdapter(db),
  onSendOTP: async (email, code) => {
    console.log(`[dev] OTP for ${email}: ${code}`);
  },
});
```

### Cloudflare D1

```ts
// src/lib/server/auth.ts
import { createAuth } from '@mrgnw/anahtar';
import { d1Adapter } from '@mrgnw/anahtar/d1';

type Auth = Awaited<ReturnType<typeof createAuth>>;
let _auth: Auth | null = null;
let _initPromise: Promise<Auth> | null = null;

export async function getAuth(env: App.Platform['env']): Promise<Auth> {
  if (_auth) return _auth;
  if (_initPromise) return _initPromise;
  _initPromise = createAuth({
    db: d1Adapter(env.DB),
    rpName: 'myapp',
    onSendOTP: async (email, code) => {
      console.log(`[dev] OTP for ${email}: ${code}`);
    },
  });
  _auth = await _initPromise;
  return _auth;
}
```

`wrangler.jsonc` — bind your D1 database and enable `nodejs_als`:

```jsonc
{
  "compatibility_flags": ["nodejs_als", "nodejs_compat"],
  "d1_databases": [
    { "binding": "DB", "database_name": "my-db", "database_id": "..." }
  ]
}
```

### PostgreSQL

```sh
pnpm add pg
```

```ts
import { createAuth } from '@mrgnw/anahtar';
import { postgresAdapter } from '@mrgnw/anahtar/postgres';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export const auth = createAuth({
  db: postgresAdapter(pool),
  onSendOTP: async (email, code) => {
    await sendEmail(email, code);
  },
});
```

---

## Wire into SvelteKit

Two files regardless of which adapter you use:

```ts
// src/hooks.server.ts
import { auth } from '$lib/server/auth';

export const handle = auth.handle;
// Sets event.locals.user = { id, email } | null on every request
```

For Cloudflare Workers where `auth` is async:

```ts
// src/hooks.server.ts
import { getAuth } from '$lib/server/auth';

export const handle = async ({ event, resolve }) => {
  const auth = await getAuth(event.platform!.env);
  return auth.handle({ event, resolve });
};
```

```ts
// src/routes/api/auth/[...path]/+server.ts
import { auth } from '$lib/server/auth';

export const { GET, POST } = auth.handlers;
```

This provides these routes:

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

`POST /api/auth/verify` response:

```json
{ "user": { "id": "...", "email": "..." }, "hasPasskey": false, "skipPasskeyPrompt": false }
```

Use `hasPasskey` and `skipPasskeyPrompt` to decide whether to show the passkey onboarding prompt after login.

---

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

---

## Further reading

| Doc | What's in it |
|-----|-------------|
| [components.md](./components.md) | AuthFlow, AuthPill, OtpInput, PasskeyPrompt, theming, i18n |
| [configuration.md](./configuration.md) | Full config reference, table prefix, migrations, email providers |
| [sveltekit-patterns.md](./sveltekit-patterns.md) | Reactive user store, route-based panels, passkey management UI |

---

## What anahtar does NOT do

- **Send emails** — you provide `onSendOTP`
- **Manage DB connections** — you pass in your own driver instance
- **Own project-specific user data** — only `id`, `email`, `created_at`
- **Handle OAuth** — email+OTP and passkeys only
- **Run database migrations** — see [configuration.md](./configuration.md#database-migrations)
