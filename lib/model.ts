import "server-only"

/** Gemini API model used when no Anthropic key is set (the original setup). */
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemma-4-26b-a4b-it"

/** Claude model for normal answers, used when ANTHROPIC_API_KEY is set. */
export const ANSWER_MODEL = process.env.ANSWER_MODEL ?? "claude-haiku-5-5"

/** Gemini model for the web-search route when Claude answers everything else. */
export const SEARCH_MODEL = process.env.SEARCH_MODEL ?? "gemini-3.1-flash-lite"

/**
 * Answers with this Google model when the main one fails before replying (busy, quota, outage).
 * Set FALLBACK_MODEL="" to turn the fallback off.
 */
export const FALLBACK_MODEL = process.env.FALLBACK_MODEL ?? "gemini-3.1-flash-lite"

/** True when answers go to Claude; false keeps the Gemini/Gemma-only setup. */
export const usesClaude = () => Boolean(process.env.ANTHROPIC_API_KEY)

/** Model name shown in the assistant UI. */
export const activeModelLabel = () => (usesClaude() ? ANSWER_MODEL : GEMINI_MODEL)

/**
 * Whether the assistant can answer. The Google key stays required even with Claude: it powers
 * the embeddings for retrieval and the web-search route (same check as app/api/chat/route.ts).
 */
export const isAssistantOnline = () => Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
