import { describe, expect, it } from "vitest"

import { buildKnowledgeDocuments } from "@/lib/rag/documents"
import { classify, routeFor } from "@/lib/rag/router"
import data from "../eval/rag-eval-cases.json"

// The routing half of the evaluation set needs no providers, so it runs in CI.
type Case = { id: string; question?: string; expectedIntent?: string; expectedRoute?: string; expectedDocuments?: string[] }
const cases = (data.cases as Case[]).filter((c) => c.question)

describe("evaluation set: routing", () => {
  it.each(cases.map((c) => [c.id, c] as const))("%s", (_, c) => {
    const intent = classify(c.question!)
    expect(intent).toBe(c.expectedIntent)
    if (c.expectedRoute) expect(routeFor(intent, "auto")).toBe(c.expectedRoute)
  })

  it("only expects documents that are published and indexable", () => {
    const ids = new Set(buildKnowledgeDocuments().map((d) => d.id))
    for (const c of cases) for (const id of c.expectedDocuments ?? []) expect(ids, `${c.id} → ${id}`).toContain(id)
  })
})
