---
---

# anahtar: remaining session features

Left over from `done/0909-session-features.md` (renewal shipped in PR #9 / 0.2.0 with no adapter change). Each of these adds an `AuthDB` method, so each is a breaking adapter change: design in `PLAN.md` first, tests on sqlite, postgres and d1, changelog migration note for custom adapters (anani uses `d1Adapter`, unaffected).

## Candidates
1. **Logout everywhere**: `AuthDB.deleteSessionsForUser(userId)` (one SQL line per adapter) + `POST /api/auth/logout-all` + `auth.invalidateUserSessions(userId)`; expose in AuthPill's passkey panel or leave to consumers.
2. **Account deletion**: `AuthDB.deleteUser(userId)` cascading sessions/passkeys/otps; consumers delete their own rows first (anani: `user_preferences`, `translation_history` soft-delete, billing).
3. **Expired-row sweep**: `DELETE FROM auth_sessions WHERE expires_at < ?` + same for OTPs/challenges, exposed as `auth.sweep()` for a cron (anani has a daily `scheduled` handler in `worker.js`). `docs/security.md` currently tells consumers to run the DELETE themselves.

Bundle 1 and 3 in one minor bump if picked together: same adapter surface, both one SQL line per adapter.
