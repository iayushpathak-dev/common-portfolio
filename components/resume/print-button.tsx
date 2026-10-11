"use client"

import { Printer } from "lucide-react"

export function PrintButton({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      <Printer className="size-5" />
      {label}
    </button>
  )
}
