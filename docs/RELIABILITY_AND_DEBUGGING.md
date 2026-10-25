# Reliability and Debugging

## 1. The "Failed to fetch the chat response." investigation

### What the message means (verified in the installed SDK)
In `node_modules/ai/dist/index.js`, the chat transport does:

```js
if (!response.ok) throw await createUIApiCallError({ response, url: api,
  fallbackMessage: "Failed to fetch the chat response." })
...
async function createUIApiCallError({ response, url, fallbackMessage }) {
  const responseBody = await response.text();
  return new APICallError$1({ message: responseBody || fallbackMessage, ... })
}
```

So the exact text appears **only when `/api/chat` returns a non-2xx status with an empty body**.
A network failure produces a different message, and any JSON body (`{ "error": ... }`) would be
shown instead (today the UI parses it via `friendlyError()` in `assistant.tsx`).

### What returns a non-2xx empty body (verified in the installed Next.js)
`node_modules/next/dist/build/templates/app-route.js`: when a route handler **throws** before
the response is sent, Next.js responds with `new Response(null, { status: 500 })`.

### The code path that threw (verified in git `HEAD:app/api/chat/route.ts`, the version you were running)

```ts
// Auto and Web modes always tried Google Search first:
const attempt = await peekForError(run(mode))
if (attempt.error && isQuotaError(attempt.error)) {
  searchUnavailable = true
  stream = run("knowledge")
} else {
  stream = attempt.stream          // ← null when attempt.error is NOT a quota error
}
...
return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream, ... }) })
```

`peekForError` returned `{ error, stream: null as never }` for **any** error. Only 429s were
handled; any other provider error (e.g. a 400/500/503 from the search-grounded request) left
`stream` as `null`, `toUIMessageStream` threw, and Next.js returned an empty 500 →
"Failed to fetch the chat response."

Why it looked intermittent and "from the start": in the old code **every** Auto-mode question
went through the search-grounded request first (the screenshot's "Ask AI" question used Auto
mode), so any transient provider error on that request triggered it.

### Status: likely root cause; fixed and tested; **not confirmed against production logs**
- The causal chain above is supported by the three code excerpts, but the original failing
  request was not captured. No Vercel logs or provider error bodies were available, so the
  specific upstream error can't be confirmed.
- **Fix (tested):** the new pipeline (`generate()` in `lib/rag/pipeline.ts`) falls back to an
  answer without search on **any** search error, and every later failure is sent as an `error`
  chunk on a 200 stream with a readable message. Test: `tests/rag/pipeline.test.ts`
  "falls back to an answer without search when search fails for any reason, not only quota".
- **Related bugs found and fixed while verifying (tested + exercised locally):**
  1. *Empty answers* — Gemma spent 998 of 1000 output tokens on hidden reasoning and returned
     no text (observed in a local run: `outputTokens: 998`, zero text). Fix:
     `thinkingLevel: "minimal"` for Gemma (`lib/rag/models.ts`) + an `emptyAnswer` error when no
     text arrives. After the fix the same question returned 1,327 characters in 7.8 s.
  2. *Silent truncation on timeout* — the model timeout ended the stream like a normal finish.
     Now it sends "The answer took too long…" and no sources.
  3. *Too-short function duration* — the old route had `maxDuration = 30`; locally measured
     answers took 19–33 s before the reasoning fix. Now `maxDuration = 60` with a 50 s model
     timeout.

### Diagnostic procedure if it happens again
1. Browser DevTools → Network → the `/api/chat` request: note **status**, **response body**,
   and the `x-request-id` response header.
   - 500 + empty body → an unhandled exception in the route (should no longer happen; look for
     a stack trace in Vercel logs at that time).
   - 500 + `notConfigured` JSON → missing `GOOGLE_GENERATIVE_AI_API_KEY` in that environment.
   - 429 → rate limit (shown as a readable message now).
   - 504 / text body mentioning `FUNCTION_INVOCATION_TIMEOUT` → `maxDuration` exceeded.
   - 200 but an error in the UI → an `error` chunk; read the SSE stream in the Response tab.
2. Vercel → Logs → filter by the request ID: the `chat_request` line has `route`, `intent`,
   `error` (`model_quota`, `model_provider`, `model_timeout`, `model_empty`,
   `retrieval_*`, `search_*`), `retrievalMs`, `modelMs`, tokens.
3. Reproduce with curl (works against local or production):
   ```bash
   curl -sN https://<site>/api/chat -H 'content-type: application/json' \
     -d '{"mode":"auto","messages":[{"id":"1","role":"user","parts":[{"type":"text","text":"What did you build at FITPASS?"}]}]}'
   ```
