import { ChevronRight, CircleCheck, Circle, Sparkles } from "lucide-react"

import type { ChatMode } from "@/lib/chat-modes"
import { PORTFOLIO } from "@/lib/portfolio"
import { cn } from "@/lib/utils"

const { insights, modes } = PORTFOLIO

type InsightsPanelProps = {
  mode: ChatMode
  usedWeb: boolean
  modelId: string
  online: boolean
  onPick: (prompt: string) => void
}

const rowClass =
  "flex w-full items-center gap-3 rounded-xl border bg-background/40 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"

export function InsightsPanel({ mode, usedWeb, modelId, online, onPick }: InsightsPanelProps) {
  return (
    <aside className="hidden min-h-0 flex-col gap-3 overflow-y-auto scrollbar-hide border-l p-3 xl:flex 2xl:p-4">
      <Panel title={insights.sourcesTitle}>
        <SourceRow
          icon={<modes.knowledge.icon className="size-5" />}
          tone="bg-success text-white"
          {...insights.sources.knowledge}
          active={mode !== "web" || !usedWeb}
        />
        <SourceRow
          icon={<modes.web.icon className="size-5" />}
          tone="bg-blue-600 text-white"
          {...insights.sources.web}
          active={usedWeb}
        />
      </Panel>

      <Panel title={insights.relatedTitle}>
        {insights.related.map((s) => (
          <button key={s.title} type="button" onClick={() => onPick(s.prompt)} className={cn(rowClass, "p-3")}>
            <s.icon className="size-5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{s.title}</span>
              <span className="block text-xs text-muted-foreground">{s.subtitle}</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        ))}
      </Panel>

      <Panel title={insights.quickActionsTitle}>
        {insights.quickActions.map((action) =>
          "href" in action ? (
            <a key={action.label} href={action.href} target="_blank" rel="noreferrer" className={rowClass}>
              <action.icon className="size-4" />
              {action.label}
            </a>
          ) : (
            <button key={action.label} type="button" onClick={() => onPick(action.prompt)} className={rowClass}>
              <action.icon className="size-4" />
              {action.label}
            </button>
          ),
        )}
      </Panel>

      <section className="rounded-2xl border border-primary/30 bg-linear-to-br from-hero-from to-hero-to p-4">
        <h2 className="mb-3 font-semibold">{insights.modelTitle}</h2>
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-7 shrink-0 text-blue-400" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{modelId}</span>
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs",
                  online ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
                )}
              >
                <span className={cn("size-1.5 rounded-full", online ? "bg-success" : "bg-destructive")} />
                {online ? insights.online : insights.offline}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{insights.modelProvider}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-foreground/80">{insights.modelNote}</p>
      </section>
    </aside>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-4">
      <h2 className="mb-3 font-semibold">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  )
}

function SourceRow({
  icon,
  tone,
  title,
  subtitle,
  active,
}: {
  icon: React.ReactNode
  tone: string
  title: string
  subtitle: string
  active: boolean
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-1">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tone)}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
      </span>
      {active ? (
        <CircleCheck className="size-5 text-success" aria-label="Used" />
      ) : (
        <Circle className="size-5 text-muted-foreground" aria-label="Not used" />
      )}
    </div>
  )
}
