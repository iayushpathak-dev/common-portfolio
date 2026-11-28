import { isJobSession } from "@/lib/jobs/auth"
import { searchQuery } from "@/lib/jobs/schema"
import { searchJobs } from "@/lib/jobs/search"

// Job search for the private dashboard. Login required, so nobody else can spend the Adzuna quota.

export async function GET(req: Request) {
  if (!isJobSession(req)) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const params = Object.fromEntries(new URL(req.url).searchParams)
  const query = searchQuery.safeParse(params)
  if (!query.success) return Response.json({ error: "Enter a job title or skill to search for." }, { status: 400 })

  const result = await searchJobs(query.data)
  if (!result.ok) return Response.json({ error: result.error }, { status: result.status })
  return Response.json(result, { headers: { "Cache-Control": "no-store" } })
}
