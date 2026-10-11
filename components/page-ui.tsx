import { cn } from "@/lib/utils"

/** Gradient title card used at the top of Blog, Projects and Experience. */
export function PageIntro({
  icon: Icon,
  title,
  subtitle,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border bg-linear-to-br from-hero-from to-hero-to p-5 lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <Icon className="mt-1 size-8 shrink-0 text-violet-500 dark:text-violet-300" />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{title}</h1>
            <p className="text-foreground/85">{subtitle}</p>
            {description && <p className="mt-2 max-w-2xl text-sm text-foreground/75">{description}</p>}
          </div>
        </div>
        {children}
      </div>
    </section>
  )
}

/** Card surface shared by all page sections. */
export const card = "rounded-2xl border bg-card p-4 lg:p-5 print:break-inside-avoid print:border-neutral-300"

export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("rounded-lg border bg-background/50 px-2.5 py-1 text-xs", className)}>{children}</span>
}

export function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <h2 className="mb-3 flex items-center gap-2.5 text-lg font-semibold">
      <Icon className="size-5 text-violet-500 dark:text-violet-300" />
      {children}
    </h2>
  )
}
