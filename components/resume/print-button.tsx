"use client"

import { Printer } from "lucide-react"

import { trackEvent } from "@/lib/analytics"

export function PrintButton({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" onClick={() => {
        trackEvent("resume_print")
        window.print()
      }} className={className}>
      <Printer className="size-5" />
      {label}
    </button>
  )
}
