---
branch: test-types
pull-request: 6
---

# anahtar: component test files fail svelte-check

## Why
`pnpm check` reports 38 errors, all in `src/lib/components/*.svelte.test.ts` (AuthFlow 18, OtpInput 8, PasskeyPrompt 7, AuthPill 6-ish) plus one in `session.test.ts`. They predate the 0.1.0 work and bury any new error in noise. Typical causes: `render(Component, { props })` typing with Svelte 5 components, `vi.fn()` mocks assigned to `globalThis.fetch`, `screen` queries returning `HTMLElement` where a narrower type is assumed.

## Steps
1. `pnpm check 2>&1 | grep svelte.test.ts` for the list.
2. Fix with real types, not `// @ts-ignore`: `as unknown as typeof fetch` for fetch mocks (see `client.test.ts` for the pattern), `ComponentProps<typeof X>` for props, `SyncAuthDB` mapped type as in `db/sqlite.test.ts` for sync adapter tests.
3. Also clear the two `state_referenced_locally` warnings (`OtpInput.svelte` `length`, `PasskeyPrompt.svelte` `countdownSeconds`) if a `$derived` fits; otherwise leave.

## Done when
- `pnpm check` → 0 errors; `pnpm test` unchanged (83 unit + 26 component).
