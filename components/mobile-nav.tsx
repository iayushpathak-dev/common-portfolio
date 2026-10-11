import { Briefcase, Ellipsis, FolderOpen, House, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

const items = [
  { label: "Home", href: "#", icon: House },
  { label: "Projects", href: "#projects", icon: FolderOpen },
  { label: "AI Assistant", href: "#", icon: Sparkles, active: true },
  { label: "Experience", href: "#experience", icon: Briefcase },
  { label: "More", href: "#about", icon: Ellipsis },
]

export function MobileNav() {
  return (
    <nav aria-label="Bottom" className="grid shrink-0 grid-cols-5 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "flex flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground",
            item.active && "text-primary dark:text-blue-300",
          )}
        >
          <item.icon className="size-5" />
          {item.label}
        </a>
      ))}
    </nav>
  )
}
