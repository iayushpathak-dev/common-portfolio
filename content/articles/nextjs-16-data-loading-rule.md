## Introduction

In the old React PWA I worked on, every API call looked the same: a `useEffect`, a loading flag, a request helper and a `setState`. When we rebuilt that app on Next.js 16, the first real design decision was not about components or styling. It was about **where each piece of data should be loaded**. Next.js gives you three tools for it: Server Components, Server Actions and Route Handlers. Picking the wrong one works in development and causes problems in production.

This article is the rule we wrote down for the rebuild, and the bug that taught us why it matters.

## Problem statement

With the App Router, the same data can be fetched in several ways, and all of them seem to work:

- A Server Component can call the backend before the HTML is sent.
- A Server Action can run on the server when the user clicks a button.
- A Route Handler can serve JSON that a client component fetches.

Without a rule, a team ends up mixing them: reads inside Server Actions, page data fetched from the browser after hydration, writes going through a public JSON endpoint. The result is extra requests, flashing loaders and an API surface that is hard to secure.

## Learning objectives

1. Know which of the three tools fits each kind of data.
2. Understand why Server Actions should not be used for reads.
3. See how a Server Action that sets a cookie and returns can trigger extra backend calls.
4. Apply the same security checks to all three paths.

## Core concepts

- **Server Component**: runs on the server for every request (or at build time). It can call the backend directly; the browser never sees the request.
- **Server Action**: a `"use server"` function that the browser calls with a POST. Next.js runs actions from one client **one at a time**, so they are slow for anything parallel.
- **Route Handler**: a normal HTTP endpoint in `app/api/.../route.js`. A client component can call it as often as it wants, which is what client-side caching libraries like React Query need.

## Technical explanation

The rule we use:

| What the screen needs | Use | Why |
|---|---|---|
| Data needed when the page opens | Server Component | HTML arrives finished, no request visible in the browser, tokens stay on the server |
| Save, book, cancel, upload | Server Action | Validated on the server, POST only |
| Data loaded **after** the page opens, driven by the user (search, filters, "load more", date tabs) | Route Handler + React Query | Caching, race handling, retries and loading state |

React Query only replaces the third row. The first page of a list still comes from the server page and is passed in as `initialData`, so there is no loader on the first render.

All three paths follow the same checks:

- Check the session (a `proxy.js` check plus `auth()` inside every Server Action).
- Take the user's identity from the session, **never** from request params.
- Pick only the fields you need from client input.
- Return only what the screen needs, not the raw backend response.

### The extra-request bug

Our checkout flow had a Server Action that started a subscription, saved a cart id in a cookie and then returned `{ ok: true }`. The client called `router.push("/checkout")`.

In the network log, the cart endpoint was being called twice and the plan endpoint once more than expected. The cause: when a Server Action **sets cookies and returns**, Next.js re-renders the current route so the new cookies are reflected. That re-render ran the page's Server Component again, and its data calls with it.

The fix was to end the action with a server `redirect()` instead of returning and navigating on the client. The redirect is part of the action's response, so Next.js renders only the destination page once.

## Code example

A read on page open, in a Server Component:

```js
// app/orders/page.js
import { callBackend } from "@/services/backend";
import OrderList from "./_components/OrderList";

export default async function OrdersPage() {
  const res = await callBackend("my_orders", { page_number: 1 });
  return <OrderList initialPage={res.data.result} />;
}
```

A write, ending with a redirect:

```js
// actions/checkout.js
"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function subscribe(planId) {
  const session = await auth();
  if (!session) redirect("/not-authorized");

  const cartId = await createCart(session.user, toId(planId));
  (await cookies()).set("cart_id", cartId, { httpOnly: true, sameSite: "lax" });

  redirect("/checkout"); // not `return { ok: true }` + router.push
}
```

A "load more" list, through a Route Handler and React Query:

```js
const query = useInfiniteQuery({
  queryKey: ["my_orders"],
  queryFn: ({ pageParam }) => api.post("/service", { service: "my_orders", params: { page_number: pageParam } }),
  initialPageParam: 2,
  getNextPageParam: (last, pages) => (last.has_more ? pages.length + 2 : undefined),
});
```

## Production considerations

- **Count your calls.** We set a budget per flow (for example, the cart is fetched once, on the checkout page). A dev-only log of every backend call makes regressions obvious.
- **Server Actions are public endpoints.** Anyone can call them with any arguments. Validate every argument (ids as numbers or short strings, never objects) and never accept tokens from the client.
- **Route Handlers need an allowlist.** If one endpoint forwards to many backend services, only allow the services and params the browser actually needs.

## Trade-offs and alternatives

- **Everything in Server Components** gives the fastest first paint, but every filter change becomes a full navigation.
- **Everything through React Query** feels familiar to SPA developers, but the first render always shows a loader and the browser sees every request.
- **Server Actions for reads** looks convenient, but actions run one at a time and are POST only, so they don't cache and they block each other.

## Common mistakes

- Using a Server Action to fetch a list, then wondering why two lists load one after the other.
- Returning from an action that set cookies, then navigating on the client, which doubles the data calls.
- Trusting a `user_id` sent from the browser instead of reading it from the session.
- Fetching page-open data with React Query instead of passing it as `initialData`.

## Key takeaways

- Server Components for page-open data, Server Actions for writes, Route Handlers + React Query for user-driven reads.
- End a cookie-setting Server Action with `redirect()`.
- The same security checks apply to all three paths.
