## Introduction

An AI answer can be fluent and wrong. The frontend is where users decide whether to trust it. Trust patterns (sources, uncertainty, editability, feedback and clear scope) are what separate a useful assistant from a liability. These notes collect the patterns I use and see in good AI products.

## Problem statement

Users either over-trust AI (copying a wrong answer into an email) or under-trust it (ignoring a correct one). Both are UI problems: the interface did not show where the answer came from, how confident it is or how to fix it.

## Learning objectives

1. Show provenance with citations and source previews.
2. Communicate scope and uncertainty without hedging every sentence.
3. Make AI output editable and reversible.
4. Collect feedback that improves the system.

## Core concepts

- **Provenance**: link claims to sources the user can open.
- **Scope statement**: say what the assistant knows about ("my portfolio and public experience") and what it does not.
- **Abstention**: "I don't have that information" is a feature, not a failure.
- **Human in control**: AI drafts, the user decides; every applied change can be undone.
- **Feedback loop**: thumbs up/down with an optional reason, linked to the request ID.

## Technical explanation

```text
answer
 ├─ inline citation markers [1] [2]  ─► hover / tap shows source title + snippet
 ├─ "Sources" list with links
 ├─ label: "Answered from portfolio" vs "Answered from web search"
 ├─ actions: Copy · Edit · Regenerate
 └─ feedback: 👍 👎 (+ reason) ─► logged with requestId for review
```

## Code example

A source chip that shows the origin and opens the real page:

```tsx
function SourceChip({ index, source }: { index: number; source: { title: string; url: string; kind: "portfolio" | "web" } }) {
  return (
    <a
      href={source.url}
      target={source.kind === "web" ? "_blank" : undefined}
      rel={source.kind === "web" ? "noopener noreferrer" : undefined}
      className="inline-flex items-center gap-1 rounded border px-1.5 text-xs"
    >
      <span aria-hidden="true">[{index}]</span>
      <span>{source.title}</span>
      <span className="sr-only">({source.kind === "web" ? "web source, opens in new tab" : "portfolio page"})</span>
    </a>
  )
}
```

## Production considerations

- Only cite sources that were actually retrieved for this answer; never let the model invent URLs.
- Show which route answered (knowledge base, web search, fallback) so users understand the basis.
- Store feedback with the question, retrieved chunk IDs and model version, or it cannot be acted on.

## Trade-offs and alternatives

Heavy disclaimers on every answer cause banner blindness. A short scope statement in the empty state plus per-answer sources works better. For high-stakes domains, a human review step is better than any UI pattern.

## Common mistakes

- Citations that link to a homepage instead of the specific source.
- Hiding the "I don't know" path so the model guesses instead.
- Collecting thumbs-down without any way to see what went wrong.

## Key takeaways

- Trust is built with provenance, scope, editability and feedback.
- Abstaining is better than guessing; design a good "I don't know" state.
- Feedback is only useful when tied to the request's full context.
