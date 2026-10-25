import type { EvidenceLabel, PublicationStatus } from "@/content/types"
import { cn } from "@/lib/utils"

const EVIDENCE_TONES: Record<EvidenceLabel, string> = {
  "Professional Experience": "border-success/40 bg-success/10 text-success",
  "Hands-on Implementation": "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-300",
  Experiment: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "Learning Notes": "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-300",
  Planned: "border-border bg-muted text-muted-foreground",
}

/** How much first-hand experience the content reflects. */
export function EvidenceBadge({ label, className }: { label: EvidenceLabel; className?: string }) {
  return (
    <span className={cn("inline-flex w-fit items-center rounded-md border px-2 py-0.5 text-xs font-medium", EVIDENCE_TONES[label], className)}>
      {label}
    </span>
  )
}

/** Shown only for drafts, which are only rendered in development. */
export function DraftBadge({ status }: { status: PublicationStatus }) {
  if (status !== "draft") return null
  return (
    <span className="inline-flex w-fit items-center rounded-md border border-dashed border-amber-500 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
      Draft · not public
    </span>
  )
}
