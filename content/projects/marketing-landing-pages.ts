import type { Project } from "@/content/types"

export const marketingLandingPages: Project = {
  id: "project-marketing-landing-pages",
  slug: "marketing-landing-pages",
  contentType: "project",
  title: "Marketing Landing Pages and Membership Funnels",
  aka: "Subscription and membership pages",
  summary:
    "The pages FITPASS ads and campaigns send people to: subscription offers, spin-the-wheel deals, Google and Facebook ad variants, CMS and HTML-driven campaign pages, and the SEO membership pages. Each one ends in the same flow: login with OTP, choose a plan, pay, thank-you.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Web App", "Performance"],
  tags: ["Landing pages", "Conversion funnels", "A/B variants", "SEO", "Next.js"],
  stack: ["Next.js App Router", "React.js", "Tailwind CSS", "Route Handlers", "CMS APIs"],
  visual: { kind: "icon", icon: "megaphone" },
  updatedAt: "2026-11-24",
  sections: {
    problem:
      "Marketing runs paid campaigns on Google and Facebook, CRM campaigns and seasonal offers all year. Every campaign needs a landing page that loads fast on mobile, keeps the campaign attribution and takes the user from the ad to a paid membership in as few steps as possible.",
    challenge: `- New campaigns, offers and A/B variants come every few weeks, often with only a day or two of notice.
- The same purchase steps (login, plans, payment) appear on dozens of pages, each with its own look and offer.
- Membership pages also have to rank in search, while ad pages must not compete with them.`,
    contribution: `I built and maintain these pages in the website. The main groups:

| Routes | What they are |
|---|---|
| \`/subscription\` and \`/subscription/*\` | Subscription offer pages: plan durations with MRP vs offer price and per-month cost, plus 6-7-8 month offers, offers with extra benefits, a city-aware membership page with nearby studios, onboarding, payment and thank-you |
| \`/subscription/spin-wheel-6m\`, \`/subscription/spin-wheel-12m\` | Spin-the-wheel campaigns: the user spins for a discount or a free goodies kit, which is added to their plan |
| \`/subscription/dynamic-page-url\` | One page whose plans and content come from the API based on the campaign in the URL |
| \`/subscription-optional/*\` | Offer and challenge pages with plans, user details, payment and thank-you |
| \`/google-lp/*\`, \`/google-display-lp/*\`, \`/fb-lp/*\` | Ad-channel landing pages per product (FITPASS, Lite, Pro, Ultra) and offer, including A/B variants of the same offer |
| \`/landing-page/[title]\` | Landing pages built entirely from the CMS, with title and description from the CMS too |
| \`/marketing/*\` | Campaign pages whose body is HTML from the backend. The CTA sends users to sign-up, plans, vertical plans or membership depending on device and login state |
| \`/membership\`, \`/membership/[plan]\`, \`/subscription-1m/*\` | SEO membership pages: plan pages with content from the API, JSON-LD and metadata, plus the monthly plan flow |

How they work:

- One purchase flow behind every page: OTP login, plan picker, an embedded payment page, then a thank-you screen with next steps. A new campaign reuses it instead of rebuilding checkout.
- Campaign data drives the page: plans, prices and content come from the API or CMS for the campaign in the URL, so most new campaigns need content, not code.
- Attribution is kept end to end: UTM and gclid from the ad are captured on the first request and stay with the user through the funnel, and each step sends analytics events (GA4, Meta Pixel, Segment).
- Urgency features: offer countdown timers, offer banners, the spin wheel and limited-time pricing.
- Location: the city is worked out from the visitor's IP to show nearby studios and local plans.
- SEO: membership pages are indexable, with metadata from the API, canonical URLs and structured data. Robots rules are set per page and default to noindex outside production.`,
    architecture: `\`\`\`text
Ad / CRM / SEO ──► landing page (subscription · spin wheel · google-lp · fb-lp · CMS · marketing HTML · membership)
                       │  UTM + gclid captured, campaign read from URL
                       ▼
           content + plans from API / CMS (by campaign, city)
                       ▼
           shared funnel: OTP login → plans → payment (embedded) → thank-you
                       │
                       └─ events at each step: GA4 · Meta Pixel · Segment
\`\`\``,
    decisions: `- One shared funnel, many entry pages, so checkout fixes and tracking apply to every campaign at once.
- Content from the API or CMS wherever possible, so marketing can launch without waiting for a release.
- Separate routes per ad channel and variant, so each campaign's numbers stay clean in analytics.
- Robots rules per page, so membership pages can rank while campaign pages are controlled one by one.`,
    tradeoffs: `- Many near-duplicate routes make campaigns easy to track and change on their own, but old campaign pages pile up and need regular clean-up.
- HTML from the backend gives marketing full freedom, but it has to be trusted or sanitised before rendering.
- Embedded payment keeps users on the page, but depends on the payment provider's page working well inside an iframe.`,
    limitations: null,
    impact: null,
    lessons: null,
  },
  relatedArticles: [],
  todos: [],
}
