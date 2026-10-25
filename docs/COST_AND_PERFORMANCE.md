# Cost and Performance

> No production traffic, bills or dashboards were available. Numbers below are either
> **measured locally** (labelled, single runs on 2026-10-18), **counted from the code/content**,
> or **verified provider limits** (with source and date). Everything else is a formula.

## 1. Cost-producing operations

| Operation | Where | When | Count per event |
|---|---|---|---|
| Query embedding | `embedQuery()` in `lib/rag/embeddings.ts` | Every chat request that reaches retrieval (not blocked/greeting), unless the per-instance cache hits | 1 Gemini embedding call |
| Vector query | `store.query()` | Same as above | 1 Upstash query |
| Chat generation | `streamText()` in `generate()` | Every request except fixed replies (blocked, greeting, no_context, out_of_scope, knowledge unavailable) | input + output tokens |
| Search grounding | web route | `current` questions in Auto, technical questions in Web mode | 1 grounded request (+1 normal request if search fails) |
| Retries | `maxRetries: 1` on normal routes | Retryable provider errors | up to 2× the generation |
| Ingestion embeddings | `embedDocuments()` | Reindex, only new/changed chunks | 1 embedding per changed chunk (batched) |
| Vector writes | `upsert`, `delete` | Reindex | 1 update per changed/deleted chunk |
| Vector listing | `listHashes()` | Every reindex | ⌈chunks / 500⌉ range calls, metadata included |
| Redis | rate limiter, index status | Every chat request; every reindex | a few commands |
| Hosting | Vercel functions | `/api/chat`, `/api/rag/reindex`, `proxy.ts` | duration × memory |

### Counted from the current content (via `buildKnowledgeDocuments` + `chunkDocument`)
- **17 documents → 65 chunks, ~25,100 characters** (largest chunk 1,412 characters).
- A **first full index** = 65 document embeddings + 65 vector updates + 1 range call.
- A **reindex with no content change** = 1 range call, 0 embeddings, 0 updates.
- Publishing all 15 draft articles would add roughly the article Markdown (~150 KB) → on the
  order of 100+ more chunks (estimate: 150,000 chars ÷ ~1,200 chars per chunk).

### Measured locally (single runs, real Gemini API, Upstash not configured)

| Request | Route | Input tokens | Output tokens | Model time |
|---|---|---|---|---|
| "Explain this topic from your experience: Next.js Rendering…" (after the reasoning fix) | fallback | 2,174 | 291 | 7.8 s |
| Same question before the fix | fallback | 2,174 | 998 (no text) | 22.8 s |
| "What is new in the latest Next.js release?" (after fix) | web_search | 375 | 429 | 12.4 s |
| "Explain React hooks in two sentences" (before fix) | general | 369 | 843 | 19.5 s |

The fallback route sends **all** core profile chunks (~2.2k input tokens); RAG with top-K would
usually send fewer.

## 2. Verified free-tier limits

- **Upstash Vector free plan** (upstash.com/pricing/vector, checked 2026-10-18): 10,000 queries
  + updates per day, 1 GB data, max 1,536 dimensions, 100 namespaces, metadata ≤ 48 KB per
  vector. Pay-as-you-go: $0.40 per 100K requests, $0.25/GB storage.
- **Gemini API, Upstash Redis, Vercel Hobby:** limits not verified in this session — check the
  respective dashboards before relying on them.

## 3. Formulas

```
Daily vector ops ≈ Q_retrieval + U_reindex
  Q_retrieval = chat requests that reach retrieval (≈ all except blocked/greeting)
  U_reindex   = changed chunks + deleted chunks (+ first index: all chunks)

Daily embedding calls ≈ Q_retrieval × (1 − cache hit rate) + changed chunks

Daily generation cost ≈ Σ (inputTokens × p_in + outputTokens × p_out)
  over requests that call the model; read tokens from chat_request logs.

Search cost ≈ web_search requests × p_search (+ fallback generation when search fails)
```

Example (illustrative, not a measurement): 300 questions/day ⇒ ~300 vector queries + ~300
embedding calls — 3% of Upstash's 10K daily operations.

## 4. What can be cached safely

| Cache | Implemented? | Safe? | Notes |
|---|---|---|---|
| Query embeddings | ✅ per instance (`withQueryCache`, 200 entries) | Yes | Keyed by model id + normalised text; content changes don't affect it |
| Static pages | ✅ prerendered | Yes | Rebuilt on deploy |
| Retrieval results | ❌ | With an index version key | Would need invalidation on reindex (e.g. store `lastRun.startedAt` in the key) |
| Full answers | ❌ | Rarely | Only for identical, non-personal, non-time-sensitive questions |
| Shared embedding cache (Redis) | ❌ | Yes | Would survive cold starts; costs Redis commands |

## 5. Batching
- Ingestion: 50 chunks per `embedDocuments` call, `maxParallelCalls: 2`; upserts in 100s,
  deletes in 500s.
- Query side: one embedding per request (no batching possible).

## 6. Reducing context size
- Lower `RAG_MAX_CONTEXT_CHARS` / `RAG_TOP_K` (tune with `npm run rag:eval`).
- Configure Upstash so personal questions use RAG instead of the full fallback context.
- History: 8 messages max; consider 4–6 for follow-ups.
- `maxOutputTokens: 1000` caps output cost.

## 7. Avoiding re-embedding
Already implemented: content hashes (`hashChunk`) — only changed chunks are embedded. Only bump
`RAG_CONFIG.chunking.version` or change the embedding model/dimensions when you intend a full
re-embed.

## 8. Measuring latency

- **Implemented:** `retrievalMs`, `modelMs`, `totalMs` in the `chat_request` log.
- **Not implemented — time to first token (TTFT):** add `firstTokenMs` in `generate()`'s
  `TransformStream` on the first `text-delta`, and measure TTFT in the browser from
  `sendMessage` to the first `status === "streaming"` render. **(recommended)**
- **Identifying slow stages:** high `retrievalMs` → embedding/Upstash latency or cache misses;
  high `modelMs` with high `outputTokens` → long answers; high `modelMs` with few tokens → slow
  prefill (large context) or search on the web route.

## 9. How free-tier limits affect reliability
- Upstash daily limit reached → queries fail → personal questions get "knowledge base
  temporarily unavailable"; technical questions fall back to general knowledge.
- Gemini 429 → "usage limit was reached" message; search 429 → answer without search.
- The chat rate limit (10/min/IP) protects quotas from a single client, not from distributed
  traffic. A global daily budget is **not implemented** (recommended if traffic grows).
