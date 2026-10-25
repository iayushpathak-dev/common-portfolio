# Interview Preparation

Questions grounded in this repository. Each has: **Answer** (short), **Deeper**, **Code**,
**Follow-up**, **Example**, **Limitation**.

> Honesty rule: describe the AI assistant as a personal project you built with an AI coding
> assistant (Claude Code) and then studied in depth. Upstash/RAG has been implemented and tested
> with fakes but **not yet run against the real vector database** — say so if asked about
> production results. Don't quote traffic, accuracy or cost numbers you haven't measured.

---

## Frontend architecture

### 1. How is the portfolio structured, and why mostly static?
- **Answer:** Next.js 16 App Router. Pages are Server Components prerendered at build time from
  typed content files; only the chat API, the reindex API and a small proxy run per request.
- **Deeper:** Content changes only with deploys, so static HTML gives the best TTFB and SEO.
  Client Components exist only where state is needed (filters, search, chat).
- **Code:** `app/projects/page.tsx` → `ProjectBrowser`; `content/index.ts`; `next.config.ts`
  (`cacheComponents: true`).
- **Follow-up:** "What if content came from a CMS?" → fetch in Server Components with
  `"use cache"` and revalidate by tag from a CMS webhook.
- **Example:** `/projects/backend-for-frontend` is a prerendered `○` route in the build output.
- **Limitation:** every content change needs a deploy.

### 2. Why do list pages receive "summaries" instead of full content objects?
- **Answer:** Props crossing into Client Components are serialised into the page payload; full
  articles would bloat it, and functions (icon components) can't be serialised at all.
- **Code:** `toProjectSummary`, `toArticleSummary` in `content/index.ts`; `IconKey` +
  `components/content/content-icon.tsx`.
- **Follow-up:** "How would you catch someone importing `@/content` into a client file?" → an
  ESLint `no-restricted-imports` rule for `"use client"` files, or bundle-size checks.
- **Limitation:** convention-based today; nothing enforces it.

### 3. How do drafts stay private in production but visible locally?
- **Answer:** `isVisible()` shows drafts only when `NODE_ENV === "development"`; production
  builds exclude them from pages, sitemap, the index and queries, and `proxy.ts` returns 404.
- **Code:** `content/index.ts`, `proxy.ts`, `lib/rag/documents.ts`, `vector-store.ts` filter.
- **Follow-up:** "Why a proxy?" → with Cache Components, unknown params stream, and a
  `notFound()` after streaming starts keeps HTTP 200.
- **Limitation:** drafts are still in the repository.

## Next.js, server/client boundaries

### 4. What runs on the server vs the client in the chat?
- **Answer:** `useChat` and rendering on the client; validation, rate limiting, routing,
  retrieval, prompting and the model call on the server. Secrets never leave the server.
- **Code:** `components/assistant/assistant.tsx`; `app/api/chat/route.ts`; `server-only`
  imports in `lib/rag/*`.
- **Follow-up:** "Why a Route Handler instead of a Server Action?" → we need a streaming HTTP
  response consumed by `useChat`'s transport, with custom status codes and headers.
- **Limitation:** the client still decides the `mode`; the server validates but trusts it.

### 5. What is `generateStaticParams` doing with `_none`?
- **Answer:** With Cache Components it must return at least one param; while every article is a
  draft, the placeholder keeps the build valid and renders a 404.
- **Code:** `app/blog/[slug]/page.tsx`.

## TypeScript design

### 6. How do types prevent content mistakes?
- **Answer:** `Project` requires every section key, forcing an explicit `null` for unknowns;
  `ProjectCategory`, `ArticleCategory`, `EvidenceLabel`, `IconKey` are unions; `satisfies` is
  used for section order.
- **Code:** `content/types.ts`; `SECTION_ORDER` in `app/projects/[slug]/page.tsx`.
- **Limitation:** Markdown bodies are untyped strings.

### 7. How is the pipeline made testable?
- **Answer:** dependency injection: `runChat` receives `ChatDeps` (`models`, `retrieval`,
  `fallbackChunks`, `now`, `modelTimeoutMs`). Tests pass a mock model and a stub store.
- **Code:** `lib/rag/pipeline.ts`, `lib/rag/service.ts`, `tests/rag/pipeline.test.ts`.
- **Follow-up:** "Why not mock modules?" → explicit dependencies are clearer and type-checked.

## API design and streaming UI

### 8. Walk through a chat request.
- **Answer:** rate limit → size check → Zod validation → classify/route → retrieve → decide
  (fixed reply or generate) → stream text → append citations → log one line.
- **Code:** see [AI_REQUEST_LIFECYCLE.md](AI_REQUEST_LIFECYCLE.md).
- **Follow-up:** "Where does the HTTP status stop being meaningful?" → once the SSE stream
  starts (200); later errors are `error` chunks.

### 9. How do you attach citations to a streamed answer?
- **Answer:** `createUIMessageStream` lets me write my own chunks: I forward the model's UI
  stream, then write `source-url` chunks for the chunks I supplied, then `finish`.
- **Code:** `generate()` in `lib/rag/pipeline.ts`; `toSources()` in `retrieve.ts`.
- **Limitation:** citations are per page, not per sentence.

### 10. How do Stop and Retry work?
- **Answer:** Stop aborts the fetch; the server forwards `req.signal` to `streamText`. Retry
  calls `regenerate()` — a new request. A user cancel isn't reported as a timeout because the
  code checks which signal fired.
- **Code:** `assistant.tsx`, `generate()`.

