## Introduction

A model response can take five to thirty seconds. Classic UI patterns assume a request returns in a few hundred milliseconds. Designing for latency is now a core frontend skill: what the user sees in the first second, while tokens arrive, and when something goes wrong halfway. These notes come from building the streaming chat on this portfolio.

## Problem statement

A spinner for ten seconds feels broken. Streaming text helps, but naive streaming causes layout jumps, broken Markdown mid-render, screen readers announcing every token and no way to stop a bad answer. Perceived performance depends on getting these details right.

## Learning objectives

1. Map the states of a streaming request.
2. Reduce time to first visible feedback.
3. Render partial Markdown without flicker.
4. Make streaming accessible and interruptible.

## Core concepts

- **Time to first token (TTFT)**: the delay before anything arrives. Often the biggest UX lever.
- **Request states**: submitted, streaming, ready, error, and user-stopped.
- **Progressive disclosure**: show what the system is doing (searching, reading sources) before text arrives.
- **Stable layout**: reserve space so the page does not jump as content grows.

## Technical explanation

```text
click ─► optimistic user message (0 ms)
      ─► "Searching portfolio…" status (from route / tool events)
      ─► first token ─► stream text into a single growing message
      ─► sources appear when retrieval finishes
      ─► ready: enable follow-ups, copy, feedback
any time ─► Stop button aborts the request and keeps the partial answer
```

## Code example

A status line driven by request state, plus a polite live region that announces only when the answer is complete:

```tsx
function AnswerStatus({ status }: { status: "submitted" | "streaming" | "ready" | "error" }) {
  const label = {
    submitted: "Thinking…",
    streaming: "Writing answer…",
    ready: "",
    error: "Something went wrong. Try again.",
  }[status]
  return (
    <>
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
      <div aria-live="polite" className="sr-only">
        {status === "ready" ? "Answer ready" : ""}
      </div>
    </>
  )
}
```

Announcing every token makes screen readers unusable; announcing completion is enough.

## Production considerations

- Measure TTFT separately from total time; they need different fixes.
- Buffer the first few tokens server-side if you need to swap in a fallback before anything is sent.
- Memoise completed messages so only the streaming one re-renders.
- Keep the Stop button visible and wired to an `AbortController`.

## Trade-offs and alternatives

Streaming adds complexity. For short structured outputs (a classification, a title), a single non-streamed response with a skeleton is simpler and just as fast to perceive. Streaming pays off for long-form answers.

## Common mistakes

- Re-rendering the entire message list on every token.
- Auto-scrolling even when the user has scrolled up to read.
- Discarding the partial answer on error instead of showing it with a retry.

## Key takeaways

- Design for the first second: optimistic message, then status, then tokens.
- Stable layout, a Stop button and a completion announcement make streaming usable.
- Track TTFT and total time as separate metrics.
