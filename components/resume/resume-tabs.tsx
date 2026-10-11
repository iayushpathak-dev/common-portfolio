"use client"

import { createContext, use, useState } from "react"

import { cn } from "@/lib/utils"

const ActiveTab = createContext<string>("")

/**
 * Below xl the resume sections become tabs; from xl (and when printing) every panel shows.
 */
export function ResumeTabs({ tabs, children }: { tabs: { key: string; label: string }[]; children: React.ReactNode }) {
  const [active, setActive] = useState(tabs[0].key)

  return (
    <ActiveTab value={active}>
      <div role="tablist" className="flex gap-1 overflow-x-auto scrollbar-hide rounded-xl border bg-card p-1 xl:hidden print:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            id={`tab-${tab.key}`}
            aria-selected={active === tab.key}
            aria-controls={`panel-${tab.key}`}
            onClick={() => setActive(tab.key)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
              active === tab.key && "bg-primary text-primary-foreground hover:text-primary-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {children}
    </ActiveTab>
  )
}

export function TabPanel({ tab, className, children }: { tab: string; className?: string; children: React.ReactNode }) {
  const active = use(ActiveTab)
  return (
    <div
      role="tabpanel"
      id={`panel-${tab}`}
      aria-labelledby={`tab-${tab}`}
      className={cn(className, active !== tab && "hidden xl:grid print:grid")}
    >
      {children}
    </div>
  )
}