## RAG internals, embeddings, chunking

### 11. Explain your RAG pipeline.
See [RAG_DEEP_DIVE.md](RAG_DEEP_DIVE.md) §A interview answer.

### 12. How do you chunk, and why those numbers?
- **Answer:** split by `##` sections, keep code fences intact, pack paragraphs up to ~1400
  characters, carry a short last paragraph as overlap, prefix title + section.
- **Code:** `lib/rag/chunk.ts`.
- **Follow-up:** "How would you tune it?" → run `npm run rag:eval` across sizes and compare hit
  rate; bump `chunking.version` to re-embed.
- **Limitation:** character-based; untuned.

### 13. Why cosine, and why convert Upstash scores?
- **Answer:** embeddings encode meaning in direction; cosine ignores length. Upstash returns
  `(1+cos)/2`, so I convert back to keep thresholds in standard cosine units.
- **Code:** `createUpstashVectorStore().query`.

### 14. How is re-indexing idempotent?
- **Answer:** deterministic IDs `documentId:index` + SHA-256 content hashes including the
  embedding fingerprint; diff → embed only changes → upsert → delete obsolete.
- **Code:** `planSync`, `syncKnowledgeBase` in `lib/rag/ingest.ts`; `tests/rag/ingest.test.ts`.
- **Follow-up:** "What if a batch fails?" → recorded, retried next run; old chunks of that
  document aren't deleted.

### 15. How do you stop the assistant inventing facts about you?
- **Answer:** personal questions without relevant chunks never reach the model; no web search
  for personal questions; instructions + evidence labels; evaluation set with abstention cases.
- **Limitation:** I observed the model adding generic first-person phrasing once; grounding is
  reduced, not guaranteed.

## Hybrid search, routing, tools

### 16. How do you decide between RAG and web search?
- **Answer:** rules in code: personal → RAG only; technical + "latest/version/release" → web
  search unless My Knowledge mode; unknown → out of scope unless retrieval finds a strong match.
- **Code:** `classify`, `routeFor` in `lib/rag/router.ts`.
- **Follow-up:** "Why not let the model choose a search tool?" → in code I can guarantee
  personal questions never hit the web; it's free, fast and testable.
- **Limitation:** keyword lists miss phrasing; "poem about React" is in scope.

### 17. Do you use tool calling or agents?
- **Answer:** only Google Search grounding on one route. No custom tools or agent loops — the
  task is a fixed workflow, so an agent would add cost and unpredictability. I've studied tools
  and agents (Learning Notes articles) but not implemented them here.

## Errors, retries, reliability

### 18. Tell me about a bug you debugged.
- **Answer:** "Failed to fetch the chat response." The SDK shows that exact text only for a
  non-2xx response with an empty body; Next.js sends an empty 500 when a route handler throws;
  the old route left the stream `null` for any non-quota search error and threw. I rewrote the
  route so search failures fall back to non-search answers and later errors stream as readable
  messages. While testing I also found Gemma spending its whole output budget on hidden
  reasoning (empty answers) and fixed it with a minimal thinking level plus an empty-answer guard.
- **Code:** [RELIABILITY_AND_DEBUGGING.md](RELIABILITY_AND_DEBUGGING.md).
- **Limitation:** production logs weren't available, so the upstream error behind the original
  report isn't confirmed.

### 19. What happens when the vector DB is down?
- **Answer:** retrieval times out at 8 s or errors; personal questions get "knowledge base
  temporarily unavailable"; technical questions fall back to general knowledge.

## Security

### 20. How do you defend against prompt injection?
- **Answer:** architecture first — no secrets or private data in context, no action tools,
  published content only; then validation, a regex for obvious attempts, escaped and fenced
  documents, and instructions that documents are data. Prompts alone don't prevent injection.
- **Code:** `router.ts` `INJECTION`, `prompt.ts` `escapeDocumentText`.

### 21. How is the reindex endpoint protected?
- **Answer:** bearer secret ≥ 32 chars, SHA-256 + `timingSafeEqual`, fails closed.

## Cost

### 22. What does a question cost and how do you control it?
- **Answer:** one query embedding (cached per instance), one vector query, one generation
  (+ search on the web route). Fixed replies skip the model. Re-indexing only embeds changed
  chunks. Output capped at 1000 tokens.
- **Example (measured locally):** fallback answer 2,174 input / 291 output tokens.
- **Limitation:** no global budget; off-topic questions still cost a retrieval.

## Testing and evaluation

### 23. How do you test a non-deterministic system?
- **Answer:** deterministic parts with unit tests (117 tests), the pipeline with a mock model,
  and retrieval with a real-provider evaluation set (hit rate, abstention, citation validity,
  latency) run on demand.
- **Code:** `tests/rag/*`, `tests/eval/*`.
- **Limitation:** the real evaluation hasn't been run yet; no LLM-as-judge groundedness metric.

## Scalability and trade-offs

### 24. What breaks first at scale?
- **Answer:** free-tier quotas (Gemini, Upstash daily ops), per-instance caches/limits without
  Redis, `listHashes()` downloading all metadata on reindex, character-based context limits.
- **Follow-up:** "Fixes?" → Redis-backed limiter and budget, store hashes in Redis or use
  `fetch` by prefix, token-aware budgeting, response caching for common questions.

### 25. Why Upstash Vector instead of pgvector?
- **Answer:** HTTP API works from serverless functions without connection pooling, metadata
  filters, free tier, nothing to operate. pgvector would let me join with relational data and
  do hybrid SQL queries but needs a database.
