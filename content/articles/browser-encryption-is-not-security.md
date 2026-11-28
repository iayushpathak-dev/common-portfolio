## Introduction

Several of the frontends I've worked on encrypted their API requests in the browser. The request body was AES-encrypted before `fetch`, the response was decrypted after it, and the key came from an environment variable. In the network tab everything looked like random Base64, so it felt secure.

It wasn't. This article explains why, and what we did instead when we rebuilt one of those apps on Next.js 16.

## Problem statement

The setup looked like this:

- A key and IV in `NEXT_PUBLIC_*` (Next.js) or `VITE_*` / `REACT_APP_*` env vars.
- A helper that encrypts every request body and decrypts every response.
- In a Create React App project, Node's `crypto` and `stream` polyfilled into the browser bundle with webpack overrides so the encryption library would run.

The goal was to stop people from reading or changing API traffic. The setup didn't achieve that, and it added cost.

## Learning objectives

1. Understand why a key shipped to the browser is not a secret.
2. Know what HTTPS already protects and what it doesn't.
3. Move encryption that's actually needed to the server.
4. Decide what "safe" means for browser-visible data.

## Core concepts

- **Public env vars are inlined.** Next.js replaces every `process.env.NEXT_PUBLIC_*` with its value at build time. Vite does the same for `import.meta.env.VITE_*`. The key ends up as a string in a JavaScript file anyone can download.
- **HTTPS (TLS)** already encrypts traffic between the browser and the server and stops it being changed in transit.
- **The user is not the attacker you can hide from.** Anything the browser can decrypt, the person using that browser can decrypt too.

## Technical explanation

Ask what browser-side encryption protects against:

| Threat | Does browser encryption help? |
|---|---|
| Someone on the network reading traffic | No: HTTPS already prevents this |
| The user reading their own requests | No: the key is in the bundle; open DevTools, set a breakpoint after decrypt |
| The user changing a request (another `user_id`, a lower price) | No: they can call the same encrypt function with any payload |
| A script on the page reading data | No: it runs in the same context as the decrypt function |

It does have costs:

- **Bundle size**: crypto libraries plus `crypto-browserify`, `stream-browserify` and `buffer` polyfills.
- **Debugging**: every request and response is unreadable in the network tab, for your own team too.
- **False confidence**: the backend team may assume the frontend has "secured" the traffic and skip real checks.

### What "safe" actually means

When we rebuilt the vendor app on Next.js 16, we wrote down a simpler definition:

- **No secrets in the browser.** Backend URLs, auth tokens, app keys and encryption keys live only in `server-only` files and non-public env vars.
- **No request can act as another user.** The server takes the user's identity from the session cookie, never from request params.
- **The browser may see its own data.** Anything shown on screen has to reach the browser anyway; hiding it in the network tab adds nothing.

### Where encryption still belongs

Our backend expects an encrypted user payload header on some services. That's fine, as long as the encryption happens on the server:

```text
Browser → POST /api/service { service, params }       (plain JSON over HTTPS)
        → Next.js server: read user from session,
          build the payload, encrypt with a server-only key
        → Backend
```

The key never leaves the server, so the user can't create a payload for someone else.

## Code example

Before: key in a public env var, encrypted in the browser.

```js
// runs in the browser, and the key is in the bundle
import cryptLib from "cryptlib";

export const encryptPayload = (json) => {
  const key = cryptLib.getHashSha256(process.env.NEXT_PUBLIC_PAYLOAD_KEY, 32);
  return cryptLib.encrypt(JSON.stringify(json), key, process.env.NEXT_PUBLIC_PAYLOAD_IV);
};
```

After: the same encryption with `node:crypto`, in a server-only module.

```js
// services/headers.js
import "server-only";
import { createCipheriv, createHash } from "node:crypto";

const key = createHash("sha256").update(process.env.PAYLOAD_HASH).digest("hex").slice(0, 32);

function encrypt(text) {
  const cipher = createCipheriv("aes-256-cbc", Buffer.from(key), Buffer.from(process.env.PAYLOAD_IV));
  return Buffer.concat([cipher.update(text, "utf8"), cipher.final()]).toString("base64");
}

export function userHeaders({ user }) {
  if (!user) throw new Error("No session user");
  return { "X-User-Payload": encrypt(JSON.stringify({ user_id: user.user_id /* ... */ })) };
}
```

`import "server-only"` makes the build fail if a client component ever imports this file.

## Production considerations

- **Rotate any key that was ever public.** If a key shipped in a bundle, assume it's known. Moving it to the server doesn't make the old one secret again.
- **Search old bundles for hardcoded tokens.** Default headers with static auth tokens or app keys in client code are the same problem as a public encryption key.
- **Check Origin and use secure cookies.** Next.js checks `Origin` against `Host` for Server Actions; keep session cookies `httpOnly`, `secure` and `SameSite=Lax`.
- **The backend must still check ownership.** Encryption doesn't tell the backend whether the cart, order or booking id belongs to the user.

## Trade-offs and alternatives

- **Request signing with a server-held key** (HMAC) proves a request came through your server. It only helps if the browser can't reach the backend directly.
- **End-to-end encryption** (for example in a chat app) is a different case: the keys belong to the users and the server isn't supposed to read the messages.
- **Obfuscation** slows down casual inspection. That's all it does.

## Common mistakes

- Treating `NEXT_PUBLIC_` or `VITE_` variables as secret.
- Polyfilling Node's `crypto` into the browser so a server library will run there.
- Hardcoding fallback tokens or keys in client header helpers.
- Taking `user_id` from a decrypted request body and trusting it.

## Key takeaways

- A key the browser can use is a key the user has.
- HTTPS protects the network; server-side checks protect the data.
- If the backend needs an encrypted payload, build and encrypt it on the server.
