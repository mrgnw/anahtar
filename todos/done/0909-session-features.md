---
branch: session-features
pull-request: 9
---

# anahtar: session features anani wants

Shipped candidate 1 as **explicit one-tap renewal** (PR #9, 0.2.0), not sliding renewal: sessions keep a fixed lifetime; `AuthPill` gets `session` + `renewBefore` props and shows a "Stay signed in" chip near expiry that runs a passkey login (which already rotates the session). No adapter or schema change. Design and the rejected sliding alternative are in `PLAN.md` ("Design: session renewal").

Also in the PR: `passkey/register-finish` rotates the session instead of extending it; locale files are `Partial<AuthMessages>` merged over `en`.

Remaining candidates moved to `session-features-remaining.md`.

## Original candidates
1. **Sliding renewal**: in `handle`, when `expiresAt - now < sessionDuration(method) / 2`, call `db.updateSessionExpiry` and re-set the cookie. Needs the method stored on the session row (new column `method TEXT`) or a single duration. — replaced by explicit renewal, see above.
2. **Logout everywhere**: `AuthDB.deleteSessionsForUser(userId)` (one SQL line per adapter) + `POST /api/auth/logout-all` + `auth.invalidateUserSessions(userId)`; expose in AuthPill's passkey panel or leave to consumers.
3. **Account deletion**: `AuthDB.deleteUser(userId)` cascading sessions/passkeys/otps; consumers delete their own rows first (anani: `user_preferences`, `translation_history` soft-delete, billing).
4. **Expired-row sweep**: `DELETE FROM auth_sessions WHERE expires_at < ?` + same for OTPs/challenges, exposed as `auth.sweep()` for a cron (anani has a daily `scheduled` handler in `worker.js`).
