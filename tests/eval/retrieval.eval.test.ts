// Provider-backed retrieval evaluation. Costs a few embedding calls and vector queries, so it
// only runs with `npm run rag:eval` and real credentials, against an index that has been
// populated with `npm run rag:reindex`. It prints a report you can use to tune RAG_MIN_SCORE.
import { describe, expect, it } from "vitest"

import { buildKnowledgeDocuments } from "@/lib/rag/documents"
import { createGeminiEmbedder } from "@/lib/rag/embeddings"
import { RAG_CONFIG } from "@/lib/rag/config"
import { retrieve, toSources } from "@/lib/rag/retrieve"
import { classify, routeFor } from "@/lib/rag/router"
import { createUpstashVectorStore, isVectorStoreConfigured } from "@/lib/rag/vector-store"
import data from "./rag-eval-cases.json"

type Case = {
  id: string
  category: string
  question?: string
  expectedIntent?: string
  expectedRoute?: string
  expectedDocuments?: string[]
  requireAll?: boolean
  mustAbstain?: boolean
  covered?: string
}

const cases = (data.cases as Case[]).filter((c) => c.question)
const enabled = isVectorStoreConfigured() && Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY)

describe.skipIf(!enabled)("RAG retrieval evaluation (real providers)", () => {
  it("meets the retrieval, abstention and citation targets", { timeout: 120_000 }, async () => {
    const deps = { embedder: createGeminiEmbedder(), store: createUpstashVectorStore() }
    const publishedUrls = new Set(buildKnowledgeDocuments().map((d) => d.url))
    const rows: Record<string, unknown>[] = []
    const latencies: number[] = []
    let hits = 0
    let hitCases = 0
    let abstainCorrect = 0
    let abstainCases = 0

    for (const c of cases) {
      const intent = classify(c.question!)
      const route = routeFor(intent, "auto")
      expect.soft(intent, `${c.id}: intent`).toBe(c.expectedIntent)
      if (c.expectedRoute) expect.soft(route, `${c.id}: route`).toBe(c.expectedRoute)
      if (intent === "blocked" || intent === "greeting") continue

      const t = performance.now()
      const result = await retrieve(c.question!, deps)
      latencies.push(performance.now() - t)
      const docs = result.chunks.map((ch) => ch.metadata.documentId)

      for (const s of toSources(result.chunks)) expect.soft(publishedUrls.has(s.url), `${c.id}: cited ${s.url}`).toBe(true)

      let hit: boolean | null = null
      if (c.expectedDocuments) {
        hitCases++
        hit = c.requireAll ? c.expectedDocuments.every((d) => docs.includes(d)) : c.expectedDocuments.some((d) => docs.includes(d))
        if (hit) hits++
      }
      let abstained: boolean | null = null
      if (c.mustAbstain) {
        abstainCases++
        abstained = result.chunks.length === 0 || (route === "out_of_scope" && (result.topScore ?? -1) < RAG_CONFIG.retrieval.scopeOverrideScore)
        if (abstained) abstainCorrect++
      }
      rows.push({ id: c.id, intent, route, topScore: result.topScore?.toFixed(3), retrieved: docs.join(", ") || "-", hit, abstained })
    }

    latencies.sort((a, b) => a - b)
    const pct = (p: number) => Math.round(latencies[Math.min(latencies.length - 1, Math.floor(p * latencies.length))])
    console.table(rows)
    console.log(
      JSON.stringify(
        {
          minScore: RAG_CONFIG.retrieval.minScore,
          hitRate: `${hits}/${hitCases}`,
          abstention: `${abstainCorrect}/${abstainCases}`,
          retrievalLatencyMs: { p50: pct(0.5), p95: pct(0.95) },
        },
        null,
        2,
      ),
    )

    // Targets: tune RAG_MIN_SCORE until both hold for this dataset.
    expect(hits / hitCases).toBeGreaterThanOrEqual(0.8)
    expect(abstainCorrect / abstainCases).toBeGreaterThanOrEqual(0.8)
  })
})

describe.skipIf(enabled)("RAG retrieval evaluation", () => {
  it.skip("needs UPSTASH_VECTOR_REST_URL, UPSTASH_VECTOR_REST_TOKEN and GOOGLE_GENERATIVE_AI_API_KEY", () => {})
})
