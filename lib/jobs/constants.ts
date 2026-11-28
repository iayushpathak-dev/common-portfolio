// Shared by the server (validation) and the /findjobs dashboard UI. No imports, so the
// client bundle stays small.

export const APPLICATION_STATUSES = ["saved", "applied", "interview", "offer", "rejected", "withdrawn"] as const
export const COMPANY_STATUSES = ["to_contact", "contacted", "replied", "not_interested"] as const
export const CITIES = ["Noida", "Gurugram", "Greater Noida", "Remote", "Other"] as const
export const SOURCES = ["LinkedIn", "Naukri", "Adzuna", "Company site", "Referral", "Email", "Other"] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]
export type CompanyStatus = (typeof COMPANY_STATUSES)[number]

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  interview: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
}

export const COMPANY_STATUS_LABELS: Record<CompanyStatus, string> = {
  to_contact: "To contact",
  contacted: "Contacted",
  replied: "Replied",
  not_interested: "Not interested",
}

/** Statuses that still need action from you. */
export const ACTIVE_STATUSES: ReadonlySet<ApplicationStatus> = new Set(["saved", "applied", "interview", "offer"])
