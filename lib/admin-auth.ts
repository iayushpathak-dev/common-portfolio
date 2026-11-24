import "server-only"

import { createHash, timingSafeEqual } from "node:crypto"

/**
 * Checks "Authorization: Bearer <RAG_ADMIN_SECRET>" in constant time. Fails closed: if the
 * secret isn't configured (or is too short to be safe), every request is rejected.
 */
// Local testing only: used when RAG_ADMIN_SECRET isn't set and we're running `next dev`.
// Never applies in production builds, so the deployed admin routes stay locked.
export const DEV_ADMIN_SECRET = "admin"

export function isAdminRequest(req: Request) {
  const envSecret = process.env.RAG_ADMIN_SECRET
  const secret = envSecret || (process.env.NODE_ENV === "development" ? DEV_ADMIN_SECRET : undefined)
  if (!secret || (envSecret && envSecret.length < 32)) return false
  const given = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/)?.[1] ?? ""
  // Hash both sides so the comparison is constant-time regardless of length.
  const a = createHash("sha256").update(given).digest()
  const b = createHash("sha256").update(secret).digest()
  return timingSafeEqual(a, b)
}
