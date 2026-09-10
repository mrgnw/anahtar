# Changelog

## 0.2.0

Session renewal, locales on demand, PasskeyPrompt on tap. No adapter changes; custom `AuthDB` implementations need nothing.

### Breaking

- `locales` (the eager `Record<string, AuthMessages>`) is gone from `./i18n` and `./components`; use `localeCodes: string[]` for the list and `loadMessages(locale)` to fetch one. The full table still exists server-side in `./dist/i18n/server.js`.
- `PasskeyPrompt` no longer auto-starts registration when its countdown ends, and the `countdownSeconds` prop is gone. WebKit requires transient user activation for `navigator.credentials.create()`, so the timer path failed silently on Safari and iOS. Registration now starts only from a tap on the ring or the "Add passkey now" button; the ring is static.
- i18n: `passkeyCreating` is renamed `passkeyTitle` and re-worded from a progress line to a question ("Making you a passkey" → "Add a passkey?") in all 88 locales, since nothing is created until the user taps. Custom `AuthMessages` and `resolveMessages` overrides must rename the key.

### Added

- `AuthPill`: `session` (`{ expiresAt }`, pass `locals.session`) and `renewBefore` (ms, default 10 days) props. Inside the window, a user with a passkey sees a "Stay signed in" chip; one tap runs a passkey login, which mints a fresh full-length session and calls `onSuccess`. No passkey, no chip: the session lapses and the normal sign-in is the renewal.
- `SessionRenew` component: the same chip on its own, for apps that render their own signed-in header. `AuthPill` uses it internally.
- `AuthMessages.staySignedIn`. Locale files are `Partial<AuthMessages>` merged over English, so a string without a translation falls back instead of failing to type-check.

### Changed

- Registering a passkey on an existing session replaces it with a passkey-length session instead of extending it in place: the token rotates and the cookie is re-set in the same response.

### Performance

- Locales load on demand. A page rendering `AuthPill` used to ship 139,971 raw / 46,636 gzipped bytes of client JS; it now ships 34,055 / 12,013 — 34.6 KB gzipped less. `en` stays in the initial chunk, the detected locale arrives as a ~1 KB (0.5 KB gzipped) chunk on mount, so first paint is English until it lands.

## 0.1.1

Survive a transient database failure. No breaking changes.

### Fixed

- `db.init()` is retried on the next request instead of poisoning the isolate. In 0.1.0 one rejection left `ready` rejected for the life of the module, and since `handle` awaits it on every request, a single transient DB error 500'd every page until the isolate recycled.
- `handle` no longer takes the page down when the database is unavailable: it sets `locals.user`/`locals.session` to `null`, reports through `onError`, and resolves the request signed out.
- `/start` catches a failing `generateOTP` (it sat outside the only `try`, so a DB error threw straight into the consumer's `handleError`) and returns the localized generic message with status 500.
- `onSendOTP` errors return the localized `errorGeneric` instead of `err.message`, which `AuthPill` rendered verbatim in front of the user.

### Added

- `AuthConfig.onError(scope, err, event?)`, called for the `'handle'`, `'otp-create'`, `'otp-send'` and `'passkey-register'` failures. Defaults to `console.error`; the `AuthErrorScope` type is exported.

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
