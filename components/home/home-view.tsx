import Link from "next/link"
import { ArrowRight, Briefcase, Code, Download, FolderOpen, GraduationCap, MessageSquare, Newspaper, Quote } from "lucide-react"

import { LatestPosts } from "@/components/blog/blog-list"
import { FeaturedProjects } from "@/components/projects/project-browser"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PORTFOLIO } from "@/lib/portfolio"
import { cn } from "@/lib/utils"

const { profile, highlights, experience, education, pages, homePage: copy } = PORTFOLIO

export function HomeView() {
  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      <Hero />
      <WhatIDo />

      <Section icon={FolderOpen} title={copy.featuredTitle} subtitle={copy.featuredSubtitle} href={pages.projects.href} linkLabel={copy.viewAllProjects}>
        <FeaturedProjects count={copy.featuredCount} />
      </Section>

      <div className="grid gap-8 lg:gap-10 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Section icon={Newspaper} title={copy.blogTitle} subtitle={copy.blogSubtitle} href={pages.blog.href} linkLabel={copy.viewAllPosts}>
          <LatestPosts count={copy.postsCount} />
        </Section>
        <CareerJourney />
      </div>

      <figure className="flex flex-col gap-2 rounded-2xl border border-primary/30 bg-linear-to-r from-hero-from to-hero-to px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
        <Quote className="size-7 shrink-0 text-success" />
        <blockquote className="flex-1 text-sm sm:text-base">&ldquo;{profile.quote}&rdquo;</blockquote>
        <figcaption className="text-sm text-muted-foreground">— {profile.name}</figcaption>
      </figure>
    </div>
  )
}

function Hero() {
  const buttonBase = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"

  return (
    <section className="relative overflow-hidden rounded-3xl border bg-linear-to-br from-hero-from via-background to-hero-to p-5 sm:p-8 lg:p-10">
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs">
            <span className="size-2 rounded-full bg-success" /> {copy.availability}
          </p>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl 2xl:text-6xl">
                {copy.greeting}{" "}
                <span className="bg-linear-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">{profile.name}</span>
              </h1>
              <p className="mt-2 text-lg text-foreground/85 sm:text-2xl">{profile.role}</p>
            </div>
            {/* On phones and tablets the photo sits beside the heading. */}
            <HeroAvatar className="size-20 sm:size-28 lg:hidden" />
          </div>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/80 sm:text-base">{copy.intro}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={pages.projects.href} className={cn(buttonBase, "bg-primary text-primary-foreground hover:bg-primary/85")}>
              {copy.viewWork} <ArrowRight className="size-4" />
            </Link>
            <a href={profile.resumeUrl} download className={cn(buttonBase, "border bg-card/60 hover:bg-muted")}>
              <Download className="size-4" />
              <span className="sm:hidden">{copy.downloadResumeShort}</span>
              <span className="hidden sm:inline">{copy.downloadResume}</span>
            </a>
            <a
              href={profile.contact.linkedin}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonBase, "hidden border bg-card/60 hover:bg-muted sm:inline-flex")}
            >
              <MessageSquare className="size-4" /> {copy.connect}
            </a>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {highlights.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex items-start gap-2.5">
                <Icon className="mt-1 size-6 shrink-0 text-violet-500 dark:text-violet-300" />
                <div className="min-w-0">
                  <dt className="sr-only">{label}</dt>
                  <dd className="text-xl font-bold">{value}</dd>
                  <dd className="text-xs text-muted-foreground">{label}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative hidden items-center justify-center lg:flex">
          <span className="absolute top-0 left-4 -rotate-12 font-serif text-lg text-foreground/70 italic">{copy.handwrittenNote}</span>
          <HeroAvatar className="size-64 2xl:size-80" />
          <pre className="absolute -bottom-2 left-0 max-w-[60%] -rotate-6 overflow-hidden rounded-xl border border-primary/40 bg-background/80 p-3 font-mono text-[11px] leading-relaxed text-violet-500 shadow-xl backdrop-blur dark:text-violet-300">
            {copy.codeLines.join("\n")}
          </pre>
          <span className="absolute right-0 bottom-6 grid size-11 place-items-center rounded-xl bg-violet-600 text-white shadow-lg">
            <Code className="size-5" />
          </span>
        </div>
      </div>

      <ul className="mt-8 flex flex-wrap gap-2">
        {copy.techStack.map((tech) => (
          <li key={tech} className="rounded-lg border bg-card/60 px-3 py-1.5 text-xs">
            {tech}
          </li>
        ))}
      </ul>
    </section>
  )
}

function HeroAvatar({ className }: { className?: string }) {
  return (
    <Avatar className={cn("shrink-0 ring-4 ring-violet-400/40 shadow-[0_0_60px_rgb(139_92_246/0.35)]", className)}>
      <AvatarImage src={profile.avatar} alt={profile.name} />
      <AvatarFallback className="bg-linear-to-br from-blue-500 to-violet-500 text-2xl font-bold text-white lg:text-6xl">
        {profile.initials}
      </AvatarFallback>
    </Avatar>
  )
}

function WhatIDo() {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {copy.whatIDo.map(({ title, text, icon: Icon }) => (
        <li key={title} className="flex flex-col gap-2 rounded-2xl border bg-card p-4 sm:flex-row sm:items-start sm:gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted">
            <Icon className="size-6 text-violet-500 dark:text-violet-300" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">{title}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function Section({
  icon: Icon,
  title,
  subtitle,
  href,
  linkLabel,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle?: string
  href?: string
  linkLabel?: string
  children: React.ReactNode
}) {
  return (
    <section className="min-w-0">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 size-7 shrink-0 text-violet-500 dark:text-violet-300" />
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {href && linkLabel && (
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/50 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 dark:text-blue-300"
          >
            <span className="sm:hidden">{copy.viewAll}</span>
            <span className="hidden sm:inline">{linkLabel}</span>
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

function CareerJourney() {
  const stops = [
    ...experience.map((job) => ({
      key: job.company,
      icon: Briefcase,
      title: job.company,
      detail: job.role,
      meta: `${job.period} · ${job.duration}`,
    })),
    ...education.map((e) => ({
      key: e.degree,
      icon: GraduationCap,
      title: e.degree,
      detail: e.place,
      meta: e.period,
    })),
  ]

  return (
    <Section icon={Briefcase} title={copy.careerTitle} href={pages.experience.href} linkLabel={copy.viewAll}>
      <ol className="flex flex-col gap-3 border-l-2 border-primary/40 pl-5">
        {stops.map(({ key, icon: Icon, title, detail, meta }) => (
          <li key={key} className="relative">
            <span className="absolute top-4 -left-[27px] size-3 rounded-full border-2 border-background bg-primary ring-2 ring-primary/40" />
            <div className="flex gap-3 rounded-xl border bg-card p-3">
              <Icon className="mt-0.5 size-5 shrink-0 text-violet-500 dark:text-violet-300" />
              <div className="min-w-0 text-sm">
                <p className="font-medium">{title}</p>
                <p className="text-xs text-primary dark:text-blue-300">{detail}</p>
                {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}
