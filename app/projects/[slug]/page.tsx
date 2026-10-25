import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, ListChecks, Newspaper, Sparkles } from "lucide-react";

import { GithubIcon } from "@/components/brand-icons";
import { DraftBadge, EvidenceBadge } from "@/components/content/content-badges";
import { ContentIcon } from "@/components/content/content-icon";
import { Markdown } from "@/components/content/markdown";
import { PageShell } from "@/components/page-shell";
import { card, Chip, SectionTitle } from "@/components/page-ui";
import {
  articleHref,
  getProject,
  hasPage,
  projectHref,
  PROJECTS,
  relatedArticlesForProject,
  type Project,
} from "@/content";
import { askAssistantHref } from "@/lib/nav";
import { PORTFOLIO } from "@/lib/portfolio";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

const { projectsPage: copy, profile } = PORTFOLIO;

export function generateStaticParams() {
  const params = PROJECTS.filter(hasPage).map((p) => ({ slug: p.slug }));
  // Cache Components needs at least one param; the placeholder renders a 404 (e.g. while every item is a draft).
  return params.length > 0 ? params : [{ slug: "_none" }];
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">) {
  const project = getProject((await params).slug);
  if (!project) return {};
  return pageMetadata({
    title: `${project.title} — ${profile.name}`,
    description: project.summary,
    path: projectHref(project.slug),
    type: "article",
    modifiedTime: project.updatedAt,
    noIndex: project.publicationStatus !== "published",
  });
}

const SECTION_ORDER = [
  "problem",
  "challenge",
  "contribution",
  "architecture",
  "decisions",
  "impact",
  "limitations",
  "lessons",
  "tradeoffs",
] as const satisfies readonly (keyof Project["sections"])[];

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const related = relatedArticlesForProject(project);
  const sections = SECTION_ORDER.filter((key) => project.sections[key]);
  const showTodos = process.env.NODE_ENV === "development" && project.todos.length > 0;

  return (
    <PageShell className="max-w-5xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: project.summary,
          url: absoluteUrl(projectHref(project.slug)),
          dateModified: project.updatedAt,
          keywords: project.tags.join(", "),
          author: { "@type": "Person", name: profile.name, url: absoluteUrl("/") },
        })}
      />
      <Link href="/projects" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {copy.backToProjects}
      </Link>

      <article className="flex flex-col gap-4">
        <header className="rounded-2xl border bg-linear-to-br from-hero-from to-hero-to p-5 lg:p-7">
          <div className="flex items-start gap-4">
            <span className="hidden size-14 shrink-0 place-items-center rounded-xl border bg-background/40 sm:grid">
              <ContentIcon
                name={project.visual.kind === "icon" ? project.visual.icon : "layers"}
                className="size-7 text-violet-500 dark:text-violet-300"
              />
            </span>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-2">
                <EvidenceBadge label={project.evidence} />
                <DraftBadge status={project.publicationStatus} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{project.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {[project.aka, project.organization, project.period].filter(Boolean).join(" · ")}
              </p>
              <p className="mt-3 max-w-3xl text-foreground/85">{project.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <Link
                  href={askAssistantHref(`${copy.caseStudyPrompt} ${project.title}`)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 font-medium text-primary-foreground hover:bg-primary/85"
                >
                  <Sparkles className="size-4" /> {copy.askAi}
                </Link>
                {project.links?.github && (
                  <a href={project.links.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 hover:bg-muted">
                    <GithubIcon className="size-4" /> {copy.github}
                  </a>
                )}
                {project.links?.live && (
                  <a href={project.links.live} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 hover:bg-muted">
                    <ExternalLink className="size-4" /> {copy.live}
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

        {showTodos && (
          <aside className="rounded-2xl border border-dashed border-amber-500 bg-amber-500/5 p-4 text-sm">
            <h2 className="mb-2 font-semibold text-amber-700 dark:text-amber-300">{copy.todoTitle}</h2>
            <ul className="list-disc space-y-1 pl-5">
              {project.todos.map((todo) => (
                <li key={todo}>{todo}</li>
              ))}
            </ul>
          </aside>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="flex min-w-0 flex-col gap-4">
            {sections.map((key) => (
              <section key={key} className={card} aria-labelledby={`section-${key}`}>
                <h2 id={`section-${key}`} className="mb-2 text-lg font-semibold">
                  {copy.sections[key]}
                </h2>
                {key === "tradeoffs" && <p className="mb-3 text-xs text-muted-foreground">{copy.tradeoffsNote}</p>}
                <Markdown>{project.sections[key]!}</Markdown>
              </section>
            ))}
          </div>

          <aside className="flex flex-col gap-4">
            {project.stack.length > 0 && (
              <section className={card}>
                <SectionTitle icon={ListChecks}>{copy.stackTitle}</SectionTitle>
                <ul className="flex flex-wrap gap-1.5">
                  {project.stack.map((s) => (
                    <li key={s}>
                      <Chip>{s}</Chip>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {related.length > 0 && (
              <section className={card}>
                <SectionTitle icon={Newspaper}>{copy.relatedArticlesTitle}</SectionTitle>
                <ul className="flex flex-col gap-2 text-sm">
                  {related.map((a) => (
                    <li key={a.id}>
                      <Link href={articleHref(a.slug)} className={cn("text-primary hover:underline dark:text-blue-300")}>
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </article>
    </PageShell>
  );
}
