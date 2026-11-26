## Introduction

A growing share of "visitors" are AI systems: search assistants summarising pages, browser agents completing tasks and chat assistants answering questions about a product. Making a site readable for them is starting to look like SEO did fifteen years ago. These notes cover what frontend engineers can do today: semantic HTML, structured data, `llms.txt` and clean, stable content.

## Problem statement

Many modern sites render key content only after client-side JavaScript, hide information behind interactions, or use div-based "buttons". Humans cope; agents and crawlers often do not. The result is wrong summaries, missed pages and agents that fail to complete simple tasks.

## Learning objectives

1. Explain how AI systems read pages (HTML, rendered DOM, accessibility tree, screenshots).
2. Apply semantic HTML and accessibility as agent-readability.
3. Add structured data and an `llms.txt` file.
4. Decide what to expose and what to keep out.

## Core concepts

- **Server-rendered content**: content present in the initial HTML is the most reliably read.
- **Accessibility tree**: many agents navigate through roles and labels, the same as screen readers.
- **Structured data**: JSON-LD (Person, Article, Product) gives machines unambiguous facts.
- **llms.txt**: a proposed Markdown file at the site root that lists the most useful pages for language models, with short descriptions.

## Technical explanation

```text
/                     server-rendered HTML, real <a>, <button>, <form>, <label>
<head>                JSON-LD: Person / Article with name, dates, sameAs
/sitemap.xml          every canonical public URL
/robots.txt           crawl rules, including AI crawlers you allow or block
/llms.txt             curated index: "Projects", "Articles", "Resume" with links
```

## Code example

Article JSON-LD in a Next.js App Router page:

```tsx
export default function ArticlePage({ article }: { article: Article }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.summary,
    dateModified: article.updatedAt,
    author: { "@type": "Person", name: "Ayush Pathak", url: "https://www.ayushpathak.co.in" },
  }
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1>{article.title}</h1>
      {/* … */}
    </article>
  )
}
```

The data comes from my own content files, never from user input, which keeps the inline script safe.

## Production considerations

- Prefer SSR/SSG for content pages; client-only rendering is the most common reason agents miss content.
- Keep URLs stable and add redirects when slugs change.
- Exclude drafts, private data and admin routes from sitemaps and `llms.txt`.
- Decide deliberately which AI crawlers to allow in `robots.txt`.

## Trade-offs and alternatives

`llms.txt` is a community proposal, not a standard, and not every system reads it. It is cheap to add, but semantic HTML and structured data matter more. For task completion (not just reading), WebMCP tools are the more explicit option.

## Common mistakes

- Clickable divs without roles, labels or keyboard support.
- Important facts only inside images or canvas.
- Listing draft or unpublished pages in machine-readable indexes.

## Key takeaways

- Accessibility and server rendering are the foundation of agent readability.
- JSON-LD and a sitemap give machines clear facts and URLs; `llms.txt` is an inexpensive extra.
- Expose public, stable content only, and keep drafts out.
