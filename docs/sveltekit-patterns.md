# SvelteKit integration patterns

Patterns learned from production use of anahtar in a SvelteKit 5 + Cloudflare Workers app.

## Auth lifecycle

The three moments that matter: sign-in, sign-out, and page load.

```ts
// src/routes/+layout.server.ts
export const load = async ({ locals, depends }) => {
  depends("app:auth");
  const user = locals.user
    ? { id: locals.user.id, email: locals.user.email }
    : null;
  return { user };
};
```

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { afterNavigate, goto, invalidateAll } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { userState } from "$lib/stores/user.svelte.js";

  async function onAuthSuccess() {
    await invalidateAll();                        // refresh page.data.user from server
    userState.set(page.data.user ?? null);        // sync reactive store
    // load any user-specific data here
    showSignInBanner();                           // see: feedback section
    goto("/");
  }

  async function onSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    await invalidateAll();
    userState.set(null);
    goto("/");
  }

  onMount(() => {
    userState.set(page.data.user ?? null);        // init on first load
  });

  afterNavigate(() => {
    userState.set(page.data.user ?? null);        // keep in sync on client-side nav
  });
</script>
```

`afterNavigate` sync is important: if a user authenticates in another tab or the session expires, client-side navigation will pick up the new server state.

## Reactive user store

A single module-level `$state` shared across components:

```js
// src/lib/stores/user.svelte.js
let user = $state(null);

export const userState = {
  get current() {
    return user;
  },
  get isAuthenticated() {
    return !!user;
  },
  set(newUser) {
    user = newUser;
  },
};
```

Components that need auth state read from `userState.isAuthenticated` rather than `page.data.user` directly — this updates immediately on sign-in/out without waiting for a navigation.

## Route-based panel (auth in document flow)

Instead of a modal or sidebar, render auth/account UI inline in the page as a collapsible section that pushes content down:

```svelte
<!-- src/lib/components/NavDropdown.svelte -->
<script>
  import { AuthFlow } from "@mrgnw/anahtar/components";
  import { slide } from "svelte/transition";
  import { page } from "$app/state";
  import AccountPanel from "./AccountPanel.svelte";

  const AUTH_ROUTES = ["/auth", "/login"];
  const USER_ROUTES = ["/me"];
  const showAuth = $derived(AUTH_ROUTES.includes(page.url.pathname));
  const showUser = $derived(USER_ROUTES.includes(page.url.pathname));
  const isOpen = $derived(showAuth || showUser);
</script>

{#if isOpen}
  <div class="panel-wrap" transition:slide={{ duration: 200 }}>
    <div class="panel-card">
      {#if showAuth}
        <AuthFlow onSuccess={onAuthSuccess} />
      {:else if showUser}
        <AccountPanel {onSignOut} />
      {/if}
    </div>
  </div>
{/if}
```

Place this **inside `<main>`** before `{@render children?.()}` so content slides down when it opens. Nav clicks route to `/auth` or `/me` to open it.

The page components at those routes just render normal content — they don't need to know about the panel:

```svelte
<!-- src/routes/auth/+page.svelte -->
<HomeContent countryCode={data.ip_country} panelAbove={true} />
```

Pass `panelAbove={true}` so the page content reduces its top padding (it normally reserves space for the fixed nav).

```ts
// src/routes/me/+page.server.ts — redirect unauthenticated users
export const load = async ({ locals }) => {
  if (!locals.user) throw redirect(302, "/auth");
  return {};
};
```

## Sign-in feedback

A fixed pill banner with animation beats a generic toast. This drops in from above the nav on desktop, rises above the bottom nav on mobile:

```svelte
<!-- src/lib/components/SignInBanner.svelte -->
<script>
  import { backOut } from "svelte/easing";
  import { fly, fade } from "svelte/transition";

  let { email, show } = $props();
</script>

{#if show}
  <div
    class="banner"
    in:fly={{ y: -16, duration: 450, easing: backOut }}
    out:fade={{ duration: 250 }}
    role="status"
  >
    🍍 Signed in · {email} ✓
  </div>
{/if}
```

Trigger from `onAuthSuccess` in the layout using plain state + `setTimeout` (no `$effect` needed):

```js
let showBanner = $state(false);
let bannerEmail = $state("");
let bannerTimer = null;

// inside onAuthSuccess, after invalidateAll():
bannerEmail = page.data.user?.email ?? "";
showBanner = true;
if (bannerTimer) clearTimeout(bannerTimer);
bannerTimer = setTimeout(() => {
  showBanner = false;
}, 3500);
```

## CSS theming

Map your app's design tokens to anahtar's CSS custom properties so components match your design system:

```css
/* app.pcss or global CSS */
:root {
  --anahtar-bg: hsl(var(--background));
  --anahtar-fg: hsl(var(--foreground));
  --anahtar-border: hsl(var(--border));
  --anahtar-ring: hsl(var(--ring));
  --anahtar-primary: hsl(var(--primary));
  --anahtar-primary-fg: hsl(var(--primary-foreground));
  --anahtar-error: hsl(var(--destructive));
}
```

## Passkey management UI

For listing and adding passkeys in the account panel, expose a server remote function:

```ts
// src/lib/user.remote.ts
import { createRemoteFunction } from "@sveltejs/kit";
import { getAuth } from "$lib/server/auth";

export const getMyPasskeys = createRemoteFunction(
  async ({ locals, platform }) => {
    if (!locals.user) return [];
    const auth = getAuth(platform!.env.DB);
    return auth.getUserPasskeys(locals.user.id);
  },
);
```

In the component, refresh passkeys after add/remove by reassigning the promise (Svelte 5 — `$derived` won't re-run, use `$state`):

```js
let passkeyPromise = $state(getMyPasskeys());

// after successful add or remove:
await invalidateAll();
passkeyPromise = getMyPasskeys();
```

## User-specific data tables

Keep your app data in separate tables — don't extend anahtar's tables. Avoid foreign key constraints against `auth_users` if you may recreate auth tables during development:

```sql
-- safe: no FK, use same UUID key convention
CREATE TABLE user_preferences (
  user_id TEXT PRIMARY KEY,
  languages TEXT,
  updated_at INTEGER
);
```

## What to keep in your own codebase

| Concern                       | Where                                         |
| ----------------------------- | --------------------------------------------- |
| Session cookie reading        | anahtar (via `locals.user`)                   |
| OTP send logic                | your `onSendOTP` impl                         |
| User-specific app data        | your tables, your remote functions            |
| UI feedback (banners, toasts) | your components                               |
| Auth route redirects          | your `+page.server.ts` load functions         |
| Passkey management UI         | your component using `auth.getUserPasskeys()` |
