import "server-only"

import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import { Ratelimit } from "@upstash/ratelimit"

import { clientKey, createMemoryRateLimiter, type RateLimiter } from "@/lib/rate-limit"
import { getRedis } from "@/lib/redis"

// Login for the private /findjobs dashboard. The username and password come from
// FINDJOBS_USERNAME and FINDJOBS_PASSWORD (never from code). After a correct login the browser
// gets an httpOnly cookie "<expiry>.<signature>"; the signature is an HMAC keyed by the
// credentials, so changing the password logs every browser out.

export const SESSION_COOKIE = "fj_session"
export const SESSION_DAYS = 7
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000

function credentials() {
  const username = process.env.FINDJOBS_USERNAME ?? ""
  const password = process.env.FINDJOBS_PASSWORD ?? ""
  return username && password.length >= 8 ? { username, password } : null
}

export const isLoginConfigured = () => credentials() !== null

const sha = (value: string) => createHash("sha256").update(value).digest()
const sameText = (a: string, b: string) => timingSafeEqual(sha(a), sha(b))

function signingKey() {
  const c = credentials()
  return c ? sha(`findjobs-session:${c.username}:${c.password}`) : null
}

const sign = (expiry: number, key: Buffer) => createHmac("sha256", key).update(`fj:${expiry}`).digest("base64url")

/** True when both the username and password match. Compares in constant time. */
export function checkCredentials(username: unknown, password: unknown) {
  const c = credentials()
  if (!c || typeof username !== "string" || typeof password !== "string") return false
  // Evaluate both so a wrong username takes as long as a wrong password.
  const userOk = sameText(username.trim().toLowerCase(), c.username.toLowerCase())
  const passOk = sameText(password, c.password)
  return userOk && passOk
}

/** A new session cookie value, or null when login isn't configured. */
export function createSessionValue(now = Date.now()) {
  const key = signingKey()
  if (!key) return null
  const expiry = now + SESSION_MS
  return `${expiry}.${sign(expiry, key)}`
}

export function isValidSessionValue(value: string | undefined, now = Date.now()) {
  const key = signingKey()
  if (!key || !value) return false
  const [expiryText, signature = ""] = value.split(".")
  const expiry = Number(expiryText)
  if (!Number.isSafeInteger(expiry) || expiry <= now) return false
  return sameText(signature, sign(expiry, key))
}

function readCookie(req: Request, name: string) {
  const header = req.headers.get("cookie") ?? ""
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=")
    if (k === name) return decodeURIComponent(v.join("="))
  }
  return undefined
}

/** True when the request carries a valid dashboard session cookie. */
export function isJobSession(req: Request, now = Date.now()) {
  return isValidSessionValue(readCookie(req, SESSION_COOKIE), now)
}

/**
 * Blocks cross-site form posts: a POST must come from this site. The cookie is also
 * SameSite=Strict, so this is a second check.
 */
export function isSameOrigin(req: Request) {
  const origin = req.headers.get("origin")
  if (!origin) return true
  try {
    return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? new URL(req.url).host)
  } catch {
    return false
  }
}

export function sessionCookieHeader(value: string, maxAgeSeconds = SESSION_MS / 1000) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`
}

export const clearSessionCookieHeader = () => sessionCookieHeader("", 0)

let limiter: RateLimiter | undefined

/** 5 login attempts per 15 minutes per client, shared across instances when Redis is set. */
export function getLoginRateLimiter(): RateLimiter {
  if (limiter) return limiter
  const redis = getRedis()
  if (redis) {
    const ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "15 m"), prefix: "rl:findjobs-login" })
    limiter = { kind: "redis", limit: (key) => ratelimit.limit(key) }
  } else {
    limiter = createMemoryRateLimiter(5, 15 * 60 * 1000)
  }
  return limiter
}

export const loginClientKey = (req: Request) => `login:${clientKey(req)}`
