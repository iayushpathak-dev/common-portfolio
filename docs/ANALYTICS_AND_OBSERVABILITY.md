# Analytics and Observability

Two separate systems with different purposes:

| | Website analytics | AI request observability |
|---|---|---|
| Question it answers | What do visitors do? | Did this chat request work, how fast, how expensive? |
| Where | Browser → GA4 / GTM | Server → Vercel runtime logs |
| Code | `app/layout.tsx`, `lib/analytics.ts` | `lib/rag/telemetry.ts`, `lib/rag/index-status.ts` |
| Contains user text? | Search box terms only (see §5) | Never |

## 1. Setup (implemented)

`app/layout.tsx`:

```tsx
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
...
{GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
<body> {GTM_ID && <noscript><iframe src=".../ns.html?id=..." /></noscript>} … </body>
{GA_ID && <GoogleAnalytics gaId={GA_ID} />}
```

- Both come from `@next/third-parties/google` and load after hydration.
- Locally, `.env.local` sets both IDs (values not reproduced here). Production needs them in
  Vercel; whether they are set there could not be checked from the repository.

## 2. Page views

- **Not sent by application code.** GA4's "enhanced measurement → page changes based on browser
  history events" (on by default in GA4 properties) records client-side navigations in the
  App Router. This depends on the GA property setting, which isn't visible from the code.
- **Duplicate risk:** if the GTM container also contains a GA4/Google tag for the same
  property, every page view and event is counted twice. The code can't prevent that; use either
  `NEXT_PUBLIC_GA_ID` **or** a GA4 tag inside GTM, not both.

## 3. Custom events (implemented)

All go through `trackEvent(name, params)` in `lib/analytics.ts`, which calls
`sendGAEvent("event", name, params)` if GA is configured and
`sendGTMEvent({ event: name, ...params })` if GTM is configured.

| Event | Fired in | Params |
|---|---|---|
| `search` (GA4 recommended event) | `useTrackSearch` in `components/blog/blog-list.tsx` (location `blog`) and `components/assistant/chat-sidebar.tsx` (location `chat_history`) | `search_term`, `search_location`, `result_count` |
| `filter_select` | Blog category pills (`blog-list.tsx`), project filters (`project-browser.tsx`) | `filter_location`, `filter_value` |
| `chat_message_sent` | `assistant.tsx` `send()` and the `?ask=` URL intent | `chat_mode`, `message_length`, `source` (`composer`/`link`) |
| `resume_print` | `components/resume/print-button.tsx` | — |

`useTrackSearch` debounces 1 s, skips empty terms and repeats of the last sent term (case
insensitive), and reads the latest result count without restarting the timer.

**Planned / not implemented:** outbound link clicks (resume download, LinkedIn), case-study
views, "Ask AI" clicks from cards, assistant answer feedback (thumbs buttons are local state
only), answer route/source kind.

## 4. Testing events
1. GA4 → Admin → DebugView, with the Google Analytics Debugger extension or `?debug_mode`.
2. GTM → Preview mode → watch `dataLayer` pushes.
3. Locally: DevTools console → `window.dataLayer` after typing in the blog search and waiting 1 s.
4. In GA4, register custom dimensions for `search_term`, `search_location`, `filter_value`,
   `chat_mode` to see them in reports.

## 5. Privacy

- **Not sent:** chat prompts, answers, retrieved content, message text (only its length).
- **Sent:** what visitors type in the blog search and the chat-history search
  (`search_term`). Chat-history search terms are words from the visitor's own chat titles —
  potentially personal. See [SECURITY_REVIEW.md](SECURITY_REVIEW.md) finding S-6.
- No consent banner is implemented. Whether one is needed depends on audience and
  jurisdiction.

## 6. AI request observability (implemented)

`createTrace()` (`lib/rag/telemetry.ts`) collects fields during the request and prints **one**
JSON line in `trace.end()`:

```json
{"event":"chat_request","requestId":"…","mode":"auto","intent":"personal","candidates":0,
 "topScore":null,"chunkCount":9,"route":"fallback","searchUnavailable":false,
 "inputTokens":2174,"outputTokens":291,"modelMs":7756,"totalMs":7760}
```
(real line from a local run)

| Field | Meaning |
|---|---|
| `requestId` | Also returned as the `x-request-id` header |
| `mode`, `intent`, `route` | Routing decisions |
| `retrievalMs`, `candidates`, `topScore`, `chunkCount` | Retrieval health and threshold tuning |
| `modelMs`, `inputTokens`, `outputTokens` | Latency and cost |
| `searchUnavailable`, `error` | Failures by class (`retrieval_*`, `search_*`, `model_*`) |

Indexing logs: `rag_index` (full report), `rag_index_failed`, `rag_index_status_error`.
Tested: `tests/rag/pipeline.test.ts` "logs route, timings, chunk count and tokens, but never the
question or answer".

**Not implemented (recommended):** time to first token, dashboards/alerts (Vercel log drains or
an OpenTelemetry exporter), daily aggregates (abstention rate, error rate per class), linking
the thumbs feedback to request IDs.
