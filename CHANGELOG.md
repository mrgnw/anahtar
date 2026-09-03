# Changelog

## 0.1.0

Security review release. Breaking changes are marked.

### Security

- OTP attempts are counted atomically in the database before the code is compared; concurrent `/verify` requests can no longer exceed `otpMaxAttempts` (Postgres and D1 were affected).
- Passkey registration and login require user verification.
- OTP codes may start with `0` (full digit space) and are compared in constant time.
- Email is validated and normalized (`parseEmail`) before `onSendOTP` and the adapters see it.
- `register-finish` no longer returns internal `reason` text; `login-finish` validates the body shape (400 instead of 500); passkey names are capped at 64 chars.
- WebAuthn challenges are consumed with a single `DELETE ... RETURNING`.
- A new sign-in invalidates the session named by the incoming cookie.
- `Accept-Language: constructor` no longer blanks every message (own-property lookups).
- New `docs/security.md`: the rate limiting you must add, proxies, CSRF, the enumeration tradeoff.

### Breaking

- `createAuth()` is synchronous. `db.init()` starts immediately; `handle` and the handlers await it; `auth.ready` is the same promise. `await createAuth(...)` keeps working; `Awaited<ReturnType<typeof createAuth>>` becomes the exported `Auth`.
- `AuthDB`: `updateOTPAttempts(id, n)` is replaced by `incrementOTPAttempts(id): number | null`; new `updateSessionExpiry(tokenHash, expiresAt)`. Custom adapters must implement both.
- `AuthConfig.tablePrefix` removed (it never did anything); pass `{ tablePrefix }` to the adapter.
- The root entry `@mrgnw/anahtar` is server-only. `guessDeviceName`, `resolveMessages`, `detectLocaleClient` and `locales` moved to `./device` and `./i18n` (still re-exported from `./components`).
- sqlite and d1 adapters return `createdAt` in milliseconds (was seconds).
- `AuthPill`: the passkey panel is always available (built-in `passkey/list`); sign-out POSTs `logout` itself, then calls `onSignOut`.

### Added

- `@mrgnw/anahtar/client`: `createAuthClient()` with `sendCode`, `verifyCode`, `logout`, `passkeyLogin`, `passkeyRegister`, `passkeyList`, `passkeyRemove`, `skipPasskeyPrompt`, `passkeyCancel`; errors are `AuthError { message, status }`.
- `event.locals.session = { id, expiresAt } | null` and the `AuthLocals` type.
- `sessionDuration` may be `(method: 'otp' | 'passkey') => number`; registering a passkey extends the current session to the passkey duration.
- `/start` returns `otpLength`; `AuthFlow` and `AuthPill` size the input from it. `OtpInput` gains `--anahtar-otp-*` size variables.
- `auth.listPasskeys(userId)`, and the `Auth` and `SessionMethod` types.
