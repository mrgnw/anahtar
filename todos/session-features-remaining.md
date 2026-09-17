---
branch: feat/logout-all-sweep
pull-request: 15
---

# anahtar: remaining session features

Left over from `done/0909-session-features.md` (renewal shipped in PR #9 / 0.2.0 with no adapter change). Each of these adds an `AuthDB` method, so each is a breaking adapter change: design in `PLAN.md` first, tests on sqlite, postgres and d1, changelog migration note for custom adapters (anani uses `d1Adapter`, unaffected).

## Candidates
1. ~~**Logout everywhere**~~: shipped in 0.3.0 as `AuthDB.deleteSessionsForUser(userId)` + `POST /api/auth/logout-all` + `auth.invalidateUserSessions(userId)`. AuthPill unchanged; consumers wire the endpoint.
2. **Account deletion**: `AuthDB.deleteUser(userId)` cascading sessions/passkeys/otps; consumers delete their own rows first (anani: `user_preferences`, `translation_history` soft-delete, billing). Deferred from 0.3.0: no schema has `ON DELETE CASCADE`, so it needs a per-adapter delete order, and no consumer has asked for it.
3. ~~**Expired-row sweep**~~: shipped in 0.3.0 as `AuthDB.deleteExpired(now)` + `auth.sweep()`. `docs/security.md` now points at `auth.sweep()` from a cron. anani follow-up: add `ctx.waitUntil(d1Adapter(env.DB).deleteExpired(Date.now()))` to the `scheduled` handler in `worker.js`.
