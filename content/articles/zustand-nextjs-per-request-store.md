## Introduction

Zustand's quick-start is one line: `export const useStore = create(...)`. In a Vite SPA that's perfect. Each browser tab loads the module once, so each user gets their own store.

In a Next.js App Router app, the same line can show one user's data to another. When we set up client state in our Next.js 16 rebuild, we used the store factory + React Context pattern instead. This article explains the problem and the pattern.

## Problem statement

Client components in the App Router are also rendered **on the server** for the first HTML. The server is a long-running Node.js process that handles many users' requests. A module is loaded once per process, not once per request.

So a store created at module level is **one object shared by every request on that server**. If request A puts a user into the store during render, request B, rendered a moment later for a different person, can read it.

## Learning objectives

1. Understand why module-level state is shared on the server.
2. Create one Zustand store per request and per browser session.
3. Read the store with selectors, without extra re-renders.
4. Decide what belongs in a client store at all.

## Core concepts

- **Module scope**: code at the top level of a file runs once when the module is first imported. On the server, that's once per process.
- **Store factory**: a function that creates a new store each time it's called (`createStore` from `zustand/vanilla`).
- **Context provider**: a client component that calls the factory once (with `useState`) and shares that store with its subtree.

## Technical explanation

The unsafe version:

```js
// store.js: one store for the whole server process
import { create } from "zustand";
export const useAppStore = create((set) => ({ user: null, setUser: (user) => set({ user }) }));
```

If any client component sets `user` during the server render, or a server-provided initial value is written into this store, it stays there for the next request.

The safe version has three parts:

1. **A factory** that builds a store from initial state.
2. **A provider** that creates the store once per mount: once per request on the server, and once per page load in the browser.
3. **A hook** that reads the store from context and takes a selector.

`useState(() => createAppStore(initState))` matters here: the factory runs once per provider instance, and the store survives re-renders. `useRef` works too; `useMemo` doesn't guarantee it.

### What we keep out of the store

- **Page-open data**: it comes from Server Components as props.
- **Server state** (lists, search results): that's React Query's job, with caching and refetching.
- **Anything the server needs on the first render**: Zustand and `localStorage` don't exist on the server. In our checkout flow, the last order id goes into an httpOnly cookie instead, so the order page can read it on the server.

What's left for Zustand is small: UI state shared by distant client components. We also decided not to persist the store; it lives in memory only.

## Code example

```js
// store/app-store.js
import { createStore } from "zustand/vanilla";

export const defaultInitState = { user: null };

export const createAppStore = (initState = defaultInitState) =>
  createStore()((set) => ({
    ...initState,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
  }));
```

```js
// store/AppStoreProvider.js
"use client";
import { createContext, useContext, useState } from "react";
import { useStore } from "zustand";
import { createAppStore } from "./app-store";

const AppStoreContext = createContext(null);

export function AppStoreProvider({ children, initState }) {
  const [store] = useState(() => createAppStore(initState));
  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(selector) {
  const store = useContext(AppStoreContext);
  if (!store) throw new Error("useAppStore must be used within AppStoreProvider");
  return useStore(store, selector);
}
```

Usage:

```js
const user = useAppStore((s) => s.user);
```

The provider sits in `app/providers.js`, which the root layout wraps around the whole app, next to the React Query client. The `QueryClient` is created with `useState` for the same reason.

## Production considerations

- **Pass only what the client needs** as `initState`. Anything you put there is serialized into the HTML.
- **Never put tokens in client state.** Our backend token lives in the encrypted session cookie and is read only on the server.
- **Use selectors.** `useAppStore((s) => s.user)` re-renders only when `user` changes; `useAppStore((s) => s)` re-renders on every change.

## Trade-offs and alternatives

- **React Context alone** is enough for state that rarely changes. Zustand helps when many components read different slices of frequently changing state.
- **URL state** (search params) is better for filters and tabs: it survives a reload and can be shared.
- **A module-level store is fine in a pure SPA** (Vite, no SSR). The risk only appears when the same module renders on a shared server.

## Common mistakes

- Copying the SPA quick-start into an App Router project.
- Creating the store inside the component body without `useState` or `useRef`, which makes a new store on every render.
- Putting server data into Zustand and then hand-writing cache logic React Query already has.
- Reading `localStorage` during render and getting hydration mismatches.

## Key takeaways

- On the server, module-level state is shared between users.
- Create one store per request with a factory and a context provider.
- Keep the client store small; server data and page-open data belong elsewhere.
