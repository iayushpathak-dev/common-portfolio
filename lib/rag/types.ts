import type { PublicationStatus } from "@/content/types"

export type KnowledgeContentType = "profile" | "experience" | "skills" | "education" | "learning" | "project" | "article"

/** One source document in the knowledge base. Only published, public content becomes one. */
export type KnowledgeDocument = {
  /** Stable ID, e.g. "article-building-rag-from-scratch". */
  id: string
  title: string
  /** Canonical absolute URL, used for citations. */
  url: string
  contentType: KnowledgeContentType
  /** Markdown text. */
  text: string
  tags: string[]
  categories: string[]
  publicationStatus: PublicationStatus
  /** ISO date. */
  updatedAt: string
}

/** Metadata stored with every vector. Keep it small: it travels with every query result. */
export type ChunkMetadata = {
  documentId: string
  title: string
  url: string
  contentType: KnowledgeContentType
  section: string
  tags: string[]
  publicationStatus: PublicationStatus
  updatedAt: string
  chunkIndex: number
  /** Hash of the chunk text + embedding setup; unchanged hash = no re-embedding needed. */
  hash: string
  text: string
}

export type Chunk = { id: string; text: string; metadata: ChunkMetadata }

export type RetrievedChunk = Chunk & {
  /** Cosine similarity (-1..1). A ranking signal, not a probability. */
  score: number
}

export type SourceLink = { id: string; url: string; title: string }

/** Which path answered a chat request. Stored in message metadata and logs. */
export type ChatRoute =
  | "personal_rag"
  | "technical_rag"
  | "general"
  | "web_search"
  | "fallback"
  | "no_context"
  | "out_of_scope"
  | "blocked"
  | "greeting"
