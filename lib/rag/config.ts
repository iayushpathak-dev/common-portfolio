// Tunable RAG settings. Values come from environment variables where tuning per deployment
// makes sense; defaults are starting points to be tuned with the evaluation set
// (tests/eval/retrieval.eval.test.ts).

function numberFromEnv(name: string, fallback: number, { min, max }: { min: number; max: number }) {
  const raw = process.env[name]
  const value = raw === undefined || raw === "" ? NaN : Number(raw)
  return Number.isFinite(value) && value >= min && value <= max ? value : fallback
}

/**
 * Who turns text into vectors.
 * - "upstash" (default): the Upstash Vector index embeds text itself with its built-in model.
 *   No embedding API key and no extra bill; the index must be created with that model selected.
 * - "gemini": we embed with Gemini (needs GOOGLE_GENERATIVE_AI_API_KEY) and send raw vectors;
 *   the index must be a custom-dimension (768, COSINE) index.
 */
export type EmbeddingProvider = "upstash" | "gemini"

export const EMBEDDING_PROVIDER: EmbeddingProvider =
  process.env.RAG_EMBEDDING_PROVIDER === "gemini" ? "gemini" : "upstash"

const EMBEDDINGS = {
  upstash: {
    provider: "upstash",
    // Selected when the Upstash index is created; Upstash hosts it.
    model: "openai/text-embedding-3-small",
    dimensions: 1536,
    // text-embedding-3-small gives lower cosine scores than Gemini for the same match,
    // so its cut-offs are lower. Tune with the evaluation set.
    minScore: 0.35,
    scopeOverrideScore: 0.5,
  },
  gemini: {
    provider: "gemini",
    model: "gemini-embedding-001",
    // 768 keeps storage and query cost low; Gemini supports 768/1536/3072 for this model.
    dimensions: 768,
    minScore: 0.6,
    scopeOverrideScore: 0.7,
  },
} as const

const embedding = EMBEDDINGS[EMBEDDING_PROVIDER]

export const RAG_CONFIG = {
  // Changing the provider, model or dimensions changes every chunk hash, so the next reindex
  // re-embeds everything.
  embedding,
  chunking: {
    /** Bump when the chunking algorithm changes, so every chunk is re-embedded. */
    version: 1,
    maxChars: 1400,
    overlapChars: 200,
  },
  retrieval: {
    topK: numberFromEnv("RAG_TOP_K", 6, { min: 1, max: 20 }),
    /**
     * Minimum cosine similarity (-1..1) for a chunk to count as relevant. It is a ranking cut-off,
     * not a confidence score.
     */
    minScore: numberFromEnv("RAG_MIN_SCORE", embedding.minScore, { min: 0, max: 1 }),
    /** Score at which an otherwise out-of-scope question is treated as in scope. */
    scopeOverrideScore: numberFromEnv("RAG_SCOPE_OVERRIDE_SCORE", embedding.scopeOverrideScore, { min: 0, max: 1 }),
    /** Upper bound on retrieved text sent to the model per question. */
    maxContextChars: numberFromEnv("RAG_MAX_CONTEXT_CHARS", 9000, { min: 1000, max: 40000 }),
    /** At most this many chunks from the same document, so one long article can't crowd out others. */
    maxChunksPerDocument: 3,
  },
  limits: {
    maxQuestionChars: 2000,
    maxMessages: 30,
    maxTotalChars: 24000,
    /** Messages of history sent to the model (the newest ones). */
    historyMessages: 8,
    maxOutputTokens: 1000,
    /** Must stay below the chat route's maxDuration (60s). */
    modelTimeoutMs: 50_000,
    retrievalTimeoutMs: 8_000,
  },
  rateLimit: {
    requests: numberFromEnv("CHAT_RATE_LIMIT", 10, { min: 1, max: 1000 }),
    windowSeconds: numberFromEnv("CHAT_RATE_LIMIT_WINDOW", 60, { min: 1, max: 86400 }),
  },
} as const

/** Folded into every chunk hash: changing the embedding setup invalidates all stored vectors. */
export const EMBEDDING_FINGERPRINT = `${RAG_CONFIG.embedding.provider}:${RAG_CONFIG.embedding.model}@${RAG_CONFIG.embedding.dimensions}/chunker-v${RAG_CONFIG.chunking.version}`
