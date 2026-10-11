import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { profile } from "@/lib/portfolio-data"
import { suggestions } from "@/lib/site-config"

export function HeroCard({ onPick, disabled }: { onPick: (prompt: string) => void; disabled?: boolean }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-2xl border bg-linear-to-br from-hero-from to-hero-to p-5 lg:p-6 2xl:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl 2xl:text-4xl">
              Hi, I&apos;m {profile.firstName} <span aria-hidden="true">👋</span>
            </h1>
            <p className="mt-1 text-foreground/85 lg:text-lg">{profile.role}</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground/80 sm:mt-3 2xl:text-base">
              {profile.tagline}
              <span className="hidden sm:inline">
                {" "}
                Ask me anything about my experience, projects, skills or the latest in frontend development.
              </span>
            </p>
          </div>
          <Avatar className="size-16 shrink-0 ring-4 ring-violet-400/30 lg:size-20 2xl:size-28">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="bg-linear-to-br from-blue-500 to-violet-500 text-lg font-semibold text-white lg:text-2xl">
              AP
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Desktop / tablet: chips sit inside the hero */}
        <div className="mt-5 hidden flex-wrap gap-2 sm:flex">
          {suggestions.map((s) => (
            <SuggestionButton key={s.label} icon={s.icon} label={s.label} onClick={() => onPick(s.prompt)} disabled={disabled} />
          ))}
        </div>
      </div>

      {/* Mobile: compact two-column grid below the hero */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        {suggestions.map((s) => (
          <SuggestionButton key={s.label} icon={s.icon} label={s.shortLabel} onClick={() => onPick(s.prompt)} disabled={disabled} />
        ))}
      </div>
    </section>
  )
}

function SuggestionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2.5 rounded-xl border bg-card/60 px-3 py-2 text-left text-sm backdrop-blur transition-colors hover:border-primary/50 hover:bg-card disabled:pointer-events-none disabled:opacity-50"
    >
      <Icon className="size-4 shrink-0 text-violet-500 dark:text-violet-300" />
      <span className="truncate">{label}</span>
    </button>
  )
}
