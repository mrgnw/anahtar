---
branch: i18n-bundle
pull-request: 8
---

# anahtar: i18n bundle size

## Why
`src/lib/i18n/index.ts` statically imports all 88 locale modules (~360 KB of source) and `resolveMessages` picks one at runtime, so every client that renders `AuthPill`/`AuthFlow` downloads every locale. anani ships the pill on every page.

## Steps
1. Measure: `pnpm build` in anahtar, then in anani `pnpm build` and check the chunk that contains `i18n/index` (or `npx vite-bundle-visualizer`; anani has `rollup-plugin-visualizer` as a devDep). Record raw and gzipped size.
2. If it matters (> ~20 KB gz is a reasonable bar for a header widget): lazy-load. Sketch: keep `en` bundled and synchronous; `loadMessages(locale)` does `import(`./${lang}.js`)` behind an allowlist; components start with `resolveMessages('en', overrides)` and swap after `onMount`. Server keeps eager imports (no bundle cost). Accept a flash of English on first paint for non-English users, or pass `locale` from the server so SSR already matches.
3. Keep `resolveMessages` sync for the server and for consumers who import `./i18n` directly.

## Done when
- Number recorded; either "not worth it" with the number, or the lazy path shipped with tests green (`pnpm test:browser`).

## Result (2026-09-09)
Worth it. Minimal SvelteKit consumer rendering `<AuthPill />`, client node chunk:
raw 139,971 -> 34,055; gzipped 46,636 -> 12,013. 34.6 KB gzipped saved.
Each locale is now a ~1 KB (0.5 KB gzipped) on-demand chunk.
Lazy path shipped: `loadMessages()` + loader-map allowlist, `en` static,
`resolveMessages` still sync (serves from the load cache), eager table moved to
`src/lib/i18n/server.ts` for the request handlers. `locales` export replaced by
`localeCodes`. 88 unit + 26 component tests green. PR #8.
