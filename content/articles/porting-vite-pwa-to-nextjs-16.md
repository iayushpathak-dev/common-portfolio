## Introduction

The partner app I work on started as a Vite + React PWA: about 370 files in `src`, React Router, `useEffect` data fetching, request headers built in the browser and a service worker. It worked, but every partner screen loaded the same way: blank shell, spinner, API call, render. And everything the backend needed, including tokens, had to live in the browser.

We rebuilt it on Next.js 16 with React 19 and Tailwind CSS 4. This article covers what changed and why, and the decisions I'd make again.

## Problem statement

The old app had three structural issues:

1. **Every screen was client-rendered.** Data arrived after hydration, so every page showed a loader.
2. **The browser called the backend directly.** Request headers, including static tokens and an encrypted user payload, were built in client code.
3. **One pattern for everything.** Reads, writes, searches and "load more" all used `useEffect` plus a request helper, with no caching and hand-written race guards.

A straight copy into Next.js would have kept all three.

## Learning objectives

1. Plan a SPA-to-App Router port screen by screen.
2. Put a thin server layer (a BFF) between the browser and the backend.
3. Replace client-built auth with a server-side login.
4. Decide on language and tooling without stalling the port.

## Core concepts

- **BFF (Backend for Frontend)**: a server layer owned by the frontend team that forwards requests to the backend, adds headers and shapes responses. Here it's one Route Handler plus a server-only service map.
- **Server-only module**: a file that starts with `import "server-only"`. The build fails if client code imports it.
- **Strangler-style port**: move one screen at a time, keeping the old app live until the new screen is verified.

## Technical explanation

### 1. One proxy, one service map

```text
Browser → POST /api/service { service, params }
        → serverServices[service] → { url, method, headers }
        → backend
```

- The service map is `server-only`, so backend URLs never reach the bundle.
- `headers` can be a function of the session user, so per-user headers are built on the server.
- Only services with a `client: [param names]` list can be called from the browser, and only with those params. Everything else returns 404.
- The backend's status and body pass through unchanged; a network error becomes a `502`.

### 2. Login moved to the server

The partner apps open our app with a signed link. In the old app, the client read the token from the URL, called the auth API and stored the result in `localStorage`.

Now the link hits a Route Handler (`/verify-user`) with no page and no client JavaScript. It calls Auth.js `signIn("credentials")` on the server, which validates the token with the backend, stores the result in an encrypted httpOnly cookie and redirects to a same-site path. A missing or bad token goes to a `/not-authorized` page.

### 3. Data loading by kind, not by habit

- Page-open data → Server Component.
- Writes → Server Actions.
- User-driven reads (search, date tabs, infinite lists) → React Query through the proxy.

Before porting more screens, I scanned all of the old `src` folder and listed every place each pattern appeared: search boxes with debounce, date tabs that refetch, "see more" lists, and a value shown on two screens. That became the migration order. It also showed that the app never polled an API: what looked like polling was local countdown timers.

### 4. JavaScript, on purpose

The new project started in TypeScript and was converted to plain JavaScript on purpose. TypeScript can come back file by file when the team asks for it. Path aliases live in `jsconfig.json`, and ESLint runs the Core Web Vitals rules only. It's a team decision, not a recommendation. What helped was writing it down in the project's instructions file, so it wasn't argued again in every review.

### 5. Same look, new platform

- The same fonts via `next/font`, and the same IcoMoon icon font via `next/font/local`, with inline SVG icons replaced by the font.
- The same screen transition (fade and slide), in `app/template.js`, which re-mounts on navigation.
- Colours as Tailwind 4 theme tokens instead of raw hex values.

## Code example

The proxy route, simplified:

```js
// app/api/service/route.js
import { auth } from "@/auth";
import { callBackend } from "@/services/backend";
import { serverServices } from "@/services/serverServices";

export async function POST(request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { service, params = {} } = await request.json();
  const config = Object.hasOwn(serverServices, service) ? serverServices[service] : null;
  if (!config?.client) return Response.json({ code: 404, message: "Unknown service" }, { status: 404 });

  const allowed = Object.fromEntries(config.client.filter((k) => k in params).map((k) => [k, params[k]]));

  try {
    const res = await callBackend(service, allowed, { user: session.user });
    return res.status === 204 ? new Response(null, { status: 204 }) : Response.json(res.data, { status: res.status });
  } catch {
    return Response.json({ code: 502, message: "Backend unavailable" }, { status: 502 });
  }
}
```

## Production considerations

- **Mock the backend for verification.** Pointing the service base URL at a small local mock and using `curl` with a cookie jar let us test login, the proxy and Server Actions without real accounts.
- **Old WebViews.** The app runs inside partner apps on older Android WebViews and iOS 14. Set `browserslist` early, because it affects the JS transpiling and the CSS output.
- **Health checks that don't call the backend.** `/api/health` returns `200` without touching the backend, so a backend outage doesn't make Kubernetes restart the frontend pods.
- **Deploy config is separate.** Removing `output: "standalone"` changes the start command; the Dockerfile and process manager must match.

## Trade-offs and alternatives

- **Port in place with the Pages Router** is less work up front, but you keep client-side fetching and miss Server Components.
- **A full rewrite** is cleaner, but it's risky without a scan of the old behaviour. The scan is what made our port predictable.
- **Keep the SPA and add a separate BFF service**: a valid choice if the team doesn't want to run Next.js, but you lose server rendering.

## Common mistakes

- Copying `useEffect` fetching into client components and calling it a Next.js app.
- Porting the client-side header builder, tokens included.
- Making the proxy forward any service name the browser sends.
- Not listing the old app's patterns before choosing new ones.

## Key takeaways

- A port is a chance to move secrets and identity to the server; take it.
- One allowlisted proxy beats dozens of thin API routes.
- Scan the old code first; the migration order falls out of the scan.
