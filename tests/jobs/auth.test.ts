import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { checkCredentials, createSessionValue, isJobSession, isLoginConfigured, isSameOrigin, isValidSessionValue, SESSION_COOKIE } from "@/lib/jobs/auth"

// Test-only credentials; the real ones live in the environment, never in code.
const USER = "test-user"
const PASS = "test-password-123"

const withCookie = (value: string) => new Request("https://example.com/api/findjobs", { headers: { cookie: `other=1; ${SESSION_COOKIE}=${value}` } })

describe("findjobs login", () => {
  beforeEach(() => {
    vi.stubEnv("FINDJOBS_USERNAME", USER)
    vi.stubEnv("FINDJOBS_PASSWORD", PASS)
  })
  afterEach(() => vi.unstubAllEnvs())

  it("accepts the right username (any case) and password", () => {
    expect(checkCredentials(USER, PASS)).toBe(true)
    expect(checkCredentials(" TEST-USER ", PASS)).toBe(true)
  })

  it.each([
    [USER, "wrong"],
    ["someone", PASS],
    [USER, PASS.toUpperCase()],
    [undefined, PASS],
    [USER, 123],
  ])("rejects %s / %s", (u, p) => {
    expect(checkCredentials(u, p)).toBe(false)
  })

  it("is off when credentials are missing or the password is too short", () => {
    vi.stubEnv("FINDJOBS_PASSWORD", "short")
    expect(isLoginConfigured()).toBe(false)
    expect(checkCredentials(USER, "short")).toBe(false)
    expect(createSessionValue()).toBeNull()
  })

  it("issues a session cookie that validates until it expires", () => {
    const now = 1_000_000
    const value = createSessionValue(now)!
    expect(isValidSessionValue(value, now + 1000)).toBe(true)
    expect(isValidSessionValue(value, now + 8 * 24 * 60 * 60 * 1000)).toBe(false)
    expect(isJobSession(withCookie(value), now + 1000)).toBe(true)
  })

  it("rejects tampered, missing or foreign cookies", () => {
    const value = createSessionValue()!
    const [expiry, sig] = value.split(".")
    expect(isValidSessionValue(`${Number(expiry) + 1000}.${sig}`)).toBe(false)
    expect(isValidSessionValue(`${expiry}.x${sig}`)).toBe(false)
    expect(isValidSessionValue(undefined)).toBe(false)
    expect(isJobSession(new Request("https://example.com/"))).toBe(false)
  })

  it("logs everyone out when the password changes", () => {
    const value = createSessionValue()!
    vi.stubEnv("FINDJOBS_PASSWORD", "a-new-password-456")
    expect(isValidSessionValue(value)).toBe(false)
  })

  it("allows same-origin and no-origin requests only", () => {
    const req = (origin?: string) => new Request("https://example.com/api/findjobs", { method: "POST", headers: origin ? { origin, host: "example.com" } : { host: "example.com" } })
    expect(isSameOrigin(req())).toBe(true)
    expect(isSameOrigin(req("https://example.com"))).toBe(true)
    expect(isSameOrigin(req("https://evil.example"))).toBe(false)
  })
})
