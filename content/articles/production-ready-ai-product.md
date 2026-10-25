## Introduction

Getting an AI demo working takes an afternoon. Running it as a product (for real users, within a budget, with acceptable latency and failure behaviour) takes architecture. These notes collect the architectural concerns I think matter most: request flow, caching, cost control, scaling, failure handling and change management.

## Problem statement

AI features have unusual characteristics: slow responses (seconds, not milliseconds), usage-based pricing, provider quotas, non-deterministic outputs and fast-moving APIs. Standard web architecture still applies, but these characteristics change the priorities.

## Learning objectives

1. Lay out a production request path for an AI feature.
2. Decide what is safe and useful to cache.
3. Control cost and handle quotas.
4. Scale serverless AI endpoints.
5. Plan for provider failures and model changes.

## Core concepts

- **Gateway concerns**: authentication, validation, rate limiting and quotas before any model call.
- **Caching layers**: embeddings, retrieval results, full responses, provider-side prompt caching.
- **Graceful degradation**: a defined fallback for each dependency.
- **Model abstraction**: switching or mixing models without rewriting features.
- **Evaluation-gated changes**: prompt, model and retrieval changes are tested before release.

## Technical explanation

### Request path

```text
client ─► edge/CDN ─► API route
            ├─ validate + rate limit + per-user quota
            ├─ route (scope, intent)
            ├─ retrieve (embedding cache ─► vector DB)
            ├─ generate (stream, output limits, timeout)
            ├─ attach sources, metadata
            └─ log metrics (no raw content)
```

### Caching: what is safe?

| Cache | Safe? | Notes |
|---|---|---|
| Query embeddings | Yes | Same text + same model → same vector. Key by model and dimensions. |
| Retrieval results | With care | Must be invalidated when the index changes; key by index version. |
| Full answers | Rarely | Only for identical, non-personal, non-time-sensitive questions. |
| Static pages and content | Yes | Ordinary web caching. |
| Provider prompt caching | Yes | Reuses a long, stable prompt prefix to cut cost and latency where supported. |

### Cost control

- Retrieval instead of sending everything.
- Output token limits.
- Cheaper models for routing or classification; larger models only where needed.
- Rate limits per client; daily budgets with alerts.
- Skip the model entirely for out-of-scope or no-context cases.

### Scaling serverless AI endpoints

- Streaming responses keep functions open for seconds, so check your platform's maximum duration.
- Serverless instances don't share memory: rate limits and caches that must be global need a shared store (for example Redis).
- HTTP-based databases (REST APIs) avoid connection-pool exhaustion in serverless functions.

### Failure handling

| Failure | Behaviour |
|---|---|
| Model quota exceeded | Clear "try again shortly" message; don't retry immediately |
| Search unavailable | Answer without search, labelled |
| Vector DB down | Fallback message (or a smaller, static context) and an alert |
| Timeout | Abort, show retry |

## Code example

A bounded in-memory LRU for query embeddings (per instance, safe because embeddings for the same text and model never change):

```ts
const MAX = 200
const cache = new Map<string, number[]>()

export async function cachedEmbed(text: string, embed: (t: string) => Promise<number[]>, model: string) {
  const key = `${model}:${text.trim().toLowerCase()}`
  const hit = cache.get(key)
  if (hit) {
    cache.delete(key) // refresh recency
    cache.set(key, hit)
    return hit
  }
  const vector = await embed(text)
  cache.set(key, vector)
  if (cache.size > MAX) cache.delete(cache.keys().next().value!)
  return vector
}
```

## Production considerations

- **Feature flags** to switch models or disable features quickly.
- **Evaluation in CI or before deploy** for prompt and retrieval changes.
- **Observability** with request IDs, route, timings, tokens, errors.
- **Privacy**: minimise stored personal data; document retention.
- **Documentation**: future you needs to know why thresholds and limits are set as they are.

## Trade-offs and alternatives

- **Managed services vs self-hosting.** Managed vector databases and model APIs are fast to adopt; self-hosting gives control and possibly lower cost at scale, with operational burden.
- **Response caching vs freshness.** Cached answers are cheap but can go stale or leak context between users; be conservative.
- **One big model vs routing across models.** One model is simpler; routing saves money but needs evaluation per route.

## Common mistakes

- In-memory rate limiting on serverless and assuming it's global.
- Caching full answers that include personal or time-sensitive content.
- No plan for quota exhaustion.
- Shipping prompt changes without evaluation.
- Ignoring function duration limits for streaming.

## Key takeaways

- Put validation, limits and routing in front of every model call.
- Cache what is deterministic; version what depends on content.
- Design explicit fallbacks for each dependency.
- Gate changes with evaluation, and observe everything except private content.
