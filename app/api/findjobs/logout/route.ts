import { clearSessionCookieHeader, isSameOrigin } from "@/lib/jobs/auth"

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 })
  return Response.json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookieHeader(), "Cache-Control": "no-store" } })
}
