# Security notes

What anahtar does, what it leaves to you, and the defaults you may want to change.

## Rate limiting (you must add this)

Anahtar does not rate-limit requests. Deploy both network and account limits before exposing auth routes. `otpMaxAttempts` (default 5) caps guesses for one code, but issuing a new code resets that code's attempt budget.

| Route | Limit | Why |
| --- | --- | --- |
| `POST /api/auth/start` | IP and email issuance | Sends an email and issues a fresh code |
| `POST /api/auth/verify` | IP and email verification | Limits guesses across code reissuance |
| `GET /api/auth/passkey/login-start` | IP | Issues a discoverable passkey challenge |
| `POST /api/auth/passkey/check-email` | IP and email issuance | Issues a challenge and reveals whether an address has passkeys |

Adjust the paths if you mounted the handlers elsewhere. Limit all auth routes at the network layer as well as the more specific limits above. Choose thresholds for your traffic, monitor legitimate blocks, and return HTTP 429 when a limit is exceeded.

### Network limits

Cloudflare WAF rate limiting rule matching both methods under the default mount:

```
(starts_with(http.request.uri.path, "/api/auth/") and (http.request.method eq "POST" or http.request.method eq "GET"))
```

For example, choose IP as the characteristic, 10 requests per 10 seconds, and block for one minute. Tune these values and add tighter issuance rules as needed. Cloudflare counters are not global across data centers, and enforcement can lag; see [request rate calculation](https://developers.cloudflare.com/waf/rate-limiting-rules/request-rate/) and [rule parameters](https://developers.cloudflare.com/waf/rate-limiting-rules/parameters/). Restrict direct access to the origin so requests cannot bypass the WAF.

nginx in front of adapter-node:

```nginx
limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;

location /api/auth/ {
	limit_req zone=auth burst=10 nodelay;
	limit_req_status 429;
	proxy_pass http://127.0.0.1:3000;
}
```

The nginx zone is shared by workers on one nginx instance, not across hosts. See [nginx request limiting](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html). Use the real client address only when it comes from a trusted proxy: restrict origin access and configure [nginx real IP](https://nginx.org/en/docs/http/ngx_http_realip_module.html) with the proxy's trusted address ranges. Never trust a client-supplied forwarding header directly.

### Account limits

IP limits alone do not protect an address from requests distributed across sources. Add separate, shared limits keyed by normalized email, independent of IP: one for code issuance (`start`), one for code verification (`verify`), and one for email-first passkey challenges (`passkey/check-email`). Normalize exactly as Anahtar does: trim whitespace and lowercase the email. Apply the limit before calling the handler, including for addresses that do not have an account. Count every valid-address verification request, not just failures, and keep its counter independent of individual codes and issuance. Do not reset it when a code is issued or replaced. Choose windows and thresholds appropriate to your users; account limits can be used to deny service to an address, so provide a recovery path and monitor blocks.

In SvelteKit, wrap the exported `POST` handler from `auth.handlers` in `src/routes/api/auth/[...path]/+server.ts`. For the three paths above, read a clone of `event.request` as JSON, normalize its string `email`, atomically check and increment the corresponding shared counter, and return a generic 429 response when over limit. Pass the original event to `auth.handlers.POST(event)` when allowed, so Anahtar can read its body normally. Let Anahtar handle invalid input. Bound request body size at the proxy before parsing, and protect all instances and alternate entry points with the same limits. Use a datastore that provides atomic increments and expiry across every instance and region; do not use in-process counters. Decide explicitly how to handle datastore outages (fail closed if enforcement is required), and avoid logging raw email addresses or codes. Network limits still apply to malformed bodies and the passkey GET route.

## OTP

- Defaults: 5 digits, 5 attempts, 30-minute expiry. `otpLength: 6` gives a space ten times larger.
- Codes may start with 0 and are compared in constant time.

## Passkeys

- Starting and finishing enrollment requires an email code or existing passkey sign-in to the same account within the last five minutes. If either endpoint returns HTTP 403, sign in again to that account and restart enrollment. Enrollment rotates the session and keeps the original sign-in time.
- User verification is required for registration and login. A security key without a PIN will be asked to set one. The passkey is the only factor, so presence alone is not enough.
- `rpID` and `origin` come from the request URL unless you pass `rpId`/`origin` to `createAuth` or set the `ORIGIN` env var. Behind a reverse proxy set `ORIGIN` (adapter-node also reads `PROTOCOL_HEADER`/`HOST_HEADER`); otherwise WebAuthn verification fails and the session cookie loses its `Secure` flag.
- `POST /api/auth/passkey/check-email` tells anyone whether an address has passkeys and returns its credential IDs (public identifiers). That is what makes the email-first flow work. If enumeration matters to you, rate-limit it or build your UI on `login-start` (discoverable credentials) only.

## Sessions

- 32 random bytes per session; only the SHA-256 hash is stored. Cookie: `httpOnly`, `SameSite=Lax`, `Secure` on https, `path=/`.
- A new sign-in invalidates the session held in the existing cookie. Registering a passkey does the same: the session is replaced by a passkey-length one and the token rotates.
- Sessions do not renew on use. Lifetime is fixed at creation (`sessionDuration(method)`); renewal is a fresh passkey login, which `AuthPill` offers as a "Stay signed in" chip near expiry. Cookie possession alone never extends a session.
- Expired rows are deleted when presented, not on a timer. Call `auth.sweep()` from a cron (daily is plenty) to drop expired sessions, OTP codes and challenges.
- `POST /api/auth/logout-all` and `auth.invalidateUserSessions(userId)` delete every session of a user, including the current one. The endpoint requires a valid session, not a passkey re-auth: a stolen cookie can at worst sign itself out.

## CSRF

Covered by `SameSite=Lax` on the cookie and SvelteKit's origin check for form-encoded and `text/plain` POSTs. Keep `csrf.checkOrigin` enabled (the default).

## `onSendOTP` errors

If `onSendOTP` throws, the client gets the localized `errorGeneric` message with status 400 — the thrown message stays server-side. Wire `onError` to see it.
