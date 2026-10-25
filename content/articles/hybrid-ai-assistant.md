## Introduction

A portfolio assistant gets three kinds of questions: about me ("What did you build at Fitpass?"), about technology in general ("How does ISR work?"), and about things that change ("What's new in the latest Next.js?"). Each needs a different source. These notes explain how a hybrid assistant chooses between **personal retrieval (RAG)**, **web search** and **abstention** (declining to answer), and how this site implements that choice.

## Problem statement

If the assistant always searches the web, it may "find" details about someone else with my name. If it never searches, it gives outdated answers about frameworks. If it always answers, it will eventually make things up. We need routing rules that pick the right source and a clear path for saying "I don't know".

## Learning objectives

1. Classify questions into intents and scope.
2. Decide when to use RAG, web search, both or neither.
3. Enforce routing in application code, not only in prompts.
4. Design a useful "no answer" response.

## Core concepts

- **Intent**: what kind of question it is: personal, general technical, current/external, out of scope.
- **Route**: which sources are allowed for that intent.
- **Abstention**: an explicit, helpful refusal when evidence is missing, which is better than a fluent guess.
- **Evidence rule**: personal facts may come *only* from my published content.

## Technical explanation

The router runs before any model call:

```text
question
  ├─ injection pattern? ─────────────► fixed refusal (no model)
  ├─ out of scope (no tech/personal signal)? ─► scope message (no model)
  ├─ personal? ─► RAG only
  │                ├─ relevant chunks ─► grounded answer + portfolio sources
  │                └─ none ─► abstain ("I don't have published information on that")
  ├─ current/external tech? ─► web search (if allowed) + RAG context if relevant
  │                └─ search unavailable ─► answer from RAG/general knowledge, flagged
  └─ general tech ─► RAG (my articles) if relevant, else model knowledge, clearly labelled
```

Signals the router uses on this site:

- **Personal**: second-person or name references ("you", "your", "Ayush"), employer and project names.
- **Current**: words like "latest", "new in", "release", "version", "this year".
- **Technical scope**: a vocabulary of frontend and AI engineering terms.
- **Retrieval evidence**: if retrieval finds strong matches in my content, the question is in scope even without keywords.

The source mode chosen in the UI (Auto, My Knowledge, Web) narrows what's allowed: "My Knowledge" never searches the web.

## Code example

A simplified router:

```ts
type Route = "blocked" | "out_of_scope" | "personal_rag" | "web_search" | "technical"

const PERSONAL = /\b(you|your|ayush|fitpass|partners studio|fitshop|qtickets|logitrack)\b/i
const CURRENT = /\b(latest|newest|release[sd]?|version|changelog|announced|this (year|month))\b/i
const INJECTION = /ignore (all|previous|the above) instructions|reveal (your )?(system )?prompt/i

export function route(question: string, mode: "auto" | "knowledge" | "web", isTechnical: boolean): Route {
  if (INJECTION.test(question)) return "blocked"
  const personal = PERSONAL.test(question)
  if (!personal && !isTechnical) return "out_of_scope"
  if (personal) return "personal_rag" // never web search for personal facts
  if (mode !== "knowledge" && (mode === "web" || CURRENT.test(question))) return "web_search"
  return "technical"
}
```

On the real site, an out-of-scope verdict is reconsidered if retrieval finds strongly matching portfolio content, because keyword lists are never complete.

## Production considerations

- **Enforce in code**: tools like web search are only *given* to the model on routes that allow them. A prompt that says "don't search" is not a control.
- **Abstain without the model**: when personal retrieval finds nothing, return a fixed message. A model asked to "say you don't know" may still improvise.
- **Label answers**: show whether an answer came from my portfolio, from the web, or from general model knowledge.
- **Search failures**: quotas and outages happen; fall back clearly instead of failing silently.
- **Test the router** with a table of questions and expected routes.

## Trade-offs and alternatives

- **Rules vs an LLM classifier.** Rules are fast, free, deterministic and easy to test, but brittle; an LLM classifier handles phrasing better at the cost of latency, money and occasional misroutes. A common middle ground is rules first, model only for ambiguous cases.
- **Let the model decide when to search (tool choice) vs decide in code.** Letting the model call a search tool is flexible, but in code you can guarantee personal questions never reach the web.
- **Strict vs lenient scope.** Strict scope avoids misuse and cost; lenient scope feels friendlier. A portfolio assistant benefits from strict scope with a polite explanation.

## Common mistakes

- Relying only on the system prompt for scope control.
- Using web search for questions about a person, which can surface namesakes.
- Treating "no retrieved context" as a reason to answer from general knowledge for personal questions.
- Not telling users which source an answer used.

## Key takeaways

- Different questions need different sources; decide which in code.
- Personal facts come only from published personal content.
- Abstaining clearly is a feature, not a failure.
- Label answers by source and test routing like any other business logic.
