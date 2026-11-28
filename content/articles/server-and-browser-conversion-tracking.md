## Introduction

The FITPASS website's landing pages and membership funnels are paid for by ads, so marketing needs every step tracked: page view, sign-up, checkout, purchase. They need it in three tools: Google Analytics 4, the Meta Pixel and Segment. Browser-only tracking loses events to ad blockers, iOS privacy features and users who close the tab right after paying.

This article covers how we send the same events to three tools from one call, and how we added Meta's Conversions API on the server without counting conversions twice.

## Problem statement

- Each tool has its own API (`gtag`, `fbq`, `analytics.track`) and its own payload rules.
- Campaign data (`gclid`, `utm_source`) arrives on the landing page but is needed on the purchase event, several pages and an OTP login later.
- Browser events get blocked or lost when the page closes.
- Sending personal data to an ad platform needs care: Meta expects email and phone **hashed**.

## Learning objectives

1. Send one event to several analytics tools with one call.
2. Keep campaign attribution across a multi-step funnel.
3. Send conversions from the server with Meta's Conversions API (CAPI).
4. Deduplicate browser and server events.

## Core concepts

- **Conversions API (CAPI)**: Meta's server-to-server endpoint for events. It isn't affected by ad blockers.
- **`event_id`**: an id you choose for each event. If the Pixel and CAPI send the same event name with the same `event_id`, Meta counts it once.
- **`fbp` / `fbc`**: Meta's first-party cookies (browser id and click id). Sending them with server events lets Meta match the event to the ad click.
- **Normalised hashing**: lowercase and trim, then SHA-256. Phone numbers in E.164 format (`+91…`) before hashing.

## Technical explanation

### 1. One call, three tools

`trackMultiEvent(eventName, payload, { google, facebook, segment }, isFinalStep)` decides per event which tools receive it. Each tool's call is in its own `try/catch`, so one failing SDK doesn't stop the others. Segment only fires when a logged-in user id is known.

### 2. Attribution that survives the funnel

The proxy (`proxy.js`, formerly middleware) looks at every request's query string. If it has a `gclid` or `utm_source`, it saves the query string in a cookie for 24 hours. On the client, tracking data such as the source page URL is merged into a `localStorage` object at each step, so later events carry it. At the final step (purchase), it's cleared so the next journey starts clean.

### 3. Server-side conversions

The browser doesn't call Meta directly for CAPI. It sends the event to our own Route Handler with `navigator.sendBeacon`, which the browser delivers **even if the page is navigating away**, falling back to `fetch`. The server then:

- reads the client IP from `x-forwarded-for` and the user agent from headers;
- reads the `_fbp` and `_fbc` cookies;
- hashes email, phone, first name and last name;
- posts to the Conversions API with the access token, which stays on the server.

Events are only sent in production, so test traffic doesn't pollute the ad account.

### 4. Choosing event ids

The `event_id` should be **stable** for the same real-world event:

- **Purchase** → the payment id. A retried or duplicated call still counts once.
- **CompleteRegistration** → the user id.
- **PageView / InitiateCheckout** → a new UUID per event.

For deduplication to work, the Pixel call in the browser must send the **same** id: `fbq("track", "Purchase", data, { eventID })`.

## Code example

The client side, safe to call during navigation:

```js
export function metaEvent(event, { eventId, user = {}, customData = {} } = {}) {
  if (process.env.NEXT_PUBLIC_ENV !== "prod") return;
  const body = JSON.stringify({ event, eventId, user, customData });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/meta", new Blob([body], { type: "application/json" }));
    return;
  }
  fetch("/api/meta", { method: "POST", headers: { "Content-Type": "application/json" }, body });
}
```

The server side:

```js
import { sha256 } from "js-sha256";
import { cookies, headers } from "next/headers";

const hash = (v = "") => sha256(v.trim().toLowerCase());
const toE164India = (phone = "") => {
  const d = String(phone).replace(/\D/g, "");
  return d ? `+${d.startsWith("91") && d.length > 10 ? d : `91${d.slice(-10)}`}` : "";
};

export async function trackMetaEvent({ event, eventId, user = {}, customData = {} }) {
  const c = await cookies();
  const h = await headers();

  const payload = {
    event_name: event,
    event_time: Math.floor(Date.now() / 1000),
    event_id: String(eventId),
    action_source: "website",
    user_data: {
      em: user.email ? hash(user.email) : undefined,
      ph: user.phone ? hash(toE164India(user.phone)) : undefined,
      client_ip_address: h.get("x-forwarded-for")?.split(",")[0]?.trim(),
      client_user_agent: h.get("user-agent"),
      fbp: c.get("_fbp")?.value,
      fbc: c.get("_fbc")?.value,
    },
    custom_data: customData, // e.g. { value: 2999, currency: "INR", content_ids: ["gold-12m"] }
  };

  await fetch(`https://graph.facebook.com/${process.env.META_API_VERSION}/${process.env.META_PIXEL_ID}/events?access_token=${process.env.META_ACCESS_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: [payload] }),
  });
}
```

## Production considerations

- **Consent.** Check your consent rules (and India's DPDP Act) before sending user data to ad platforms, hashed or not.
- **Validate the Route Handler input.** `/api/meta` is public: allowlist event names and limit payload size, or anyone can send fake conversions.
- **Use Meta's test event code** in a staging setup instead of turning tracking off completely, so the integration is tested before production.
- **Don't log payloads.** Even hashed identifiers are personal data.

## Trade-offs and alternatives

- **Google Tag Manager server-side** or a CDP like Segment can fan out events for you; that's less code, but one more paid service.
- **Server-only tracking** is reliable but loses browser context (scroll, clicks) unless you send it explicitly.
- **`localStorage` vs cookies for attribution**: `localStorage` is easier on the client; a cookie can be read on the server.

## Common mistakes

- Hashing without normalising (`" Ayush@Mail.com"` and `"ayush@mail.com"` give different hashes).
- Phone numbers without a country code.
- Random event ids on both the browser and server side, so nothing deduplicates.
- Firing events from development and testing environments into the live ad account.

## Key takeaways

- One tracking function, many destinations, each isolated by its own `try/catch`.
- `sendBeacon` for events that happen right before navigation.
- Server events plus stable, shared `event_id`s give reliable, deduplicated conversions.
