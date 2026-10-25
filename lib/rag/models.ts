import "server-only"

import { createGoogleGenerativeAI, google } from "@ai-sdk/google"
import type { LanguageModel, ProviderMetadata, ToolSet } from "ai"

import { GEMINI_MODEL } from "@/lib/model"

export type ModelChoice = { model: LanguageModel; tools: ToolSet; providerOptions?: ProviderMetadata }

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
const providerOptions: ProviderMetadata | undefined = IS_GEMINI
  ? undefined
  : { google: { thinkingConfig: { thinkingLevel: "minimal" } } }

export const googleModels: ModelFactory = ({ webSearch }): ModelChoice => {
  if (!webSearch) return { model: google(GEMINI_MODEL), tools: {}, providerOptions }
  return IS_GEMINI
    ? { model: google(GEMINI_MODEL), tools: { google_search: google.tools.googleSearch({}) } as ToolSet }
    : { model: gemmaSearchProvider(GEMINI_MODEL), tools: {}, providerOptions }
}
