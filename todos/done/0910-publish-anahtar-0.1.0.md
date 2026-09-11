---
branch: review/security-dx
pull-request: 5
---

# Publish anahtar 0.1.0

Repo: `~/dev/anahtar`, branch `review/security-dx` (21 commits on top of `origin/main` 942419a, not pushed). `CHANGELOG.md` lists the breaking changes.

## Why
anani production runs 0.0.30: the OTP attempt cap is bypassable with concurrent `/verify` requests on D1, passkeys don't require user verification, `register-finish` leaks internal strings. None of the review fixes take effect until 0.1.0 is on npm. Every other anahtar/anani todo here depends on this.

## Steps
1. `git push -u origin review/security-dx`, open a PR against `main` (or merge directly; single-maintainer package).
2. Verify on main: `pnpm test` (83 unit + 26 component), `pnpm check` (only the 38 pre-existing `.svelte.test.ts` errors), `pnpm build`.
3. `npm publish` (runs `prepublishOnly` → build). Human step: needs npm credentials.
4. Drop the obsolete stash on main: `git stash drop` (`pre-review local pnpm edits`; origin already has the real pnpm-workspace fix).
5. Decide the untracked `.opencode/package-lock.json` and `docs/business plan.md`.

## Done when
- `npm view @mrgnw/anahtar version` prints `0.1.0`.
