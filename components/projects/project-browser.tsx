"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, ArrowRightLeft, Sparkles } from "lucide-react"

import { FilterPills } from "@/components/blog/blog-list"
import { GithubIcon } from "@/components/brand-icons"
import { card, Chip, PageIntro } from "@/components/page-ui"
import { askAssistantHref } from "@/lib/nav"
import { PORTFOLIO } from "@/lib/portfolio"
import { cn } from "@/lib/utils"

const { projects, pages, projectsPage: copy } = PORTFOLIO

type Project = (typeof projects)[number]

export function ProjectBrowser() {
  const [category, setCategory] = useState<string | null>(null)
  const visible = projects.filter(
    (p) => category === null || (p.categories as readonly string[]).includes(category),
  )

  return (
    <div className="flex flex-col gap-4">
      <PageIntro icon={pages.projects.icon} title={copy.title} subtitle={copy.subtitle} description={copy.description}>
        <FilterPills options={copy.filters} allLabel={copy.allLabel} value={category} onChange={setCategory} />
      </PageIntro>

      {visible.length === 0 ? (
        <p className={cn(card, "text-center text-sm text-muted-foreground")}>{copy.empty}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const featured = "featured" in project && project.featured
  const caseStudyUrl = "caseStudyUrl" in project && typeof project.caseStudyUrl === "string" ? project.caseStudyUrl : null
  const githubUrl = "githubUrl" in project ? project.githubUrl : null
  const buttonBase = "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"

  return (
    <article className={cn(card, "flex flex-col gap-3", featured && "border-primary/50")}>
      <div className="relative">
        <ProjectVisual project={project} />
        {featured && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
            <Sparkles className="size-3" /> {copy.featuredLabel}
          </span>
        )}
      </div>
      <h2 className="text-lg font-semibold">{project.name}</h2>
      <p className="text-sm text-foreground/80">{project.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <Chip key={t}>{t}</Chip>
        ))}
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        {caseStudyUrl ? (
          <a href={caseStudyUrl} className={cn(buttonBase, "bg-primary text-primary-foreground hover:bg-primary/85")}>
            {copy.caseStudy} <ArrowRight className="size-4" />
          </a>
        ) : (
          <Link
            href={askAssistantHref(`${copy.caseStudyPrompt} ${project.name}`)}
            className={cn(buttonBase, "bg-primary text-primary-foreground hover:bg-primary/85")}
          >
            {copy.caseStudy} <ArrowRight className="size-4" />
          </Link>
        )}
        {githubUrl && (
          <a href={githubUrl} target="_blank" rel="noreferrer" className={cn(buttonBase, "border hover:bg-muted")}>
            <GithubIcon className="size-4" /> {copy.github}
          </a>
        )}
      </div>
    </article>
  )
}

const visualFrame = "grid h-40 place-items-center overflow-hidden rounded-xl border bg-linear-to-br from-hero-from to-hero-to"

function ProjectVisual({ project }: { project: Project }) {
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
            <p className="text-2xl font-bold">{visual.score}</p>
            <p className="text-[10px] text-muted-foreground">{visual.label}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={visualFrame} aria-hidden="true">
      <visual.icon className="size-16 text-blue-400 drop-shadow-[0_0_20px_rgb(96_165_250/0.5)]" />
    </div>
  )
}
