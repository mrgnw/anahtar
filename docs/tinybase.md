# TinyBase adapter

Use anahtar with a [TinyBase](https://tinybase.org) store as the auth database. Auth data lives in TinyBase tables alongside your app state — if you're syncing a `MergeableStore` to a Durable Object or another backend, auth state syncs through the same pipeline automatically.

## Install

```sh
pnpm add @mrgnw/anahtar tinybase
```

## Basic setup

Pass any TinyBase `Store` (or `MergeableStore`) to `tinybaseAdapter`:

```ts
import { createAuth } from '@mrgnw/anahtar';
import { tinybaseAdapter } from '@mrgnw/anahtar/tinybase';
import { createStore } from 'tinybase';

const store = createStore();

export const auth = createAuth({
  db: tinybaseAdapter(store),
  onSendOTP: async (email, code) => {
    console.log(`OTP for ${email}: ${code}`);
  },
});
```

`db.init()` (called internally by `createAuth`) sets up indexes. Tables are created implicitly by TinyBase on first write — no `CREATE TABLE` needed.

## With MergeableStore + Cloudflare Durable Objects

The main use case: auth state syncs through the same `MergeableStore` as your app state, persisted in a Durable Object.

```ts
// src/lib/server/auth.ts
import { createAuth } from '@mrgnw/anahtar';
import { tinybaseAdapter } from '@mrgnw/anahtar/tinybase';
import { createMergeableStore } from 'tinybase';
import { createDurableObjectSqlStoragePersister } from 'tinybase/persisters/persister-durable-object-sql-storage';

type Auth = Awaited<ReturnType<typeof createAuth>>;

let _auth: Auth | null = null;

export async function getAuth(storage: DurableObjectStorage): Promise<Auth> {
  if (_auth) return _auth;

  const store = createMergeableStore();
  const persister = createDurableObjectSqlStoragePersister(store, storage.sql);
  await persister.load();
  await persister.startAutoSave();

  _auth = await createAuth({
    db: tinybaseAdapter(store),
    rpName: 'myapp',
    onSendOTP: async (email, code) => {
      // send via your email provider
      console.log(`OTP for ${email}: ${code}`);
    },
  });

  return _auth;
}
```

```ts
// src/hooks.server.ts
import { getAuth } from '$lib/server/auth';

export const handle = async ({ event, resolve }) => {
  const auth = await getAuth(event.platform!.env.MY_DO.state.storage);
  return auth.handle({ event, resolve });
};
```

## Tables created in TinyBase

The adapter uses 5 tables (prefix `auth_` by default):

| Table | Row ID | Cells |
|---|---|---|
| `auth_users` | user UUID | `email`, `skip_passkey_prompt`, `created_at` |
| `auth_sessions` | token hash | `user_id`, `expires_at`, `created_at` |
| `auth_otp_codes` | OTP UUID | `email`, `code`, `attempts`, `expires_at`, `created_at` |
| `auth_passkeys` | passkey UUID | `user_id`, `credential_id`, `public_key`, `counter`, `transports`, `name`, `created_at` |
| `auth_challenges` | challenge string | `user_id`, `expires_at`, `created_at` |

These live alongside your application tables in the same store. There is no schema conflict as long as your app doesn't use `auth_`-prefixed table names.

### Custom prefix

```ts
tinybaseAdapter(store, { tablePrefix: 'myapp_' })
// → myapp_users, myapp_sessions, etc.
```

## How it differs from SQL adapters

**No migrations.** TinyBase tables are created on first write. New columns aren't an issue — rows are flexible objects. Schema upgrades between anahtar versions require no ALTER TABLE.

**publicKey stored as base64.** TinyBase cells are `string | number | boolean`. `Uint8Array` (passkey public keys) is encoded to base64 on write and decoded on read. This is transparent — `PasskeyRecord.publicKey` is always a `Uint8Array`.

**Synchronous.** TinyBase's in-memory API is synchronous, so all adapter methods return values directly (no `Promise`). This is valid because `AuthDB` methods are typed as `MaybePromise<T>`.

**Indexes.** The adapter creates 4 TinyBase indexes on `init()` for non-PK lookups:

| Index | Table | Cell | Used by |
|---|---|---|---|
| `email_to_user` | `auth_users` | `email` | `getUserByEmail` |
| `email_to_otp` | `auth_otp_codes` | `email` | `getLatestOTP`, `deleteOTPsForEmail` |
| `credential_to_passkey` | `auth_passkeys` | `credential_id` | `getPasskeyByCredentialId` |
| `user_to_passkey` | `auth_passkeys` | `user_id` | `getUserPasskeys` |

These are in-memory index structures maintained by TinyBase's `Indexes` module. They persist as part of the store data.

## Wire into SvelteKit

Same as any other adapter — anahtar's SvelteKit integration is adapter-agnostic:

```ts
// src/hooks.server.ts
import { auth } from '$lib/server/auth';
export const handle = auth.handle;
```

```ts
// src/routes/api/auth/[...path]/+server.ts
import { auth } from '$lib/server/auth';
export const { GET, POST } = auth.handlers;
```

See [integration.md](./integration.md) for full SvelteKit wiring, UI components, and configuration options.
