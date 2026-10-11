import {
  Award,
  Briefcase,
  Building,
  Download,
  Eye,
  File,
  FileStack,
  GraduationCap,
  Mail,
  MapPin,
  Quote,
  RefreshCw,
  Settings,
  User,
  UserRound,
  Zap,
} from "lucide-react"

import { GithubIcon, LinkedinIcon } from "@/components/brand-icons"
import { ExperienceTimeline } from "@/components/experience-timeline"
import { card, Chip, SectionTitle } from "@/components/page-ui"
import { PrintButton } from "@/components/resume/print-button"
import { ResumeTabs, TabPanel } from "@/components/resume/resume-tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PORTFOLIO } from "@/lib/portfolio"
import { cn } from "@/lib/utils"

const { profile, highlights, experience, skillGroups, education, certifications, resumePage: copy, sidebar } = PORTFOLIO

const TABS = (["summary", "skills", "experience", "education"] as const).map((key) => ({ key, label: copy.tabs[key] }))

function displayUrl(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")
}

export function ResumeView() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px] print:block">
      <div className="flex min-w-0 flex-col gap-4">
        <ResumeHero />
        <ResumeTabs tabs={TABS}>
          <TabPanel tab="summary" className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <Summary />
            <Highlights />
          </TabPanel>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <TabPanel tab="skills" className="grid">
              <Skills />
            </TabPanel>
            <TabPanel tab="education" className="grid">
              <EducationAndCertifications />
            </TabPanel>
          </div>
          <TabPanel tab="experience" className="grid">
            <Experience />
          </TabPanel>
        </ResumeTabs>
      </div>

      <aside className="flex flex-col gap-4 print:hidden">
        <ResumeActions />
        <QuickInfo />
        <Connect />
        <ProfileQuote />
      </aside>
    </div>
  )
}



function ResumeHero() {
  const contacts = [
    { icon: MapPin, label: profile.location },
    { icon: Mail, label: profile.contact.email, href: `mailto:${profile.contact.email}` },
    { icon: LinkedinIcon, label: displayUrl(profile.contact.linkedin), href: profile.contact.linkedin },
    { icon: GithubIcon, label: displayUrl(profile.contact.github), href: profile.contact.github },
  ]

  return (
    <section className="rounded-2xl border bg-linear-to-br from-hero-from to-hero-to p-5 lg:p-7 print:bg-none">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight 2xl:text-4xl">{copy.title}</h1>
          <p className="mt-1 text-foreground/85 lg:text-lg">{profile.role}</p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/80 2xl:text-base">{profile.intro}</p>
        </div>
        <Avatar className="size-16 shrink-0 ring-4 ring-violet-400/30 lg:size-24 2xl:size-32 print:hidden">
          <AvatarImage src={profile.avatar} alt={profile.name} />
          <AvatarFallback className="bg-linear-to-br from-blue-500 to-violet-500 text-lg font-semibold text-white lg:text-3xl">
            {profile.initials}
          </AvatarFallback>
        </Avatar>
      </div>

      <ul className="mt-5 flex flex-wrap gap-2">
        {contacts.map(({ icon: Icon, label, href }) => {
          const inner = (
            <>
              <Icon className="size-4 shrink-0 text-blue-500 dark:text-blue-300" />
              <span className="truncate">{label}</span>
            </>
          )
          const cls = "flex max-w-full items-center gap-2 rounded-lg border bg-card/60 px-3 py-1.5 text-sm"
          return (
            <li key={label} className="max-w-full">
              {href ? (
                <a href={href} target="_blank" rel="noreferrer" className={cn(cls, "transition-colors hover:border-primary/50")}>
                  {inner}
                </a>
              ) : (
                <span className={cls}>{inner}</span>
              )}
            </li>
          )
        })}
      </ul>

      {/* On narrow screens the actions column sits far below, so offer the download here too. */}
      <a
        href={profile.resumeUrl}
        download
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground xl:hidden print:hidden"
      >
        <Download className="size-4" /> {copy.download}
      </a>
    </section>
  )
}

function Summary() {
  return (
    <section className={card}>
      <SectionTitle icon={User}>{copy.summaryTitle}</SectionTitle>
      <p className="text-sm leading-relaxed text-foreground/85">{profile.summary}</p>
    </section>
  )
}