4. In development only: React Strict Mode runs effects twice. `UrlIntent` (assistant.tsx)
   removes the `?ask=` param with `router.replace` after handling it, but a double send in
   development is worth ruling out by watching the Network tab for two `/api/chat` requests.
   (Hypothesis, not observed.)

## 2. Client request lifecycle (`useChat`)

- `sendMessage` → status `submitted` → first chunk → `streaming` → `ready` (or `error`).
- `busy = status === "submitted" || status === "streaming"` blocks duplicate sends in `send()`,
  `ChatComposer.submit()` and the suggestion chips (`HeroCard disabled={busy}`).
- `stop()` aborts the fetch. `regenerate({ body: { mode } })` re-sends.
- `onFinish({ isError })` saves history only when there was no error.

## 3. Server route lifecycle

```
POST → key check → rate limit (fails open) → body ≤ 100 KB → JSON.parse → parseChatRequest
     → createTrace → runChat (returns a stream immediately) → createUIMessageStreamResponse
```
Everything after `runChat` happens **inside the stream**: by then the HTTP status is 200, so
errors must be sent as `error` chunks (`createUIMessageStream({ onError })`).

## 4. Streaming protocol

Server-Sent Events with the AI SDK UI message protocol. A successful RAG answer looks like:

```
data: {"type":"start","messageMetadata":{"createdAt":…,"mode":"auto","route":"personal_rag","requestId":"…"}}
data: {"type":"start-step"}
data: {"type":"text-start","id":"…"}
data: {"type":"text-delta","id":"…","delta":"At FITPASS…"}
…
data: {"type":"text-end","id":"…"}
data: {"type":"finish-step"}
data: {"type":"source-url","sourceId":"experience-fitpass","url":"https://ayushpathak.co.in/experience","title":"…"}
data: {"type":"finish"}
data: [DONE]
```

Fixed replies (`writeFixedReply`) send `start`, one `text-start/delta/end`, and `finish`.
Errors send `{"type":"error","errorText":"…"}`.

## 5. Abort signals and timeouts

| Timeout | Value | Where | On expiry |
|---|---|---|---|
| Retrieval | 8 s | `withTimeout` in `retrieve.ts` | `TimeoutError` → degraded route (no cancellation of the HTTP call) |
| Model | 50 s | `AbortSignal.timeout` in `generate()` | `error` chunk "took too long" |
| Function | 60 s | `maxDuration` in the route | Platform kills the function |
| Client cancel | — | `req.signal` → `AbortSignal.any` | Model request aborted; not reported as timeout |

## 6. Provider rate limits and retries

- `maxRetries: 1` (normal) / `0` (web search). The AI SDK retries with backoff on retryable errors.
- 429 from Gemini → `errorClass() === "quota"` → "usage limit was reached" message.
- **No client-side automatic retry**; the user decides with the Retry button.

## 7. Vector database failures

See [AI_REQUEST_LIFECYCLE.md](AI_REQUEST_LIFECYCLE.md) Scenario 5. Indexing failures return
HTTP 207 with `failed[]`; the CLI exits 1, so the GitHub workflow fails visibly.

## 8. Rate limiting

- `getChatRateLimiter()`: Upstash sliding window (default 10 per 60 s per hashed IP) when Redis
  is configured; otherwise an **in-memory fixed window per serverless instance** (best effort).
- Verified locally against the production build: requests 9 and 10 in a minute returned 429 with
  `Retry-After` (the server had already handled 2 requests).
- Limiter errors fail open (chat stays available).

## 9. Serverless limits

- Vercel Hobby functions: `maxDuration = 60` is declared; check the current plan limit in the
  Vercel dashboard.
- Each instance has its own memory: the query-embedding cache and the in-memory limiter are
  per instance and reset on cold starts.

## 10. Structured errors and diagnostics

- Pre-stream errors: `{ "error": string }` JSON + HTTP status.
- In-stream errors: `error` chunk with a safe, user-facing message (`userMessageFor`).
- Logs: exactly one `chat_request` JSON line per request (`trace.end()` in `finally`), plus
  `rag_index` / `rag_index_failed` / `rag_index_status_error` for indexing.
- `x-request-id` header on chat responses ties the browser to the log line.

## 11. Debugging checklist

| Question | Check |
|---|---|
| Did the request reach the pipeline? | A `chat_request` log line with the request ID |
| Which route ran? | `route`, `intent`, `mode` |
| Was retrieval slow or empty? | `retrievalMs`, `candidates`, `topScore`, `chunkCount` |
| Did the model fail? | `error` starting with `model_` |
| Was search skipped? | `searchUnavailable: true`, `error: "search_*"` |
| Is it the index? | `GET /api/rag/reindex` (last run), Upstash console vector count |
