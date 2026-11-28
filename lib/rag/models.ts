import "server-only"

import { anthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI, google } from "@ai-sdk/google"
import type { LanguageModel, ProviderMetadata, ToolSet } from "ai"

import { ANSWER_MODEL, FALLBACK_MODEL, GEMINI_MODEL, SEARCH_MODEL, usesClaude } from "@/lib/model"

export type ModelChoice = {
  model: LanguageModel
  tools: ToolSet
  providerOptions?: ProviderMetadata
  /**
   * Used when the primary model fails before answering (e.g. Google's "high demand" 503 on
   * free models), so a busy provider doesn't fail the visitor's question.
   */
  fallback?: Omit<ModelChoice, "fallback">
}

/**
 * Web search is a separate capability: only routes that are allowed to search receive it.
 * Today it's Google Search grounding through Gemini; to swap providers, implement this type
 * with another search tool (results must come back as sources).
 */
export type ModelFactory = (options: { webSearch: boolean }) => ModelChoice

const IS_GEMINI = GEMINI_MODEL.startsWith("gemini-")

// The AI SDK only forwards google.tools.googleSearch() for gemini-* model ids and silently
// drops it for Gemma, although the API supports search grounding there. This provider adds
// the search tool to the request body itself.
const gemmaSearchProvider = createGoogleGenerativeAI({
  fetch: async (url, init) => {
    if (typeof init?.body === "string") {
      const body = JSON.parse(init.body)
      body.tools = [...(body.tools ?? []), { googleSearch: {} }]
      init = { ...init, body: JSON.stringify(body) }
    }
    return fetch(url, init)
  },
})

// Gemma thinks by default and the hidden reasoning counts against maxOutputTokens: a measured
// request spent 998 of 1000 tokens thinking and returned no text. "minimal" turns that off
// (Gemma rejects "low" and thinkingBudget with a 400). Gemini models keep the SDK's default.
const gemmaThinking: ProviderMetadata = { google: { thinkingConfig: { thinkingLevel: "minimal" } } }
const providerOptions: ProviderMetadata | undefined = IS_GEMINI ? undefined : gemmaThinking

/** A different Google model to answer with when the primary one is busy or failing. */
const googleFallback = (primary: string): ModelChoice["fallback"] => {
  if (!FALLBACK_MODEL || FALLBACK_MODEL === primary) return undefined
  // Gemma needs thinking turned down (see providerOptions below); Gemini keeps the defaults.
  const options = FALLBACK_MODEL.startsWith("gemini-") ? undefined : gemmaThinking
  return { model: google(FALLBACK_MODEL), tools: {}, providerOptions: options }
}

export const googleModels: ModelFactory = ({ webSearch }): ModelChoice => {
  if (!webSearch) return { model: google(GEMINI_MODEL), tools: {}, providerOptions, fallback: googleFallback(GEMINI_MODEL) }
  return IS_GEMINI
    ? { model: google(GEMINI_MODEL), tools: { google_search: google.tools.googleSearch({}) } as ToolSet }
    : { model: gemmaSearchProvider(GEMINI_MODEL), tools: {}, providerOptions }
}

/**
 * Claude for answers, Gemini for web search. Claude handles every route that answers from the
 * portfolio's own content (and general questions); only the web_search route goes to Gemini,
 * because Google Search grounding is what returns web sources.
 */
export const claudeModels: ModelFactory = ({ webSearch }): ModelChoice => {
  if (!webSearch) return { model: anthropic(ANSWER_MODEL), tools: {}, fallback: googleFallback(ANSWER_MODEL) }
  if (SEARCH_MODEL.startsWith("gemini-")) {
    return { model: google(SEARCH_MODEL), tools: { google_search: google.tools.googleSearch({}) } as ToolSet }
  }
  return googleModels({ webSearch: true })
}

/** Claude when ANTHROPIC_API_KEY is set, otherwise the original Gemini/Gemma setup. */
export const selectModels = (): ModelFactory => (usesClaude() ? claudeModels : googleModels)
