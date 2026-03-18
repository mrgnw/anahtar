# Configuration

## AuthConfig reference

```ts
interface AuthConfig {
  db: AuthDB;
  rpName?: string;          // WebAuthn relying party name — default: 'App'
  tablePrefix?: string;     // default: 'auth_' — set to '' for no prefix
  cookie?: string;          // session cookie name — default: 'session'
  sessionDuration?: number; // default: 30 days (ms)
  otpExpiry?: number;       // default: 30 min (ms)
  otpLength?: number;       // default: 5 digits
  otpMaxAttempts?: number;  // default: 5
  onSendOTP: (email: string, code: string) => Promise<void>;
}
```

## Table prefix

All tables use the prefix (default `auth_`):

| Default           | `tablePrefix: 'myapp_'` | `tablePrefix: ''` |
| ----------------- | ----------------------- | ----------------- |
| `auth_users`      | `myapp_users`           | `users`           |
| `auth_sessions`   | `myapp_sessions`        | `sessions`        |
| `auth_otp_codes`  | `myapp_otp_codes`       | `otp_codes`       |
| `auth_passkeys`   | `myapp_passkeys`        | `passkeys`        |
| `auth_challenges` | `myapp_challenges`      | `challenges`      |

## WebAuthn origin

`rpID` and `origin` are derived from the request URL at runtime. No hardcoded hostnames — works on any port in dev.

Override for production with the `ORIGIN` env var if your host doesn't match the request URL.

**Important**: Passkeys are bound to the `rpID` (hostname). A passkey created on `preview.example.com` won't work on `example.com`. Use a consistent domain for production.

---

## Database migrations

Tables are created with `CREATE TABLE IF NOT EXISTS` on first `db.init()` call. If the schema changes between anahtar versions, existing tables keep the old schema — `CREATE TABLE IF NOT EXISTS` is a no-op on existing tables.

Check the changelog when upgrading. If a column was added, run an ALTER TABLE manually:

```sql
-- SQLite / D1
ALTER TABLE auth_users ADD COLUMN skip_passkey_prompt INTEGER DEFAULT 0;
```

For D1 specifically:

```sh
DATABASE=my-db
```

```sh
npx wrangler d1 execute $DATABASE --remote --command "ALTER TABLE auth_users ADD COLUMN skip_passkey_prompt INTEGER DEFAULT 0"
```

For TinyBase: no migrations needed — rows are flexible objects and new cells are simply absent on old rows.

---

## Project-specific user data

Anahtar owns `auth_users` (`id`, `email`, `created_at`, `skip_passkey_prompt`). For project-specific fields, create a separate table:

```sql
CREATE TABLE user_profiles (
  user_id TEXT PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT
);
```

Avoid foreign key constraints against `auth_users` if you may recreate auth tables during development.

```ts
// Access in your app
const profile = db
  .prepare('SELECT * FROM user_profiles WHERE user_id = ?')
  .get(locals.user.id);
```

---

## Email providers

You provide `onSendOTP` — anahtar calls it with the email address and the generated code. Throw an error to surface it to the user.

### Development

```ts
onSendOTP: async (email, code) => {
  console.log(`OTP for ${email}: ${code}`);
}
```

### Scaleway Transactional Email

Works from Cloudflare Workers with no SDK — just `fetch`.

**Setup:**
1. Register your sending domain in [Scaleway TEM](https://console.scaleway.com/transactional-email/domains) and add SPF, DKIM, DMARC DNS records
2. Create an [IAM Application](https://console.scaleway.com/iam/applications) and generate an API key
3. Create an [IAM Policy](https://console.scaleway.com/iam/policies) granting **TransactionalEmailFullAccess** (under _Domains & Web Hosting_) scoped to your project
4. Add `SCW_SECRET_KEY` and `SCW_PROJECT_ID` as worker secrets

```ts
onSendOTP: async (email, code) => {
  const scwKey = env.SCW_SECRET_KEY;
  const scwProject = env.SCW_PROJECT_ID;

  if (!scwKey || !scwProject) {
    console.log(`[dev] OTP for ${email}: ${code}`);
    return;
  }

  const res = await fetch(
    'https://api.scaleway.com/transactional-email/v1alpha1/regions/fr-par/emails',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': scwKey,
      },
      body: JSON.stringify({
        from: { name: 'MyApp', email: 'noreply@myapp.com' },
        to: [{ email }],
        subject: `Your verification code: ${code}`,
        text: `Your verification code is: ${code}\n\nExpires in 30 minutes.`,
        project_id: scwProject,
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(`Scaleway TEM error: ${res.status}`, body);
    throw new Error('Failed to send verification email');
  }
}
```

The `throw` is important — anahtar catches it and returns a 400 with the error message to the client.

The API also accepts an `html` field for styled emails alongside `text` as the plain-text fallback.
