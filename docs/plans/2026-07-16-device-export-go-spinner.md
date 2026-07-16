# Plan: export `./device`, native go-button spinner (issue #3)

Anani (mrgnw/anani PR #316) needs `guessDeviceName()` to label passkeys but the
exports map doesn't expose it, so it's copy-pasted downstream. The AuthPill go
button also renders a literal `...` while the email submit is in flight, which
reads as a second ⋯ button — anani hides it with CSS overrides. Fix both at the
source and publish `0.0.30`.

## Decisions (locked)

- **Go-button a11y label:** reuse `m.continue` ("Continue", already translated in
  every locale) — same as AuthFlow's identical button. No new i18n key, no touching
  ~90 locale files. (Issue suggested `aria-label="Signing in"`; `m.continue` is the
  consistent, zero-cost choice.)
- **Spinner:** mirror the existing AuthFlow spinner (arc SVG `class="anahtar-spinner"`
  + `@keyframes anahtar-spin`). No new design, no dependency.
- **Publish:** `package.json` is already `0.0.30`; `npm publish` is a post-merge human
  step (runs `prepublishOnly` → build). Nothing to bump in this PR.
- **Toolchain fix (drive-by):** committed `pnpm-workspace.yaml` had
  `onlyBuiltDependencies: '["better-sqlite3"]'` — a YAML *string*, so pnpm ignored it
  and every `pnpm install/test/build` died with `ERR_PNPM_IGNORED_BUILDS`. Fixed to a
  proper list incl. `esbuild`. Without this nothing builds or tests.

## Tasks

- [ ] **1. Fix `pnpm-workspace.yaml`** → proper `onlyBuiltDependencies` list.
      Verify: `pnpm install` runs build scripts, `pnpm test` collects.
- [ ] **2. Export `./device`** in `package.json` `exports` (shape of `./sqlite`).
      `guessDeviceName` is already re-exported from both barrels; svelte-package emits
      `dist/device.{js,d.ts}` automatically.
      Verify: `pnpm build && ls dist/device.js dist/device.d.ts`.
- [ ] **3. AuthPill spinner (TDD)** — new test asserts the in-flight go button has an
      accessible name, contains `.anahtar-spinner`, and no literal `...`; then replace
      the `...` branch with the arc SVG + keyframes in the scoped `<style>`.
      Verify: `pnpm test:browser`, `pnpm check`.

## Out of scope / notes

- `PasskeyPrompt.svelte.test.ts` (4 failures) is a pre-existing stale-text mismatch
  with `en.ts` — unrelated to this issue, left as-is.
- Downstream anani cleanup happens after `0.0.30` is on npm (see issue).
