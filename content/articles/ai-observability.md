## Introduction

When an AI feature is slow, wrong or expensive, the first question is "what happened on that request?". Without observability you can't answer it. These notes cover what to measure in an LLM application (tokens, latency, failures, cost) and how to do it without logging users' private conversations.

## Problem statement

LLM requests are multi-step: validation, routing, embedding, retrieval, generation, sometimes search. Each step can be slow or fail, and costs are per token. A single "500 error" log line tells you nothing about which step broke or what it cost.

## Learning objectives

1. Choose the metrics that matter for AI requests.
2. Emit structured, privacy-safe logs with a request ID.
3. Measure time to first token and total latency.
4. Estimate cost from token usage.
5. Classify provider errors.

## Core concepts

- **Request ID**: a unique ID attached to every log line for one request, returned to the client in a header for support.
- **Span/phase timing**: duration of each phase (retrieval, generation).
- **Token usage**: input and output tokens reported by the provider.
- **Error class**: quota/rate limit, timeout, provider error, validation error.
- **Privacy by default**: log metadata about questions, not the questions themselves.

## Technical explanation

What this site's chat endpoint records per request:

| Field | Example | Why |
|---|---|---|
| requestId | `7f3c…` | Correlate logs |
| route | `personal_rag`, `web_search`, `out_of_scope` | Understand behaviour |
| retrievalMs | 180 | Find slow vector queries |
| chunkCount | 4 | Spot empty or bloated context |
| topScore | 0.71 | Tune thresholds over time |
| modelMs | 2400 | Generation latency |
| totalMs | 2650 | User-perceived latency |
| inputTokens / outputTokens | 1800 / 320 | Cost |
| error | `quota` | Failure class |

It deliberately does **not** record the question, the answer or the retrieved text.

### Cost estimation

```text
cost ≈ inputTokens × inputPrice + outputTokens × outputPrice
     + embedding calls × embeddingPrice + vector queries × queryPrice
```

On free tiers the "price" is quota: track daily usage against the documented limits so you know how close you are.

## Code example

A tiny structured logger:

```ts
export function createTrace(route: string) {
  const requestId = crypto.randomUUID()
  const start = performance.now()
  const fields: Record<string, unknown> = { requestId, route }

  return {
    requestId,
    set: (key: string, value: unknown) => void (fields[key] = value),
    time: async <T>(key: string, fn: () => Promise<T>) => {
      const t = performance.now()
      try {
        return await fn()
      } finally {
        fields[key] = Math.round(performance.now() - t)
      }
    },
    end: (error?: string) =>
      console.log(JSON.stringify({ event: "chat_request", ...fields, error, totalMs: Math.round(performance.now() - start) })),
  }
}
```

Reading token usage from the stream's `finish` part:

```ts
if (part.type === "finish") {
  trace.set("inputTokens", part.totalUsage.inputTokens)
  trace.set("outputTokens", part.totalUsage.outputTokens)
}
```

## Production considerations

- **Structured JSON logs** are searchable in hosting dashboards (Vercel, for example).
- **Sampling**: at high volume, sample detailed logs but keep counters for everything.
- **Alerts** on error rate and p95 latency, not on single failures.
- **Dashboards**: tokens per day, requests per route, abstention rate, quota usage.
- **Analytics vs logs**: product analytics (like Google Analytics) should receive coarse events only (for example "message sent", the mode, the message length), never the content.
- **Retention**: keep logs only as long as you need them.

## Trade-offs and alternatives

- **Console logs vs tracing platforms.** JSON logs are free and enough for a small app; OpenTelemetry-based tracing (and its emerging GenAI conventions) gives proper spans and dashboards at the cost of setup.
- **Logging prompts vs privacy.** Full prompts make debugging easy but create a store of personal data; logging metadata plus opt-in debug traces is a safer default.
- **Client vs server timing.** Server timing explains where time went; client timing (time to first token in the browser) is what users feel. Ideally measure both.

## Common mistakes

- Logging full prompts and answers by default.
- No request ID, so you can't connect a user report to logs.
- Only measuring total latency, not phases.
- Ignoring token usage until the bill arrives.
- Sending free-text user input to analytics tools.

## Key takeaways

- Measure per phase, per request, with a request ID.
- Tokens are cost; log them.
- Classify errors so you can tell quota from bugs.
- Observe behaviour, not private content.
