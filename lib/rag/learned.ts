import "server-only"

import { ARTICLES, PROJECTS, articleHref, projectHref } from "@/content"
import { buildKnowledgeDocuments, faqDocument } from "@/lib/rag/documents"
import { getQuestionStore } from "@/lib/rag/question-store"
import type { KnowledgeDocument } from "@/lib/rag/types"

/** Public pages an answer may cite as its source. */
export function citablePaths() {
  return [
    "/about",
    "/experience",
    "/resume",
    "/projects",
    "/blog",
    ...PROJECTS.filter((p) => p.publicationStatus === "published").map((p) => projectHref(p.slug)),
    ...ARTICLES.filter((a) => a.publicationStatus === "published").map((a) => articleHref(a.slug)),
  ]
}

/**
 * Published content plus the answers Ayush wrote for real visitor questions. Throws if the
 * learned answers can't be read, so a reindex never deletes them because of a Redis error.
 */
export async function buildAllKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
  const store = getQuestionStore()
  const learned = store ? await store.listLearned() : []
  return [...buildKnowledgeDocuments(), ...learned.map(faqDocument)]
}
