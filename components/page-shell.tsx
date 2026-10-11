import { LinkedSidebar } from "@/components/assistant/linked-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { NavRail } from "@/components/nav-rail"
import { SiteHeader } from "@/components/site-header"
import { cn } from "@/lib/utils"

/**
 * Layout for content pages: header, then an icon rail on tablets or the chat sidebar
 * from xl, a scrolling main area, and the bottom bar on phones. `sidebar={false}` gives a
 * full-width page (used by Home).
 */
export function PageShell({
  children,
  className,
  sidebar = true,
}: {
  children: React.ReactNode
  className?: string
  sidebar?: boolean
}) {
  return (
    <div className="flex h-dvh flex-col print:h-auto">
      <SiteHeader />
      <div
        className={cn(
          "grid min-h-0 flex-1 print:block",
          sidebar && "md:grid-cols-[64px_minmax(0,1fr)] xl:grid-cols-[248px_minmax(0,1fr)] 2xl:grid-cols-[272px_minmax(0,1fr)]",
        )}
      >
        {sidebar && (
          <>
            <NavRail />
            <LinkedSidebar className="xl:flex" />
          </>
        )}
        <main className="min-h-0 min-w-0 overflow-y-auto scrollbar-hide print:overflow-visible">
          <div className={cn("mx-auto max-w-7xl p-4 lg:p-5 print:p-0", className)}>{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