function Highlights() {
  return (
    <section className={card}>
      <SectionTitle icon={Zap}>{copy.highlightsTitle}</SectionTitle>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 2xl:grid-cols-4">
        {highlights.map(({ value, label, icon: Icon }) => (
          <div key={label} className="flex flex-col items-center gap-1 rounded-xl border bg-background/40 p-3 text-center">
            <Icon className="size-6 text-violet-500 dark:text-violet-300" />
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function Skills() {
  return (
    <section className={card}>
      <SectionTitle icon={Settings}>{copy.skillsTitle}</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        {skillGroups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-2 text-sm font-medium">{group.title}</h3>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <Chip key={item}>{item}</Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function EducationAndCertifications() {
  return (
    <section className={card}>
      <SectionTitle icon={GraduationCap}>{copy.educationTitle}</SectionTitle>
      <ul className="flex flex-col gap-2">
        {education.map((e) => (
          <li key={e.degree} className="flex gap-3 rounded-xl border bg-background/40 p-3">
            <Building className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 text-sm">
              <p className="font-medium">{e.degree}</p>
              <p className="text-xs text-muted-foreground">{e.place}</p>
              <p className="text-xs text-muted-foreground">{e.period}</p>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mt-5 mb-3 flex items-center gap-2.5 text-lg font-semibold">
        <Award className="size-5 text-amber-500" />
        {copy.certificationsTitle}
        <span className="text-xs font-normal text-muted-foreground">{copy.certificationsNote}</span>
      </h2>
      <ul className="flex flex-col gap-2 text-sm">
        {certifications.map((c) => (
          <li key={c.name} className="flex items-center justify-between gap-3">
            <span className="min-w-0">{c.name}</span>
            <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn("size-1.5 rounded-full", c.status === "Completed" ? "bg-success" : "bg-amber-500")} />
              {c.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Experience() {
  return (
    <section className={card}>
      <SectionTitle icon={Briefcase}>{copy.experienceTitle}</SectionTitle>
      <ExperienceTimeline technologiesTitle={copy.keyTechnologies} />
    </section>
  )
}

const actionClass =
  "flex w-full items-center gap-3 rounded-xl border bg-background/40 px-4 py-3 text-left text-sm transition-colors hover:bg-muted"

function ResumeActions() {
  return (
    <section className={card}>
      <SectionTitle icon={FileStack}>{copy.actionsTitle}</SectionTitle>
      <div className="flex flex-col gap-2">
        <a
          href={profile.resumeUrl}
          download
          className="flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          <Download className="size-5" /> {copy.download}
        </a>
        <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className={actionClass}>
          <Eye className="size-5" /> {copy.preview}
        </a>
        <PrintButton label={copy.print} className={actionClass} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <RefreshCw className="size-4 text-success" />
          <div>
            <dt className="text-xs text-muted-foreground">{copy.lastUpdatedLabel}</dt>
            <dd>{copy.lastUpdated}</dd>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <File className="size-4 text-blue-500" />
          <div>
            <dt className="text-xs text-muted-foreground">{copy.fileSizeLabel}</dt>
            <dd>{copy.fileSize}</dd>
          </div>
        </div>
      </dl>
    </section>
  )
}

function QuickInfo() {
  const current = experience[0]
  const rows = [
    { icon: Briefcase, label: copy.quickInfo.experience, value: profile.totalExperience },
    { icon: UserRound, label: copy.quickInfo.role, value: current.role },
    { icon: Building, label: copy.quickInfo.company, value: current.company },
    { icon: MapPin, label: copy.quickInfo.location, value: profile.location },
  ]

  return (
    <section className={card}>
      <SectionTitle icon={User}>{copy.quickInfoTitle}</SectionTitle>
      <dl className="flex flex-col gap-3">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon className="size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-sm">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  )
}

function Connect() {
  return (
    <section className="rounded-2xl bg-linear-to-br from-blue-600 to-violet-600 p-5 text-white">
      <h2 className="text-lg font-semibold">{copy.connectTitle}</h2>
      <p className="mt-1 text-sm text-white/85">{copy.connectText}</p>
      <div className="mt-4 flex gap-2">
        {sidebar.socials.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="grid size-11 place-items-center rounded-xl bg-white/15 transition-colors hover:bg-white/25"
          >
            <Icon className="size-5" />
          </a>
        ))}
      </div>
    </section>
  )
}

function ProfileQuote() {
  return (
    <figure className={card}>
      <Quote className="size-7 text-success" />
      <blockquote className="mt-2 text-center text-sm leading-relaxed">&ldquo;{profile.quote}&rdquo;</blockquote>
      <figcaption className="mt-3 text-right text-sm text-muted-foreground">— {profile.name}</figcaption>
    </figure>
  )
}
