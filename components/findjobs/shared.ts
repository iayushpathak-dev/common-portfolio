import type { ApplicationInput, CompanyInput } from "@/lib/jobs/schema"

export type Save = {
  application: (item: Partial<ApplicationInput> & Pick<ApplicationInput, "company" | "role">, done?: string) => Promise<boolean>
  company: (item: Partial<CompanyInput> & Pick<CompanyInput, "name">, done?: string) => Promise<boolean>
  remove: (kind: "application" | "company", id: string) => Promise<boolean>
  prep: (topicId: string, done: boolean, notes: string) => Promise<boolean>
}

/** Today's date as YYYY-MM-DD in the browser's time zone. */
export const today = () => new Date().toLocaleDateString("en-CA")

export const field = "rounded-md border bg-background px-3 py-2 text-base"
