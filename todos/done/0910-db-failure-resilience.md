---
branch: fix/db-failure-resilience
---

# anahtar: survive a transient DB failure

From a production anani sign-in failure: D1 returned `D1_ERROR: D1 DB is overloaded` while
anahtar was initialising, and the raw string was rendered inside the auth island. anani has
patched its own side (branch `debug-prod-login-add-logging`), but **three of the four causes
live here**, and one of them gets worse in the unpublished 0.1.0.

0.1.0 is already on npm. anani is the only known consumer and is still pinned to `0.0.30`,
so nobody is running the regression today — but that holds only as long as the pin does.
**Ship this as 0.1.1 before anani bumps.**

## 1. `ready` is poisoned forever by one failure — REGRESSION in 0.1.0

`src/lib/index.ts:29`

```ts
const ready = Promise.resolve().then(() => config.db.init());
```

One rejection and that promise stays rejected for the life of the module. Every consumer
path awaits it:

- `src/lib/kit/handle.ts:7` — **every request the host serves**, auth-related or not
- `src/lib/kit/handlers.ts:349,353` — both dispatchers

So a single transient DB error at cold start takes down every page in that isolate until it
recycles. In 0.0.30 the same failure was at least scoped to whatever called `createAuth`,
and a consumer could clear its own cache — anani's current fix does exactly that. **That fix
stops working on 0.1.0**, because the cache moved inside the library. So the upgrade would
silently delete a shipped production fix; anani's `getAuth` memo becomes decoration.

Lazy fix — make it retryable, keep `auth.ready` as a getter:

```ts
let ready: Promise<void> | undefined;
const ensureReady = () =>
	(ready ??= Promise.resolve()
		.then(() => config.db.init())
		.catch((e) => {
			ready = undefined; // next request retries instead of inheriting the failure
			throw e;
		}));
```

## 2. `createHandle` has no error handling

`src/lib/kit/handle.ts:6-12`. `await ready` or `validateSession` throwing rejects the host's
`handle` chain, so a DB blip 500s the page render. It should degrade to
`locals.user = null` and carry on — a database hiccup costs you the session, not the site.

anani wraps this in its own try/catch today (`src/hooks.server.ts`), which is a workaround
every consumer has to reinvent, and which cannot help when `await ready` is what fails.

## 3. `generateOTP` sits outside the only try in `/start`

`src/lib/kit/handlers.ts:107`. A DB failure there throws straight out of the route — nothing
in the handler catches it — into the consumer's `handleError` as an opaque 500. This is the
exact line the anani incident hit.

## 4. `onSendOTP`'s error message is rendered verbatim in the UI

`src/lib/kit/handlers.ts:111-113` returns `err.message` as `{ error }`, and `AuthPill`
renders it. Whatever a consumer's email path throws — or, in anani's case, a raw D1 error
string — lands in front of a user. Return `m.errorGeneric` and pass the original somewhere
the consumer can log it.

## 5. There is almost no logging

One `console.error` in the whole handlers file (`:272`, register-finish). Every other failure
returns JSON and vanishes. On Workers that means a consumer has nothing to query after an
incident — which is why the anani failure looked invisible for two weeks.

**One hook covers 2, 3, 4 and 5:** an optional `onError(scope, err, event)` in `AuthConfig`,
called at each catch site. anani would wire it straight to its `reportError()`. Default is a
`console.error` so the out-of-the-box story is still better than silence.

## 6. `init()` runs DDL on the request hot path — design call, not a bug

Five `CREATE TABLE IF NOT EXISTS` statements per isolate cold start, awaited by every
request. `PLAN.md:130` documents auto-create as a feature, so this is deliberate — but it
makes every consumer's auth availability depend on DDL succeeding. Worth considering
`init: false`, or a separately exported `migrate()` for consumers who already run migrations
(anani manages the `auth_*` tables through drizzle).

## Tests

Both belong in the unit config (`vitest.unit.ts`), with an adapter whose `init()` rejects
on first call:

- second `handle` invocation succeeds after the first `init()` fails — the item 1 regression
- `handle` sets `locals.user = null` and resolves when the DB throws, rather than rejecting
