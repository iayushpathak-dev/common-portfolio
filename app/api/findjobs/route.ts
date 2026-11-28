import { isJobSession, isSameOrigin } from "@/lib/jobs/auth"
import { PREP_TOPICS } from "@/lib/jobs/prep-topics"
import { parseJobAction } from "@/lib/jobs/schema"
import { isJobSearchConfigured } from "@/lib/jobs/search"
import { applyJobAction, getJobStore } from "@/lib/jobs/store"

// Private job-search dashboard data. Needs the /findjobs login cookie (see lib/jobs/auth.ts).
// GET returns everything; POST saves or deletes one application, company or prep topic.

const unauthorized = () => Response.json({ error: "Unauthorized" }, { status: 401 })
const noStore = () => Response.json({ error: "Redis is not configured." }, { status: 503 })
const NO_CACHE = { "Cache-Control": "no-store" }

export async function GET(req: Request) {
  if (!isJobSession(req)) return unauthorized()
  const store = getJobStore()
  if (!store) return noStore()
  const data = await store.load()
  return Response.json({ ...data, topics: PREP_TOPICS, searchEnabled: isJobSearchConfigured() }, { headers: NO_CACHE })
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 })
  if (!isJobSession(req)) return unauthorized()
  const store = getJobStore()
  if (!store) return noStore()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 })
  }
  const parsed = parseJobAction(body)
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 })

  const result = await applyJobAction(store, parsed.value)
  if (!result.ok) return Response.json({ error: result.error }, { status: result.status })
  return Response.json(result, { headers: NO_CACHE })
}
