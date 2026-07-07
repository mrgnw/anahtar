# Fix: AuthPill passkey ceremony freezes email sign-in (#1)

## Problem

In `src/lib/components/AuthPill.svelte`, submitting an email freezes the go
button on `...` (disabled) on domains where the passkey rpID doesn't match
(e.g. `*.workers.dev` preview hosts). Two root causes:

1. **Unbounded modal ceremony.** `handleEmailSubmit` runs
   `await startAuthentication({ optionsJSON: opts })` as a blocking step before
   the email OTP fetch. If `navigator.credentials.get()` neither resolves nor
   rejects, execution never reaches `/start`, the `finally { loading = false }`
   never runs, and the button stays disabled on `...` forever.
2. **Decorative cancellation.** `tryConditionalWebAuthn` stores
   `conditionalAbort = new AbortController()` but never passes `.signal` to
   `startAuthentication`, so `conditionalAbort.abort()` is a no-op — the
   mount-time conditional (autofill) ceremony is never actually cancelled.

## Library facts (verified in `@simplewebauthn/browser@13.2.2`)

`startAuthentication` internally calls `WebAuthnAbortService.createNewAbortSignal()`
and passes that signal to `navigator.credentials.get()`. The exported
`WebAuthnAbortService` singleton has `cancelCeremony()` (aborts the in-flight
ceremony; safe when none is active). So `WebAuthnAbortService.cancelCeremony()`
cancels whichever ceremony (conditional or modal) is running — no per-call
`AbortController` wiring is needed.

## Trap to avoid

`tryConditionalWebAuthn` currently sets `loading = true` then
`finally { loading = false }`. Once we *actually* cancel the conditional
ceremony from `handleEmailSubmit`, its `startAuthentication` promise rejects as
a microtask and its `finally` would set `loading = false` mid-submit, clobbering
the `loading = true` we just set. Fix: scope that `loading` to only the verify
fetch that runs *after* a real autofill response; the abort path must not touch
`loading`.

## Tasks (TDD)

- [ ] **Task A — Tests (red).** Add `src/lib/components/AuthPill.svelte.test.ts`:
  - `mock @simplewebauthn/browser` with `startAuthentication`, `startRegistration`,
    `WebAuthnAbortService.cancelCeremony` spies.
  - **a11y/hang → OTP fallback:** `startAuthentication` returns a never-settling
    promise; check-email returns `allowCredentials:[{id}]`; advance fake timers
    past the 8s timeout; assert OTP step is shown, its inputs are **not**
    disabled (loading cleared), and `cancelCeremony` was called.
  - **cancel on submit:** modal ceremony rejects → assert `cancelCeremony` called
    and OTP step reached (fell through).
  - **success short-circuits:** `startAuthentication` resolves + `/login-finish`
    ok → `onSuccess` called once, `/start` never fetched.

- [ ] **Task B — Fix (green).** Edit `src/lib/components/AuthPill.svelte`:
  - Replace `conditionalAbort` state with a captured
    `webauthnAbort: { cancelCeremony: () => void } | null` module ref +
    `const PASSKEY_TIMEOUT_MS = 8000`.
  - Add `raceTimeout(promise, ms)` helper (clears its timer; the losing promise's
    later rejection is consumed by `Promise.race`, so no unhandled rejection).
  - `tryConditionalWebAuthn`: capture `webauthnAbort = mod.WebAuthnAbortService`
    after import; only touch `loading` inside an inner try/finally around the
    verify fetch (after a real `authResponse`).
  - `handleEmailSubmit`: `webauthnAbort?.cancelCeremony()` at the top; wrap the
    modal `startAuthentication` in `raceTimeout(..., PASSKEY_TIMEOUT_MS)`; on
    catch call `WebAuthnAbortService.cancelCeremony()` and fall through to OTP.
  - `onMount` cleanup: `return () => webauthnAbort?.cancelCeremony()`.

## Verify

- `node_modules/.bin/vitest run --config vitest.browser.ts` (AuthPill + AuthFlow green)
- `node_modules/.bin/svelte-check --tsconfig ./tsconfig.json`
- `node_modules/.bin/svelte-package` (build)

## Notes

- `PasskeyPrompt.svelte.test.ts` has 4 failures that pre-date this branch
  (reproduced with my changes stashed) — out of scope here.
- `pnpm test`/`pnpm run` trips pnpm 11's `verify-deps-before-run` on ignored
  native build scripts; running the `vitest`/`svelte-check` bins directly avoids
  that unrelated tooling gate.
</content>
</invoke>
