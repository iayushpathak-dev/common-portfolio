import { z } from "zod"

import { APPLICATION_STATUSES, CITIES, COMPANY_STATUSES, SOURCES } from "@/lib/jobs/constants"

// Data for the private /findjobs dashboard. Everything a request sends goes through these
// schemas, so the store only ever holds validated, size-limited values.

const MESSAGES = {
  company: "Company is required",
  role: "Role is required",
  name: "Company name is required",
  url: "Links must start with http:// or https://",
} as const
/** Messages written for the dashboard; any other validation error is shown as "Invalid request." */
const FRIENDLY_ERRORS: ReadonlySet<string> = new Set(Object.values(MESSAGES))

const id = z.string().regex(/^[a-z0-9-]{1,64}$/)
const text = (max: number) => z.string().trim().max(max)
const optionalText = (max: number) => text(max).optional().default("")
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .or(z.literal(""))
  .optional()
  .default("")
const url = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), MESSAGES.url)
  .optional()
  .default("")

export const applicationInput = z.object({
  id: id.optional(),
  company: text(120).min(1, MESSAGES.company),
  role: text(120).min(1, MESSAGES.role),
  location: optionalText(80),
  url,
  source: z.enum(SOURCES).optional().default("Other"),
  status: z.enum(APPLICATION_STATUSES).optional().default("saved"),
  appliedOn: date,
  followUpOn: date,
  salary: optionalText(80),
  notes: optionalText(2000),
  externalId: optionalText(80),
})

export const companyInput = z.object({
  id: id.optional(),
  name: text(120).min(1, MESSAGES.name),
  city: z.enum(CITIES).optional().default("Other"),
  stack: optionalText(200),
  careersUrl: url,
  contact: optionalText(200),
  status: z.enum(COMPANY_STATUSES).optional().default("to_contact"),
  notes: optionalText(2000),
})

export const prepInput = z.object({
  topicId: id,
  done: z.boolean(),
  notes: optionalText(500),
})

export type ApplicationInput = z.infer<typeof applicationInput>
export type CompanyInput = z.infer<typeof companyInput>
export type Application = Omit<ApplicationInput, "id"> & { id: string; createdAt: number; updatedAt: number }
export type Company = Omit<CompanyInput, "id"> & { id: string; createdAt: number; updatedAt: number }
export type PrepProgress = { topicId: string; done: boolean; notes: string; updatedAt: number }

export const jobAction = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save_application"), item: applicationInput }),
  z.object({ action: z.literal("delete_application"), id }),
  z.object({ action: z.literal("save_company"), item: companyInput }),
  z.object({ action: z.literal("delete_company"), id }),
  z.object({ action: z.literal("set_prep"), item: prepInput }),
])

export type JobAction = z.infer<typeof jobAction>

/** Validates a dashboard request body. Returns the first error message or the action. */
export function parseJobAction(body: unknown): { ok: true; value: JobAction } | { ok: false; error: string } {
  const result = jobAction.safeParse(body)
  if (result.success) return { ok: true, value: result.data }
  const message = result.error.issues[0]?.message ?? ""
  return { ok: false, error: FRIENDLY_ERRORS.has(message) ? message : "Invalid request." }
}

export const searchQuery = z.object({
  what: text(100).min(2).optional().default("react developer"),
  where: text(60).optional().default(""),
  page: z.coerce.number().int().min(1).max(20).optional().default(1),
  maxDaysOld: z.coerce.number().int().min(1).max(60).optional().default(14),
})

export type SearchQuery = z.infer<typeof searchQuery>
