# UI components

Anahtar ships four Svelte components. All are optional — you can build your own UI and call the API routes directly.

## AuthFlow

The complete email → OTP → passkey onboarding → success flow:

```svelte
<script>
  import { AuthFlow } from '@mrgnw/anahtar/components';
  import { goto } from '$app/navigation';
</script>

<AuthFlow onSuccess={() => goto('/')} />
```

AuthFlow handles: email input with conditional WebAuthn (passkey autofill), OTP verification with resend, passkey registration countdown, and success confirmation.

Props:

| Prop        | Type                    | Default       | Description                         |
| ----------- | ----------------------- | ------------- | ----------------------------------- |
| `apiBase`   | `string`                | `'/api/auth'` | Base path for auth API routes       |
| `locale`    | `string`                | auto-detected | Language code (e.g. `'fr'`, `'ja'`) |
| `messages`  | `Partial<AuthMessages>` | —             | Override specific UI strings        |
| `onSuccess` | `() => void`            | —             | Called after successful login       |

## AuthPill

A pill-shaped component for headers, floating islands, or inline placement. Handles sign-in, OTP, passkey onboarding, passkey management, and sign-out in a compact form factor.

```svelte
<script>
  import { AuthPill } from '@mrgnw/anahtar/components';
  import { invalidateAll } from '$app/navigation';
  import { page } from '$app/state';

  let user = $derived(page.data.user);
</script>

<AuthPill
  {user}
  onSuccess={() => invalidateAll()}
  onSignOut={async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    invalidateAll();
  }}
/>
```

With passkey management:

```svelte
<AuthPill
  {user}
  onSuccess={() => invalidateAll()}
  onSignOut={async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    invalidateAll();
  }}
  getPasskeys={async () => {
    const res = await fetch('/api/passkeys');
    return res.json();
  }}
/>
```

Props:

| Prop               | Type                           | Default       | Description                                             |
| ------------------ | ------------------------------ | ------------- | ------------------------------------------------------- |
| `apiBase`          | `string`                       | `'/api/auth'` | Base path for auth API routes                           |
| `user`             | `{ email: string } \| null`    | `null`        | Current user — controls signed-in vs signed-out state   |
| `locale`           | `string`                       | auto-detected | Language code (e.g. `'es'`, `'de'`)                     |
| `messages`         | `Partial<AuthMessages>`        | —             | Override specific UI strings                            |
| `onSuccess`        | `() => void`                   | —             | Called after successful sign-in                         |
| `onSignOut`        | `() => void`                   | —             | Called when user clicks sign out (you handle the fetch) |
| `onPasskeysChange` | `() => void`                   | —             | Called after a passkey is added or removed              |
| `getPasskeys`      | `() => Promise<PasskeyInfo[]>` | —             | If provided, enables passkey management panel           |

`PasskeyInfo` shape: `{ id: string; credentialId?: string; name?: string | null; createdAt?: number }`

## PasskeyPrompt

Standalone passkey registration prompt with animated countdown ring:

```svelte
<script>
  import { PasskeyPrompt, resolveMessages } from '@mrgnw/anahtar/components';
  const m = resolveMessages('en');
</script>

<PasskeyPrompt
  {m}
  onRegister={async () => {
    // call passkey/register-start + register-finish
  }}
  onSkip={() => {
    fetch('/api/auth/skip-passkey', { method: 'POST' });
  }}
/>
```

- 5-second countdown with radial progress ring, then auto-triggers registration
- Click the ring to register immediately (skips timer)
- Falls back to manual "Add passkey" / "Maybe later" on failure
- `countdownSeconds` prop to customize timing

## OtpInput

Standalone OTP input with auto-advance, backspace navigation, and paste support:

```svelte
<script>
  import { OtpInput } from '@mrgnw/anahtar/components';
</script>

<OtpInput
  length={5}
  onComplete={(code) => verifyOtp(code)}
/>
```

---

## Building your own UI

Call the API routes directly if you prefer full control.

```ts
// Send OTP
await fetch('/api/auth/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
});

// Verify OTP
const res = await fetch('/api/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, code }),
});
const { hasPasskey, skipPasskeyPrompt } = await res.json();

// Logout
await fetch('/api/auth/logout', { method: 'POST' });
```

