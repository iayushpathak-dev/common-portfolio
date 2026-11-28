import "server-only"

import { Index } from "@upstash/vector"

import type { Chunk, ChunkMetadata, RetrievedChunk } from "@/lib/rag/types"

/** `vector` is omitted when the store embeds text itself (see `VectorStore.embedsText`). */
export type VectorRecord = Chunk & { vector?: number[] }

/** The storage operations RAG needs. Upstash implements it in production; tests use a fake. */
export interface VectorStore {
  /**
   * True when the store turns text into vectors itself (an Upstash index created with a
   * built-in embedding model). Then records are upserted without vectors and queries are text.
   */
  readonly embedsText: boolean
  upsert(records: VectorRecord[]): Promise<void>
  /**
   * Returns matches with cosine similarity in -1..1, highest first. Only published chunks.
   * Pass text when `embedsText` is true, otherwise a vector.
   */
  query(input: number[] | string, topK: number): Promise<RetrievedChunk[]>
  delete(ids: string[]): Promise<void>
  /** Every stored chunk ID with the content hash it was embedded from. */
  listHashes(): Promise<Map<string, string>>
}

export function isVectorStoreConfigured() {
  return Boolean(process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN)
}

const PAGE_SIZE = 500

/**
 * Upstash Vector over its REST API (no connection pool, works from serverless functions).
 * With `embedsText`, the index must be created with RAG_CONFIG.embedding.model selected;
 * otherwise with RAG_CONFIG.embedding.dimensions as a custom dimension. Both use COSINE.
 */
export function createUpstashVectorStore({ embedsText }: { embedsText: boolean }): VectorStore {
  const index = new Index<ChunkMetadata>({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  })
  const ns = index.namespace(process.env.UPSTASH_VECTOR_NAMESPACE ?? "")

  return {
    embedsText,

    async upsert(records) {
      for (let i = 0; i < records.length; i += 100) {
        const batch = records.slice(i, i + 100)
        if (embedsText) {
          await ns.upsert(batch.map((r) => ({ id: r.id, data: r.text, metadata: r.metadata })))
        } else {
          await ns.upsert(
            batch.map((r) => {
              if (!r.vector) throw new Error(`missing vector for ${r.id}`)
              return { id: r.id, vector: r.vector, metadata: r.metadata }
            }),
          )
        }
      }
    },

    async query(input, topK) {
      if (embedsText !== (typeof input === "string")) {
        throw new Error(embedsText ? "this index embeds text: query with text" : "this index needs a query vector")
      }
      const results = await ns.query<ChunkMetadata>({
        ...(typeof input === "string" ? { data: input } : { vector: input }),
        topK,
        includeMetadata: true,
        // Defence in depth: only published content is indexed, and only published content is queried.
        filter: "publicationStatus = 'published'",
      })
      return results
        .filter((r): r is typeof r & { metadata: ChunkMetadata } => Boolean(r.metadata?.text))
        .map((r) => ({
          id: String(r.id),
          text: r.metadata.text,
          metadata: r.metadata,
          // Upstash normalises cosine scores to 0..1 as (1 + cos) / 2; convert back to cosine.
          score: 2 * r.score - 1,
        }))
    },

    async delete(ids) {
      for (let i = 0; i < ids.length; i += 500) await ns.delete(ids.slice(i, i + 500))
    },

    async listHashes() {
      const hashes = new Map<string, string>()
      let cursor: string | number = 0
      do {
        const page: Awaited<ReturnType<typeof ns.range<ChunkMetadata>>> = await ns.range<ChunkMetadata>({
          cursor,
          limit: PAGE_SIZE,
          includeMetadata: true,
        })
        for (const v of page.vectors) hashes.set(String(v.id), v.metadata?.hash ?? "")
        cursor = page.nextCursor
      } while (cursor !== "" && String(cursor) !== "0")
      return hashes
    },
  }
}
