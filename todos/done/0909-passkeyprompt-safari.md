---
branch: passkeyprompt-safari
pull-request: 7
---

# anahtar: PasskeyPrompt countdown does nothing on Safari

## Why
`src/lib/components/PasskeyPrompt.svelte` counts down 5 s and then calls `onRegister` → `navigator.credentials.create()` with no user gesture. WebKit requires transient user activation for `create()`, so on Safari/iOS the ring finishes and nothing happens; the user sees the manual "Add passkey now" / "Maybe later" buttons after a silent failure. Chrome allows it, which is why it looks fine on desktop.

## Options (product decision)
1. Drop the auto-trigger: show the ring as a prompt only, register on tap. Simplest, consistent across browsers.
2. Keep the countdown on browsers that allow it (`navigator.userActivation` is not enough to detect this; would need UA sniffing). Not recommended.

## Steps
- Pick 1 unless there's a reason not to; remove `triggerRegistration()` from the interval, keep the ring as a decorative progress-to-prompt or remove it; update `PasskeyPrompt.svelte.test.ts` ("calls onRegister after countdown expires") accordingly; `pnpm test:browser`.

## Done when
- Registration only starts from a tap; test suite green; docs/components.md PasskeyPrompt section updated.
