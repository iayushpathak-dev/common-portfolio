"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { isActive, railLinks } from "@/lib/nav"
import { cn } from "@/lib/utils"

/** Icon-only page navigation for tablets, between the mobile bar and the full sidebar. */
export function NavRail({ className = "md:flex xl:hidden" }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Pages"
      className={cn("hidden flex-col items-center gap-2 border-r bg-sidebar py-4 print:hidden", className)}
    >
      {railLinks.map((page) => {
        const active = isActive(page, pathname)
        return (
          <Link
            key={page.label}
            href={page.href}
            title={page.label}
            aria-label={page.label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            )}
          >
            <page.icon className="size-5" />
          </Link>
        )
      })}
    </nav>
  )
}
