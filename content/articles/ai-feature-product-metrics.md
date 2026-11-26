## Introduction

My observability note covered logs and traces: what happened inside a request. Product teams ask a different question: is the AI feature actually helping users? These notes cover product metrics for AI features, the events a frontend should emit and how to read them without fooling yourself.

## Problem statement

"Number of chat messages" goes up whether users love the feature or are fighting it. Thumbs-down rates are low because almost nobody clicks them. Without the right events, a team cannot tell a helpful assistant from an expensive toy.

## Learning objectives

1. Define outcome metrics for an AI feature.
2. Instrument the frontend events that feed them.
3. Combine product events with cost and quality data.
4. Avoid common misreadings.

## Core concepts

- **Engagement vs success**: messages sent is engagement; a copied answer, a clicked source or a completed booking is success.
- **Acceptance rate**: how often a suggestion is used as-is, edited or discarded.
- **Abandonment**: user stops the stream, leaves mid-answer or rephrases immediately.
- **Cost per successful outcome**: model spend divided by successful sessions, not by requests.

## Technical explanation

```text
chat_message_sent      { requestId, route }
answer_rendered        { requestId, ttftMs, totalMs, sourceCount }
answer_stopped         { requestId, atMs }
source_clicked         { requestId, sourceKind }
answer_copied          { requestId }
quick_rephrase         { previousRequestId }   // new question within 15s
feedback_given         { requestId, value: "up" | "down", reason? }
```

All events carry the same `requestId` as server logs, so a bad outcome can be traced to the exact retrieval and model call.

## Code example

```ts
export function trackAnswerEvent(
  name: "answer_rendered" | "answer_stopped" | "source_clicked" | "answer_copied",
  params: { requestId: string } & Record<string, string | number>,
) {
  // Never send the question or answer text to analytics: it can contain personal data.
  window.dataLayer?.push({ event: name, ...params })
}
```

Keeping message text out of analytics is a deliberate privacy choice; the text stays in server logs with retention limits.

## Production considerations

- Pick one north-star outcome per feature (for a portfolio assistant: a source or project link clicked).
- Watch the rephrase rate; a high rate usually means retrieval misses.
- Segment by route (knowledge base, web search, fallback); they behave very differently.
- Review a sample of real sessions weekly; metrics show where to look, not why.

## Trade-offs and alternatives

Explicit feedback is precise but rare. Implicit signals (copy, stop, rephrase) are plentiful but noisy. Use both. LLM-as-judge scoring of logged answers can add a quality signal, but should be checked against human review.

## Common mistakes

- Celebrating message volume.
- Sending user questions to analytics tools.
- Measuring average latency only, while the slowest ten percent of requests drive abandonment.

## Key takeaways

- Measure outcomes (copied, clicked, completed), not just messages.
- Share one request ID across frontend events and server logs.
- Track rephrases and stops as early signs of bad answers.
