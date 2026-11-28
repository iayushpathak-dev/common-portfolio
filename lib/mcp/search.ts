import "server-only"

import { retrieve } from "@/lib/rag/retrieve"
import { getChatDeps } from "@/lib/rag/service"

// search_portfolio: semantic search over the same knowledge base the site's assistant uses.
// The index holds published content only, and selectChunks drops anything not published, so
// drafts can't come back from here. No language model is called: results are raw excerpts.

export type SearchHit = { title: string; url: string; section: string; type: string; excerpt: string; score: number }
export type SearchResult = { ok: true; hits: SearchHit[] } | { ok: false; error: string }

const EXCERPT_CHARS = 700

export async function searchPortfolio(query: string, limit = 5): Promise<SearchResult> {
  const retrieval = getChatDeps().retrieval
  if (!retrieval) return { ok: false, error: "Search isn't available right now. Use list_projects or list_articles instead." }

  try {
    const { chunks } = await retrieve(query, retrieval, { maxChunksPerDocument: 2 })
    const hits = chunks.slice(0, limit).map((c) => ({
      title: c.metadata.title,
      url: c.metadata.url,
      section: c.metadata.section,
      type: c.metadata.contentType,
      excerpt: c.text.length > EXCERPT_CHARS ? `${c.text.slice(0, EXCERPT_CHARS).trimEnd()}…` : c.text,
      score: Math.round(c.score * 100) / 100,
    }))
    return { ok: true, hits }
  } catch {
    return { ok: false, error: "Search failed. Try again, or use list_projects or list_articles." }
  }
}
