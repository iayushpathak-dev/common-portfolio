import { Menu } from "lucide-react"

import { GithubIcon } from "@/components/brand-icons"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { profile } from "@/lib/portfolio-data"
import { navLinks } from "@/lib/site-config"
import { cn } from "@/lib/utils"

export function Logo() {
  return (
    <a href="#" className="flex items-center gap-3">
      <span className="bg-linear-to-br from-blue-500 to-violet-500 bg-clip-text text-3xl font-black leading-none text-transparent">
        A
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-semibold">{profile.name}</span>
        <span className="text-xs text-muted-foreground">{profile.role}</span>
      </span>
    </a>
  )
}

export function SiteHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b px-4 lg:px-5">
      <Logo />

      <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
          >
            {link.label}
          </a>
        ))}
        <span
          aria-current="page"
          className="rounded-lg border border-primary/50 bg-primary/15 px-3 py-2 text-sm font-medium text-primary dark:text-blue-300"
        >
          AI Assistant
        </span>
      </nav>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <a
          href={profile.links.github}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-lg" }), "hidden sm:inline-flex")}
        >
          <GithubIcon className="size-5" />
        </a>
        <a
          href={profile.resumeUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "ml-2 hidden px-4 md:inline-flex")}
        >
          Resume
        </a>

        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon-lg" className="md:hidden" aria-label="Open menu" />}>
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="rounded-lg px-3 py-2.5 hover:bg-muted">
                  {link.label}
                </a>
              ))}
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="rounded-lg px-3 py-2.5 hover:bg-muted">
                Resume
              </a>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
