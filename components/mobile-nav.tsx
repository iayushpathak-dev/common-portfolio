"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { bottomLinks, isActive, moreLinks } from "@/lib/nav"
import { PORTFOLIO } from "@/lib/portfolio"
import { cn } from "@/lib/utils"

const { mobileNav } = PORTFOLIO
const itemClass = "flex flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground"
const activeClass = "text-primary dark:text-blue-300"

export function MobileNav() {
  const pathname = usePathname()
  const moreActive = moreLinks.some((page) => isActive(page, pathname))

  return (
    <nav
      aria-label="Bottom"
      className="grid shrink-0 grid-cols-5 border-t bg-background pb-[env(safe-area-inset-bottom)] print:hidden md:hidden"
    >
      {bottomLinks.map((page) => {
        const active = isActive(page, pathname)
        return (
          <Link
            key={page.label}
            href={page.href}
            aria-current={active ? "page" : undefined}
            className={cn(itemClass, active && activeClass)}
          >
            <page.icon className="size-5" />
            {page.label}
          </Link>
        )
      })}

      <Sheet>
        <SheetTrigger className={cn(itemClass, moreActive && activeClass)}>
          <mobileNav.moreIcon className="size-5" />
          {mobileNav.moreLabel}
        </SheetTrigger>
        <SheetContent side="bottom" className="pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <SheetHeader>
            <SheetTitle>{mobileNav.moreLabel}</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-2 px-4">
            {moreLinks.map((page) => {
              const active = isActive(page, pathname)
              return (
                <SheetClose
                  key={page.label}
                  render={
                    <Link
                      href={page.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm hover:bg-muted",
                        active && "border-primary/60 bg-accent",
                      )}
                    />
                  }
                >
                  <page.icon className="size-5" />
                  {page.label}
                </SheetClose>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
