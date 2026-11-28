import { afterEach, describe, expect, it, vi } from "vitest"

import { PREP_TOPICS } from "@/lib/jobs/prep-topics"
import { parseJobAction, searchQuery } from "@/lib/jobs/schema"
import { mapAdzunaResult, searchJobs } from "@/lib/jobs/search"
import { applyJobAction, createMemoryJobStore, MAX_ITEMS } from "@/lib/jobs/store"

const app = { company: "Acme", role: "Senior Frontend Engineer" }

describe("parseJobAction", () => {
  it("accepts a minimal application and fills defaults", () => {
    const r = parseJobAction({ action: "save_application", item: app })
    expect(r.ok).toBe(true)
    if (r.ok && r.value.action === "save_application") {
      expect(r.value.item).toMatchObject({ status: "saved", source: "Other", url: "", notes: "" })
    }
  })

  it.each([
    [{ action: "save_application", item: { company: "", role: "x" } }, "Company is required"],
    [{ action: "save_application", item: { ...app, url: "javascript:alert(1)" } }, "Links must start with http:// or https://"],
    [{ action: "save_application", item: { ...app, status: "hired" } }, "Invalid request."],
    [{ action: "save_application", item: { ...app, appliedOn: "28/11/2026" } }, "Invalid request."],
    [{ action: "delete_company", id: "../etc" }, "Invalid request."],
    [{ action: "drop_tables" }, "Invalid request."],
    [null, "Invalid request."],
  ])("rejects %j", (body, error) => {
    expect(parseJobAction(body)).toEqual({ ok: false, error })
  })

  it("caps long text", () => {
    expect(parseJobAction({ action: "save_application", item: { ...app, notes: "x".repeat(2001) } }).ok).toBe(false)
  })
})

describe("applyJobAction with the memory store", () => {
  it("creates, updates and deletes an application, keeping createdAt", async () => {
    const store = createMemoryJobStore()
    const create = parseJobAction({ action: "save_application", item: app })
    if (!create.ok) throw new Error("bad fixture")
    const created = await applyJobAction(store, create.value, 1000)
    expect(created.ok).toBe(true)
    const id = (created as { id: string }).id

    const update = parseJobAction({ action: "save_application", item: { ...app, id, status: "interview" } })
    if (!update.ok) throw new Error("bad fixture")
    await applyJobAction(store, update.value, 2000)

    const { applications } = await store.load()
    expect(applications).toHaveLength(1)
    expect(applications[0]).toMatchObject({ id, status: "interview", createdAt: 1000, updatedAt: 2000 })

    const del = parseJobAction({ action: "delete_application", id })
    if (!del.ok) throw new Error("bad fixture")
    await applyJobAction(store, del.value)
    expect((await store.load()).applications).toHaveLength(0)
  })

  it("refuses to update an item that doesn't exist", async () => {
    const store = createMemoryJobStore()
    const action = parseJobAction({ action: "save_company", item: { name: "Acme", id: "missing" } })
    if (!action.ok) throw new Error("bad fixture")
    expect(await applyJobAction(store, action.value)).toMatchObject({ ok: false, status: 404 })
  })

  it("stops adding new items at the limit", async () => {
    const store = createMemoryJobStore()
    for (let i = 0; i < MAX_ITEMS; i++) await store.put("companies", `c${i}`, { id: `c${i}`, updatedAt: i })
    const action = parseJobAction({ action: "save_company", item: { name: "One more" } })
    if (!action.ok) throw new Error("bad fixture")
    expect(await applyJobAction(store, action.value)).toMatchObject({ ok: false, status: 400 })
  })

  it("saves prep progress only for known topics", async () => {
    const store = createMemoryJobStore()
    const known = parseJobAction({ action: "set_prep", item: { topicId: PREP_TOPICS[0].id, done: true } })
    const unknown = parseJobAction({ action: "set_prep", item: { topicId: "not-a-topic", done: true } })
    if (!known.ok || !unknown.ok) throw new Error("bad fixture")
    expect(await applyJobAction(store, known.value)).toEqual({ ok: true })
    expect(await applyJobAction(store, unknown.value)).toMatchObject({ ok: false, status: 400 })
    expect((await store.load()).prep).toEqual([expect.objectContaining({ topicId: PREP_TOPICS[0].id, done: true })])
  })

  it("has unique prep topic ids", () => {
    expect(new Set(PREP_TOPICS.map((t) => t.id)).size).toBe(PREP_TOPICS.length)
  })
})

describe("job search", () => {
  afterEach(() => vi.unstubAllEnvs())

  const raw = {
    id: "4912",
    title: "<strong>React</strong> Developer",
    company: { display_name: "Acme Tech" },
    location: { display_name: "Noida, Uttar Pradesh" },
    redirect_url: "https://www.adzuna.in/details/4912",
    created: "2026-11-27T10:00:00Z",
    salary_min: 1800000,
    salary_max: 2400000,
    salary_is_predicted: "1",
    description: "Build <b>Next.js</b> apps",
  }

  it("maps an Adzuna result and strips HTML", () => {
    expect(mapAdzunaResult(raw)).toEqual({
      externalId: "adzuna-4912",
      title: "React Developer",
      company: "Acme Tech",
      location: "Noida, Uttar Pradesh",
      url: "https://www.adzuna.in/details/4912",
      created: "2026-11-27T10:00:00Z",
      salaryMin: 1800000,
      salaryMax: 2400000,
      salaryPredicted: true,
      snippet: "Build Next.js apps",
    })
  })

  it("drops results without an id or a safe link", () => {
    expect(mapAdzunaResult({ ...raw, id: undefined })).toBeNull()
    expect(mapAdzunaResult({ ...raw, redirect_url: "javascript:alert(1)" })).toBeNull()
  })

  it("explains when keys are missing", async () => {
    vi.stubEnv("ADZUNA_APP_ID", "")
    vi.stubEnv("ADZUNA_APP_KEY", "")
    expect(await searchJobs(searchQuery.parse({}))).toMatchObject({ ok: false, status: 503 })
  })

  it("calls the India endpoint with the query and maps results", async () => {
    vi.stubEnv("ADZUNA_APP_ID", "id")
    vi.stubEnv("ADZUNA_APP_KEY", "key")
    const fetchImpl = vi.fn(async () => Response.json({ count: 1, results: [raw, { bad: true }] }))
    const res = await searchJobs(searchQuery.parse({ what: "next.js unique-1", where: "Gurugram" }), fetchImpl as unknown as typeof fetch)
    const url = new URL(String((fetchImpl.mock.calls[0] as unknown[])[0]))
    expect(url.pathname).toBe("/v1/api/jobs/in/search/1")
    expect(url.searchParams.get("what")).toBe("next.js unique-1")
    expect(url.searchParams.get("where")).toBe("Gurugram")
    expect(res).toMatchObject({ ok: true, total: 1, results: [expect.objectContaining({ externalId: "adzuna-4912" })] })
  })

  it("reports a rejected key clearly", async () => {
    vi.stubEnv("ADZUNA_APP_ID", "id")
    vi.stubEnv("ADZUNA_APP_KEY", "key")
    const fetchImpl = vi.fn(async () => new Response("no", { status: 401 }))
    const res = await searchJobs(searchQuery.parse({ what: "unique-2" }), fetchImpl as unknown as typeof fetch)
    expect(res).toMatchObject({ ok: false, status: 502 })
  })
})