### Conditional WebAuthn (passkey autofill)

To offer instant passkey login when the page loads, before the user types anything:

```ts
import { startAuthentication } from '@simplewebauthn/browser';

async function tryConditionalWebAuthn() {
  const res = await fetch('/api/auth/passkey/login-start');
  if (!res.ok) return;
  const options = await res.json();

  const authResponse = await startAuthentication({
    optionsJSON: options,
    useBrowserAutofill: true, // enables conditional mediation
  });

  const verifyRes = await fetch('/api/auth/passkey/login-finish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authResponse),
  });
  if (verifyRes.ok) {
    // user is logged in
  }
}
```

Requires `autocomplete="username webauthn"` on your email input. The browser will show saved passkeys in the autofill dropdown.

### Passkey-first login (check before OTP)

When a user submits their email, check for existing passkeys first:

```ts
const checkRes = await fetch('/api/auth/passkey/check-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
});

if (checkRes.ok) {
  const opts = await checkRes.json();
  if (opts.allowCredentials?.length > 0) {
    // user has passkeys — try passkey auth first
    const authResp = await startAuthentication({ optionsJSON: opts });
    // ... verify with passkey/login-finish
  }
}
// fall through to OTP if no passkeys or user cancelled
```

---

## Theming

Components use CSS custom properties:

```css
:root {
  /* Shared (AuthFlow, OtpInput, PasskeyPrompt) */
  --anahtar-bg: transparent;
  --anahtar-fg: inherit;
  --anahtar-border: #d1d5db;
  --anahtar-ring: #3b82f6;
  --anahtar-primary: #3b82f6;
  --anahtar-primary-fg: #fff;
  --anahtar-error: #ef4444;

  /* AuthPill-specific */
  --anahtar-pill-bg: rgba(255, 255, 255, 0.9);
  --anahtar-pill-fg: #374151;
  --anahtar-pill-border: rgba(0, 0, 0, 0.06);
  --anahtar-pill-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  --anahtar-pill-icon: #6b7280;
  --anahtar-pill-sep: rgba(0, 0, 0, 0.2);
  --anahtar-pill-placeholder: #9ca3af;
}
```

Map your app's design tokens to anahtar's properties:

```css
:root {
  --anahtar-bg: hsl(var(--background));
  --anahtar-fg: hsl(var(--foreground));
  --anahtar-border: hsl(var(--border));
  --anahtar-primary: hsl(var(--primary));
  --anahtar-primary-fg: hsl(var(--primary-foreground));
  --anahtar-error: hsl(var(--destructive));
}
```

---

## Localization

Components auto-detect the browser locale. 88 locales bundled (every language with 5M+ speakers).

Override per component:

```svelte
<AuthFlow locale="fr" onSuccess={() => goto('/')} />
<AuthPill locale="ja" {user} onSuccess={() => invalidateAll()} />
```

Override specific strings:

```svelte
<AuthFlow
  messages={{ continue: 'Sign in', emailPlaceholder: 'you@company.com' }}
  onSuccess={() => goto('/')}
/>
```

### Using i18n in your own UI

```ts
import { resolveMessages, detectLocaleClient, locales } from '@mrgnw/anahtar/components';

const m = resolveMessages(detectLocaleClient());
// → m.continue, m.emailPlaceholder, m.errorInvalidCode, etc.

// With overrides
const m = resolveMessages('de', { continue: 'Anmelden' });

// Server-side detection (in +page.server.ts or hooks)
import { detectLocaleServer } from '@mrgnw/anahtar';
const locale = detectLocaleServer(event.request); // reads Accept-Language header

// All available locale codes
Object.keys(locales); // ['af', 'ak', 'am', 'ar', ..., 'zh', 'zu']
```

The `AuthMessages` type defines all 34 translatable strings — see `src/lib/i18n/types.ts`.

---

## Utilities

### guessDeviceName

Generates a human-readable passkey name from the user agent string:

```ts
import { guessDeviceName } from '@mrgnw/anahtar/components';
// or
import { guessDeviceName } from '@mrgnw/anahtar';

guessDeviceName();          // "Chrome on macOS"
guessDeviceName(customUA);  // pass a UA string directly
```

The built-in components use this automatically when registering passkeys.
