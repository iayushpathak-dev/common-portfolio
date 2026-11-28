import {
  checkCredentials,
  createSessionValue,
  getLoginRateLimiter,
  isLoginConfigured,
  isSameOrigin,
  loginClientKey,
  sessionCookieHeader,
} from "@/lib/jobs/auth"

// Username + password login for /findjobs. Sets an httpOnly session cookie on success.

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 })
  if (!isLoginConfigured()) {
    return Response.json({ error: "Login isn't set up. Add FINDJOBS_USERNAME and FINDJOBS_PASSWORD to the environment." }, { status: 503 })
  }

  const { success } = await getLoginRateLimiter().limit(loginClientKey(req))
  if (!success) return Response.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 })

  const body = (await req.json().catch(() => null)) as { username?: unknown; password?: unknown } | null
  if (!checkCredentials(body?.username, body?.password)) {
    return Response.json({ error: "Wrong username or password." }, { status: 401 })
  }

  const value = createSessionValue()!
  return Response.json({ ok: true }, { headers: { "Set-Cookie": sessionCookieHeader(value), "Cache-Control": "no-store" } })
}
