## Introduction

A RAG assistant is only as good as its index. If I publish a new article and the vector database doesn't know about it, the assistant says "I don't have that information". If I unpublish a draft and its chunks stay in the index, the assistant can quote something I deliberately removed. These notes describe how to keep a knowledge base in sync with published content, and how the indexer for this site works.

## Problem statement

We need an indexing process that:

- includes only published content,
- picks up new and edited content,
- removes deleted or unpublished content,
- can run many times without duplicating anything (idempotent),
- doesn't re-embed unchanged text (embedding calls cost quota),
- reports what it did and what failed,
- can't be triggered by strangers.

## Learning objectives

1. Design deterministic IDs and content hashes for chunks.
2. Compute a diff between desired and indexed state.
3. Choose a trigger: deploy hook, CMS webhook, cron or manual.
4. Protect an ingestion endpoint.
5. Record indexing status and errors.

## Core concepts

**Desired state vs actual state.** The desired state is "every chunk of every published document right now". The actual state is what's in the vector store. Syncing means making actual equal desired, like a reconciliation loop.

**Deterministic chunk ID.** `documentId:chunkIndex`, for example `article-building-rag-from-scratch:4`. The same chunk always gets the same ID.

**Content hash.** A hash (for example SHA-256) of the chunk text plus the embedding model and settings. If the hash hasn't changed, the stored vector is still valid.

## Technical explanation

```text
1. Build desired chunks from published content ──► { id, hash, text, metadata }
2. List indexed chunks (IDs + stored hash)
3. Diff:
     new or hash changed ──► embed ──► upsert
     indexed but not desired ──► delete
     same hash ──► skip
4. Save a status record: counts, duration, errors, timestamp
```

Because both upserts and deletes are keyed by deterministic IDs, running the process twice in a row does nothing the second time.

Including the **embedding model name and dimensions** in the hash matters: if you switch models, every hash changes and everything is re-embedded automatically, so old and new vectors never mix.

### Triggers

| Trigger | When it fits |
|---|---|
| Post-deploy job | Content lives in the repository (as on this site): content changes only when the site deploys. |
| CMS webhook | Content lives in a CMS; index on publish/unpublish events. |
| Scheduled job | As a safety net that catches missed events. |
| Manual command | Development, recovery and full reindexes. |

This site keeps content in the repository, so a GitHub Actions workflow calls a protected reindex endpoint after each successful production deployment. The same endpoint can be called manually.

## Code example

The heart of the diff:

```ts
type DesiredChunk = { id: string; hash: string; text: string; metadata: ChunkMetadata }

export function planSync(desired: DesiredChunk[], indexed: Map<string, string /* hash */>) {
  const toUpsert = desired.filter((c) => indexed.get(c.id) !== c.hash)
  const desiredIds = new Set(desired.map((c) => c.id))
  const toDelete = [...indexed.keys()].filter((id) => !desiredIds.has(id))
  const unchanged = desired.length - toUpsert.length
  return { toUpsert, toDelete, unchanged }
}
```

Protecting the endpoint with a shared secret, compared in constant time:

```ts
import { timingSafeEqual } from "node:crypto"

function authorised(req: Request) {
  const expected = process.env.RAG_ADMIN_SECRET
  const given = req.headers.get("authorization")?.replace(/^Bearer /, "") ?? ""
  if (!expected || given.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected))
}
```

## Production considerations

- **Fail closed**: if the secret isn't configured, the endpoint should refuse every request.
- **Partial failures**: embed in batches; if one batch fails, record the error and keep going so one bad document doesn't block the rest. Unchanged hashes make the next run retry only what failed.
- **Quotas**: hashing avoids re-embedding, which keeps you inside free-tier embedding and vector-update limits.
- **Ordering**: upsert before deleting, so the index is never empty mid-run.
- **Status**: store the last run's counts, errors and time so you can see whether indexing worked.
- **Don't assume**: publishing content doesn't update the index unless the trigger actually ran; check the status record.

## Trade-offs and alternatives

- **Full rebuild vs incremental sync.** Rebuilding is simplest and always correct, but re-embeds everything each time; incremental sync is cheaper but needs hashes and deletes.
- **Push (webhooks) vs pull (scheduled).** Webhooks are immediate but can be missed; schedules are reliable but delayed. Many systems use both.
- **Index in the build vs after deploy.** Indexing during the build ties it to a successful build but runs before the new site is live; indexing after deploy means the index never points at pages that aren't published yet.

## Common mistakes

- Random chunk IDs, creating duplicates on every run.
- Forgetting deletions, so unpublished content stays searchable.
- Leaving the ingestion endpoint unprotected, or comparing secrets with `===`.
- Re-embedding everything on every deploy and exhausting quotas.
- Changing the embedding model without re-embedding old vectors.

## Key takeaways

- Treat indexing as reconciliation between desired and actual state.
- Deterministic IDs + content hashes = idempotent, cheap re-runs.
- Always handle deletions, and filter by publication status at query time too.
- Protect the endpoint, record status, and verify that the trigger actually ran.
