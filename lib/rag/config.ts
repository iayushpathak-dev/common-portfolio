// Tunable RAG settings. Values come from environment variables where tuning per deployment
// makes sense; defaults are starting points to be tuned with the evaluation set
// (tests/eval/retrieval.eval.test.ts).

function numberFromEnv(name: string, fallback: number, { min, max }: { min: number; max: number }) {
  const raw = process.env[name]
  const value = raw === undefined || raw === "" ? NaN : Number(raw)
  return Number.isFinite(value) && value >= min && value <= max ? value : fallback
}

export const RAG_CONFIG = {
  embedding: {
    model: "gemini-embedding-001",
    // 768 keeps storage and query cost low; Gemini supports 768/1536/3072 for this model.
    // Changing either value changes every chunk hash, so the next reindex re-embeds everything.
    dimensions: 768,
  },
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
    minScore: numberFromEnv("RAG_MIN_SCORE", 0.6, { min: 0, max: 1 }),
    /** Score at which an otherwise out-of-scope question is treated as in scope. */
    scopeOverrideScore: numberFromEnv("RAG_SCOPE_OVERRIDE_SCORE", 0.7, { min: 0, max: 1 }),
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
export const EMBEDDING_FINGERPRINT = `${RAG_CONFIG.embedding.model}@${RAG_CONFIG.embedding.dimensions}/chunker-v${RAG_CONFIG.chunking.version}`
