import { afterEach, describe, expect, it, vi } from "vitest"

import { isAdminRequest } from "@/lib/admin-auth"

const SECRET = "s".repeat(40)
const req = (auth?: string) => new Request("https://example.com/api/rag/reindex", { method: "POST", headers: auth ? { authorization: auth } : {} })

describe("isAdminRequest", () => {
  afterEach(() => vi.unstubAllEnvs())

  it("accepts the correct bearer secret", () => {
    vi.stubEnv("RAG_ADMIN_SECRET", SECRET)
    expect(isAdminRequest(req(`Bearer ${SECRET}`))).toBe(true)
  })

  it.each([undefined, "Bearer wrong", `Basic ${SECRET}`, `Bearer ${SECRET}x`])("rejects %s", (auth) => {
    vi.stubEnv("RAG_ADMIN_SECRET", SECRET)
    expect(isAdminRequest(req(auth))).toBe(false)
  })

  it("fails closed when the secret is missing or too short", () => {
    vi.stubEnv("RAG_ADMIN_SECRET", "")
    expect(isAdminRequest(req("Bearer "))).toBe(false)
    vi.stubEnv("RAG_ADMIN_SECRET", "short")
    expect(isAdminRequest(req("Bearer short"))).toBe(false)
  })
})
