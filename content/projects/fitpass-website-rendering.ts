import type { Project } from "@/content/types"

export const fitpassWebsiteRendering: Project = {
  id: "project-fitpass-website-rendering",
  slug: "fitpass-website-rendering",
  contentType: "project",
  title: "FITPASS Website (Next.js App Router)",
  aka: "fitpass.co.in",
  summary:
    "The public fitpass.co.in website on the Next.js App Router: 200+ server-rendered routes with API-driven SEO, studio and city pages, membership and checkout flows, campaign landing pages, multi-channel analytics and a containerised standalone deployment.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Web App", "Performance"],
  tags: ["Next.js", "App Router", "SEO", "SSR", "Core Web Vitals", "Analytics", "Docker"],
  stack: [
    "Next.js 16 (App Router)",
    "React 19",
    "JavaScript",
    "Tailwind CSS",
    "Route Handlers",
    "gRPC",
    "Mapbox",
    "GA4 / GTM / Meta Pixel / Segment",
    "Docker",
    "nginx",
  ],
  featured: true,
  visual: { kind: "score", score: 100, display: "100", label: "Lighthouse SEO" },
  links: { live: "https://fitpass.co.in" },
  updatedAt: "2026-11-23",
  sections: {
    problem:
      "fitpass.co.in is the main acquisition channel for FITPASS: people find gyms and studios through search, compare plans and buy a membership. Thousands of studio, city and activity pages have to rank, load fast on mobile, and stay in sync with data that changes in the backend every day.",
    challenge:
      "One codebase serves very different audiences: SEO landing pages, a gym and studio directory, logged-in membership and checkout flows, co-branded partner and corporate pages, and paid-ads landing pages that marketing launches every few weeks. Each needs correct metadata, fast first paint and reliable conversion tracking, without exposing backend APIs or keys to the browser.",
    contribution: `I work on the website end to end, from page architecture to production deployment:

- Route structure: organised 200+ routes with App Router route groups for common pages, corporate and partner journeys, partner network and Fitshop, each with its own layout. The [B2B2C partner funnels](/projects/configurable-corporate-journeys) and [Fitshop](/projects/fitshop) are written up as separate projects.
- SEO from the API: studio, city, activity, blog and catch-all pages build their \`generateMetadata\` (title, description, canonical, Open Graph, Twitter) from the backend's meta response. Studio pages add geo meta tags. Key pages ship JSON-LD, and sitemap routes are served through rewrites.
- Dynamic SEO routes: a catch-all route resolves city pages and filtered studio listings from the URL, and follows 301/302 redirects and 404s returned by the API.
- Performance: device-specific LCP image preloads with \`fetchPriority="high"\`, reserved aspect ratios on hero banners for zero layout shift, \`next/font\` with \`display: swap\`, lazy-loaded below-the-fold sections with \`next/dynamic\`, and CDN image optimisation.
- Analytics: one tracking helper fans each event out to GA4, Meta Pixel and Segment, keeps campaign attribution (UTM and gclid, captured in the request proxy) across a funnel, and sends server-side Meta Conversions API events with hashed user data.
- Integrations through the [BFF](/projects/backend-for-frontend): the browser talks only to Next.js Route Handlers, which add auth headers, call backend, gRPC and third-party services (geocoding, reCAPTCHA v3, face scan) and return encrypted payloads.
- Deployment: containerised the app as a Next.js standalone build behind nginx and supervisor on Kubernetes, with a health check that holds nginx until Next.js is ready.`,
    architecture: `\`\`\`text
Visitor ──► nginx ──► Next.js standalone server (Docker / k8s)
                        │
                        ├─ proxy.ts: request headers, campaign cookie, CORS allow-list
                        │
                        ├─ Server Components (SSR)
                        │    generateMetadata + page data ◄── backend APIs (meta, studios, cities, blogs)
                        │
                        ├─ Route Handlers (BFF)
                        │    /api/service ──► REST APIs
                        │    /api/grpc-service ──► gRPC event service
                        │    geocoding · reCAPTCHA · face scan · file uploads
                        │
                        └─ Client components
                             forms, maps, sliders, analytics (GA4 · Meta Pixel · Segment)
\`\`\``,
    decisions: `- **Server rendering for data-driven pages.** Studio, city and listing pages depend on location cookies, the logged-in user and backend data that changes often, so they render on the server per request instead of being prebuilt.
- Metadata owned by the backend. Titles, descriptions, canonicals and Open Graph come from the API's \`meta\` object, so the SEO team can change them without a deploy.
- Indexing controlled by environment. One helper returns \`noindex\` everywhere except production, so staging copies never get indexed.
- No backend URLs or keys in the browser. Client calls go through Route Handlers, which add credentials on the server.
- Standalone output. The Docker image ships only the traced server and static assets, and runs \`node server.js\` without npm. Files read at runtime (gRPC \`.proto\` definitions) are added explicitly with \`outputFileTracingIncludes\`.`,
    tradeoffs: `- **SSR vs SSG/ISR:** per-request rendering is always fresh and can personalise, but every request costs server time. Static or incrementally regenerated pages are faster and cheaper, but need a revalidation strategy and can't depend on cookies.
- API-driven metadata: flexible for SEO teams, but a slow or failing API delays or degrades the page head, so fallbacks matter.
- A BFF in the same Next.js app: one deploy and one language, but website traffic and API traffic scale together.
- Several analytics tools at once: each team gets its tool, but every extra third-party script competes with page performance.`,
    limitations: null,
    impact: `Measured with PageSpeed Insights on the homepage (23 Nov 2026):

- Core Web Vitals: passed on both mobile and desktop for real users (Chrome UX Report, 28 days). LCP 1.6 s, INP 110 ms, CLS 0 on mobile; LCP 1.3 s, INP 69 ms, CLS 0 on desktop.
- Lighthouse: SEO 100, Best Practices 100, Accessibility 96 on both mobile and desktop.
- Zero layout shift in lab and field data, from the reserved hero aspect ratios.`,
    lessons: "Field data and lab scores can disagree: real users pass Core Web Vitals, while Lighthouse's throttled mobile run still points at JavaScript and third-party scripts as the next thing to cut.",
  },
  relatedArticles: [],
  todos: [
    "Confirm which parts you personally built vs. the team (e.g. Docker/k8s setup, Meta CAPI, analytics).",
  ],
}
