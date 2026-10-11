import { Briefcase, GraduationCap, MapPin } from "lucide-react"

import { Chip } from "@/components/page-ui"
import { PORTFOLIO } from "@/lib/portfolio"

const { experience, education } = PORTFOLIO

const dot = "absolute top-5 -left-[29px] size-3.5 rounded-full border-2 border-background bg-primary ring-2 ring-primary/40"

/** Jobs (most recent first) on a vertical timeline, optionally ending with education. */
export function ExperienceTimeline({
  technologiesTitle,
  responsibilitiesTitle,
  educationTitle,
}: {
  technologiesTitle: string
  /** Heading above the bullet list; omitted on the compact resume version. */
  responsibilitiesTitle?: string
  /** When set, education is added as the last stop on the timeline. */
  educationTitle?: string
}) {
  return (
    <ol className="relative flex flex-col gap-4 border-l-2 border-primary/40 pl-5 sm:ml-2">
      {experience.map((job) => (
        <li key={`${job.company}-${job.period}`} className="relative print:break-inside-avoid">
          <span className={dot} />
          <article className="grid gap-4 rounded-xl border bg-background/40 p-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="flex min-w-0 gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted">
                <Briefcase className="size-5 text-violet-500 dark:text-violet-300" />
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold">{job.company}</h3>
                <p className="text-sm text-primary dark:text-blue-300">{job.role}</p>
                <p className="mt-2 text-sm text-foreground/85">{job.summary}</p>
                {job.highlights.length > 0 && (
                  <>
                    {responsibilitiesTitle && <h4 className="mt-3 text-sm font-medium">{responsibilitiesTitle}</h4>}
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-foreground/80 marker:text-muted-foreground">
                      {job.highlights.map((h) => {
                        const [title, ...rest] = h.split(": ")
                        return (
                          <li key={h}>
                            {rest.length > 0 ? (
                              <>
                                <span className="font-medium text-foreground">{title}:</span> {rest.join(": ")}
                              </>
                            ) : (
                              h
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 text-sm md:max-w-64 md:items-end md:text-right">
              <div className="text-muted-foreground">
                <p className="text-foreground">{job.period}</p>
                <p>{job.duration}</p>
                {job.location && (
                  <p className="flex items-center gap-1 md:justify-end">
                    <MapPin className="size-3.5" /> {job.location}
                  </p>
                )}
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium">{technologiesTitle}</p>
                <div className="flex flex-wrap gap-1.5 md:justify-end">
                  {job.technologies.map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </li>
      ))}

      {educationTitle &&
        education.map((e) => (
          <li key={e.degree} className="relative">
            <span className={dot} />
            <article className="flex gap-3 rounded-xl border bg-background/40 p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted">
                <GraduationCap className="size-5 text-violet-500 dark:text-violet-300" />
              </span>
              <div className="min-w-0 text-sm">
                <h3 className="font-semibold">{educationTitle}</h3>
                <p>{e.degree}</p>
                <p className="text-muted-foreground">{[e.period, e.place].filter(Boolean).join(" · ")}</p>
              </div>
            </article>
          </li>
        ))}
    </ol>
  )
}
