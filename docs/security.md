# Security notes

What anahtar does, what it leaves to you, and the defaults you may want to change.

## Rate limiting (you must add this)

Anahtar does not rate-limit. Guesses per code are capped (`otpMaxAttempts`, default 5, counted in the database before each comparison so concurrent requests cannot exceed it), but nothing stops a client from requesting new codes or hammering the endpoints. Limit these at the edge, keyed by IP and, for `/start`, by email if you can:

| Route | Why |
| --- | --- |
| `POST /api/auth/start` | sends an email per call; a fresh code resets the attempt budget |
| `POST /api/auth/verify` | code guessing |
| `POST /api/auth/passkey/check-email` | account enumeration (see below) |

Cloudflare (WAF → Rate limiting rules), one rule covering all of them:

```
(http.request.uri.path wildcard "/api/auth/*" and http.request.method eq "POST")
```

Characteristics: IP. 10 requests per 10 seconds, block for 1 minute. Tighten `/api/auth/start` further if you can afford a second rule.

nginx in front of adapter-node:

```nginx
limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;

location /api/auth/ {
	limit_req zone=auth burst=10 nodelay;
	proxy_pass http://127.0.0.1:3000;
}
```

## OTP

- Defaults: 5 digits, 5 attempts, 30-minute expiry. `otpLength: 6` gives a space ten times larger.
- Codes may start with 0 and are compared in constant time.

## Passkeys

- User verification is required for registration and login. A security key without a PIN will be asked to set one. The passkey is the only factor, so presence alone is not enough.
- `rpID` and `origin` come from the request URL unless you pass `rpId`/`origin` to `createAuth` or set the `ORIGIN` env var. Behind a reverse proxy set `ORIGIN` (adapter-node also reads `PROTOCOL_HEADER`/`HOST_HEADER`); otherwise WebAuthn verification fails and the session cookie loses its `Secure` flag.
- `POST /api/auth/passkey/check-email` tells anyone whether an address has passkeys and returns its credential IDs (public identifiers). That is what makes the email-first flow work. If enumeration matters to you, rate-limit it or build your UI on `login-start` (discoverable credentials) only.

## Sessions

- 32 random bytes per session; only the SHA-256 hash is stored. Cookie: `httpOnly`, `SameSite=Lax`, `Secure` on https, `path=/`.
- A new sign-in invalidates the session held in the existing cookie. Registering a passkey does the same: the session is replaced by a passkey-length one and the token rotates.
- Sessions do not renew on use. Lifetime is fixed at creation (`sessionDuration(method)`); renewal is a fresh passkey login, which `AuthPill` offers as a "Stay signed in" chip near expiry. Cookie possession alone never extends a session.
- Expired rows are deleted when presented, not swept. Run `DELETE FROM auth_sessions WHERE expires_at < <now in ms>` periodically if table size matters.

## CSRF

Covered by `SameSite=Lax` on the cookie and SvelteKit's origin check for form-encoded and `text/plain` POSTs. Keep `csrf.checkOrigin` enabled (the default).

## `onSendOTP` errors

If `onSendOTP` throws, the client gets the localized `errorGeneric` message with status 400 — the thrown message stays server-side. Wire `onError` to see it.
