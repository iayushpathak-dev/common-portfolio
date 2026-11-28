## Introduction

Halfway through rebuilding a partner app on Next.js 16, I stopped adding features and reviewed the security of what we had: login, the API proxy, Server Actions, cookies, logs and dependencies. I wrote every finding into a document with a severity, an owner (frontend, backend or DevOps) and a fix, plus a checklist for new code.

The review found 14 issues. None of them were exotic. Most came from defaults, from temporary debug code, or from assuming another layer would handle something. This article covers the kinds of issues it found and how to look for them in your own app.

## Problem statement

A Next.js App Router app has more server entry points than it looks:

- Every Server Action is a public POST endpoint.
- Every Route Handler is an HTTP API.
- Auth libraries add their own routes.
- `proxy.js` (formerly `middleware.js`) runs before all of them, but only as an optimistic check.

It's easy to secure the endpoint you wrote and miss the ones that came with the framework.

## Learning objectives

1. List every server entry point in an App Router app.
2. Find the issues that come from library defaults.
3. Sort findings by severity and owner.
4. Turn the review into a checklist for new code.

## Core concepts

- **Severity.** *High*: a logged-in user can abuse it now. *Medium*: real risk that needs a fix or a backend answer before production. *Low*: hardening.
- **Owner.** Many issues can't be fixed in the frontend alone: ownership checks belong to the backend, rate limits to the gateway, host headers to DevOps.
- **Defence in depth.** The proxy is a first check; every Server Action and API route checks the session again; the backend validates the user on every call.

## Technical explanation

### 1. A built-in route that lets users edit their own session

Auth.js exposes `GET` and `POST /api/auth/session`. With a JWT session and a `jwt` callback that merges `trigger === "update"` data into the token, any logged-in user can fetch a CSRF token and POST new values for their own session. If the server later trusts those fields (a corporate id, a mobile number) to build backend headers, the user can change who they appear to be.

**Fix:** close the endpoint (we return 404 for both methods; nothing in the app needs it because `auth()` and `unstable_update` run on the server), and only accept a fixed allowlist of fields in the `jwt` update merge.

### 2. Temporary logs that print tokens

A "log the full auth response until we confirm its shape" line printed tokens and personal data to production logs. Debug logging in the API layer printed request headers.

**Fix:** wrap debug logging in a single dev-only flag. In production, log the service name, status and code, never bodies or headers.

### 3. Backend responses in the browser console

Same issue on the client: `console.log(response)` in a coupon flow.

**Fix:** remove it, or strip `console.*` from production builds (Vite: `esbuild.drop`; Next.js: `compiler.removeConsole`).

### 4. Ids the backend must check

The frontend takes the user from the session, but a cart, booking or order id still comes from the client. Only the backend can check that the id belongs to that user.

**Fix (backend):** check ownership for every API that takes an id; answer 403 or 404 otherwise.

### 5. Redirect URLs built from the Host header

When the site's own URL wasn't configured, a payment `redirect_url` fell back to the request's `Host` header, which the client controls.

**Fix:** always set the site URL in production, make the helper throw when it's missing, and have nginx pass only the real host.

### 6. Login links, CSRF and session lifetime

The partner apps open ours with a signed token in the URL. URLs end up in logs and browser history, and a forged link could log a victim in as the attacker. The session also lasted 30 days regardless of the backend token's expiry.

**Fix:** short-lived, single-use tokens (backend); `redirect_url` limited to same-site paths (`/...`, never `//...`); session `maxAge` tied to the backend token's `exp`.

### 7. The usual hardening

No security headers yet (CSP with `frame-ancestors`, `nosniff`, `Referrer-Policy`, HSTS); a cookie `secure` flag that depended on the `Origin` header; uploads checked by extension only; an error page that showed any text from the URL; a dependency with known advisories.

### What was already right

- The browser never calls the backend directly.
- Keys and tokens live only in `server-only` files and non-public env vars.
- The API proxy only runs allowlisted services, with allowlisted params.
- Every Server Action checks the session and validates ids as numbers or short strings.
- Sensitive ids (cart, invoice, order) travel in httpOnly cookies, not URLs.
- Backend HTML is sanitized before `dangerouslySetInnerHTML`.

## Code example

Closing the Auth.js session endpoint while keeping the other routes:

```js
// app/api/auth/[...nextauth]/route.js
import { handlers } from "@/auth";

const closed = () => new Response(null, { status: 404 });
const isSession = (req) => new URL(req.url).pathname === "/api/auth/session";

export const GET = (req) => (isSession(req) ? closed() : handlers.GET(req));
export const POST = (req) => (isSession(req) ? closed() : handlers.POST(req));
```

A scalar check for Server Action arguments:

```js
export function scalar(value, { max = 64 } = {}) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.length > 0 && value.length <= max) return value;
  throw new Error("Invalid input");
}
```

## Production considerations

- **Write the review down.** A table with issue, severity and owner is easier to act on than a chat thread, and the backend and DevOps items need tickets.
- **Re-review after big changes.** Adding a new action, cookie, log or backend call should start with the checklist.
- **Run `npm audit --omit=dev`** before every release.

## Trade-offs and alternatives

- **Database sessions instead of JWT** make server-side revocation easy, at the cost of a store lookup per request.
- **Rate limiting at the gateway vs in the app**: the gateway is cheaper and protects everything; app-level limits can be smarter per user.
- **A strict CSP** is the strongest XSS defence, but third-party SDKs (chat, video, analytics) make it hard to write. Start with `frame-ancestors` and `object-src 'none'`.

## Common mistakes

- Securing your own routes and forgetting the library's routes.
- "Temporary" logs that ship to production.
- Assuming the backend checks ownership without asking.
- Trusting the `Host` or `Origin` header to build URLs or cookie flags.

## Key takeaways

- List every entry point, including the ones the framework adds.
- Give every finding a severity and an owner.
- Turn the review into a checklist so new code starts safe.
