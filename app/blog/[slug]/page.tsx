import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookMarked, FolderOpen, Newspaper, Sparkles } from "lucide-react";

import { DraftBadge, EvidenceBadge } from "@/components/content/content-badges";
import { Markdown } from "@/components/content/markdown";
import { PageShell } from "@/components/page-shell";
import { card, Chip, SectionTitle } from "@/components/page-ui";
import {
  ARTICLES,
  articleHref,
  getArticle,
  hasPage,
  projectHref,
  readMinutes,
  relatedArticlesForArticle,
  relatedProjectsForArticle,
} from "@/content";
import { askAssistantHref } from "@/lib/nav";
import { PORTFOLIO } from "@/lib/portfolio";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { formatDate } from "@/lib/utils";

const { blogPage: copy, profile } = PORTFOLIO;

export function generateStaticParams() {
  const params = ARTICLES.filter(hasPage).map((a) => ({ slug: a.slug }));
  // Cache Components needs at least one param; the placeholder renders a 404 (e.g. while every item is a draft).
  return params.length > 0 ? params : [{ slug: "_none" }];
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">) {
  const article = getArticle((await params).slug);
  if (!article) return {};
  return pageMetadata({
    title: `${article.title} — ${profile.name}`,
    description: article.summary,
    path: articleHref(article.slug),
    type: "article",
    modifiedTime: article.updatedAt,
    noIndex: article.publicationStatus !== "published",
  });
}

export default async function ArticlePage({ params }: PageProps<"/blog/[slug]">) {
  const article = getArticle((await params).slug);
  if (!article) notFound();

  const projects = relatedProjectsForArticle(article);
  const articles = relatedArticlesForArticle(article);

  return (
    <PageShell className="max-w-5xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: article.title,
          description: article.summary,
          url: absoluteUrl(articleHref(article.slug)),
          dateModified: article.updatedAt,
          keywords: article.tags.join(", "),
          author: { "@type": "Person", name: profile.name, url: absoluteUrl("/") },
        })}
      />
      <Link href="/blog" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {copy.backToBlog}
      </Link>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <article className={card}>
          <header className="mb-6 border-b pb-5">
            <div className="mb-3 flex flex-wrap gap-2">
              <EvidenceBadge label={article.learningStatus} />
              <DraftBadge status={article.publicationStatus} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{article.title}</h1>
            <p className="mt-2 text-foreground/80">{article.summary}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {article.category} · {copy.updatedLabel} <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time> ·{" "}
              {readMinutes(article.body)} {copy.minRead}
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {article.tags.map((t) => (
                <li key={t}>
                  <Chip>{t}</Chip>
                </li>
              ))}
            </ul>
          </header>

          <Markdown>{article.body}</Markdown>
        </article>

        <aside className="flex flex-col gap-4">
          <Link
            href={askAssistantHref(`${copy.askPrompt} ${article.title}`)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/85"
          >
            <Sparkles className="size-4" /> {copy.askAi}
          </Link>

          {article.sourceUrls.length > 0 && (
            <section className={card}>
              <SectionTitle icon={BookMarked}>{copy.referencesTitle}</SectionTitle>
              <ul className="flex flex-col gap-2 text-sm">
                {article.sourceUrls.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noreferrer" className="text-primary hover:underline dark:text-blue-300">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {projects.length > 0 && (
            <section className={card}>
              <SectionTitle icon={FolderOpen}>{copy.relatedProjectsTitle}</SectionTitle>
              <ul className="flex flex-col gap-2 text-sm">
                {projects.map((p) => (
                  <li key={p.id}>
                    <Link href={projectHref(p.slug)} className="text-primary hover:underline dark:text-blue-300">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {articles.length > 0 && (
            <section className={card}>
              <SectionTitle icon={Newspaper}>{copy.relatedArticlesTitle}</SectionTitle>
              <ul className="flex flex-col gap-2 text-sm">
                {articles.map((a) => (
                  <li key={a.id}>
                    <Link href={articleHref(a.slug)} className="text-primary hover:underline dark:text-blue-300">
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
