import { afterEach, describe, expect, it, vi } from "vitest"

// Which model answers which route. No network calls: creating a model object doesn't call the API.

async function load() {
  vi.resetModules()
  return import("@/lib/rag/models")
}

const id = (m: unknown) => {
  const model = m as { provider: string; modelId: string }
  return `${model.provider.split(".")[0]}:${model.modelId}`
}

describe("model selection", () => {
  afterEach(() => vi.unstubAllEnvs())

  it("keeps the original Gemini/Gemma setup when no Anthropic key is set", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "")
    vi.stubEnv("GEMINI_MODEL", "gemma-4-26b-a4b-it")
    const { selectModels } = await load()
    expect(id(selectModels()({ webSearch: false }).model)).toBe("google:gemma-4-26b-a4b-it")
  })

  it("answers with Claude and searches with Gemini when the key is set", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key")
    vi.stubEnv("ANSWER_MODEL", "claude-haiku-5-5")
    vi.stubEnv("SEARCH_MODEL", "gemini-3.1-flash-lite")
    const { selectModels } = await load()
    const models = selectModels()

    const answer = models({ webSearch: false })
    expect(id(answer.model)).toBe("anthropic:claude-haiku-5-5")
    expect(answer.tools).toEqual({})

    const search = models({ webSearch: true })
    expect(id(search.model)).toBe("google:gemini-3.1-flash-lite")
    expect(Object.keys(search.tools)).toEqual(["google_search"])
  })

  it("uses the defaults when only the key is set", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key")
    vi.stubEnv("ANSWER_MODEL", undefined as unknown as string)
    vi.stubEnv("SEARCH_MODEL", undefined as unknown as string)
    const { selectModels } = await load()
    expect(id(selectModels()({ webSearch: false }).model)).toBe("anthropic:claude-haiku-5-5")
  })

  it("with Claude, defaults web search and the fallback to the free Gemma model", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key")
    vi.stubEnv("GEMINI_MODEL", "gemma-4-26b-a4b-it")
    vi.stubEnv("SEARCH_MODEL", undefined as unknown as string)
    vi.stubEnv("FALLBACK_MODEL", undefined as unknown as string)
    const { selectModels } = await load()
    const models = selectModels()

    const answer = models({ webSearch: false })
    expect(id(answer.fallback!.model)).toBe("google:gemma-4-26b-a4b-it")
    expect(answer.fallback!.providerOptions).toEqual({ google: { thinkingConfig: { thinkingLevel: "minimal" } } })

    // Gemma search goes through the provider that adds the googleSearch tool to the request.
    expect(id(models({ webSearch: true }).model)).toBe("google:gemma-4-26b-a4b-it")
  })
})
