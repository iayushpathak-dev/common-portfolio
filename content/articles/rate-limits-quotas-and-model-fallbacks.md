## Introduction

Some of the hardest problems in my portfolio's AI assistant were not about the prompt or retrieval. They came from the provider and the edges around it: empty answers, timeouts and quota limits, which are more common on small, cheap models and low tiers. These notes cover how the assistant handles rate limits, timeouts and provider errors, and which fallbacks I would add next, so the user always gets a sensible response.

## Problem statement

An LLM call can fail in more ways than a normal API: 429 quota errors, provider overload, timeouts on long generations, empty or truncated output and safety refusals. If the UI shows "Failed to fetch" for all of them, users assume the whole feature is broken.

## Learning objectives

1. Classify provider failures into a small set of error kinds.
2. Rate-limit your own endpoint before the provider does.
3. Add timeouts and decide what to do when they fire.
4. Design fallbacks and user-facing messages per error kind.

## Core concepts

- **Your rate limit vs theirs**: limit per user (for example per IP per minute) so one visitor cannot exhaust the shared provider quota.
- **Error classification**: quota, timeout, provider error, empty answer, validation error.
- **Fallback chain**: a cheaper or different model, a simpler route, or a fixed helpful reply.
- **Buffer before sending**: hold the first part of the stream server-side so a failure can be swapped for a fallback before the client sees anything.

## Technical explanation

```text
request ─► own rate limit (429 to client if exceeded)
        ─► validate input
        ─► call model with timeout
            ├─ ok, non-empty      ─► stream answer
            ├─ 429 / quota        ─► "quota" ─► fallback model or friendly retry-later message
            ├─ timeout            ─► "timeout" ─► shorter prompt / fallback route
            ├─ empty answer       ─► "empty" ─► retry once, then fixed reply
            └─ other provider err ─► "provider" ─► fixed reply, log with request ID
```

## Code example

A small classifier, similar to the one in this site's telemetry code:

```ts
type FailureKind = "quota" | "timeout" | "provider" | "empty"

function classify(error: unknown): FailureKind {
  if (error instanceof DOMException && error.name === "TimeoutError") return "timeout"
  const status = (error as { statusCode?: number })?.statusCode
  if (status === 429) return "quota"
  return "provider"
}

const USER_MESSAGE: Record<FailureKind, string> = {
  quota: "The assistant is busy right now. Please try again in a minute.",
  timeout: "That took too long. Try a shorter question.",
  provider: "The assistant couldn't answer right now. Please try again.",
  empty: "I couldn't find an answer to that. Try rephrasing.",
}
```

Each kind is logged with a request ID so failures can be counted per day.

## Production considerations

- Use a shared store (Redis) for rate limits in serverless deployments; in-memory limits reset per instance.
- Add a daily budget cap, not only per-minute limits.
- Pick fallback models in advance and test them with the same eval set.
- Return `Retry-After` on your own 429s so the UI can show a countdown.

## Trade-offs and alternatives

Automatic retries can multiply cost and make quota problems worse; retry once at most, with backoff. A model router or gateway can handle fallbacks for you, but you still need user-facing messages per failure kind.

## Common mistakes

- One generic error message for every failure.
- No server-side timeout, so the function runs until the platform kills it.
- Falling back to a model that was never evaluated on your questions.

## Key takeaways

- Treat quota, timeout, empty and provider errors as normal, expected states.
- Rate-limit your own endpoint and cap daily spend.
- Classify failures, log them with request IDs and show specific, helpful messages.
