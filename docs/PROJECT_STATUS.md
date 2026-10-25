# Project Status (2026-10-18)

Verification legend: **T** = covered by automated tests · **L** = exercised locally against
real services · **B** = verified in a production build · **—** = not verified.

## Implemented

| Feature | Evidence |
|---|---|
| Static portfolio pages (Home, About, Experience, Resume, Projects, Blog) | B |
| Case-study pages `/projects/[slug]` (9 published) | B |
| Article pages `/blog/[slug]` (render in dev; 0 published) | L (dev) |
| Draft/published/planned status, dev-only drafts, 404 via `proxy.ts` | B |
| Canonical URLs, Open Graph, JSON-LD, sitemap, robots | B |
| GA4/GTM loading + custom events (`search`, `filter_select`, `chat_message_sent`, `resume_print`) | B (tags render); events not checked in GA DebugView |
| Chat endpoint: rate limit, validation, routing, fixed replies | T, L |
| Grounded generation with citations (fallback route) | T, L |
| Web search with fallback on any search error | T, L |
| Timeout / empty-answer / provider-error handling | T, L (empty answer reproduced and fixed) |
| Gemma `thinkingLevel: "minimal"` | L |
| Structured request logs with request IDs | T, L |
| RAG modules: documents, chunking, embeddings, Upstash store, retrieval, prompt | T (fakes) |
| Idempotent ingestion with updates/deletions/partial failures | T |
| Protected reindex endpoint | T (auth), L (401 without auth) |
| Reindex CLI + post-deploy GitHub workflow | — (never run) |
| Evaluation dataset + real-provider eval test | T (routing half); retrieval half — |
| In-memory rate limiter | T, L (429 after 10/min) |
| Upstash Redis limiter | — (not configured) |

## Partially implemented
- **RAG in production:** code complete; Upstash not configured → `fallback` route is what runs.
- **Automatic content sync:** depends on GitHub secrets/variables and the Vercel deployment
  environment name `Production` (assumed).
- **Content:** 6 project drafts with TODOs; 15 article drafts awaiting review.
- **Observability:** logs exist; no TTFT, dashboards or alerts.

## Planned or missing
- Time-to-first-token metric; dashboards/alerts.
- Retrieval result caching; shared embedding cache; global daily budget.
- Hybrid (keyword + vector) search; reranking; LLM-based routing for ambiguous questions.
- Citing portfolio chunks on the web route.
- Groundedness evaluation (LLM-as-judge or human review process).
- Security headers / CSP; consent banner (if required).
- Open Graph images; redirects for changed slugs.
- Scheduled reindex safety net.

## Critical dependencies
Gemini API key (required for chat) · Upstash Vector + Redis (RAG, shared rate limiting) ·
`RAG_ADMIN_SECRET` · Vercel · GitHub Actions (CI, reindex) · GA4/GTM (optional).

## Known bugs / issues
1. Web route sends portfolio chunks to the model but doesn't cite them.
2. Chunk hash excludes `updatedAt`/`section` → stale metadata on date-only edits.
3. Chunk text can exceed `maxChars` slightly (header added after packing; max seen 1,412).
4. Off-topic questions cost an embedding + vector query.
5. Model can embellish beyond documents (observed once).
6. Chat-history search terms sent to GA (privacy).
7. Original "Failed to fetch the chat response." — likely cause identified and fixed; not
   confirmed with production logs.

## Tests that exist
117 tests in 9 files (`npm test`), see [CODEBASE_GUIDE.md](CODEBASE_GUIDE.md) §7.

## Tests still needed
- Real-provider retrieval eval run + threshold tuning (`npm run rag:eval`).
- Route handler tests for 413/429/500 responses (logic is tested in units; the handler itself
  is only exercised manually).
- `createUpstashVectorStore` against a real or emulated Upstash (pagination, score conversion).
- `proxy.ts` and `generateStaticParams` behaviour (verified manually on a build).
- Component tests for `ChatMessage` (route labels, internal vs external links) and
  `BlogBrowser` filtering.
- Analytics: `useTrackSearch` debounce/dedupe.
- Groundedness evaluation of answers.

## Architectural risks
- Free-tier quotas under a traffic spike.
- Single model provider (Google) for chat, embeddings and search.
- Keyword router brittleness.
- Index drift if the reindex workflow silently stops running.

## Suggested next steps
1. Create Upstash Vector (768, cosine) + Redis; set env vars locally and in Vercel; set GitHub
   secret/variable.
2. `npm run rag:reindex`, then `npm run rag:eval`; tune `RAG_MIN_SCORE`.
3. Review and publish articles; answer project TODOs.
4. Fix known issues 1, 2, 6 (small, contained changes).
5. Add TTFT logging and a scheduled reindex.
