import type { RequestEvent } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";
import { generateOTP, verifyOTP } from "../otp.js";
import {
  generateAuthenticationChallenge,
  generateAuthenticationChallengeForUser,
  generateRegistrationChallenge,
  removePasskey,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "../passkey.js";
import {
  createSession,
  invalidateSession,
  validateSession,
} from "../session.js";
import {
  resolveMessages,
  detectLocaleServer,
  type AuthMessages,
} from "../i18n/index.js";
import type { ResolvedConfig, SessionMethod } from "../types.js";
import { parseEmail } from "../email.js";

type RouteHandler = (event: RequestEvent) => Promise<Response>;

function getMessages(
  event: RequestEvent,
  config: ResolvedConfig,
): AuthMessages {
  const locale = config.locale ?? detectLocaleServer(event.request);
  return resolveMessages(locale, config.messages);
}

function requireAuth(
  event: RequestEvent,
  m: AuthMessages,
): { id: string; email: string } | Response {
  const user = event.locals.user;
  if (!user) return json({ error: m.errorNotAuthenticated }, { status: 401 });
  return user;
}

export function createHandlers(
  config: ResolvedConfig,
  ensureReady: () => Promise<void>,
): {
  GET: RouteHandler;
  POST: RouteHandler;
} {
  function cookieOpts(event: RequestEvent, durationMs: number) {
    return {
      httpOnly: true,
      secure: event.url.protocol === "https:",
      sameSite: "lax" as const,
      path: "/",
      maxAge: Math.floor(durationMs / 1000),
    };
  }

  async function startSession(
    event: RequestEvent,
    userId: string,
    method: SessionMethod,
  ) {
    const previous = event.cookies.get(config.cookie);
    if (previous) {
      const existing = await validateSession(config.db, previous);
      if (existing) await invalidateSession(config.db, existing.session.id);
    }
    const session = await createSession(config.db, userId, config, method);
    event.cookies.set(
      config.cookie,
      session.sessionToken,
      cookieOpts(event, config.sessionDuration(method)),
    );
  }

  async function extendCurrentSession(
    event: RequestEvent,
    method: SessionMethod,
  ) {
    const token = event.cookies.get(config.cookie);
    const current = event.locals.session;
    if (!token || !current) return;
    const duration = config.sessionDuration(method);
    const expiresAt = Date.now() + duration;
    if (expiresAt <= current.expiresAt) return;
    await config.db.updateSessionExpiry(current.id, expiresAt);
    event.cookies.set(config.cookie, token, cookieOpts(event, duration));
  }

  const routes: Record<
    string,
    { method: "GET" | "POST"; handler: RouteHandler }
  > = {
    start: {
      method: "POST",
      handler: async (event) => {
        const m = getMessages(event, config);
        const body = await event.request.json().catch(() => null);
        const email = parseEmail(body?.email);
        if (!email) {
          return json({ error: m.errorInvalidEmail }, { status: 400 });
        }

        let code: string;
        try {
          ({ code } = await generateOTP(config.db, email, config));
        } catch (err) {
          config.onError("otp-create", err, event);
          return json({ error: m.errorGeneric }, { status: 500 });
        }

        try {
          await config.onSendOTP(email, code);
        } catch (err) {
          // whatever the consumer's mail path throws is internal: the user gets the generic text
          config.onError("otp-send", err, event);
          return json({ error: m.errorGeneric }, { status: 400 });
        }

        return json({ success: true, otpLength: config.otpLength });
      },
    },

    verify: {
      method: "POST",
      handler: async (event) => {
        const m = getMessages(event, config);
        const body = await event.request.json().catch(() => null);
        const email = parseEmail(body?.email);
        if (!email || typeof body.code !== "string") {
          return json({ error: m.errorInvalidInput }, { status: 400 });
        }

        const otp = await verifyOTP(config.db, email, body.code, config);
        if (!otp.ok) {
          const messages = {
            invalid: m.errorInvalidCode,
            expired: m.errorCodeExpired,
            rate_limited: m.errorTooManyAttempts,
          };
          return json(
            { error: messages[otp.error] },
            { status: otp.error === "rate_limited" ? 429 : 400 },
          );
        }

        let user = await config.db.getUserByEmail(email);
        if (!user) {
          user = await config.db.createUser(email);
        }

        await startSession(event, user.id, "otp");

        const passkeys = await config.db.getUserPasskeys(user.id);

        return json({
          user: { id: user.id, email: user.email },
          hasPasskey: passkeys.length > 0,
          skipPasskeyPrompt: user.skipPasskeyPrompt,
        });
      },
    },

    logout: {
      method: "POST",
      handler: async (event) => {
        const token = event.cookies.get(config.cookie);
        if (token) {
          const result = await validateSession(config.db, token);
          if (result) {
            await invalidateSession(config.db, result.session.id);
          }
          event.cookies.delete(config.cookie, { path: "/" });
        }
        return json({ ok: true });
      },
    },

    "passkey/login-start": {
      method: "GET",
      handler: async (event) => {
        const options = await generateAuthenticationChallenge(
          config.db,
          event.url,
          config,
        );
        return json(options);
      },
    },

    "passkey/check-email": {
      method: "POST",
      handler: async (event) => {
        const body = await event.request.json().catch(() => null);
        const email = parseEmail(body?.email);
        if (!email) return json({ allowCredentials: [] });
        const options = await generateAuthenticationChallengeForUser(
          config.db,
          email,
          event.url,
          config,
        );
        return json(options);
      },
    },

    "passkey/login-finish": {
      method: "POST",
      handler: async (event) => {
        const m = getMessages(event, config);
        const body = await event.request.json().catch(() => null);
        if (
          typeof body?.id !== "string" ||
          typeof body.response?.clientDataJSON !== "string"
        ) {
          return json({ error: m.errorInvalidInput }, { status: 400 });
        }

        const result = await verifyAuthenticationResponse(
          config.db,
          body,
          event.url,
          config,
        );
        if (!result) return json({ error: m.errorAuthFailed }, { status: 401 });

        await startSession(event, result.user.id, "passkey");

        return json({ user: result.user });
      },
    },

    "passkey/register-start": {
      method: "POST",
      handler: async (event) => {
        const m = getMessages(event, config);
        const user = requireAuth(event, m);
        if (user instanceof Response) return user;

        const options = await generateRegistrationChallenge(
          config.db,
          user,
          event.url,
          config,
        );
        return json(options);
      },
    },

    "passkey/register-finish": {
      method: "POST",
      handler: async (event) => {
        const m = getMessages(event, config);
        const user = requireAuth(event, m);
        if (user instanceof Response) return user;

        const body = await event.request.json().catch(() => null);
        if (typeof body?.response?.clientDataJSON !== "string") {
          return json({ error: m.errorInvalidInput }, { status: 400 });
        }

        const { name, ...response } = body;
        const passkeyName =
          typeof name === "string" && name.trim() ? name.trim().slice(0, 64) : null;

        const result = await verifyRegistrationResponse(
          config.db,
          user.id,
          response,
          event.url,
          passkeyName,
          config,
        );
        if (!result.ok) {
          config.onError("passkey-register", result.reason, event);
          return json({ error: m.errorPasskeyRegFailed }, { status: 400 });
        }

        await extendCurrentSession(event, "passkey");
        return json({ success: true });
      },
    },

    "passkey/remove": {
      method: "POST",
      handler: async (event) => {
        const m = getMessages(event, config);
        const user = requireAuth(event, m);
        if (user instanceof Response) return user;

        const body = await event.request.json().catch(() => null);
        if (!body || typeof body.passkeyId !== "string") {
          return json({ error: m.errorInvalidInput }, { status: 400 });
        }

        const success = await removePasskey(config.db, body.passkeyId, user.id);
        if (!success)
          return json({ error: m.errorPasskeyNotFound }, { status: 404 });

        return json({ success: true });
      },
    },

    "passkey/list": {
      method: "GET",
      handler: async (event) => {
        const m = getMessages(event, config);
        const user = requireAuth(event, m);
        if (user instanceof Response) return user;

        const passkeys = await config.db.getUserPasskeys(user.id);
        return json(
          passkeys.map((p) => ({
            id: p.id,
            credentialId: p.credentialId,
            name: p.name,
            createdAt: p.createdAt,
          })),
        );
      },
    },

    "skip-passkey": {
      method: "POST",
      handler: async (event) => {
        const m = getMessages(event, config);
        const user = requireAuth(event, m);
        if (user instanceof Response) return user;

        await config.db.setSkipPasskeyPrompt(user.id, true);
        return json({ success: true });
      },
    },
  };

  function getRoute(
    event: RequestEvent,
    method: "GET" | "POST",
  ): RouteHandler | null {
    const path = event.params.path;
    if (typeof path !== "string" || !Object.hasOwn(routes, path)) return null;
    const route = routes[path];
    return route.method === method ? route.handler : null;
  }

  function notFound(event: RequestEvent) {
    return json({ error: getMessages(event, config).errorNotFound }, { status: 404 });
  }

  return {
    GET: async (event) => {
      await ensureReady();
      return getRoute(event, "GET")?.(event) ?? notFound(event);
    },
    POST: async (event) => {
      await ensureReady();
      return getRoute(event, "POST")?.(event) ?? notFound(event);
    },
  };
}
