## Introduction

"Frontend AI engineer" started showing up in job posts and LinkedIn threads in 2025, and by 2026 it is a real specialisation. It is not "a frontend developer who uses Copilot". It is a frontend engineer who builds product surfaces on top of models: chat and agent UIs, generative UI, streaming, evaluation and the trust patterns that make AI features usable. These are my notes on what the role covers and how it maps onto skills a React and Next.js engineer already has.

## Problem statement

Most AI content is written for ML engineers or for backend teams wiring up an API. The part users actually touch (latency, partial answers, tool approvals, citations, errors) lands on the frontend, but there is little guidance on what a frontend engineer is expected to own. Without a clear map it is easy to either over-index on model trivia or treat AI as "just another fetch".

## Learning objectives

1. Separate AI-assisted frontend work from AI product frontend work.
2. List the skill areas the role adds on top of React, Next.js and TypeScript.
3. Identify which of those skills transfer directly from existing frontend experience.
4. Plan a small set of projects that prove each skill.

## Core concepts

- **AI-assisted engineering**: using Claude Code, Codex or Copilot to write code faster. Useful, but every engineer is expected to do it now.
- **AI product engineering**: building the feature that calls a model and shows the result. This is the new layer.
- **Uncertain, slow, streaming outputs**: model responses take seconds, arrive in pieces and can be wrong. The UI has to be designed for that.
- **Protocols**: MCP gives agents tools, AG-UI connects agents to frontends, MCP Apps and A2UI describe UI an agent can return.

## Technical explanation

The role adds roughly six areas on top of a normal frontend stack:

```text
Frontend core        React, Next.js, TypeScript, performance, accessibility
+ Model integration  AI SDKs, streaming, structured outputs, tool calling
+ Retrieval          embeddings, vector search, RAG, citations
+ Agent UX           approvals, progress, interruption, generative UI
+ Quality            evals, observability, cost and latency budgets
+ Safety             prompt injection, output sanitising, data boundaries
```

A lot of this is familiar. Streaming is a variant of handling slow networks. Generative UI is a component registry with a schema. Tool approval is a confirmation dialog with state. The genuinely new parts are evaluation (you cannot unit-test "is this answer good" with a single assertion) and reasoning about cost per request.

## Code example

A minimal checklist I use to judge whether an AI feature is "frontend AI engineering" work or just an API call:

```ts
type AiFeatureReview = {
  streamsPartialOutput: boolean      // does the UI render while tokens arrive?
  canBeStopped: boolean              // abort signal wired to a visible control?
  showsSources: boolean              // citations or "where this came from"?
  handlesRefusalAndEmpty: boolean    // empty answer, refusal and provider errors?
  hasEvalSet: boolean                // fixed questions run before each release?
  hasCostCeiling: boolean            // rate limit or daily budget per user?
}
```

If most of these are false, the feature works in a demo and fails with real users.

## Production considerations

- Product metrics matter more than model choice: did the user accept, edit or abandon the answer?
- Provider quotas and timeouts are normal events, not edge cases. Plan the fallback UI first.
- Keep the model behind your own route handler so keys, limits and logging stay server-side.

## Trade-offs and alternatives

Going deep on model internals is interesting but rarely what a product team needs from a frontend engineer. Going "full-stack AI" (agents, orchestration, infra) is valuable but a different job. The sweet spot for a frontend engineer is owning the request lifecycle from the button click to the rendered, trustworthy answer.

## Common mistakes

- Treating a chat box as the whole feature.
- Listing "LLM" and "RAG" on a resume without a project that shows streaming, errors and evals.
- Learning five agent frameworks instead of shipping one feature end to end.

## Key takeaways

- The role is frontend engineering plus model integration, retrieval, agent UX, quality and safety.
- Most of it builds on skills a senior React engineer already has.
- The proof is a shipped feature with streaming, sources, error states and an eval set.
