"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, ArrowRightLeft, Sparkles } from "lucide-react"

import { FilterPills } from "@/components/blog/blog-list"
import { GithubIcon } from "@/components/brand-icons"
import { DraftBadge, EvidenceBadge } from "@/components/content/content-badges"
import { ContentIcon } from "@/components/content/content-icon"
import { card, Chip, PageIntro } from "@/components/page-ui"
import type { ProjectSummary } from "@/content"
import { trackEvent } from "@/lib/analytics"
import { askAssistantHref } from "@/lib/nav"
import { PORTFOLIO } from "@/lib/portfolio"
import { cn } from "@/lib/utils"

const { pages, projectsPage: copy } = PORTFOLIO

export function ProjectBrowser({ projects }: { projects: ProjectSummary[] }) {
  const [category, setCategory] = useState<string | null>(null)
  const visible = projects.filter((p) => category === null || (p.categories as string[]).includes(category))

  function selectCategory(next: string | null) {
    setCategory(next)
    trackEvent("filter_select", { filter_location: "projects", filter_value: next ?? "all" })
  }

  return (
    <div className="flex flex-col gap-4">
      <PageIntro icon={pages.projects.icon} title={copy.title} subtitle={copy.subtitle} description={copy.description}>
        <FilterPills options={copy.filters} allLabel={copy.allLabel} value={category} onChange={selectCategory} />
      </PageIntro>

      {visible.length === 0 ? (
        <p className={cn(card, "text-center text-sm text-muted-foreground")}>{copy.empty}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

export function ProjectCard({ project }: { project: ProjectSummary }) {
  const buttonBase = "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"

  return (
    <article className={cn(card, "flex flex-col gap-3", project.featured && "border-primary/50")}>
      <div className="relative">
        <ProjectVisual project={project} />
        {project.featured && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
            <Sparkles className="size-3" /> {copy.featuredLabel}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <EvidenceBadge label={project.evidence} />
        <DraftBadge status={project.publicationStatus} />
      </div>
      <div>
        <h2 className="text-lg font-semibold">
          <Link href={project.href} className="hover:underline">
            {project.title}
          </Link>
        </h2>
        <p className="text-xs text-muted-foreground">
          {[project.aka, project.organization].filter(Boolean).join(" · ")}
        </p>
      </div>
      <p className="text-sm text-foreground/80">{project.summary}</p>
      <div className="flex flex-wrap gap-1.5">
        {project.tags.slice(0, 5).map((t) => (
          <Chip key={t}>{t}</Chip>
        ))}
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <Link href={project.href} className={cn(buttonBase, "bg-primary text-primary-foreground hover:bg-primary/85")}>
          {copy.caseStudy} <ArrowRight className="size-4" />
        </Link>
        <Link href={askAssistantHref(`${copy.caseStudyPrompt} ${project.title}`)} className={cn(buttonBase, "border hover:bg-muted")}>
          <Sparkles className="size-4" /> {copy.askAi}
        </Link>
        {project.links?.github && (
          <a href={project.links.github} target="_blank" rel="noreferrer" className={cn(buttonBase, "border hover:bg-muted")}>
            <GithubIcon className="size-4" /> {copy.github}
          </a>
        )}
      </div>
    </article>
  )
}

const visualFrame = "grid h-40 place-items-center overflow-hidden rounded-xl border bg-linear-to-br from-hero-from to-hero-to"

function ProjectVisual({ project }: { project: ProjectSummary }) {
  const visual = project.visual

  if (visual.kind === "diagram") {
    const box = "rounded-md border border-primary/50 bg-background/60 px-2 py-1 text-center text-[11px] leading-tight"
    return (
      <div className={visualFrame} aria-hidden="true">
        <div className="flex items-center gap-2 px-3">
          <div className="flex flex-col gap-2">
            {visual.clients.map((c) => (
              <span key={c} className={box}>
                {c}
              </span>
            ))}
          </div>
          <ArrowRightLeft className="size-4 text-muted-foreground" />
          <span className={cn(box, "px-3 py-3 font-semibold")}>{visual.hub}</span>
          <ArrowRightLeft className="size-4 text-muted-foreground" />
          <span className={cn(box, "border-red-400/60")}>{visual.backend}</span>
        </div>
      </div>
    )
  }

  if (visual.kind === "score") {
    const circumference = 2 * Math.PI * 34
    return (
      <div className={visualFrame} aria-hidden="true">
        <div className="relative grid size-24 place-items-center">
          <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" strokeWidth="7" className="stroke-muted" />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              strokeWidth="7"
              strokeLinecap="round"
              className="stroke-success"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - visual.score / 100)}
            />
          </svg>
          <div className="text-center">
            <p className="text-2xl font-bold">{visual.display}</p>
            <p className="text-[10px] text-muted-foreground">{visual.label}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={visualFrame} aria-hidden="true">
      <ContentIcon name={visual.icon} className="size-16 text-blue-400 drop-shadow-[0_0_20px_rgb(96_165_250/0.5)]" />
    </div>
  )
}

/** Project cards for the home page (data comes from the server page as plain props). */
export function FeaturedProjects({ projects }: { projects: ProjectSummary[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
