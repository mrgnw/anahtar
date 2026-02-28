# plan-ideas

## Summary
Opinionated auth package for SvelteKit providing email+OTP identification with optional passkey (WebAuthn) registration. Published to npm as `@mrgnw/anahtar` (v0.0.6, pre-alpha). Has 68 tests (46 unit + 22 component), three DB adapters (SQLite, Postgres, D1), and is already integrated into anani. The package is functional and published but still pre-alpha with potential API changes.

## Action Items
- [ ] Integrate into a second project to validate the API surface beyond anani
- [ ] Add rate limiting for OTP requests (currently relies on consumer to implement)
- [ ] Add session refresh/renewal logic (extend expiring sessions)
- [ ] Write tests for the D1 adapter (currently untested, only SQLite has adapter tests)
- [ ] Write tests for the Postgres adapter
- [ ] Add passkey deletion tests (handler exists but not tested)
- [ ] Consider email validation beyond simple format check
- [ ] Document error handling patterns for consumers
- [ ] Fix vitest hanging on Node 25 (known issue, may resolve with vitest update)
- [ ] Bump to 0.1.0 once API stabilizes

## Detailed Assessment

### Project Status
Functional and published. The core auth flow (email -> OTP -> session -> optional passkey) works end-to-end. Three DB adapters ship (SQLite, Postgres, D1). UI components (AuthFlow, OtpInput, PasskeyPrompt) are included as .svelte source files. The package is consumed by anani via Cloudflare D1. Version 0.0.6, labeled pre-alpha.

### Git Status
Branch: main. Working tree is clean. No uncommitted changes.

### Last Activity
Last commit: 2026-02-18 (publish to npm, switch to public registry, bump 0.0.6)
Last file edit: 2026-02-18

### Existing Plans & TODOs
PLAN.md is comprehensive -- covers package structure, config interface, DB adapter interface, testing setup, build/publish workflow. No TODO comments in source code. No todos/ folder. The PLAN.md serves as both architecture doc and reference.

docs/integration.md covers consumer setup: install, SvelteKit wiring, config options, theming, Postgres setup.

### Remaining Work

**Testing gaps:**
- D1 adapter has zero tests (added in the last batch of features)
- Postgres adapter has zero tests
- Passkey deletion flow not tested
- No integration/E2E tests for the full auth flow in a real SvelteKit app

**Missing features for 0.1.0:**
- Rate limiting for OTP requests (prevent brute force at the package level)
- Session refresh (currently sessions expire after sessionDuration with no renewal)
- Account deletion / data export
- Multi-device session management (list active sessions, revoke)

**DX improvements:**
- Error types are ad-hoc (throw new Error) -- could use typed error classes
- No migration story -- if schema changes between versions, consumers have no upgrade path
- The vitest process hang on Node 25 blocks CI adoption

### Ideas & Considerations
- The package is tightly coupled to SvelteKit via `event.cookies` and `event.url`. Consider whether the core auth logic (OTP, session, passkey) could be framework-agnostic with a thin SvelteKit adapter layer.
- Challenge storage for passkeys uses a DB table -- could use a signed JWT instead to avoid the extra table.
- The `onSendOTP` callback pattern is clean but doesn't give consumers error feedback if their email service fails. Consider a result type.
- Passkey names (guessDeviceName helper) are a nice touch -- could expand to show device type icons in a session management UI.
- D1 adapter opens the door for edge-deployed auth. Could document a Cloudflare Workers pattern specifically.
- Currently no way to customize the OTP email template (just email + code passed to callback). Some consumers may want HTML templates.
