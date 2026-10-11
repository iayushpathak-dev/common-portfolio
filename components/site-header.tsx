"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { GithubIcon } from "@/components/brand-icons"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { headerLinks, isActive, railLinks } from "@/lib/nav"
import { PORTFOLIO } from "@/lib/portfolio"
import { cn } from "@/lib/utils"

const { profile, header, pages } = PORTFOLIO

const navClass = "rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
const activeNavClass =
  "border border-primary/50 bg-primary/15 font-medium text-primary hover:bg-primary/20 hover:text-primary dark:text-blue-300"

export function Logo() {
  return (
    <Link href={pages.home.href} className="flex min-w-0 items-center gap-3">
      <span className="bg-linear-to-br from-blue-500 to-violet-500 bg-clip-text text-3xl font-black leading-none text-transparent">
        A
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate font-semibold">{profile.name}</span>
        <span className="truncate text-xs text-muted-foreground">{profile.role}</span>
      </span>
    </Link>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const onResume = isActive(pages.resume, pathname)

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b px-4 print:hidden lg:px-5">
      <Logo />

      <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
        {[...headerLinks, pages.assistant].map((page) => {
          const active = isActive(page, pathname)
          return (
            <Link
              key={page.label}
              href={page.href}
              aria-current={active ? "page" : undefined}
              className={cn(navClass, (active || page === pages.assistant) && "border border-transparent", active && activeNavClass)}
            >
              {page.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex shrink-0 items-center gap-1">
        <ThemeToggle />
        <a
          href={profile.contact.github}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-lg" }), "hidden sm:inline-flex")}
        >
          <GithubIcon className="size-5" />
        </a>
        <Link
          href={pages.resume.href}
          aria-current={onResume ? "page" : undefined}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "ml-2 hidden px-4 md:inline-flex",
            onResume && "border-primary bg-primary/15 dark:border-primary",
          )}
        >
          {pages.resume.label}
        </Link>

        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon-lg" className="lg:hidden" aria-label="Open menu" />}>
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>{header.menuTitle}</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
              {railLinks.map(
                (page) => {
                  const active = isActive(page, pathname)
                  return (
                    <SheetClose
                      key={page.label}
                      render={
                        <Link
                          href={page.href}
                          aria-current={active ? "page" : undefined}
                          className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted", active && "bg-accent")}
                        />
                      }
                    >
                      <page.icon className="size-4" />
                      {page.label}
                    </SheetClose>
                  )
                },
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
