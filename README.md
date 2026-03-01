# @mrgnw/anahtar

> **Pre-alpha.** API may change between releases.

Auth for SvelteKit. Email+OTP + optional passkeys.

"Anahtar" = key (Turkish)

## Auth flow

1. Email -> OTP sent via your `onSendOTP` callback
2. OTP verified -> session cookie
3. First login -> passkey registration prompt
4. Future logins -> passkey autofill, OTP fallback

## Quick start

```sh
pnpm add @mrgnw/anahtar
```

Create your auth instance:

```ts
// src/lib/server/auth.ts
import { createAuth } from "@mrgnw/anahtar";
import { sqliteAdapter } from "@mrgnw/anahtar/sqlite";
import Database from "better-sqlite3";

const db = new Database("data/app.db");

export const auth = createAuth({
  db: sqliteAdapter(db),
  onSendOTP: async (email, code) => {
    console.log(`[dev] OTP for ${email}: ${code}`);
  },
});
```

Wire into SvelteKit:

```ts
// src/hooks.server.ts
import { auth } from "$lib/server/auth";
export const handle = auth.handle;
```

```ts
// src/routes/api/auth/[...path]/+server.ts
import { auth } from "$lib/server/auth";
export const { GET, POST } = auth.handlers;
```

Optional UI components:

```svelte
<!-- Full-page auth flow -->
<script>
  import { AuthFlow } from '@mrgnw/anahtar/components';
  import { goto } from '$app/navigation';
</script>

<AuthFlow onSuccess={() => goto('/')} />
```

```svelte
<!-- Compact inline pill (for headers, floating islands) -->
<script>
  import { AuthPill } from '@mrgnw/anahtar/components';
  import { invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  let user = $derived($page.data.user);
</script>

<AuthPill {user} onSuccess={() => invalidateAll()} />
```

All components auto-detect locale (88 languages). Override with `locale="fr"` or `messages={{ continue: 'Go' }}`.

## Tests

68 tests: 46 unit (node) + 22 component (happy-dom).

```sh
pnpm test:unit
pnpm test:browser
pnpm test
```

## Docs

- [Integration guide](docs/integration.md) — install, config, components, i18n, theming, DB adapters
- [PLAN.md](PLAN.md) — architecture, DB adapter interface, test setup
