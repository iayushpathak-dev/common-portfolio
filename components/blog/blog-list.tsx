"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, CalendarClock, Search, Sparkles, X } from "lucide-react"

import { DraftBadge, EvidenceBadge } from "@/components/content/content-badges"
import { ContentIcon } from "@/components/content/content-icon"
import { card, Chip, PageIntro } from "@/components/page-ui"
import type { ArticleSummary } from "@/content"
import { trackEvent, useTrackSearch } from "@/lib/analytics"
import { askAssistantHref } from "@/lib/nav"
import { PORTFOLIO } from "@/lib/portfolio"
import { cn, formatDate } from "@/lib/utils"

const { pages, blogPage: copy } = PORTFOLIO

function BlogSearch({ query, onQuery }: { query: string; onQuery: (q: string) => void }) {
  return (
    <label className="relative block w-full lg:w-72">
      <span className="sr-only">{copy.searchPlaceholder}</span>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder={copy.searchPlaceholder}
        className="h-10 w-full rounded-xl border bg-card/70 pr-9 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50 [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button
          type="button"
          onClick={() => onQuery("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </label>
  )
}

export function FilterPills({
  options,
  allLabel,
  value,
  onChange,
}: {
  options: readonly string[]
  allLabel: string
  value: string | null
  onChange: (v: string | null) => void
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group">
      {[null, ...options].map((option) => (
        <button
          key={option ?? "all"}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={cn(
            "rounded-lg border px-3.5 py-1.5 text-sm transition-colors hover:bg-muted",
            value === option && "border-primary bg-primary text-primary-foreground hover:bg-primary",
          )}
        >
          {option ?? allLabel}
        </button>
      ))}
    </div>
  )
}

/** The search box sits in the page intro, so this renders the intro too and owns all filter state. */
export function BlogBrowser({ articles }: { articles: ArticleSummary[] }) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const categories = [...new Set(articles.map((a) => a.category))]

  const q = query.trim().toLowerCase()
  const matching = articles.filter(
    (a) =>
      (category === null || a.category === category) &&
      (q === "" || [a.title, a.summary, a.category, ...a.tags].some((text) => text.toLowerCase().includes(q))),
  )
  const written = matching.filter((a) => a.href !== null)
  const planned = matching.filter((a) => a.publicationStatus === "planned")
  const featured = written.find((a) => a.featured)
  const rest = written.filter((a) => a !== featured)
  useTrackSearch(query, "blog", matching.length)

  function selectCategory(next: string | null) {
    setCategory(next)
    trackEvent("filter_select", { filter_location: "blog", filter_value: next ?? "all" })
  }

  return (
    <div className="flex flex-col gap-4">
      <PageIntro icon={pages.blog.icon} title={copy.title} subtitle={copy.subtitle} description={copy.description}>
        <BlogSearch query={query} onQuery={setQuery} />
      </PageIntro>
      <FilterPills options={categories} allLabel={copy.allLabel} value={category} onChange={selectCategory} />

      {matching.length === 0 && (
        <p className={cn(card, "text-center text-sm text-muted-foreground")}>
          {articles.length === 0 ? copy.noArticlesYet : copy.empty}
        </p>
      )}

      {featured && <FeaturedPost post={featured} />}
      {rest.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rest.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {planned.length > 0 && <PlannedTopics posts={planned} />}
    </div>
  )
}

function PostLink({ post }: { post: ArticleSummary }) {
  const cls = "inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline dark:text-blue-300"
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {post.href && (
        <Link href={post.href} className={cls}>
          {copy.readArticle} <ArrowRight className="size-4" />
        </Link>
      )}
      <Link href={askAssistantHref(`${copy.askPrompt} ${post.title}`)} className={cls}>
        <Sparkles className="size-4" /> {copy.askAi}
      </Link>
    </div>
  )
}

function Meta({ post }: { post: ArticleSummary }) {
  return (
    <p className="text-xs text-muted-foreground">
      {post.category} · {formatDate(post.updatedAt)} · {post.readMinutes} {copy.minRead}
    </p>
  )
}

function Badges({ post }: { post: ArticleSummary }) {
  return (
    <div className="flex flex-wrap gap-2">
      <EvidenceBadge label={post.learningStatus} />
      <DraftBadge status={post.publicationStatus} />
    </div>
  )
}

function FeaturedPost({ post }: { post: ArticleSummary }) {
  return (
    <article className="grid gap-4 overflow-hidden rounded-2xl border border-primary/40 bg-linear-to-br from-hero-from to-hero-to p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:p-6">
      <div className="flex min-w-0 flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1 rounded-md bg-violet-600 px-2 py-0.5 text-xs font-medium text-white">
          <Sparkles className="size-3" /> {copy.featuredLabel}
        </span>
        <h2 className="text-xl font-semibold lg:text-2xl">{post.title}</h2>
        <Meta post={post} />
        <Badges post={post} />
        <p className="text-sm text-foreground/80">{post.summary}</p>
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
        <div className="mt-1">
          <PostLink post={post} />
        </div>
      </div>
      <div className="grid min-h-40 place-items-center rounded-xl border bg-background/30">
        <ContentIcon name={post.icon} className="size-24 text-blue-400 drop-shadow-[0_0_24px_rgb(96_165_250/0.6)]" />
      </div>
    </article>
  )
}

function PostCard({ post }: { post: ArticleSummary }) {
  return (
    <article className={cn(card, "flex flex-col gap-3")}>
      <div className="flex items-start gap-3">
        <span className="grid size-14 shrink-0 place-items-center rounded-xl border bg-linear-to-br from-hero-from to-hero-to">
          <ContentIcon name={post.icon} className="size-7 text-violet-500 dark:text-violet-300" />
        </span>
        <div className="min-w-0">
          <h2 className="font-semibold">{post.title}</h2>
          <Meta post={post} />
        </div>
      </div>
      <Badges post={post} />
      <p className="text-sm text-foreground/80">{post.summary}</p>
      <div className="flex flex-wrap gap-1.5">
        {post.tags.slice(0, 4).map((t) => (
          <Chip key={t}>{t}</Chip>
        ))}
      </div>
      <div className="mt-auto pt-1">
        <PostLink post={post} />
      </div>
    </article>
  )
}

function PlannedTopics({ posts }: { posts: ArticleSummary[] }) {
  return (
    <section className={card} aria-labelledby="planned-topics">
      <h2 id="planned-topics" className="mb-1 flex items-center gap-2 font-semibold">
        <CalendarClock className="size-5 text-violet-500 dark:text-violet-300" /> {copy.plannedTitle}
      </h2>
      <p className="mb-3 text-sm text-muted-foreground">{copy.plannedSubtitle}</p>
      <ul className="grid gap-2 md:grid-cols-2">
        {posts.map((post) => (
          <li key={post.id} className="flex items-start gap-3 rounded-xl border bg-background/40 p-3">
            <ContentIcon name={post.icon} className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-medium">{post.title}</p>
              <p className="text-xs text-muted-foreground">{post.summary}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Article cards for the home page. */
export function LatestPosts({ posts }: { posts: ArticleSummary[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
