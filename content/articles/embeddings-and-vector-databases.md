## Introduction

Keyword search fails when the user's words differ from the document's words: someone asks "Has he built offline apps?" and the page says "PWA with service workers". **Embeddings** fix this by comparing meaning instead of spelling, and **vector databases** make that comparison fast. These notes explain both for frontend engineers, using the setup behind this site's assistant (Gemini embeddings stored in Upstash Vector).

## Problem statement

We need to find the passages most relevant to a question, even when they share few words with it, across hundreds or thousands of passages, in tens of milliseconds.

## Learning objectives

1. Explain what an embedding is.
2. Compute and interpret cosine similarity.
3. Understand what a vector database adds over an array.
4. Choose dimensions, metrics and metadata sensibly.
5. Avoid common embedding pitfalls (model mismatches, stale vectors).

## Core concepts

**Embedding.** A fixed-length list of numbers (a vector) that an embedding model produces for a piece of text. Texts with similar meaning get vectors that point in similar directions.

**Dimensions.** The length of the vector, for example 768 or 3072. More dimensions can capture more nuance but cost more storage and compute.

**Similarity metric.** How two vectors are compared. **Cosine similarity** measures the angle between them: 1 means same direction, 0 means unrelated.

**Vector database.** Stores vectors with metadata and answers "find the K nearest vectors to this one", usually with an approximate nearest-neighbour (ANN) index so it doesn't compare against every vector.

## Technical explanation

### Cosine similarity

```text
cos(a, b) = (a · b) / (|a| × |b|)
```

If vectors are normalised to length 1, cosine similarity is just the dot product.

### Two embedding "modes"

Some models embed queries and documents slightly differently. Gemini embedding models accept a task type such as `RETRIEVAL_DOCUMENT` for stored passages and `RETRIEVAL_QUERY` for questions, which improves search quality. Always use the same model (and dimensions) for both sides; vectors from different models are not comparable.

### What the database adds

An in-memory array plus a loop works for a demo, but it:

- recomputes nothing but also persists nothing: every server start needs the vectors again,
- scans every vector on every query,
- can't filter by metadata efficiently,
- isn't shared across serverless instances.

A vector database persists vectors, indexes them for fast approximate search, and supports **metadata filters** such as `status = 'published'`.

## Code example

Embedding a question and querying Upstash Vector:

```ts
import { embed } from "ai"
import { google } from "@ai-sdk/google"
import { Index } from "@upstash/vector"

const index = new Index({ url: process.env.UPSTASH_VECTOR_REST_URL!, token: process.env.UPSTASH_VECTOR_REST_TOKEN! })

const { embedding } = await embed({
  model: google.embedding("gemini-embedding-001"),
  value: "Has Ayush built offline-capable web apps?",
  providerOptions: { google: { taskType: "RETRIEVAL_QUERY", outputDimensionality: 768 } },
})

const matches = await index.query({
  vector: embedding,
  topK: 5,
  includeMetadata: true,
  filter: "status = 'published'",
})
// matches: [{ id, score, metadata: { title, url, text, ... } }]
```

And cosine similarity by hand, which is useful in tests:

```ts
function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}
```

(The `ai` package also exports a `cosineSimilarity` helper.)

## Architecture

```text
Indexing:  document ─► chunks ─► embed (RETRIEVAL_DOCUMENT) ─► upsert { id, vector, metadata }
Querying:  question ─► embed (RETRIEVAL_QUERY) ─► query topK + filter ─► ranked chunks
```

## Production considerations

- **Fix the dimensions** when you create the index; changing the model or dimensions means re-embedding everything.
- **Store useful metadata** (title, URL, content type, status, a content hash) so results can be cited and filtered without another lookup.
- **Respect metadata size limits** of your provider; store a chunk's text, not the whole document.
- **Quotas**: embedding calls and vector operations both count towards free-tier limits. Upstash Vector's free plan, for example, allows 10,000 queries plus updates per day; re-embedding unchanged content wastes that budget.
- **Scores are relative**: a similarity of 0.7 isn't "70% confident". Thresholds depend on the model and must be tuned with real questions.

## Trade-offs and alternatives

- **Hosted vector DB vs Postgres + pgvector.** A hosted service is quick to start and serverless-friendly; pgvector keeps vectors next to relational data and allows SQL joins.
- **Dense vs hybrid search.** Dense embeddings capture meaning but can miss exact terms like product codes; hybrid search adds keyword (sparse) scoring.
- **Dimensions.** Fewer dimensions mean cheaper storage and faster queries with a small quality cost; many models support reduced output dimensions.

## Common mistakes

- Mixing vectors from different models or dimensions in one index.
- Embedding whole long documents as one vector, which blurs their meaning.
- Treating similarity scores as probabilities.
- Re-embedding everything on every deploy.
- Forgetting to filter out unpublished or private content.

## Key takeaways

- Embeddings turn meaning into geometry; cosine similarity measures closeness.
- Use the same model and dimensions for queries and documents.
- Vector databases add persistence, fast approximate search and metadata filters.
- Tune thresholds with evaluation; never read scores as confidence.
