import type { Project } from "@/content/types"

export const fitpassWebsiteRendering: Project = {
  id: "project-fitpass-website-rendering",
  slug: "fitpass-website-rendering",
  contentType: "project",
  title: "Fitpass Website and Rendering Strategies",
  aka: "fitpass.co.in",
  summary:
    "fitpass.co.in on Next.js, choosing SSR, SSG, ISR or CSR per page based on SEO and performance needs, with webhook-triggered ISR and Lighthouse scores in the 90s.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Web App", "Performance"],
  tags: ["Next.js", "SEO", "ISR", "SSR", "Core Web Vitals"],
  stack: ["Next.js", "React.js", "JavaScript", "Webhooks"],
  featured: true,
  visual: { kind: "score", score: 90, display: "90+", label: "Lighthouse" },
  links: { live: "https://fitpass.co.in" },
  updatedAt: "2026-10-18",
  sections: {
    problem:
      "A public marketing and product website has to rank well in search and load fast, while some of its content changes often.",
    challenge:
      "No single rendering mode fits every page: static pages are fastest but go stale, server rendering is always fresh but costs time on every request, and client rendering is weakest for SEO.",
    contribution:
      "I built fitpass.co.in on Next.js, choosing SSR, SSG, ISR or CSR for each page based on its SEO and performance needs, and set up webhook-triggered ISR so content updates reach static pages without a full rebuild.",
    architecture: `\`\`\`text
Content change ──webhook──► Next.js revalidation ──► page regenerated
                                                     │
Visitor ──► CDN / Next.js ──► SSG or ISR page (cached HTML)
                         └──► SSR page (rendered per request)
                         └──► CSR section (data fetched in the browser)
\`\`\``,
    decisions: `- Rendering mode is chosen **per page**, based on how often its content changes and how much it matters for SEO.
- **Webhook-triggered ISR**: when content changes, a webhook asks Next.js to regenerate the affected pages, instead of waiting for a time-based revalidation window.`,
    tradeoffs: `- **SSG/ISR** gives the fastest TTFB and cheapest hosting, but needs a revalidation strategy.
- **SSR** is always fresh and can personalise, but every request pays server time.
- **CSR** keeps servers simple but delays content and hurts crawlability.
- **Time-based vs on-demand revalidation:** time-based is simple but serves stale content until the window passes; on-demand (webhooks) is fresher but needs reliable webhook delivery and retries.`,
    limitations: null,
    impact: "Lighthouse scores in the 90s.",
    lessons: null,
  },
  relatedArticles: [],
  todos: [
    "Which content source sends the revalidation webhooks (CMS, admin panel, backend)?",
    "Examples of which pages use which rendering mode, and why.",
    "Any specific performance work behind the Lighthouse scores (images, fonts, bundle size).",
  ],
}
